using System.Security.Claims;
using MiniErp.Application.Abstractions;
using MiniErp.Domain.Auth;

namespace MiniErp.Api.Auth;

// Resolves the caller from JWT claims populated by the API Gateway authorizer.
// Requests without an authenticated principal fall back to the configured local identity
// so local development keeps working without Cognito.
public sealed class HttpContextCurrentUser : ICurrentUser
{
    private const string AdminGroup = "admin";

    public HttpContextCurrentUser(IHttpContextAccessor accessor, IConfiguration configuration)
    {
        var fallback = configuration.GetSection("Auth:Fallback");
        var principal = accessor.HttpContext?.User;
        var authenticated = principal?.Identity?.IsAuthenticated == true;

        string? Claim(params string[] types) => authenticated
            ? types.Select(t => principal!.FindFirst(t)?.Value).FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))
            : null;

        UserId = Claim("sub", ClaimTypes.NameIdentifier) ?? fallback["UserId"] ?? "local-user";
        Email = Claim("email", ClaimTypes.Email) ?? fallback["Email"] ?? "local@example.com";
        DisplayName = Claim("preferred_username", "name", "cognito:username", "username")
                      ?? Email.Split('@')[0];
        OrgId = Claim("custom:orgId", "custom:org_id") ?? fallback["OrgId"] ?? "demo-org";

        Role = authenticated
            ? (IsInAdminGroup(principal!) ? Role.Admin : Role.Staff)
            : Enum.TryParse<Role>(fallback["Role"], true, out var role) ? role : Role.Admin;
    }

    public string UserId { get; }
    public string Email { get; }
    public string DisplayName { get; }
    public string OrgId { get; }
    public Role Role { get; }

    // API Gateway forwards cognito:groups either as repeated claims or as a "[a b]" string.
    private static bool IsInAdminGroup(ClaimsPrincipal principal)
        => principal.FindAll("cognito:groups")
            .SelectMany(c => c.Value.Trim('[', ']').Split([' ', ','], StringSplitOptions.RemoveEmptyEntries))
            .Any(g => string.Equals(g.Trim('"'), AdminGroup, StringComparison.OrdinalIgnoreCase));
}

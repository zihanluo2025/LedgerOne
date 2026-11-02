using Microsoft.AspNetCore.Mvc;
using MiniErp.Application.Profiles;

namespace MiniErp.Api.Controllers;

[ApiController]
[Route("api/profile")]
public sealed class ProfileController : ControllerBase
{
    private readonly UserProfileService _service;

    public ProfileController(UserProfileService service)
    {
        _service = service;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMine(CancellationToken cancellationToken)
        => Ok(await _service.GetMineAsync(cancellationToken));

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateMine(
        [FromBody] UpdateUserProfileRequest request,
        CancellationToken cancellationToken)
        => Ok(await _service.UpdateMineAsync(request, cancellationToken));

    [HttpPost("me/password-changed")]
    public async Task<ActionResult<UserProfileDto>> PasswordChanged(CancellationToken cancellationToken)
        => Ok(await _service.RecordPasswordChangedAsync(cancellationToken));

    [HttpGet("departments")]
    public ActionResult<IReadOnlyList<string>> GetDepartments() => Ok(UserProfileService.Departments);
}

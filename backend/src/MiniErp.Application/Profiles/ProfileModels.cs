namespace MiniErp.Application.Profiles;

// Personal settings for the signed-in user. Identity (email, password, MFA) stays in Cognito.
public sealed record UserProfileDto(
    string UserId,
    string FullName,
    string? JobTitle,
    string? Department,
    bool EmailAlerts,
    bool DesktopNotifications,
    DateTime? PasswordChangedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public sealed record UpdateUserProfileRequest(
    string FullName,
    string? JobTitle,
    string? Department,
    bool EmailAlerts,
    bool DesktopNotifications
);

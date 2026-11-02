using MiniErp.Application.Abstractions;

namespace MiniErp.Application.Profiles;

public sealed class UserProfileService
{
    public static readonly string[] Departments =
    [
        "Executive Management",
        "Finance",
        "Operations",
        "Procurement",
        "Sales",
        "Warehouse",
        "IT"
    ];

    private readonly IUserProfileRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public UserProfileService(IUserProfileRepository repository, ICurrentUser currentUser, IClock clock)
    {
        _repository = repository;
        _currentUser = currentUser;
        _clock = clock;
    }

    // Returns the stored profile, or defaults derived from the identity when none exists yet.
    public async Task<UserProfileDto> GetMineAsync(CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(_currentUser.UserId, cancellationToken);
        if (existing is not null) return existing;

        var now = _clock.UtcNow.UtcDateTime;
        return new UserProfileDto(
            UserId: _currentUser.UserId,
            FullName: _currentUser.DisplayName,
            JobTitle: null,
            Department: null,
            EmailAlerts: true,
            DesktopNotifications: false,
            PasswordChangedAt: null,
            CreatedAt: now,
            UpdatedAt: now);
    }

    public async Task<UserProfileDto> UpdateMineAsync(
        UpdateUserProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var current = await GetMineAsync(cancellationToken);
        var department = Guard.Optional(request.Department, "Department", 100);

        var updated = current with
        {
            FullName = Guard.Required(request.FullName, "Full name", 100),
            JobTitle = Guard.Optional(request.JobTitle, "Job title", 100),
            Department = department is null ? null : Guard.OneOf(department, "Department", Departments),
            EmailAlerts = request.EmailAlerts,
            DesktopNotifications = request.DesktopNotifications,
            UpdatedAt = _clock.UtcNow.UtcDateTime
        };

        await _repository.SaveAsync(updated, cancellationToken);
        return updated;
    }

    // The password itself is changed in Cognito by the client; this only records when.
    public async Task<UserProfileDto> RecordPasswordChangedAsync(CancellationToken cancellationToken = default)
    {
        var now = _clock.UtcNow.UtcDateTime;
        var updated = (await GetMineAsync(cancellationToken)) with { PasswordChangedAt = now, UpdatedAt = now };

        await _repository.SaveAsync(updated, cancellationToken);
        return updated;
    }
}

using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Application.Suppliers;

public sealed class SupplierService
{
    public static readonly string[] Statuses = ["Draft", "Active", "Inactive"];
    public static readonly string[] RiskLevels = ["Low", "Medium", "High"];

    private readonly ISupplierRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public SupplierService(ISupplierRepository repository, ICurrentUser currentUser, IClock clock)
    {
        _repository = repository;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<PagedResult<SupplierDto>> GetSuppliersAsync(
        SupplierListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<SupplierDto> items = await _repository.ListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.SupplierCode, keyword) ||
                Guard.Contains(x.SupplierName, keyword) ||
                Guard.Contains(x.PrimaryCategory, keyword) ||
                Guard.Contains(x.ContactPerson, keyword) ||
                Guard.Contains(x.ContactEmail, keyword) ||
                Guard.Contains(x.Region, keyword));
        }

        items = FilterEquals(items, query.Status, x => x.Status);
        items = FilterEquals(items, query.Region, x => x.Region);
        items = FilterEquals(items, query.Category, x => x.PrimaryCategory);
        items = FilterEquals(items, query.RiskLevel, x => x.RiskLevel);

        return Paging.Apply(items.OrderByDescending(x => x.UpdatedAt), query.Limit, query.Cursor);
    }

    public async Task<SupplierSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.ListAsync(cancellationToken);

        return new SupplierSummaryDto(
            items.Count,
            items.Count(x => x.Status == "Active"),
            items.Count(x => x.Status == "Draft"),
            items.Count(x => x.RiskLevel == "High"));
    }

    public Task<SupplierDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public async Task<SupplierDto> CreateAsync(
        CreateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = Guard.Required(request.SupplierCode, "Supplier code", 50);
        await EnsureCodeIsUniqueAsync(code, null, cancellationToken);

        var now = _clock.UtcNow.UtcDateTime;
        var item = Map(Guid.NewGuid().ToString("N"), code, request, now, _currentUser.UserId, now);

        await _repository.SaveAsync(item, cancellationToken);
        return item;
    }

    public async Task<SupplierDto?> UpdateAsync(
        string id,
        UpdateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return null;

        var code = Guard.Required(request.SupplierCode, "Supplier code", 50);
        await EnsureCodeIsUniqueAsync(code, id, cancellationToken);

        var updated = Map(id, code, request, existing.CreatedAt, existing.CreatedBy, _clock.UtcNow.UtcDateTime);

        await _repository.SaveAsync(updated, cancellationToken);
        return updated;
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    public async Task BulkDeleteAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default)
    {
        foreach (var id in ids.Distinct())
            await _repository.DeleteAsync(id, cancellationToken);
    }

    private SupplierDto Map(
        string id,
        string code,
        SupplierRequest request,
        DateTime createdAt,
        string createdBy,
        DateTime now)
        => new(
            id,
            code,
            Guard.Required(request.SupplierName, "Supplier name"),
            Guard.Required(request.PrimaryCategory, "Primary category", 100),
            Guard.Required(request.ContactPerson, "Contact person", 100),
            Guard.Optional(request.ContactEmail, "Contact email", 200),
            Guard.Optional(request.ContactPhone, "Contact phone", 50),
            Guard.Required(request.Region, "Region", 100),
            Guard.Optional(request.Address, "Address", 300),
            Guard.Optional(request.Website, "Website", 255),
            Guard.OneOf(request.Status, "Status", Statuses),
            Guard.OneOf(request.RiskLevel, "Risk level", RiskLevels),
            request.LastOrderDate,
            Guard.Optional(request.Notes, "Notes"),
            createdAt,
            createdBy,
            now,
            _currentUser.UserId);

    private async Task EnsureCodeIsUniqueAsync(string code, string? currentId, CancellationToken cancellationToken)
    {
        var items = await _repository.ListAsync(cancellationToken);
        if (items.Any(x => x.Id != currentId && string.Equals(x.SupplierCode, code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"Supplier code '{code}' already exists.");
    }

    private static IEnumerable<SupplierDto> FilterEquals(
        IEnumerable<SupplierDto> items,
        string? value,
        Func<SupplierDto, string> selector)
        => string.IsNullOrWhiteSpace(value) || value == "all"
            ? items
            : items.Where(x => string.Equals(selector(x), value.Trim(), StringComparison.OrdinalIgnoreCase));
}

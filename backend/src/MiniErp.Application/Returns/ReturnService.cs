using MiniErp.Application.Abstractions;
using MiniErp.Application.Returns.Models;

namespace MiniErp.Application.Returns;

public sealed class ReturnService
{
    private readonly IReturnRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public ReturnService(IReturnRepository repository, ICurrentUser currentUser, IClock clock)
    {
        _repository = repository;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<PagedResult<ReturnDto>> GetListAsync(
        ReturnListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<ReturnDto> items = await _repository.ListAsync(cancellationToken);

        if (query.Type is not null)
            items = items.Where(x => x.Type == query.Type);

        if (query.Status is not null)
            items = items.Where(x => x.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.ReturnNo, keyword) ||
                Guard.Contains(x.ProductName, keyword) ||
                Guard.Contains(x.PartnerName, keyword) ||
                Guard.Contains(x.ProductMeta, keyword));
        }

        return Paging.Apply(items.OrderByDescending(x => x.RequestedAt), query.Limit, query.Cursor);
    }

    public Task<ReturnDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public async Task<ReturnDto> CreateAsync(
        CreateReturnRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = _clock.UtcNow;
        var partnerName = Guard.Required(request.PartnerName, "Partner name");

        var item = new ReturnDto(
            Id: Guid.NewGuid().ToString("N"),
            ReturnNo: DocumentNumber.Next("RET", now),
            Type: request.Type,
            PartnerName: partnerName,
            PartnerRole: Guard.Optional(request.PartnerRole, "Partner role", 100) ?? "—",
            PartnerInitials: InitialsFromName(partnerName),
            ProductName: Guard.Required(request.ProductName, "Product name"),
            ProductMeta: Guard.Optional(request.ProductMeta, "Product details", 200) ?? "—",
            Qty: Guard.Positive(request.Qty, "Quantity"),
            RequestedAt: now.UtcDateTime,
            Status: request.Status ?? ReturnStatus.Inspecting,
            CreatedAt: now.UtcDateTime,
            CreatedBy: _currentUser.UserId,
            UpdatedAt: now.UtcDateTime,
            UpdatedBy: _currentUser.UserId);

        await _repository.SaveAsync(item, cancellationToken);
        return item;
    }

    public async Task<ReturnDto?> UpdateAsync(
        string id,
        UpdateReturnRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return null;

        var partnerName = Guard.Required(request.PartnerName, "Partner name");

        var updated = existing with
        {
            Type = request.Type,
            PartnerName = partnerName,
            PartnerRole = Guard.Optional(request.PartnerRole, "Partner role", 100) ?? "—",
            PartnerInitials = InitialsFromName(partnerName),
            ProductName = Guard.Required(request.ProductName, "Product name"),
            ProductMeta = Guard.Optional(request.ProductMeta, "Product details", 200) ?? "—",
            Qty = Guard.Positive(request.Qty, "Quantity"),
            Status = request.Status,
            UpdatedAt = _clock.UtcNow.UtcDateTime,
            UpdatedBy = _currentUser.UserId
        };

        await _repository.SaveAsync(updated, cancellationToken);
        return updated;
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static string InitialsFromName(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "?";
        if (parts.Length == 1)
            return (parts[0].Length >= 2 ? parts[0][..2] : parts[0]).ToUpperInvariant();

        return string.Concat(parts.Take(2).Select(p => char.ToUpperInvariant(p[0])));
    }
}

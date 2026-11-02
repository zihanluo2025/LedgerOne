using System.Globalization;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;
using MiniErp.Application.Approvals.Models;
using MiniErp.Application.Inbounds.Models;
using MiniErp.Application.Suppliers;

namespace MiniErp.Application.Inbounds;

public sealed class InboundService
{
    private readonly IInboundRepository _repository;
    private readonly ISupplierRepository _suppliers;
    private readonly ApprovalService _approvals;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public InboundService(
        IInboundRepository repository,
        ISupplierRepository suppliers,
        ApprovalService approvals,
        ICurrentUser currentUser,
        IClock clock)
    {
        _repository = repository;
        _suppliers = suppliers;
        _approvals = approvals;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<PagedResult<InboundDto>> GetListAsync(
        InboundListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<InboundDto> items = await _repository.ListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.InboundNo, keyword) ||
                Guard.Contains(x.Supplier, keyword) ||
                Guard.Contains(x.SupplierId, keyword) ||
                Guard.Contains(x.Warehouse, keyword));
        }

        if (!string.IsNullOrWhiteSpace(query.Warehouse))
            items = items.Where(x => string.Equals(x.Warehouse, query.Warehouse, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(query.Status))
            items = items.Where(x => string.Equals(x.Status, query.Status, StringComparison.OrdinalIgnoreCase));

        return Paging.Apply(items.OrderByDescending(x => x.CreatedAt), query.Limit, query.Cursor);
    }

    public Task<InboundDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public async Task<InboundDto> CreateAsync(
        CreateInboundRequest request,
        CancellationToken cancellationToken = default)
    {
        var supplierName = await ResolveSupplierNameAsync(request.SupplierId, cancellationToken);
        var now = _clock.UtcNow;

        var item = new InboundDto(
            Id: Guid.NewGuid().ToString("N"),
            InboundNo: DocumentNumber.Next("INB", now),
            SupplierId: request.SupplierId.Trim(),
            Supplier: supplierName,
            Warehouse: Guard.Required(request.Warehouse, "Warehouse", 100),
            Items: Guard.Positive(request.Items, "Items"),
            ExpectedQty: Guard.Positive(request.ExpectedQty, "Expected quantity"),
            ReceivedQty: 0,
            Date: NormalizeDate(request.ExpectedDate),
            Status: InboundStatus.Pending,
            Notes: Guard.Optional(request.Notes, "Notes"),
            ApprovalStatus: ApprovalStatus.Pending,
            CreatedAt: now.UtcDateTime,
            CreatedBy: _currentUser.UserId,
            UpdatedAt: now.UtcDateTime,
            UpdatedBy: _currentUser.UserId);

        await _repository.SaveAsync(item, cancellationToken);

        await _approvals.SubmitAsync(new ApprovalSubmission(
            DocumentId: item.Id,
            DocumentNo: item.InboundNo,
            BusinessType: ApprovalBusinessType.Inbound,
            Summary: $"{item.ExpectedQty} units ({item.Items} items) from {item.Supplier}",
            Partner: item.Supplier,
            Quantity: item.ExpectedQty,
            Location: item.Warehouse), cancellationToken);

        return item;
    }

    public async Task<InboundDto?> UpdateAsync(
        string id,
        UpdateInboundRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return null;

        var supplierName = existing.SupplierId == request.SupplierId?.Trim()
            ? existing.Supplier
            : await ResolveSupplierNameAsync(request.SupplierId, cancellationToken);

        var expectedQty = Guard.Positive(request.ExpectedQty, "Expected quantity");
        var receivedQty = Guard.NonNegative(request.ReceivedQty ?? existing.ReceivedQty, "Received quantity");
        var hasException = request.HasException ?? existing.Status == InboundStatus.Exception;

        if (receivedQty > expectedQty)
            throw new ArgumentException("Received quantity cannot exceed expected quantity. Flag an exception instead.");

        var approved = existing.ApprovalStatus is null or ApprovalStatus.Approved;
        if (receivedQty > 0 && !approved)
            throw new InvalidOperationException("Inbound must be approved before goods can be received.");

        var updated = existing with
        {
            SupplierId = request.SupplierId!.Trim(),
            Supplier = supplierName,
            Warehouse = Guard.Required(request.Warehouse, "Warehouse", 100),
            Items = Guard.Positive(request.Items, "Items"),
            ExpectedQty = expectedQty,
            ReceivedQty = receivedQty,
            Date = NormalizeDate(request.ExpectedDate),
            Status = InboundStatus.Resolve(receivedQty, expectedQty, hasException),
            Notes = Guard.Optional(request.Notes, "Notes"),
            UpdatedAt = _clock.UtcNow.UtcDateTime,
            UpdatedBy = _currentUser.UserId
        };

        await _repository.SaveAsync(updated, cancellationToken);
        return updated;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var deleted = await _repository.DeleteAsync(id, cancellationToken);
        if (deleted)
            await _approvals.WithdrawForDocumentAsync(id, cancellationToken);

        return deleted;
    }

    public async Task BulkDeleteAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default)
    {
        foreach (var id in ids.Distinct())
            await DeleteAsync(id, cancellationToken);
    }

    private async Task<string> ResolveSupplierNameAsync(string? supplierId, CancellationToken cancellationToken)
    {
        var id = Guard.Required(supplierId, "Supplier", 100);
        var supplier = await _suppliers.GetByIdAsync(id, cancellationToken)
            ?? throw new ArgumentException("Supplier not found.");

        return supplier.SupplierName;
    }

    private static string NormalizeDate(string? value)
    {
        var raw = Guard.Required(value, "Expected date", 40);
        if (!DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var date))
            throw new ArgumentException("Expected date is not a valid date.");

        return date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }
}

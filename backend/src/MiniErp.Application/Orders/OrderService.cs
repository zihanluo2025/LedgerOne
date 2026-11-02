using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;
using MiniErp.Application.Approvals.Models;
using MiniErp.Application.Orders.Models;

namespace MiniErp.Application.Orders;

public sealed class OrderService
{
    // Statuses an order may hold before its approval has been granted.
    private static readonly OrderStatus[] PreApprovalStatuses = [OrderStatus.Draft, OrderStatus.Cancelled];

    private readonly IOrderRepository _repository;
    private readonly ApprovalService _approvals;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public OrderService(
        IOrderRepository repository,
        ApprovalService approvals,
        ICurrentUser currentUser,
        IClock clock)
    {
        _repository = repository;
        _approvals = approvals;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<PagedResult<OrderDto>> GetListAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<OrderDto> items = await _repository.ListAsync(cancellationToken);

        if (query.Status is not null)
            items = items.Where(x => x.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.OrderNo, keyword) ||
                Guard.Contains(x.CustomerName, keyword) ||
                Guard.Contains(x.Notes, keyword));
        }

        var ordered = items.OrderByDescending(x => x.OrderDate).ThenByDescending(x => x.CreatedAt);
        return Paging.Apply(ordered, query.Limit, query.Cursor);
    }

    public Task<OrderDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public async Task<OrderDto> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Status is not null && request.Status != OrderStatus.Draft)
            throw new ArgumentException("New orders start as Draft and are confirmed through approval.");

        var now = _clock.UtcNow;
        var item = new OrderDto(
            Id: Guid.NewGuid().ToString("N"),
            OrderNo: DocumentNumber.Next("SO", now),
            CustomerName: Guard.Required(request.CustomerName, "Customer name"),
            OrderDate: NormalizeDate(request.OrderDate ?? now.UtcDateTime),
            Status: OrderStatus.Draft,
            Currency: NormalizeCurrency(request.Currency),
            TotalAmount: Guard.NonNegative(request.TotalAmount, "Total amount"),
            Notes: Guard.Optional(request.Notes, "Notes"),
            ApprovalStatus: ApprovalStatus.Pending,
            CreatedAt: now.UtcDateTime,
            CreatedBy: _currentUser.UserId,
            UpdatedAt: now.UtcDateTime,
            UpdatedBy: _currentUser.UserId);

        await _repository.SaveAsync(item, cancellationToken);

        await _approvals.SubmitAsync(new ApprovalSubmission(
            DocumentId: item.Id,
            DocumentNo: item.OrderNo,
            BusinessType: ApprovalBusinessType.Sales,
            Summary: $"Sales order for {item.CustomerName}",
            Partner: item.CustomerName,
            Amount: item.TotalAmount,
            Currency: item.Currency), cancellationToken);

        return item;
    }

    public async Task<OrderDto?> UpdateAsync(
        string id,
        UpdateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return null;

        var approved = existing.ApprovalStatus is null or ApprovalStatus.Approved;
        if (!approved && !PreApprovalStatuses.Contains(request.Status))
            throw new InvalidOperationException($"Order must be approved before it can move to {request.Status}.");

        var updated = existing with
        {
            CustomerName = Guard.Required(request.CustomerName, "Customer name"),
            OrderDate = NormalizeDate(request.OrderDate),
            Status = request.Status,
            Currency = NormalizeCurrency(request.Currency),
            TotalAmount = Guard.NonNegative(request.TotalAmount, "Total amount"),
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

    private static string NormalizeCurrency(string? currency)
    {
        var value = Guard.Required(currency, "Currency", 3).ToUpperInvariant();
        if (value.Length != 3 || !value.All(char.IsAsciiLetter))
            throw new ArgumentException("Currency must be a 3-letter ISO code.");

        return value;
    }

    private static DateTime NormalizeDate(DateTime value)
        => value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(value, DateTimeKind.Utc) : value.ToUniversalTime();
}

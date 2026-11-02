using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;

namespace MiniErp.Application.Orders;

// Keeps sales orders in sync with their approval outcome.
public sealed class OrderApprovalHandler : IApprovalDocumentHandler
{
    private readonly IOrderRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public OrderApprovalHandler(IOrderRepository repository, ICurrentUser currentUser, IClock clock)
    {
        _repository = repository;
        _currentUser = currentUser;
        _clock = clock;
    }

    public ApprovalBusinessType BusinessType => ApprovalBusinessType.Sales;

    public async Task OnStatusChangedAsync(string documentId, ApprovalStatus status, CancellationToken cancellationToken)
    {
        var order = await _repository.GetByIdAsync(documentId, cancellationToken);
        if (order is null) return;

        var nextStatus = (status, order.Status) switch
        {
            (ApprovalStatus.Approved, OrderStatus.Draft) => OrderStatus.Confirmed,
            (ApprovalStatus.Rejected, OrderStatus.Draft) => OrderStatus.Cancelled,
            _ => order.Status
        };

        await _repository.SaveAsync(order with
        {
            Status = nextStatus,
            ApprovalStatus = status,
            UpdatedAt = _clock.UtcNow.UtcDateTime,
            UpdatedBy = _currentUser.UserId
        }, cancellationToken);
    }
}

using MiniErp.Application.Abstractions;
using MiniErp.Application.Orders.Models;

namespace MiniErp.Application.Orders;

public sealed class OrderService
{
    private readonly IOrderRepository _repository;

    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<OrderDto>> GetListAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default)
        => _repository.GetListAsync(query, cancellationToken);

    public Task<OrderDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public Task<OrderDto> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new ArgumentException("Customer name is required.");

        if (string.IsNullOrWhiteSpace(request.Currency))
            throw new ArgumentException("Currency is required.");

        if (request.TotalAmount < 0)
            throw new ArgumentException("Total amount must be >= 0.");

        return _repository.CreateAsync(request, cancellationToken);
    }

    public Task<OrderDto?> UpdateAsync(
        string id,
        UpdateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new ArgumentException("Customer name is required.");

        if (string.IsNullOrWhiteSpace(request.Currency))
            throw new ArgumentException("Currency is required.");

        if (request.TotalAmount < 0)
            throw new ArgumentException("Total amount must be >= 0.");

        return _repository.UpdateAsync(id, request, cancellationToken);
    }

    public Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);
}

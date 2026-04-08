using MiniErp.Application.Abstractions;
using MiniErp.Application.Orders.Models;

namespace MiniErp.Application.Orders;

public interface IOrderRepository
{
    Task<PagedResult<OrderDto>> GetListAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default);

    Task<OrderDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<OrderDto> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default);

    Task<OrderDto?> UpdateAsync(
        string id,
        UpdateOrderRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default);
}

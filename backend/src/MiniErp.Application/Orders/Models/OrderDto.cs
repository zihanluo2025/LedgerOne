using MiniErp.Application.Orders;

namespace MiniErp.Application.Orders.Models;

public sealed record OrderDto(
    string Id,
    string OrderNo,
    string CustomerName,
    DateTime OrderDate,
    OrderStatus Status,
    string Currency,
    decimal TotalAmount,
    string? Notes,
    DateTime CreatedAt
);

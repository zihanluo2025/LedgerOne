using MiniErp.Application.Orders;

namespace MiniErp.Application.Orders.Models;

public sealed record CreateOrderRequest(
    string CustomerName,
    DateTime? OrderDate,
    OrderStatus? Status,
    string Currency,
    decimal TotalAmount,
    string? Notes
);

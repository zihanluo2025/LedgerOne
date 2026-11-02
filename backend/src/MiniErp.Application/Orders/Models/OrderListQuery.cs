namespace MiniErp.Application.Orders.Models;

public sealed record OrderListQuery(
    string? Keyword,
    OrderStatus? Status = null,
    int Limit = 50,
    string? Cursor = null
);

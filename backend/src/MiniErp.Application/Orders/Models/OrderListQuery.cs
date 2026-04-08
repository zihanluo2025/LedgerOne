namespace MiniErp.Application.Orders.Models;

public sealed record OrderListQuery(
    string? Keyword,
    int Limit = 50,
    string? Cursor = null
);

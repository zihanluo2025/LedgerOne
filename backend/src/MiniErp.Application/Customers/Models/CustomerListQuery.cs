namespace MiniErp.Application.Customers.Models;

public sealed record CustomerListQuery(
    string? Keyword,
    string? Status = null,
    string? Segment = null,
    int Limit = 50,
    string? Cursor = null
);

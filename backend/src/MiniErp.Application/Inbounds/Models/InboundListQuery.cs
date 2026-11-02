namespace MiniErp.Application.Inbounds.Models;

public sealed record InboundListQuery(
    string? Keyword,
    string? Warehouse = null,
    string? Status = null,
    int Limit = 50,
    string? Cursor = null
);

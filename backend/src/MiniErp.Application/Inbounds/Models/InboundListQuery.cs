namespace MiniErp.Application.Inbounds.Models;

public sealed record InboundListQuery(
    string? Keyword,
    int Limit = 50,
    string? Cursor = null
);
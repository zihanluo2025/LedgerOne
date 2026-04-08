namespace MiniErp.Application.Returns.Models;

public sealed record ReturnListQuery(
    string? Keyword,
    int Limit = 50,
    string? Cursor = null
);

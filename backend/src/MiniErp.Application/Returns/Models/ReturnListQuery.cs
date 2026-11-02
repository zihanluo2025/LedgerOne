using MiniErp.Application.Returns;

namespace MiniErp.Application.Returns.Models;

public sealed record ReturnListQuery(
    string? Keyword,
    ReturnType? Type = null,
    ReturnStatus? Status = null,
    int Limit = 50,
    string? Cursor = null
);

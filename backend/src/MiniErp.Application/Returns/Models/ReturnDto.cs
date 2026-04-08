using MiniErp.Application.Returns;

namespace MiniErp.Application.Returns.Models;

public sealed record ReturnDto(
    string Id,
    string ReturnNo,
    ReturnType Type,
    string PartnerName,
    string PartnerRole,
    string PartnerInitials,
    string ProductName,
    string ProductMeta,
    int Qty,
    DateTime RequestedAt,
    ReturnStatus Status,
    DateTime CreatedAt
);

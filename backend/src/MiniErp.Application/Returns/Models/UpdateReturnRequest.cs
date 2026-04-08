using MiniErp.Application.Returns;

namespace MiniErp.Application.Returns.Models;

public sealed record UpdateReturnRequest(
    ReturnType Type,
    string PartnerName,
    string PartnerRole,
    string ProductName,
    string ProductMeta,
    int Qty,
    ReturnStatus Status
);

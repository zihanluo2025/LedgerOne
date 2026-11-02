using MiniErp.Application.Approvals;

namespace MiniErp.Application.Inbounds.Models;

public sealed record InboundDto(
    string Id,
    string InboundNo,
    string SupplierId,
    string Supplier,
    string Warehouse,
    int Items,
    int ExpectedQty,
    int ReceivedQty,
    string Date,
    string Status,
    string? Notes,
    ApprovalStatus? ApprovalStatus,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime UpdatedAt,
    string UpdatedBy
);

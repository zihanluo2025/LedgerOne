using MiniErp.Application.Approvals;

namespace MiniErp.Application.Orders.Models;

public sealed record OrderDto(
    string Id,
    string OrderNo,
    string CustomerName,
    DateTime OrderDate,
    OrderStatus Status,
    string Currency,
    decimal TotalAmount,
    string? Notes,
    ApprovalStatus? ApprovalStatus,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime UpdatedAt,
    string UpdatedBy
);

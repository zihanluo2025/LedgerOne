namespace MiniErp.Application.Approvals.Models;

// Immutable audit trail entry for every approval state transition.
public sealed record ApprovalLogDto(
    string Id,
    string ApprovalId,
    string DocumentNo,
    ApprovalBusinessType BusinessType,
    string RequesterName,
    string OperatorId,
    string OperatorName,
    ApprovalAction Action,
    ApprovalStatus? FromStatus,
    ApprovalStatus ToStatus,
    string? Comment,
    DateTime CreatedAt
);

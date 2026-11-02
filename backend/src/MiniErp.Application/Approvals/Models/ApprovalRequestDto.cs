namespace MiniErp.Application.Approvals.Models;

public sealed record ApprovalRequestDto(
    string Id,
    string DocumentId,
    string DocumentNo,
    ApprovalBusinessType BusinessType,
    string Summary,
    string Partner,
    int? Quantity,
    decimal? Amount,
    string? Currency,
    string? Location,
    string RequesterId,
    string RequesterName,
    ApprovalStatus Status,
    DateTime SubmittedAt,
    DateTime UpdatedAt,
    DateTime? ProcessedAt,
    string? ProcessedById,
    string? ProcessedByName,
    string? Comment
);

namespace MiniErp.Application.Approvals.Models;

public enum ApprovalScope
{
    All,
    Pending,
    Completed,
    Mine
}

public sealed record ApprovalListQuery(
    ApprovalScope Scope = ApprovalScope.All,
    string? Keyword = null,
    ApprovalBusinessType? BusinessType = null,
    ApprovalStatus? Status = null,
    int Limit = 200,
    string? Cursor = null
);

public sealed record ApprovalLogListQuery(
    string? Keyword = null,
    ApprovalAction? Action = null,
    int Limit = 200,
    string? Cursor = null
);

public sealed record ApprovalDecisionRequest(string? Comment);

public sealed record BatchApprovalRequest(IReadOnlyList<string> Ids, string? Comment);

public sealed record BatchApprovalResult(int Approved, IReadOnlyList<string> Skipped);

// Input used by business modules (orders, inbounds) to submit a document for approval.
public sealed record ApprovalSubmission(
    string DocumentId,
    string DocumentNo,
    ApprovalBusinessType BusinessType,
    string Summary,
    string Partner,
    int? Quantity = null,
    decimal? Amount = null,
    string? Currency = null,
    string? Location = null
);

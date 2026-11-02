using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals.Models;
using MiniErp.Domain.Auth;

namespace MiniErp.Application.Approvals;

public sealed class ApprovalService
{
    private readonly IApprovalRepository _approvals;
    private readonly IApprovalLogRepository _logs;
    private readonly IEnumerable<IApprovalDocumentHandler> _handlers;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public ApprovalService(
        IApprovalRepository approvals,
        IApprovalLogRepository logs,
        IEnumerable<IApprovalDocumentHandler> handlers,
        ICurrentUser currentUser,
        IClock clock)
    {
        _approvals = approvals;
        _logs = logs;
        _handlers = handlers;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<PagedResult<ApprovalRequestDto>> ListAsync(
        ApprovalListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<ApprovalRequestDto> items = await _approvals.ListAsync(cancellationToken);

        items = query.Scope switch
        {
            ApprovalScope.Pending => items.Where(x => x.Status == ApprovalStatus.Pending),
            ApprovalScope.Completed => items.Where(x => x.Status is ApprovalStatus.Approved or ApprovalStatus.Rejected),
            ApprovalScope.Mine => items.Where(x => x.RequesterId == _currentUser.UserId),
            _ => items
        };

        if (query.BusinessType is not null)
            items = items.Where(x => x.BusinessType == query.BusinessType);

        if (query.Status is not null)
            items = items.Where(x => x.Status == query.Status);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.DocumentNo, keyword) ||
                Guard.Contains(x.Summary, keyword) ||
                Guard.Contains(x.Partner, keyword) ||
                Guard.Contains(x.RequesterName, keyword) ||
                Guard.Contains(x.ProcessedByName, keyword));
        }

        var ordered = query.Scope == ApprovalScope.Completed
            ? items.OrderByDescending(x => x.ProcessedAt ?? x.UpdatedAt)
            : items.OrderByDescending(x => x.SubmittedAt);

        return Paging.Apply(ordered, query.Limit, query.Cursor);
    }

    public Task<ApprovalRequestDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => _approvals.GetByIdAsync(id, cancellationToken);

    public async Task<PagedResult<ApprovalLogDto>> ListLogsAsync(
        ApprovalLogListQuery query,
        CancellationToken cancellationToken = default)
    {
        EnsureApprover();

        IEnumerable<ApprovalLogDto> items = await _logs.ListAsync(cancellationToken);

        if (query.Action is not null)
            items = items.Where(x => x.Action == query.Action);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.DocumentNo, keyword) ||
                Guard.Contains(x.RequesterName, keyword) ||
                Guard.Contains(x.OperatorName, keyword) ||
                Guard.Contains(x.Comment, keyword));
        }

        return Paging.Apply(items.OrderByDescending(x => x.CreatedAt), query.Limit, query.Cursor);
    }

    public async Task<ApprovalRequestDto> SubmitAsync(
        ApprovalSubmission submission,
        CancellationToken cancellationToken = default)
    {
        var now = Now();

        var request = new ApprovalRequestDto(
            Id: Guid.NewGuid().ToString("N"),
            DocumentId: submission.DocumentId,
            DocumentNo: submission.DocumentNo,
            BusinessType: submission.BusinessType,
            Summary: submission.Summary,
            Partner: submission.Partner,
            Quantity: submission.Quantity,
            Amount: submission.Amount,
            Currency: submission.Currency,
            Location: submission.Location,
            RequesterId: _currentUser.UserId,
            RequesterName: _currentUser.DisplayName,
            Status: ApprovalStatus.Pending,
            SubmittedAt: now,
            UpdatedAt: now,
            ProcessedAt: null,
            ProcessedById: null,
            ProcessedByName: null,
            Comment: null);

        await _approvals.SaveAsync(request, cancellationToken);
        await WriteLogAsync(request, ApprovalAction.Submit, null, "Submitted for approval.", cancellationToken);

        return request;
    }

    public Task<ApprovalRequestDto> ApproveAsync(string id, string? comment, CancellationToken cancellationToken = default)
    {
        EnsureApprover();
        return DecideAsync(id, ApprovalAction.Approve, ApprovalStatus.Approved, comment, cancellationToken);
    }

    public Task<ApprovalRequestDto> RejectAsync(string id, string? comment, CancellationToken cancellationToken = default)
    {
        EnsureApprover();
        Guard.Required(comment, "Rejection comment", 500);
        return DecideAsync(id, ApprovalAction.Reject, ApprovalStatus.Rejected, comment, cancellationToken);
    }

    public async Task<ApprovalRequestDto> WithdrawAsync(string id, CancellationToken cancellationToken = default)
    {
        var request = await GetPendingAsync(id, cancellationToken);

        if (request.RequesterId != _currentUser.UserId && _currentUser.Role != Role.Admin)
            throw new UnauthorizedAccessException("Only the requester can withdraw this request.");

        return await TransitionAsync(
            request, ApprovalAction.Withdraw, ApprovalStatus.Withdrawn, "Withdrawn by requester.", cancellationToken);
    }

    public async Task<BatchApprovalResult> BatchApproveAsync(
        BatchApprovalRequest request,
        CancellationToken cancellationToken = default)
    {
        EnsureApprover();

        if (request.Ids is null || request.Ids.Count == 0)
            throw new ArgumentException("At least one approval id is required.");

        var approved = 0;
        var skipped = new List<string>();

        foreach (var id in request.Ids.Distinct())
        {
            var item = await _approvals.GetByIdAsync(id, cancellationToken);
            if (item is null || item.Status != ApprovalStatus.Pending)
            {
                skipped.Add(id);
                continue;
            }

            await TransitionAsync(item, ApprovalAction.Approve, ApprovalStatus.Approved, request.Comment, cancellationToken);
            approved++;
        }

        return new BatchApprovalResult(approved, skipped);
    }

    // Called when the underlying document is deleted so the request no longer waits in the queue.
    public async Task WithdrawForDocumentAsync(string documentId, CancellationToken cancellationToken = default)
    {
        var items = await _approvals.ListAsync(cancellationToken);
        foreach (var item in items.Where(x => x.DocumentId == documentId && x.Status == ApprovalStatus.Pending))
        {
            await TransitionAsync(
                item, ApprovalAction.Withdraw, ApprovalStatus.Withdrawn, "Source document deleted.", cancellationToken);
        }
    }

    private async Task<ApprovalRequestDto> DecideAsync(
        string id,
        ApprovalAction action,
        ApprovalStatus status,
        string? comment,
        CancellationToken cancellationToken)
    {
        var request = await GetPendingAsync(id, cancellationToken);
        return await TransitionAsync(request, action, status, comment, cancellationToken);
    }

    private async Task<ApprovalRequestDto> GetPendingAsync(string id, CancellationToken cancellationToken)
    {
        var request = await _approvals.GetByIdAsync(id, cancellationToken)
            ?? throw new KeyNotFoundException("Approval request not found.");

        if (request.Status != ApprovalStatus.Pending)
            throw new InvalidOperationException($"Approval request is already {request.Status}.");

        return request;
    }

    private async Task<ApprovalRequestDto> TransitionAsync(
        ApprovalRequestDto request,
        ApprovalAction action,
        ApprovalStatus status,
        string? comment,
        CancellationToken cancellationToken)
    {
        var now = Now();
        var trimmedComment = Guard.Optional(comment, "Comment", 500);
        var isDecision = action is ApprovalAction.Approve or ApprovalAction.Reject;

        var updated = request with
        {
            Status = status,
            UpdatedAt = now,
            ProcessedAt = isDecision ? now : request.ProcessedAt,
            ProcessedById = isDecision ? _currentUser.UserId : request.ProcessedById,
            ProcessedByName = isDecision ? _currentUser.DisplayName : request.ProcessedByName,
            Comment = trimmedComment ?? request.Comment
        };

        await _approvals.SaveAsync(updated, cancellationToken);
        await WriteLogAsync(updated, action, request.Status, trimmedComment, cancellationToken);

        foreach (var handler in _handlers.Where(h => h.BusinessType == updated.BusinessType))
            await handler.OnStatusChangedAsync(updated.DocumentId, status, cancellationToken);

        return updated;
    }

    private Task WriteLogAsync(
        ApprovalRequestDto request,
        ApprovalAction action,
        ApprovalStatus? fromStatus,
        string? comment,
        CancellationToken cancellationToken)
        => _logs.SaveAsync(new ApprovalLogDto(
            Id: Guid.NewGuid().ToString("N"),
            ApprovalId: request.Id,
            DocumentNo: request.DocumentNo,
            BusinessType: request.BusinessType,
            RequesterName: request.RequesterName,
            OperatorId: _currentUser.UserId,
            OperatorName: _currentUser.DisplayName,
            Action: action,
            FromStatus: fromStatus,
            ToStatus: request.Status,
            Comment: comment,
            CreatedAt: Now()), cancellationToken);

    // RBAC hook: approvers are admins for now; swap for a permission check when roles expand.
    private void EnsureApprover()
    {
        if (_currentUser.Role != Role.Admin)
            throw new UnauthorizedAccessException("Only approvers can perform this action.");
    }

    private DateTime Now() => _clock.UtcNow.UtcDateTime;
}

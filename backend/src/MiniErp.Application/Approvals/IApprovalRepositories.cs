using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals.Models;

namespace MiniErp.Application.Approvals;

public interface IApprovalRepository : IEntityRepository<ApprovalRequestDto>;

public interface IApprovalLogRepository : IEntityRepository<ApprovalLogDto>;

// Implemented by business modules to react to approval decisions on their documents.
public interface IApprovalDocumentHandler
{
    ApprovalBusinessType BusinessType { get; }

    Task OnStatusChangedAsync(string documentId, ApprovalStatus status, CancellationToken cancellationToken);
}

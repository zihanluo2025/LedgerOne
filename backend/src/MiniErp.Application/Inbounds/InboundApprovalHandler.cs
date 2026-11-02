using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;

namespace MiniErp.Application.Inbounds;

// Records approval outcome on the inbound so receiving can be gated on it.
public sealed class InboundApprovalHandler : IApprovalDocumentHandler
{
    private readonly IInboundRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public InboundApprovalHandler(IInboundRepository repository, ICurrentUser currentUser, IClock clock)
    {
        _repository = repository;
        _currentUser = currentUser;
        _clock = clock;
    }

    public ApprovalBusinessType BusinessType => ApprovalBusinessType.Inbound;

    public async Task OnStatusChangedAsync(string documentId, ApprovalStatus status, CancellationToken cancellationToken)
    {
        var inbound = await _repository.GetByIdAsync(documentId, cancellationToken);
        if (inbound is null) return;

        await _repository.SaveAsync(inbound with
        {
            ApprovalStatus = status,
            UpdatedAt = _clock.UtcNow.UtcDateTime,
            UpdatedBy = _currentUser.UserId
        }, cancellationToken);
    }
}

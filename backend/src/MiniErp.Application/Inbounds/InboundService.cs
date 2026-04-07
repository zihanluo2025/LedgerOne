using MiniErp.Application.Abstractions;
using MiniErp.Application.Inbounds.Models;

namespace MiniErp.Application.Inbounds;

public sealed class InboundService
{
    private readonly IInboundRepository _repository;

    public InboundService(IInboundRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<InboundDto>> GetListAsync(
        InboundListQuery query,
        CancellationToken cancellationToken = default)
        => _repository.GetListAsync(query, cancellationToken);

    public Task<InboundDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public Task<InboundDto> CreateAsync(
        CreateInboundRequest request,
        CancellationToken cancellationToken = default)
        => _repository.CreateAsync(request, cancellationToken);

    public Task<InboundDto?> UpdateAsync(
        string id,
        UpdateInboundRequest request,
        CancellationToken cancellationToken = default)
        => _repository.UpdateAsync(id, request, cancellationToken);

    public Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    public Task BulkDeleteAsync(
        IEnumerable<string> ids,
        CancellationToken cancellationToken = default)
        => _repository.BulkDeleteAsync(ids, cancellationToken);
}
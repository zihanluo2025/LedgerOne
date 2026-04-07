using MiniErp.Application.Abstractions;
using MiniErp.Application.Inbounds.Models;

namespace MiniErp.Application.Inbounds;

public interface IInboundRepository
{
    Task<PagedResult<InboundDto>> GetListAsync(
        InboundListQuery query,
        CancellationToken cancellationToken = default);

    Task<InboundDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<InboundDto> CreateAsync(
        CreateInboundRequest request,
        CancellationToken cancellationToken = default);

    Task<InboundDto?> UpdateAsync(
        string id,
        UpdateInboundRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task BulkDeleteAsync(
        IEnumerable<string> ids,
        CancellationToken cancellationToken = default);
}
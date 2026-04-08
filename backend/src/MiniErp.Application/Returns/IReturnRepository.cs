using MiniErp.Application.Abstractions;
using MiniErp.Application.Returns.Models;

namespace MiniErp.Application.Returns;

public interface IReturnRepository
{
    Task<PagedResult<ReturnDto>> GetListAsync(
        ReturnListQuery query,
        CancellationToken cancellationToken = default);

    Task<ReturnDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<ReturnDto> CreateAsync(
        CreateReturnRequest request,
        CancellationToken cancellationToken = default);

    Task<ReturnDto?> UpdateAsync(
        string id,
        UpdateReturnRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default);
}

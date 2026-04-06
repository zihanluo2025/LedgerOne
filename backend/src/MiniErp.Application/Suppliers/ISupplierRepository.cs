using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Application.Suppliers;

public interface ISupplierRepository
{
    Task<PagedResult<SupplierDto>> GetListAsync(SupplierListQuery query, CancellationToken cancellationToken = default);
    Task<SupplierSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<SupplierDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default);
    Task<SupplierDto?> UpdateAsync(string id, UpdateSupplierRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task BulkDeleteAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default);
}
using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Application.Suppliers;

public sealed class SupplierService
{
    private readonly ISupplierRepository _supplierRepository;

    public SupplierService(ISupplierRepository supplierRepository)
    {
        _supplierRepository = supplierRepository;
    }

    public Task<PagedResult<SupplierDto>> GetSuppliersAsync(
        SupplierListQuery query,
        CancellationToken cancellationToken = default)
    {
        return _supplierRepository.GetListAsync(query, cancellationToken);
    }

    public Task<SupplierSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        return _supplierRepository.GetSummaryAsync(cancellationToken);
    }

    public Task<SupplierDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return _supplierRepository.GetByIdAsync(id, cancellationToken);
    }

    public Task<SupplierDto> CreateAsync(
        CreateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        return _supplierRepository.CreateAsync(request, cancellationToken);
    }

    public Task<SupplierDto?> UpdateAsync(
        string id,
        UpdateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        return _supplierRepository.UpdateAsync(id, request, cancellationToken);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        return _supplierRepository.DeleteAsync(id, cancellationToken);
    }

    public Task BulkDeleteAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default)
    {
        return _supplierRepository.BulkDeleteAsync(ids, cancellationToken);
    }
}
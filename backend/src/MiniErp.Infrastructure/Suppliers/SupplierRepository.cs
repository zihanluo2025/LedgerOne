using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Infrastructure.Suppliers;

public sealed class SupplierRepository : ISupplierRepository
{
    private static readonly List<SupplierDto> _data = new();

    public Task<PagedResult<SupplierDto>> GetListAsync(
        SupplierListQuery query,
        CancellationToken cancellationToken = default)
    {
        var items = _data.Take(query.Limit).ToList();
        return Task.FromResult(new PagedResult<SupplierDto>(items, null));
    }

    public Task<SupplierSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new SupplierSummaryDto(
            _data.Count,
            _data.Count(x => x.Status == "active"),
            _data.Count(x => x.Status == "pending_review"),
            _data.Count(x => x.RiskLevel == "high")
        ));
    }

    public Task<SupplierDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_data.FirstOrDefault(x => x.Id == id));
    }

    public Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default)
    {
        var item = new SupplierDto(
            Guid.NewGuid().ToString("N"),
            request.SupplierCode,
            request.SupplierName,
            request.PrimaryCategory,
            request.ContactPerson,
            request.ContactEmail,
            request.ContactPhone,
            request.Region,
            request.Address,
            request.Website,
            request.Status,
            request.RiskLevel,
            request.LastOrderDate,
            request.Notes,
            DateTime.UtcNow,
            DateTime.UtcNow
        );

        _data.Add(item);
        return Task.FromResult(item);
    }

    public Task<SupplierDto?> UpdateAsync(string id, UpdateSupplierRequest request, CancellationToken cancellationToken = default)
    {
        var existing = _data.FirstOrDefault(x => x.Id == id);
        if (existing is null) return Task.FromResult<SupplierDto?>(null);

        var updated = existing with
        {
            SupplierCode = request.SupplierCode,
            SupplierName = request.SupplierName,
            PrimaryCategory = request.PrimaryCategory,
            ContactPerson = request.ContactPerson,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Region = request.Region,
            Address = request.Address,
            Website = request.Website,
            Status = request.Status,
            RiskLevel = request.RiskLevel,
            LastOrderDate = request.LastOrderDate,
            Notes = request.Notes,
            UpdatedAt = DateTime.UtcNow
        };

        _data.Remove(existing);
        _data.Add(updated);

        return Task.FromResult<SupplierDto?>(updated);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var item = _data.FirstOrDefault(x => x.Id == id);
        if (item is null) return Task.FromResult(false);

        _data.Remove(item);
        return Task.FromResult(true);
    }

    public Task BulkDeleteAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default)
    {
        var set = ids.ToHashSet();
        _data.RemoveAll(x => set.Contains(x.Id));
        return Task.CompletedTask;
    }
}
using MiniErp.Application.Abstractions;
using MiniErp.Application.Inbounds;
using MiniErp.Application.Inbounds.Models;

namespace MiniErp.Infrastructure.Inbounds;

public sealed class InboundRepository : IInboundRepository
{
    private static readonly List<InboundDto> _data = new();

    public Task<PagedResult<InboundDto>> GetListAsync(
        InboundListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<InboundDto> items = _data;

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();

            items = items.Where(x =>
                x.InboundNo.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.Supplier.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.Warehouse.Contains(keyword, StringComparison.OrdinalIgnoreCase));
        }

        var result = items
            .OrderByDescending(x => x.CreatedAt)
            .Take(query.Limit)
            .ToList();

        return Task.FromResult(new PagedResult<InboundDto>(result, null));
    }

    public Task<InboundDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var item = _data.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(item);
    }

    public Task<InboundDto> CreateAsync(
        CreateInboundRequest request,
        CancellationToken cancellationToken = default)
    {
        var item = new InboundDto(
            Guid.NewGuid().ToString("N"),
            $"INB-{Random.Shared.Next(1000, 9999)}",
            request.SupplierId,
            request.SupplierId,
            request.Warehouse,
            request.Items,
            request.ExpectedQty,
            0,
            DateTime.UtcNow.ToString("yyyy-MM-dd"),
            "Pending",
            DateTime.UtcNow
        );

        _data.Add(item);

        return Task.FromResult(item);
    }

    public Task<InboundDto?> UpdateAsync(
        string id,
        UpdateInboundRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = _data.FirstOrDefault(x => x.Id == id);
        if (existing is null) return Task.FromResult<InboundDto?>(null);

        var updated = existing with
        {
            SupplierId = request.SupplierId,
            Supplier = request.SupplierId,
            Warehouse = request.Warehouse,
            ExpectedQty = request.ExpectedQty,
            Items = request.Items,
        };

        _data.Remove(existing);
        _data.Add(updated);

        return Task.FromResult<InboundDto?>(updated);
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
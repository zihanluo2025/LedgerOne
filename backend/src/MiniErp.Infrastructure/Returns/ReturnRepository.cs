using MiniErp.Application.Abstractions;
using MiniErp.Application.Returns;
using MiniErp.Application.Returns.Models;

namespace MiniErp.Infrastructure.Returns;

public sealed class ReturnRepository : IReturnRepository
{
    private static readonly List<ReturnDto> Data = new();

    private static string InitialsFromName(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "?";
        if (parts.Length == 1)
        {
            var p = parts[0];
            return p.Length >= 2
                ? p[..2].ToUpperInvariant()
                : p.ToUpperInvariant();
        }

        return string.Concat(parts.Take(2).Select(p => char.ToUpperInvariant(p[0])));
    }

    private static string NextReturnNo()
        => $"RET-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(1000, 9999)}";

    public Task<PagedResult<ReturnDto>> GetListAsync(
        ReturnListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<ReturnDto> items = Data;

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();

            items = items.Where(x =>
                x.ReturnNo.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.ProductName.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.PartnerName.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.ProductMeta.Contains(keyword, StringComparison.OrdinalIgnoreCase));
        }

        var result = items
            .OrderByDescending(x => x.RequestedAt)
            .Take(Math.Clamp(query.Limit, 1, 200))
            .ToList();

        return Task.FromResult(new PagedResult<ReturnDto>(result, null));
    }

    public Task<ReturnDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var item = Data.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(item);
    }

    public Task<ReturnDto> CreateAsync(
        CreateReturnRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var partnerName = request.PartnerName.Trim();
        var partnerRole = string.IsNullOrWhiteSpace(request.PartnerRole)
            ? "—"
            : request.PartnerRole.Trim();

        var item = new ReturnDto(
            Guid.NewGuid().ToString("N"),
            NextReturnNo(),
            request.Type,
            partnerName,
            partnerRole,
            InitialsFromName(partnerName),
            request.ProductName.Trim(),
            string.IsNullOrWhiteSpace(request.ProductMeta) ? "—" : request.ProductMeta.Trim(),
            request.Qty,
            now,
            request.Status ?? ReturnStatus.Inspecting,
            now);

        Data.Add(item);
        return Task.FromResult(item);
    }

    public Task<ReturnDto?> UpdateAsync(
        string id,
        UpdateReturnRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = Data.FirstOrDefault(x => x.Id == id);
        if (existing is null) return Task.FromResult<ReturnDto?>(null);

        var partnerName = request.PartnerName.Trim();
        var partnerRole = string.IsNullOrWhiteSpace(request.PartnerRole)
            ? "—"
            : request.PartnerRole.Trim();

        var updated = existing with
        {
            Type = request.Type,
            PartnerName = partnerName,
            PartnerRole = partnerRole,
            PartnerInitials = InitialsFromName(partnerName),
            ProductName = request.ProductName.Trim(),
            ProductMeta = string.IsNullOrWhiteSpace(request.ProductMeta)
                ? "—"
                : request.ProductMeta.Trim(),
            Qty = request.Qty,
            Status = request.Status
        };

        Data.Remove(existing);
        Data.Add(updated);
        return Task.FromResult<ReturnDto?>(updated);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var item = Data.FirstOrDefault(x => x.Id == id);
        if (item is null) return Task.FromResult(false);

        Data.Remove(item);
        return Task.FromResult(true);
    }
}

using MiniErp.Application.Abstractions;
using MiniErp.Application.Orders;
using MiniErp.Application.Orders.Models;

namespace MiniErp.Infrastructure.Orders;

public sealed class OrderRepository : IOrderRepository
{
    private static readonly List<OrderDto> Data = new();

    private static string NextOrderNo()
        => $"SO-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(1000, 9999)}";

    public Task<PagedResult<OrderDto>> GetListAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<OrderDto> items = Data;

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();

            items = items.Where(x =>
                x.OrderNo.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                x.CustomerName.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                (x.Notes ?? "").Contains(keyword, StringComparison.OrdinalIgnoreCase));
        }

        var result = items
            .OrderByDescending(x => x.OrderDate)
            .Take(Math.Clamp(query.Limit, 1, 500))
            .ToList();

        return Task.FromResult(new PagedResult<OrderDto>(result, null));
    }

    public Task<OrderDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var item = Data.FirstOrDefault(x => x.Id == id);
        return Task.FromResult(item);
    }

    public Task<OrderDto> CreateAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var orderDate = request.OrderDate ?? now;
        var status = request.Status ?? OrderStatus.Draft;
        var currency = request.Currency.Trim().ToUpperInvariant();
        if (currency.Length > 3)
            currency = currency[..3];

        var item = new OrderDto(
            Guid.NewGuid().ToString("N"),
            NextOrderNo(),
            request.CustomerName.Trim(),
            orderDate,
            status,
            currency,
            request.TotalAmount,
            string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            now);

        Data.Add(item);
        return Task.FromResult(item);
    }

    public Task<OrderDto?> UpdateAsync(
        string id,
        UpdateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = Data.FirstOrDefault(x => x.Id == id);
        if (existing is null) return Task.FromResult<OrderDto?>(null);

        var currency = request.Currency.Trim().ToUpperInvariant();
        if (currency.Length > 3)
            currency = currency[..3];

        var updated = existing with
        {
            CustomerName = request.CustomerName.Trim(),
            OrderDate = request.OrderDate,
            Status = request.Status,
            Currency = currency,
            TotalAmount = request.TotalAmount,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
        };

        Data.Remove(existing);
        Data.Add(updated);
        return Task.FromResult<OrderDto?>(updated);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var item = Data.FirstOrDefault(x => x.Id == id);
        if (item is null) return Task.FromResult(false);

        Data.Remove(item);
        return Task.FromResult(true);
    }
}

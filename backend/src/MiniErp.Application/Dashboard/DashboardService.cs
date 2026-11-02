using System.Globalization;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;
using MiniErp.Application.Inbounds;
using MiniErp.Application.Orders;
using MiniErp.Application.Orders.Models;
using MiniErp.Application.Products;

namespace MiniErp.Application.Dashboard;

public sealed class DashboardService
{
    public const int LowStockThreshold = 20;
    public static readonly TimeSpan ApprovalOverdueAfter = TimeSpan.FromHours(48);

    private const int MaxProducts = 1000;
    private const int BreakdownSlices = 5;
    private const int MaxNotices = 6;

    private readonly IProductRepository _products;
    private readonly IOrderRepository _orders;
    private readonly IInboundRepository _inbounds;
    private readonly IApprovalRepository _approvals;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public DashboardService(
        IProductRepository products,
        IOrderRepository orders,
        IInboundRepository inbounds,
        IApprovalRepository approvals,
        ICurrentUser currentUser,
        IClock clock)
    {
        _products = products;
        _orders = orders;
        _inbounds = inbounds;
        _approvals = approvals;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(int trendDays, CancellationToken cancellationToken = default)
    {
        var days = Math.Clamp(trendDays, 7, 90);
        var now = _clock.UtcNow.UtcDateTime;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = monthStart.AddMonths(-1);

        var products = await _products.ListAsync(_currentUser.OrgId, null, MaxProducts, null, cancellationToken);
        var orders = await _orders.ListAsync(cancellationToken);
        var inbounds = await _inbounds.ListAsync(cancellationToken);
        var approvals = await _approvals.ListAsync(cancellationToken);

        var billable = orders.Where(x => x.Status != OrderStatus.Cancelled).ToList();
        var pendingApprovals = approvals.Where(x => x.Status == ApprovalStatus.Pending).ToList();

        var inventory = new InventoryKpi(
            ProductCount: products.Count,
            TotalStock: products.Sum(x => x.Stock),
            StockValue: products.Sum(x => x.Price * x.Stock),
            LowStockCount: products.Count(x => x.Stock > 0 && x.Stock <= LowStockThreshold),
            OutOfStockCount: products.Count(x => x.Stock == 0));

        var inbound = new InboundKpi(
            Total: inbounds.Count,
            Open: inbounds.Count(x => InboundStatus.IsOpen(x.Status)),
            PendingApproval: inbounds.Count(x => x.ApprovalStatus == ApprovalStatus.Pending),
            CompletedThisMonth: inbounds.Count(x => x.Status == InboundStatus.Completed && x.UpdatedAt >= monthStart),
            Exceptions: inbounds.Count(x => x.Status == InboundStatus.Exception));

        var thisMonth = billable.Where(x => x.OrderDate >= monthStart).ToList();
        var lastMonth = billable.Where(x => x.OrderDate >= lastMonthStart && x.OrderDate < monthStart).ToList();

        var sales = new SalesKpi(
            OrdersThisMonth: thisMonth.Count,
            OrdersLastMonth: lastMonth.Count,
            RevenueThisMonth: thisMonth.Sum(x => x.TotalAmount),
            RevenueLastMonth: lastMonth.Sum(x => x.TotalAmount),
            OpenOrders: orders.Count(x => x.Status is OrderStatus.Draft or OrderStatus.Confirmed or OrderStatus.Processing or OrderStatus.Shipped),
            Currency: PrimaryCurrency(billable));

        var approvalKpi = new ApprovalKpi(
            Pending: pendingApprovals.Count,
            Overdue: pendingApprovals.Count(x => now - x.SubmittedAt > ApprovalOverdueAfter));

        return new DashboardSummaryDto(
            inventory,
            inbound,
            sales,
            approvalKpi,
            BuildSalesTrend(billable, now.Date, days),
            BuildInventoryBreakdown(products),
            BuildNotices(products, orders, inbounds, approvalKpi, now),
            now);
    }

    private static IReadOnlyList<SalesTrendPoint> BuildSalesTrend(IReadOnlyList<OrderDto> orders, DateTime today, int days)
    {
        var byDay = orders
            .GroupBy(x => x.OrderDate.Date)
            .ToDictionary(g => g.Key, g => (Amount: g.Sum(x => x.TotalAmount), Count: g.Count()));

        return Enumerable.Range(0, days)
            .Select(offset => today.AddDays(offset - days + 1))
            .Select(day =>
            {
                byDay.TryGetValue(day, out var bucket);
                var label = days <= 7
                    ? day.ToString("ddd", CultureInfo.InvariantCulture).ToUpperInvariant()
                    : day.ToString("MMM dd", CultureInfo.InvariantCulture);

                return new SalesTrendPoint(
                    day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    label,
                    bucket.Amount,
                    bucket.Count);
            })
            .ToList();
    }

    private static IReadOnlyList<InventorySlice> BuildInventoryBreakdown(IReadOnlyList<Products.Models.ProductDto> products)
    {
        var stocked = products.Where(x => x.Stock > 0).OrderByDescending(x => x.Stock).ToList();
        var slices = stocked.Take(BreakdownSlices).Select(x => new InventorySlice(x.Name, x.Stock)).ToList();

        var others = stocked.Skip(BreakdownSlices).Sum(x => x.Stock);
        if (others > 0)
            slices.Add(new InventorySlice("Others", others));

        return slices;
    }

    private static IReadOnlyList<DashboardNotice> BuildNotices(
        IReadOnlyList<Products.Models.ProductDto> products,
        IReadOnlyList<OrderDto> orders,
        IReadOnlyList<Inbounds.Models.InboundDto> inbounds,
        ApprovalKpi approvals,
        DateTime now)
    {
        var alerts = new List<DashboardNotice>();

        var outOfStock = products.Where(x => x.Stock == 0).ToList();
        if (outOfStock.Count > 0)
        {
            alerts.Add(new DashboardNotice(
                NoticeType.Alert,
                $"{outOfStock.Count} product(s) out of stock",
                $"{string.Join(", ", outOfStock.Take(3).Select(x => x.Name))} need replenishment.",
                outOfStock.Max(x => x.UpdatedAt).UtcDateTime));
        }

        var lowStock = products.Where(x => x.Stock > 0 && x.Stock <= LowStockThreshold).OrderBy(x => x.Stock).ToList();
        if (lowStock.Count > 0)
        {
            alerts.Add(new DashboardNotice(
                NoticeType.Alert,
                $"{lowStock.Count} product(s) running low",
                $"{string.Join(", ", lowStock.Take(3).Select(x => $"{x.Name} ({x.Stock})"))} at or below {LowStockThreshold} units.",
                lowStock.Max(x => x.UpdatedAt).UtcDateTime));
        }

        if (approvals.Overdue > 0)
        {
            alerts.Add(new DashboardNotice(
                NoticeType.Alert,
                $"{approvals.Overdue} approval(s) overdue",
                $"Requests have been waiting for more than {ApprovalOverdueAfter.TotalHours:0} hours.",
                now));
        }

        var exceptions = inbounds.Where(x => x.Status == InboundStatus.Exception).ToList();
        if (exceptions.Count > 0)
        {
            alerts.Add(new DashboardNotice(
                NoticeType.Alert,
                $"{exceptions.Count} inbound exception(s)",
                $"Review receiving discrepancies: {string.Join(", ", exceptions.Take(3).Select(x => x.InboundNo))}.",
                exceptions.Max(x => x.UpdatedAt)));
        }

        var updates = new List<DashboardNotice>();

        if (approvals.Pending > 0)
        {
            updates.Add(new DashboardNotice(
                NoticeType.Update,
                $"{approvals.Pending} request(s) awaiting approval",
                "Inbound and sales documents are waiting in the approval queue.",
                now));
        }

        updates.AddRange(orders
            .OrderByDescending(x => x.CreatedAt)
            .Take(2)
            .Select(x => new DashboardNotice(
                NoticeType.New,
                $"New order {x.OrderNo}",
                $"{x.CustomerName} · {x.Currency} {x.TotalAmount:N2} · {x.Status}",
                x.CreatedAt)));

        updates.AddRange(inbounds
            .OrderByDescending(x => x.CreatedAt)
            .Take(2)
            .Select(x => new DashboardNotice(
                NoticeType.New,
                $"New inbound {x.InboundNo}",
                $"{x.Supplier} → {x.Warehouse} · {x.ExpectedQty} units expected",
                x.CreatedAt)));

        return alerts
            .Concat(updates.OrderByDescending(x => x.OccurredAt))
            .Take(MaxNotices)
            .ToList();
    }

    private static string PrimaryCurrency(IReadOnlyList<OrderDto> orders)
        => orders.GroupBy(x => x.Currency).OrderByDescending(g => g.Count()).Select(g => g.Key).FirstOrDefault() ?? "AUD";
}

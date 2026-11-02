namespace MiniErp.Application.Dashboard;

public sealed record DashboardSummaryDto(
    InventoryKpi Inventory,
    InboundKpi Inbound,
    SalesKpi Sales,
    ApprovalKpi Approvals,
    IReadOnlyList<SalesTrendPoint> SalesTrend,
    IReadOnlyList<InventorySlice> InventoryBreakdown,
    IReadOnlyList<DashboardNotice> Notices,
    DateTime GeneratedAt
);

public sealed record InventoryKpi(
    int ProductCount,
    int TotalStock,
    decimal StockValue,
    int LowStockCount,
    int OutOfStockCount
);

public sealed record InboundKpi(
    int Total,
    int Open,
    int PendingApproval,
    int CompletedThisMonth,
    int Exceptions
);

public sealed record SalesKpi(
    int OrdersThisMonth,
    int OrdersLastMonth,
    decimal RevenueThisMonth,
    decimal RevenueLastMonth,
    int OpenOrders,
    string Currency
);

public sealed record ApprovalKpi(int Pending, int Overdue);

public sealed record SalesTrendPoint(string Date, string Label, decimal Amount, int Orders);

public sealed record InventorySlice(string Name, int Value);

public enum NoticeType
{
    Alert,
    New,
    Update
}

public sealed record DashboardNotice(NoticeType Type, string Title, string Content, DateTime OccurredAt);

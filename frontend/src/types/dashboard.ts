export type DashboardNoticeType = "Alert" | "New" | "Update";

export type DashboardSummary = {
  inventory: {
    productCount: number;
    totalStock: number;
    stockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  inbound: {
    total: number;
    open: number;
    pendingApproval: number;
    completedThisMonth: number;
    exceptions: number;
  };
  sales: {
    ordersThisMonth: number;
    ordersLastMonth: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    openOrders: number;
    currency: string;
  };
  approvals: {
    pending: number;
    overdue: number;
  };
  salesTrend: { date: string; label: string; amount: number; orders: number }[];
  inventoryBreakdown: { name: string; value: number }[];
  notices: {
    type: DashboardNoticeType;
    title: string;
    content: string;
    occurredAt: string;
  }[];
  generatedAt: string;
};

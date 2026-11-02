import type { DashboardSummary } from "@/types/dashboard";

export type KpiTrendType = "positive" | "neutral" | "warning";

export type KpiItem = {
  label: string;
  iconSrc: string;
  trend: string;
  trendType: KpiTrendType;
  subText: string;
  displayValue: string;
};

export type NoticeTag = "NEW" | "ALERT" | "UPDATE";

export type NoticeItem = {
  title: string;
  content: string;
  tag: NoticeTag;
  time: string;
};

// Validated categorical order (fixed, never cycled); "Others" is always neutral gray.
export const PIE_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];
export const PIE_OTHERS_COLOR = "#a3acb9";

export function formatMoney(amount: number, currency: string, compact = false) {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function percentChange(current: number, previous: number): string | null {
  if (previous === 0) return current > 0 ? "New this month" : null;
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(0)}% MoM`;
}

export function buildKpis(summary: DashboardSummary): KpiItem[] {
  const { inventory, inbound, sales } = summary;
  const stockAlerts = inventory.lowStockCount + inventory.outOfStockCount;
  const salesTrend = percentChange(sales.ordersThisMonth, sales.ordersLastMonth);

  return [
    {
      label: "Stock Quantity",
      iconSrc: "/icons/kpi-stock.svg",
      displayValue: inventory.totalStock.toLocaleString(),
      trend: stockAlerts > 0 ? `${stockAlerts} Low / Out` : "Healthy",
      trendType: stockAlerts > 0 ? "warning" : "positive",
      subText: `Across ${inventory.productCount} products`,
    },
    {
      label: "Stock Value",
      iconSrc: "/icons/kpi-value.svg",
      displayValue: formatMoney(inventory.stockValue, sales.currency),
      trend: inventory.outOfStockCount > 0 ? `${inventory.outOfStockCount} Out of stock` : "Optimal",
      trendType: inventory.outOfStockCount > 0 ? "warning" : "neutral",
      subText: "Price × on-hand quantity",
    },
    {
      label: "Purchase Orders",
      iconSrc: "/icons/kpi-purchase.svg",
      displayValue: inbound.open.toLocaleString(),
      trend: inbound.pendingApproval > 0 ? `${inbound.pendingApproval} Pending` : "Up to date",
      trendType: inbound.pendingApproval > 0 ? "warning" : "neutral",
      subText: `${inbound.completedThisMonth} received this month · ${inbound.exceptions} exceptions`,
    },
    {
      label: "Sales Orders",
      iconSrc: "/icons/kpi-sales.svg",
      displayValue: sales.ordersThisMonth.toLocaleString(),
      trend: salesTrend ?? "No change",
      trendType:
        sales.ordersThisMonth > 0 && sales.ordersThisMonth >= sales.ordersLastMonth ? "positive" : "neutral",
      subText: `${formatMoney(sales.revenueThisMonth, sales.currency)} revenue this month`,
    },
  ];
}

const noticeTags: Record<DashboardSummary["notices"][number]["type"], NoticeTag> = {
  Alert: "ALERT",
  New: "NEW",
  Update: "UPDATE",
};

export function buildNotices(summary: DashboardSummary): NoticeItem[] {
  return summary.notices.map((n) => ({
    title: n.title,
    content: n.content,
    tag: noticeTags[n.type],
    time: new Date(n.occurredAt).toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

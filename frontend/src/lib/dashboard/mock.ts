/**
 * Dashboard mock data (hard-coded for now).
 * Replace with real API calls later.
 */
export type KpiTrendType = "positive" | "neutral" | "warning";
export type KpiItem = {
  label: string;
  value: number;
  iconSrc: string;
  trend: string;
  trendType: KpiTrendType;
  progress: number;
  subText: string;
  displayValue: string;
};

export type SalesPoint = {
  day: string;
  amount: number;
};

export type PieItem = {
  name: string;
  value: number;
};

export type NoticeItem = {
  title: string;
  content: string;
  tag: "NEW" | "ALERT" | "UPDATE";
  time: string;
};
export const KPI_ITEMS: KpiItem[] = [
  {
    label: "Stock Quantity",
    value: 891,
    iconSrc: "/icons/kpi-stock.svg",
    trend: "+12.5%",
    trendType: "positive",
    progress: 75,
    subText: "As of 2 min ago",
    displayValue: "891",
  },
    {
    label: "Stock Value",
    value: 40490,
    iconSrc: "/icons/kpi-value.svg",
    trend: "Optimal",
    trendType: "neutral",
    progress: 80,
    subText: "Updated 2 min ago",
    displayValue: "$40,490",
  },
    {
    label: "Purchase Orders",
    value: 15,
    iconSrc: "/icons/kpi-purchase.svg",
    trend: "3 Pending",
    trendType: "warning",
    progress: 60,
    subText: "Active pipelines",
    displayValue: "15",
  },
    {
    label: "Sales Orders",
    value: 36,
    iconSrc: "/icons/kpi-sales.svg",
    trend: "+8% MoM",
    trendType: "positive",
    progress: 18,
    subText: "Active delivery pipelines",
    displayValue: "36",
  },
];

export const SALES_TREND: SalesPoint[] = [
  { day: "MON", amount: 42 },
  { day: "TUE", amount: 44 },
  { day: "WED", amount: 68 },
  { day: "THU", amount: 56 },
  { day: "FRI", amount: 24 },
  { day: "SAT", amount: 15 },
  { day: "SUN", amount: 33 },
];

export const INVENTORY_DIST: PieItem[] = [
  { name: "Premium Prunes", value: 43.47 },
  { name: "Swiss Roll", value: 11.67 },
  { name: "Kiss Candy", value: 9.65 },
  { name: "Spiced Beef", value: 11.22 },
];

export const PIE_COLORS = ["#2563eb", "#60a5fa", "#f59e0b", "#34d399"];

export const NOTICES: NoticeItem[] = [
  {
    title: "Welcome to Mini ERP",
    content:
      "This demo includes basic modules such as Products, Suppliers, Customers, and Orders.",
    tag: "NEW",
    time: "2026-02-23",
  },
  {
    title: "Low stock detected",
    content:
      "Please create purchase orders to replenish inventory and avoid sales impact.",
    tag: "ALERT",
    time: "2026-02-22",
  },
  {
    title: "UI improvements",
    content:
      "Added KPI cards, trend chart, inventory breakdown chart, and notice list.",
    tag: "UPDATE",
    time: "2026-02-21",
  },
];
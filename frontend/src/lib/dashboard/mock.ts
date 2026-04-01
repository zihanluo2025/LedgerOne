/**
 * Dashboard mock data (hard-coded for now).
 * Replace with real API calls later.
 */
export type KpiTrendType = "positive" | "neutral" | "warning";
export type KpiItem = {
  label: string;
  value: number;
  icon: string;
  trend: string;
  trendType: KpiTrendType;
  progress: number;
  subText: string;
  displayValue: string;
};

export type SalesPoint = {
  date: string;
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
    icon: "📦",
    trend: "+12.5%",
    trendType: "positive",
    progress: 75,
    subText: "As of 2 min ago",
    displayValue: "891",
  },
    {
    label: "Stock Value",
    value: 40490,
    icon: "💰",
    trend: "Optimal",
    trendType: "neutral",
    progress: 80,
    subText: "Updated 2 min ago",
    displayValue: "$40,490",
  },
    {
    label: "Purchase Orders",
    value: 15,
    icon: "🧾",
    trend: "3 Pending",
    trendType: "warning",
    progress: 60,
    subText: "Active pipelines",
    displayValue: "15",
  },
    {
    label: "Sales Orders",
    value: 36,
    icon: "📈",
    trend: "+8% MoM",
    trendType: "positive",
    progress: 68,
    subText: "Active delivery pipelines",
    displayValue: "36",
  },
];

export const SALES_TREND: SalesPoint[] = [
  { date: "2023-10-21", amount: 0 },
  { date: "2023-10-22", amount: 300 },
  { date: "2023-10-23", amount: 245 },
  { date: "2023-10-24", amount: 95 },
  { date: "2023-10-25", amount: 55 },
  { date: "2023-10-26", amount: 95 },
  { date: "2023-10-27", amount: 150 },
];

export const INVENTORY_DIST: PieItem[] = [
  { name: "Premium Prunes", value: 13.47 },
  { name: "Swiss Roll", value: 11.67 },
  { name: "Kiss Candy", value: 9.65 },
  { name: "Spiced Beef", value: 11.22 },
  { name: "Mineral Water", value: 9.99 },
  { name: "AD Calcium Milk", value: 21.89 },
  { name: "Mixed Porridge", value: 11.22 },
  { name: "Strawberry Pie", value: 10.89 },
];

export const PIE_COLORS = [
  "#4f6bed",
  "#7cc46b",
  "#f2c14e",
  "#ff7a7a",
  "#67c3ff",
  "#2fbf9f",
  "#ff9f5a",
  "#9b7cf6",
];

export const NOTICES: NoticeItem[] = [
  {
    title: "Welcome to Mini ERP",
    content:
      "This demo includes basic modules such as Products, Suppliers, Customers, and Orders.",
    tag: "NEW",
    time: "2026-02-23",
  },
  {
    title: "Inventory Alert: Low stock detected",
    content:
      "Please create purchase orders to replenish inventory and avoid sales impact.",
    tag: "ALERT",
    time: "2026-02-22",
  },
  {
    title: "Update: Dashboard UI improvements",
    content:
      "Added KPI cards, trend chart, inventory breakdown chart, and notice list.",
    tag: "UPDATE",
    time: "2026-02-21",
  },
];
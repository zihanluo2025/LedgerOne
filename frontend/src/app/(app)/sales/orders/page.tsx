"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Download,
    Plus,
    RefreshCw,
    ShoppingCart,
    Truck,
    PackageCheck,
    CheckCircle2,
    Pencil,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import type { DataTableColumn } from "@/components/common/data-table/types";

import OrderDrawer, {
    type OrderFormValues,
} from "./_components/OrderDrawer";
import { useConfirm } from "@/hooks/use-confirm";

import {
    createOrder,
    deleteOrder,
    listOrders,
    updateOrder,
} from "@/lib/apis/orders";
import type { OrderRecord, OrderStatus } from "@/types/order";

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function normalizeValue(value?: string | null) {
    return (value ?? "").toLowerCase().trim().replace(/\s+/g, "-");
}

function formatOrderDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatMoney(amount: number, currency: string) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency.length === 3 ? currency : "USD",
            minimumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const classMap: Record<OrderStatus, string> = {
        Draft: "border-slate-200 bg-slate-100 text-slate-600",
        Confirmed: "border-blue-200 bg-blue-50 text-blue-700",
        Processing: "border-violet-200 bg-violet-50 text-violet-700",
        Shipped: "border-amber-200 bg-amber-50 text-amber-800",
        Delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
        Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
    };

    const dotMap: Record<OrderStatus, string> = {
        Draft: "bg-slate-400",
        Confirmed: "bg-blue-500",
        Processing: "bg-violet-500",
        Shipped: "bg-amber-500",
        Delivered: "bg-emerald-500",
        Cancelled: "bg-rose-500",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.04em]",
                classMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotMap[status])} />
            {status}
        </span>
    );
}

export default function OrdersPage() {
    const { confirm } = useConfirm();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [drawerRecord, setDrawerRecord] = useState<OrderRecord | null>(null);

    const pageSize = 6;

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listOrders({ limit: 500 });
            setItems(res.items);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load sales orders."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.orderNo.toLowerCase().includes(keyword) ||
                item.customerName.toLowerCase().includes(keyword) ||
                (item.notes ?? "").toLowerCase().includes(keyword);

            const matchStatus =
                statusFilter === "all" ||
                normalizeValue(item.status) === statusFilter;

            return matchKeyword && matchStatus;
        });
    }, [items, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const kpi = useMemo(() => {
        const total = items.length;
        const pipeline = items.filter((o) =>
            ["Draft", "Confirmed", "Processing"].includes(o.status)
        ).length;
        const shipped = items.filter((o) => o.status === "Shipped").length;
        const delivered = items.filter((o) => o.status === "Delivered").length;

        return {
            total: String(total),
            pipeline: String(pipeline),
            shipped: String(shipped),
            delivered: String(delivered),
        };
    }, [items]);

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            onChange: (value) => {
                setSearch(value);
                setCurrentPage(1);
            },
            placeholder: "Search order no, customer, notes...",
        },
        {
            key: "status",
            type: "select",
            label: "",
            value: statusFilter,
            onChange: (value) => {
                setStatusFilter(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All status", value: "all" },
                { label: "Draft", value: "draft" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Processing", value: "processing" },
                { label: "Shipped", value: "shipped" },
                { label: "Delivered", value: "delivered" },
                { label: "Cancelled", value: "cancelled" },
            ],
        },
    ];

    function openCreate() {
        setDrawerMode("create");
        setDrawerRecord(null);
        setDrawerOpen(true);
    }

    function openEdit(row: OrderRecord) {
        setDrawerMode("edit");
        setDrawerRecord(row);
        setDrawerOpen(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
        setDrawerRecord(null);
    }

    async function handleDrawerSubmit(values: OrderFormValues) {
        setError(null);
        const orderDateIso = `${values.orderDate}T00:00:00.000Z`;
        try {
            if (drawerMode === "create") {
                await createOrder({
                    customerName: values.customerName,
                    orderDate: orderDateIso,
                    status: values.status,
                    currency: values.currency,
                    totalAmount: Number(values.totalAmount),
                    notes: values.notes || null,
                });
            } else if (drawerRecord) {
                await updateOrder(drawerRecord.id, {
                    customerName: values.customerName,
                    orderDate: orderDateIso,
                    status: values.status,
                    currency: values.currency,
                    totalAmount: Number(values.totalAmount),
                    notes: values.notes || null,
                });
            }
            await loadData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : drawerMode === "create"
                      ? "Failed to create order."
                      : "Failed to update order.";
            setError(message);
            throw err;
        }
    }

    async function handleDelete(row: OrderRecord) {
        const ok = await confirm({
            title: "Delete order?",
            description: `This action will permanently delete order "${row.orderNo}" for ${row.customerName}. This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!ok) return;

        setError(null);
        try {
            await deleteOrder(row.id);
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete order."
            );
        }
    }

    const columns: DataTableColumn<OrderRecord>[] = [
        {
            key: "orderNo",
            title: "Order No",
            render: (item: OrderRecord) => (
                <button
                    type="button"
                    className="text-left text-[16px] font-bold leading-6 text-[#175CFF] hover:underline"
                >
                    #{item.orderNo}
                </button>
            ),
        },
        {
            key: "customer",
            title: "Customer",
            className: "font-semibold text-[#183B6B]",
            render: (item: OrderRecord) => item.customerName,
        },
        {
            key: "orderDate",
            title: "Order date",
            className: "text-[14px] font-medium text-[#5A6B86]",
            render: (item: OrderRecord) => formatOrderDate(item.orderDate),
        },
        {
            key: "total",
            title: "Total",
            render: (item: OrderRecord) => (
                <span className="tabular-nums font-semibold text-[#183B6B]">
                    {formatMoney(item.totalAmount, item.currency)}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item: OrderRecord) => <StatusBadge status={item.status} />,
        },
        {
            key: "actions",
            title: "Actions",
            render: (item: OrderRecord) => (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => openEdit(item)}
                        aria-label={`Edit order ${item.orderNo}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void handleDelete(item)}
                        aria-label={`Delete order ${item.orderNo}`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Sales Orders"
                    description="Create and manage customer sales orders, amounts and fulfilment status."
                    actions={[
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => {
                                const blob = new Blob(
                                    [JSON.stringify(filteredData, null, 2)],
                                    { type: "application/json" }
                                );
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "sales-orders-export.json";
                                a.click();
                                URL.revokeObjectURL(url);
                            },
                        },
                        {
                            label: "Create Order",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: openCreate,
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Orders"
                        value={loading ? "..." : kpi.total}
                        description=""
                        footer={
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                All time
                            </span>
                        }
                        rightIcon={
                            <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#2563EB]">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                        }
                    />

                    <KpiCard
                        title="In pipeline"
                        value={loading ? "..." : kpi.pipeline}
                        description=""
                        footer={
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                Draft · Confirmed · Processing
                            </span>
                        }
                        rightIcon={
                            <div className="rounded-lg bg-[#F2EAFE] p-3 text-[#6E56A8]">
                                <PackageCheck className="h-5 w-5" />
                            </div>
                        }
                    />

                    <KpiCard
                        title="Shipped"
                        value={loading ? "..." : kpi.shipped}
                        description=""
                        footer={
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                                In transit
                            </span>
                        }
                        rightIcon={
                            <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                <Truck className="h-5 w-5" />
                            </div>
                        }
                    />

                    <KpiCard
                        title="Delivered"
                        value={loading ? "..." : kpi.delivered}
                        description=""
                        footer={
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                                Closed
                            </span>
                        }
                        rightIcon={
                            <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#0B3A6E]">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        }
                    />
                </div>

                <DataFilterBar
                    fields={filterFields}
                    actionSlot={
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-[#EAF1FF] text-[#5B7BEA] hover:bg-[#DFE9FF]"
                            onClick={() => void loadData()}
                            disabled={loading}
                            aria-label="Refresh from server"
                        >
                            <RefreshCw
                                className={cn("h-5 w-5", loading && "animate-spin")}
                            />
                        </Button>
                    }
                />

                {error && (
                    <div
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: OrderRecord) => row.id}
                    selectable={false}
                    emptyText={
                        loading
                            ? "Loading orders…"
                            : "No sales orders found"
                    }
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(
                            currentPage * pageSize,
                            filteredData.length
                        )} of ${filteredData.length} orders`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />
            </div>

            <OrderDrawer
                open={drawerOpen}
                mode={drawerMode}
                initialData={drawerMode === "edit" ? drawerRecord : null}
                onClose={closeDrawer}
                onSubmit={handleDrawerSubmit}
            />
        </div>
    );
}

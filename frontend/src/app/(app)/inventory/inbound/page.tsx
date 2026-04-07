"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Download,
    PackageCheck,
    Plus,
    RefreshCw,
    TriangleAlert,
    Truck,
    Boxes,
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

import InboundDrawer from "./_components/InboundDrawer";
import { useConfirm } from "@/hooks/use-confirm";

import { createInbound, deleteInbound, listInbounds, updateInbound } from "@/lib/apis/inbound";
import type {
    CreateInboundRequest,
    InboundItem,
    InboundStatus,
} from "@/types/inbound";

type DrawerMode = "create" | "edit";
type InboundViewItem = {
    id: string;
    inboundNo: string;
    supplier: string;
    supplierId: string;
    warehouse: string;
    items: number;
    expectedQty: number;
    receivedQty: number;
    date: string;
    status: InboundStatus;
};

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function normalizeValue(value?: string | null) {
    return (value ?? "").toLowerCase().trim().replace(/\s+/g, "-");
}

function mapInboundToViewItem(item: InboundItem): InboundViewItem {
    return {
        id: String(item.id ?? ""),
        inboundNo: item.inboundNo ?? "-",
        supplier: item.supplier ?? "-",
        supplierId: item.supplierId ?? "-",
        warehouse: item.warehouse ?? "-",
        items: item.items ?? 0,
        expectedQty: item.expectedQty ?? 0,
        receivedQty: item.receivedQty ?? 0,
        date: item.date ?? "-",
        status: item.status ?? "Pending",
    };
}

function ProgressBar({
    expected,
    received,
}: {
    expected: number;
    received: number;
}) {
    const safeExpected = expected > 0 ? expected : 1;
    const percent = Math.min((received / safeExpected) * 100, 100);

    return (
        <div className="mt-1 h-1.5 w-[80px] rounded-full bg-slate-200">
            <div
                className={cn(
                    "h-full rounded-full",
                    percent === 100
                        ? "bg-emerald-500"
                        : percent > 50
                            ? "bg-blue-500"
                            : "bg-rose-500"
                )}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: InboundStatus }) {
    const classMap: Record<InboundStatus, string> = {
        Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
        "Partially Received": "border-blue-200 bg-blue-50 text-blue-700",
        Exception: "border-rose-200 bg-rose-50 text-rose-700",
        Pending: "border-slate-200 bg-slate-100 text-slate-500",
    };

    const dotMap: Record<InboundStatus, string> = {
        Completed: "bg-emerald-500",
        "Partially Received": "bg-blue-500",
        Exception: "bg-rose-500",
        Pending: "bg-slate-400",
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

export default function InboundPage() {
    const { confirm } = useConfirm();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [warehouse, setWarehouse] = useState("all");
    const [status, setStatus] = useState("all");

    const [inbounds, setInbounds] = useState<InboundItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
    const [editingInbound, setEditingInbound] = useState<InboundItem | null>(null);

    const pageSize = 4;

    async function loadInbounds() {
        try {
            setLoading(true);
            const data = await listInbounds();
            setInbounds(data.items ?? []);
        } catch (error) {
            console.error("Failed to load inbounds:", error);
            setInbounds([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInbounds();
    }, []);

    function handleOpenCreate() {
        setDrawerOpen(true);
    }



    async function handleSubmit(values: CreateInboundRequest) {
        if (drawerMode === "create") {
            await createInbound(values);
        } else if (editingInbound) {
            await updateInbound(editingInbound.id, values);
        }

        setDrawerOpen(false);
        await loadInbounds();
    }
    function handleOpenEdit(inbound: InboundItem) {
        setDrawerMode("edit");
        setEditingInbound(inbound);
        setDrawerOpen(true);
    }

    async function handleDelete(inbound: InboundItem) {
        const ok = await confirm({
            title: "Delete inbound?",
            description: `This action will permanently delete "${inbound.inboundNo}". This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!ok) return;

        try {
            await deleteInbound(inbound.id);
            await loadInbounds();
        } catch (error) {
            console.error("Failed to delete customer:", error);
        }
    }

    const tableData = useMemo<InboundViewItem[]>(() => {
        return inbounds.map(mapInboundToViewItem);
    }, [inbounds]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return tableData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.inboundNo.toLowerCase().includes(keyword) ||
                item.supplier.toLowerCase().includes(keyword) ||
                item.supplierId.toLowerCase().includes(keyword) ||
                item.warehouse.toLowerCase().includes(keyword);

            const matchWarehouse =
                warehouse === "all" || normalizeValue(item.warehouse) === warehouse;

            const matchStatus =
                status === "all" || normalizeValue(item.status) === status;

            return matchKeyword && matchWarehouse && matchStatus;
        });
    }, [tableData, search, warehouse, status]);

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

    const warehouseOptions = useMemo(() => {
        const uniqueWarehouses = Array.from(
            new Set(tableData.map((item) => item.warehouse).filter(Boolean))
        );

        return [
            { label: "All Warehouses", value: "all" },
            ...uniqueWarehouses.map((item) => ({
                label: item,
                value: normalizeValue(item),
            })),
        ];
    }, [tableData]);

    const totalInbound = tableData.length;
    const pendingReceiving = tableData.filter(
        (item) => item.status === "Pending"
    ).length;
    const receivedToday = tableData.filter((item) =>
        item.date.toLowerCase().includes("today")
    ).length;
    const exceptions = tableData.filter(
        (item) => item.status === "Exception"
    ).length;

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            onChange: (value) => {
                setSearch(value);
                setCurrentPage(1);
            },
            placeholder: "Filter by Inbound No, Supplier, Warehouse or Supplier ID...",
        },
        {
            key: "warehouse",
            type: "select",
            label: "",
            value: warehouse,
            onChange: (value) => {
                setWarehouse(value);
                setCurrentPage(1);
            },
            options: warehouseOptions,
        },
        {
            key: "status",
            type: "select",
            label: "",
            value: status,
            onChange: (value) => {
                setStatus(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Status", value: "all" },
                { label: "Completed", value: "completed" },
                { label: "Partially Received", value: "partially-received" },
                { label: "Exception", value: "exception" },
                { label: "Pending", value: "pending" },
            ],
        },
    ];

    const columns: DataTableColumn<InboundViewItem>[] = [
        {
            key: "inboundNo",
            title: "Inbound No",
            render: (item: InboundViewItem) => (
                <button className="text-left text-[16px] font-bold leading-6 text-[#175CFF] hover:underline">
                    #{item.inboundNo}
                </button>
            ),
        },
        {
            key: "supplier",
            title: "Supplier",
            render: (item: InboundViewItem) => (
                <div>
                    <div className="font-semibold">{item.supplier}</div>
                    <div className="text-xs text-slate-400">ID: {item.supplierId}</div>
                </div>
            ),
        },
        {
            key: "warehouse",
            title: "Warehouse",
            className: "text-[14px] font-medium text-[#5A6B86]",
            render: (item: InboundViewItem) => item.warehouse,
        },
        {
            key: "items",
            title: "Items",
            render: (item: InboundViewItem) => `${item.items} SKUs`,
        },
        {
            key: "qty",
            title: "Qty (Exp/Rec)",
            render: (item: InboundViewItem) => (
                <div>
                    <div className="font-semibold">
                        {item.expectedQty.toLocaleString()} / {item.receivedQty.toLocaleString()}
                    </div>
                    <ProgressBar
                        expected={item.expectedQty}
                        received={item.receivedQty}
                    />
                </div>
            ),
        },
        {
            key: "date",
            title: "Received At",
            className: "text-[14px] font-medium text-[#5A6B86]",
            render: (item: InboundViewItem) => item.date,
        },
        {
            key: "status",
            title: "Status",
            render: (item: InboundViewItem) => <StatusBadge status={item.status} />,
        },
        {
            key: "actions",
            title: "Actions",
            render: (item: InboundViewItem) => {
                const originalInbound = inbounds.find((i) => String(i.id) === item.id);

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => {
                                if (originalInbound) {
                                    handleOpenEdit(originalInbound);
                                }
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                                if (originalInbound) {
                                    handleDelete(originalInbound);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Inbound"
                    description="Manage and track inventory incoming into your facilities."
                    actions={[
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Export clicked"),
                        },
                        {
                            label: "Create Inbound",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: handleOpenCreate,
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Inbound This Month"
                        value={loading ? "..." : totalInbound.toString()}
                        description=""
                        footer={
                            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                Live data
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#5B7BEA]">
                                    <Truck className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Pending Receiving"
                        value={loading ? "..." : pendingReceiving.toString()}
                        description=""
                        footer={
                            <span className="rounded-md bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                                Awaiting receipt
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#FFF7E8] p-3 text-[#F59E0B]">
                                    <Boxes className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Received Today"
                        value={loading ? "..." : receivedToday.toString()}
                        description=""
                        footer={
                            <span className="text-base font-semibold text-slate-400">
                                Daily activity
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#E8FAF6] p-3 text-[#14B8A6]">
                                    <PackageCheck className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Exceptions"
                        value={loading ? "..." : exceptions.toString()}
                        description=""
                        footer={
                            <span className="rounded-md bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">
                                Needs review
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#FFF1F2] p-3 text-[#F43F5E]">
                                    <TriangleAlert className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />
                </div>

                <DataFilterBar
                    fields={filterFields}
                    actionSlot={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-[#EAF1FF] text-[#5B7BEA] hover:bg-[#DFE9FF]"
                            onClick={loadInbounds}
                        >
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: InboundViewItem) => row.id}
                    selectable={false}
                    emptyText={loading ? "Loading inbound records..." : "No inbound records found"}
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(
                            currentPage * pageSize,
                            filteredData.length
                        )} of ${filteredData.length} inbound records`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />

                <InboundDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
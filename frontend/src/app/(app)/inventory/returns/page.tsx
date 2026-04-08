"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Ban,
    Download,
    Plus,
    RotateCcw,
    ClipboardCheck,
    AlertTriangle,
    RefreshCw,
    Pencil,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import DataFilterBar from "@/components/common/data-filter-bar";
import { FilterField } from "@/components/common/data-filter-bar/types";
import { DataTableColumn } from "@/components/common/data-table/types";

import {
    createReturn,
    deleteReturn,
    listReturns,
    updateReturn,
} from "@/lib/apis/returns";
import type { ReturnRecord, ReturnStatus } from "@/types/return";
import ReturnDrawer, {
    type ReturnFormValues,
} from "./_components/ReturnDrawer";
import { useConfirm } from "@/hooks/use-confirm";

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function formatRequestedAt(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
    const classMap: Record<ReturnStatus, string> = {
        Inspecting: "border-orange-200 bg-orange-50 text-orange-600",
        Completed: "border-emerald-200 bg-emerald-50 text-emerald-600",
        Rejected: "border-rose-200 bg-rose-50 text-rose-600",
    };

    const dotMap: Record<ReturnStatus, string> = {
        Inspecting: "bg-orange-500",
        Completed: "bg-emerald-500",
        Rejected: "bg-rose-500",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold",
                classMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotMap[status])} />
            {status}
        </span>
    );
}

function PartnerCell({ item }: { item: ReturnRecord }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
                {item.partnerInitials}
            </div>

            <div>
                <div className="text-[15px] font-semibold leading-5 text-[#183B6B]">
                    {item.partnerName}
                </div>
                <div className="text-sm text-[#4F7AB8]">{item.partnerRole}</div>
            </div>
        </div>
    );
}

function ProductCell({ item }: { item: ReturnRecord }) {
    return (
        <div>
            <div className="text-[15px] font-semibold leading-6 text-[#183B6B]">
                {item.productName}
            </div>
            <div className="text-sm text-[#4F7AB8]">{item.productMeta}</div>
        </div>
    );
}

export default function ReturnsPage() {
    const { confirm } = useConfirm();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState<ReturnRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
    const [drawerRecord, setDrawerRecord] = useState<ReturnRecord | null>(
        null
    );

    const pageSize = 4;

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listReturns({ limit: 500 });
            setItems(res.items);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Failed to load return records."
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

        if (!keyword) return items;

        return items.filter(
            (item) =>
                item.returnNo.toLowerCase().includes(keyword) ||
                item.productName.toLowerCase().includes(keyword) ||
                item.partnerName.toLowerCase().includes(keyword) ||
                item.productMeta.toLowerCase().includes(keyword)
        );
    }, [items, search]);

    const kpi = useMemo(() => {
        const now = new Date();
        const thisMonth = items.filter((r) => {
            const d = new Date(r.requestedAt);
            return (
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth()
            );
        }).length;

        const inspecting = items.filter((r) => r.status === "Inspecting").length;
        const completed = items.filter((r) => r.status === "Completed").length;
        const rejected = items.filter((r) => r.status === "Rejected").length;

        return {
            thisMonth: String(thisMonth),
            inspecting: String(inspecting),
            completed: String(completed),
            rejected: String(rejected),
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
            placeholder: "Filter by name, product or return no...",
        },
    ];

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    function openCreate() {
        setDrawerMode("create");
        setDrawerRecord(null);
        setDrawerOpen(true);
    }

    function openEdit(row: ReturnRecord) {
        setDrawerMode("edit");
        setDrawerRecord(row);
        setDrawerOpen(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
        setDrawerRecord(null);
    }

    async function handleDrawerSubmit(values: ReturnFormValues) {
        setError(null);
        try {
            if (drawerMode === "create") {
                await createReturn({
                    type: values.type,
                    partnerName: values.partnerName,
                    partnerRole: values.partnerRole,
                    productName: values.productName,
                    productMeta: values.productMeta,
                    qty: values.qty,
                    status: values.status,
                });
            } else if (drawerRecord) {
                await updateReturn(drawerRecord.id, values);
            }
            await loadData();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : drawerMode === "create"
                      ? "Failed to create return record."
                      : "Failed to update return record.";
            setError(message);
            throw err;
        }
    }

    async function handleDelete(row: ReturnRecord) {
        const ok = await confirm({
            title: "Delete return?",
            description: `This action will permanently delete return "${row.returnNo}" (${row.productName}). This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!ok) return;

        setError(null);
        try {
            await deleteReturn(row.id);
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete return record."
            );
        }
    }

    const columns: DataTableColumn<ReturnRecord>[] = [
        {
            key: "returnNo",
            title: "Return No",
            render: (item: ReturnRecord) => (
                <button
                    type="button"
                    className="text-left text-[16px] font-bold leading-6 text-[#175CFF] hover:underline"
                >
                    #{item.returnNo}
                </button>
            ),
        },
        {
            key: "partner",
            title: "Source / Partner",
            render: (item: ReturnRecord) => <PartnerCell item={item} />,
        },
        {
            key: "product",
            title: "Product & Items",
            render: (item: ReturnRecord) => <ProductCell item={item} />,
        },
        {
            key: "qty",
            title: "Qty",
            className: "text-[16px] font-medium text-[#183B6B]",
            render: (item: ReturnRecord) => String(item.qty).padStart(2, "0"),
        },
        {
            key: "requestedAt",
            title: "Requested",
            className: "text-[16px] font-medium text-[#4F6786]",
            render: (item: ReturnRecord) => (
                <span className="whitespace-pre-line">
                    {formatRequestedAt(item.requestedAt)}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item: ReturnRecord) => (
                <ReturnStatusBadge status={item.status} />
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (item: ReturnRecord) => (
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => openEdit(item)}
                        aria-label={`Edit return ${item.returnNo}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => void handleDelete(item)}
                        aria-label={`Delete return ${item.returnNo}`}
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
                    title="Returns"
                    description="Manage and track customer and supplier return records."
                    actions={[
                        {
                            label: "Export",
                            icon: (
                                <Download size={22} strokeWidth={2.2} />
                            ),
                            onClick: () => {
                                const blob = new Blob(
                                    [JSON.stringify(filteredData, null, 2)],
                                    { type: "application/json" }
                                );
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = "returns-export.json";
                                a.click();
                                URL.revokeObjectURL(url);
                            },
                        },
                        {
                            label: "Create Return",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: openCreate,
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Returns This Month"
                        value={kpi.thisMonth}
                        description=""
                        footer={
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                Current period
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#2563EB]">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Pending Inspection"
                        value={kpi.inspecting}
                        description=""
                        footer={
                            <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-[#A94442]">
                                Inspecting
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Completed"
                        value={kpi.completed}
                        description=""
                        footer={
                            <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-sm font-semibold text-[#5E7AA2]">
                                Closed
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#F2EAFE] p-3 text-[#6E56A8]">
                                    <RotateCcw className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Rejected Returns"
                        value={kpi.rejected}
                        description=""
                        footer={
                            <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-sm font-semibold text-[#2563EB]">
                                Active
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#0B3A6E]">
                                    <Ban className="h-5 w-5" />
                                </div>
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
                    rowKey={(row: ReturnRecord) => row.id}
                    selectable={false}
                    emptyText={
                        loading
                            ? "Loading return records…"
                            : "No return records found"
                    }
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(
                            currentPage * pageSize,
                            filteredData.length
                        )} of ${filteredData.length} return records`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />
            </div>

            <ReturnDrawer
                open={drawerOpen}
                mode={drawerMode}
                initialData={drawerMode === "edit" ? drawerRecord : null}
                onClose={closeDrawer}
                onSubmit={handleDrawerSubmit}
            />
        </div>
    );
}

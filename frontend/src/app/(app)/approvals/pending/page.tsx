"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, History, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import KpiCard from "@/components/common/kpi-card";
import DataFilterBar from "@/components/common/data-filter-bar";
import DataTable from "@/components/common/data-table/index";
import PageHeader from "@/components/common/PageHeader";
import type { DataTableColumn } from "@/components/common/data-table/types";
import type { FilterField } from "@/components/common/data-filter-bar/types";

import { approveRequest, batchApprove, rejectRequest } from "@/lib/apis/approvals";
import { toastApiError, toastSuccess, toastWarning } from "@/lib/tools/toast";
import type { ApprovalRequest } from "@/types/approval";

import DecisionDialog, { type DecisionKind } from "../_components/DecisionDialog";
import { useApprovals } from "../_components/use-approvals";
import {
    ApprovalStatusBadge,
    businessTypeOptions,
    cn,
    describeRequest,
    DocumentCell,
    formatDateTime,
    formatDuration,
    hoursBetween,
    isOverdue,
    isToday,
    PersonCell,
    TypeBadge,
} from "../_components/shared";

type DecisionState = { kind: DecisionKind; target?: ApprovalRequest } | null;

export default function PendingPage() {
    const router = useRouter();
    const { items, loading, error, reload } = useApprovals("Pending");

    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [priority, setPriority] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [decision, setDecision] = useState<DecisionState>(null);

    const pageSize = 10;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.documentNo.toLowerCase().includes(keyword) ||
                item.requesterName.toLowerCase().includes(keyword) ||
                item.partner.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword);

            const matchType = type === "all" || item.businessType === type;
            const overdue = isOverdue(item);
            const matchPriority =
                priority === "all" || (priority === "overdue" ? overdue : !overdue);

            return matchKeyword && matchType && matchPriority;
        });
    }, [items, search, type, priority]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const pagedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, safePage]);

    // Selection only counts rows that are still pending in the current list.
    const activeSelection = selectedIds.filter((id) => items.some((item) => item.id === id));

    const kpi = useMemo(() => {
        const overdue = items.filter(isOverdue).length;
        const today = items.filter((item) => isToday(item.submittedAt)).length;
        const avgWait =
            items.length > 0
                ? items.reduce((sum, item) => sum + hoursBetween(item.submittedAt), 0) / items.length
                : 0;

        return { total: items.length, overdue, today, avgWait };
    }, [items]);

    const allChecked =
        pagedData.length > 0 && pagedData.every((item) => activeSelection.includes(item.id));

    const toggleRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleAll = (checked: boolean) => {
        const pageIds = pagedData.map((item) => item.id);
        setSelectedIds((prev) =>
            checked
                ? Array.from(new Set([...prev, ...pageIds]))
                : prev.filter((id) => !pageIds.includes(id))
        );
    };

    async function handleDecision(comment: string) {
        if (!decision) return;

        try {
            if (decision.kind === "batch") {
                const result = await batchApprove(activeSelection, comment || undefined);
                toastSuccess(`${result.approved} request(s) approved.`, "Batch Approved");
                if (result.skipped.length > 0) {
                    toastWarning(`${result.skipped.length} request(s) were already processed and skipped.`);
                }
                setSelectedIds([]);
            } else if (decision.target) {
                const { documentNo } = decision.target;
                if (decision.kind === "approve") {
                    await approveRequest(decision.target.id, comment || undefined);
                    toastSuccess(`${documentNo} approved.`, "Request Approved");
                } else {
                    await rejectRequest(decision.target.id, comment);
                    toastSuccess(`${documentNo} rejected.`, "Request Rejected");
                }
                setSelectedIds((prev) => prev.filter((id) => id !== decision.target?.id));
            }
            setDecision(null);
            await reload();
        } catch (e) {
            toastApiError(e, "Approval Failed");
        }
    }

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            onChange: (value) => {
                setSearch(value);
                setCurrentPage(1);
            },
            placeholder: "Search Doc No, Requester, Partner...",
        },
        {
            key: "type",
            type: "select",
            label: "Type",
            value: type,
            onChange: (value) => {
                setType(value);
                setCurrentPage(1);
            },
            options: businessTypeOptions,
        },
        {
            key: "priority",
            type: "select",
            label: "Priority",
            value: priority,
            onChange: (value) => {
                setPriority(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All", value: "all" },
                { label: "Overdue", value: "overdue" },
                { label: "Normal", value: "normal" },
            ],
        },
    ];

    const columns: DataTableColumn<ApprovalRequest>[] = [
        {
            key: "docNo",
            title: "Document",
            render: (item) => <DocumentCell item={item} />,
        },
        {
            key: "type",
            title: "Type",
            render: (item) => <TypeBadge type={item.businessType} />,
        },
        {
            key: "summary",
            title: "Summary",
            render: (item) => (
                <div className="max-w-[220px]">
                    <div className="text-sm font-semibold text-slate-800">{describeRequest(item)}</div>
                    <div className="truncate text-xs text-slate-500">{item.summary}</div>
                </div>
            ),
        },
        {
            key: "requester",
            title: "Requester",
            render: (item) => <PersonCell name={item.requesterName} />,
        },
        {
            key: "submittedAt",
            title: "Submitted At",
            className: "text-[14px] font-semibold",
            render: (item) => (
                <div className={cn(isOverdue(item) ? "text-[#C95A52]" : "text-slate-500")}>
                    <div>{formatDateTime(item.submittedAt)}</div>
                    <div className="text-xs font-medium">waiting {formatDuration(hoursBetween(item.submittedAt))}</div>
                </div>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item) => <ApprovalStatusBadge status={item.status} overdue={isOverdue(item)} />,
        },
        {
            key: "actions",
            title: "Actions",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        title="Approve"
                        aria-label={`Approve ${item.documentNo}`}
                        onClick={() => setDecision({ kind: "approve", target: item })}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        title="Reject"
                        aria-label={`Reject ${item.documentNo}`}
                        onClick={() => setDecision({ kind: "reject", target: item })}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const overduePercent = kpi.total > 0 ? Math.round((kpi.overdue / kpi.total) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Approval Workflow"
                    description="Review and action pending operational requests across the organization."
                    actions={[
                        {
                            label: "View History",
                            icon: <History size={22} strokeWidth={2.2} />,
                            onClick: () => router.push("/approvals/completed"),
                        },
                        {
                            label: activeSelection.length > 0 ? `Batch Approve (${activeSelection.length})` : "Batch Approve",
                            icon: <CheckCheck size={22} strokeWidth={2.2} />,
                            disabled: activeSelection.length === 0,
                            onClick: () => setDecision({ kind: "batch" }),
                        },
                    ]}
                />

                {error ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-3">
                    <KpiCard
                        title="Pending Tasks"
                        value={loading ? "..." : String(kpi.total)}
                        suffix="tasks waiting"
                        description={`${kpi.overdue} overdue (${overduePercent}%)`}
                        footer={
                            <div className="h-2 rounded-full bg-slate-100">
                                <div
                                    className="h-2 rounded-full bg-[#D9534F] transition-all"
                                    style={{ width: `${overduePercent}%` }}
                                />
                            </div>
                        }
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Today's New"
                        value={loading ? "..." : String(kpi.today)}
                        suffix="new entries"
                        description="Submitted since midnight"
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Avg. Waiting Time"
                        value={loading ? "..." : formatDuration(kpi.avgWait)}
                        description="Overdue after 48h in queue"
                        rightIcon={undefined}
                    />
                </div>

                <DataFilterBar
                    fields={filterFields}
                    actionSlot={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl text-slate-500 hover:bg-white"
                            onClick={() => void reload()}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row) => row.id}
                    selectable
                    allChecked={allChecked}
                    selectedRowKeys={activeSelection}
                    onSelectRow={toggleRow}
                    onSelectAll={toggleAll}
                    rowClassName={(row) => (isOverdue(row) ? "bg-rose-50/40" : undefined)}
                    emptyText={loading ? "Loading pending requests..." : "No pending requests - you're all caught up"}
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} pending requests`}
                    pagination={{
                        currentPage: safePage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />

                <DecisionDialog
                    open={decision !== null}
                    kind={decision?.kind ?? "approve"}
                    subject={
                        decision?.kind === "batch"
                            ? `Approve ${activeSelection.length} selected request(s).`
                            : decision?.target
                                ? `${decision.target.documentNo} · ${decision.target.summary}`
                                : ""
                    }
                    onCancel={() => setDecision(null)}
                    onConfirm={handleDecision}
                />
            </div>
        </div>
    );
}

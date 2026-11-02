"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import type { DataTableColumn } from "@/components/common/data-table/types";

import { useConfirm } from "@/hooks/use-confirm";
import { withdrawRequest } from "@/lib/apis/approvals";
import { exportToCsv } from "@/lib/export";
import { toastApiError, toastSuccess } from "@/lib/tools/toast";
import type { ApprovalRequest } from "@/types/approval";

import { useApprovals } from "../_components/use-approvals";
import {
    ApprovalStatusBadge,
    businessTypeOptions,
    cn,
    describeRequest,
    DocumentCell,
    formatDateTime,
    isOverdue,
    isThisMonth,
    OutcomeStat,
    PersonCell,
    TypeBadge,
} from "../_components/shared";

export default function MySubmittedRequestsPage() {
    const { confirm } = useConfirm();
    const { items, loading, error, reload } = useApprovals("Mine");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("all");

    const pageSize = 8;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.documentNo.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword) ||
                item.partner.toLowerCase().includes(keyword) ||
                (item.processedByName ?? "").toLowerCase().includes(keyword);

            const matchType = type === "all" || item.businessType === type;
            const matchStatus = status === "all" || item.status === status;

            return matchKeyword && matchType && matchStatus;
        });
    }, [items, search, type, status]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const pagedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, safePage]);

    const kpi = useMemo(() => {
        const pending = items.filter((item) => item.status === "Pending").length;
        return {
            thisMonth: items.filter((item) => isThisMonth(item.submittedAt)).length,
            pending,
            pendingPercent: items.length > 0 ? Math.round((pending / items.length) * 100) : 0,
            approved: items.filter((item) => item.status === "Approved").length,
            rejected: items.filter((item) => item.status === "Rejected").length,
            withdrawn: items.filter((item) => item.status === "Withdrawn").length,
        };
    }, [items]);

    async function handleWithdraw(item: ApprovalRequest) {
        const ok = await confirm({
            title: "Withdraw request?",
            description: `${item.documentNo} will be removed from the approval queue. The document itself is kept.`,
            confirmText: "Withdraw",
            cancelText: "Cancel",
            variant: "destructive",
        });
        if (!ok) return;

        try {
            await withdrawRequest(item.id);
            toastSuccess(`${item.documentNo} has been withdrawn.`, "Request Withdrawn");
            await reload();
        } catch (e) {
            toastApiError(e, "Withdraw Failed");
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
            placeholder: "Search Doc No / Summary / Approver",
        },
        {
            key: "type",
            type: "select",
            label: "",
            value: type,
            onChange: (value) => {
                setType(value);
                setCurrentPage(1);
            },
            options: businessTypeOptions,
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
                { label: "In Review", value: "Pending" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
                { label: "Withdrawn", value: "Withdrawn" },
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
                <div className="max-w-[240px] text-sm font-semibold text-slate-700">{describeRequest(item)}</div>
            ),
        },
        {
            key: "approver",
            title: "Approver",
            render: (item) =>
                item.status === "Pending" ? (
                    <span className="text-[14px] font-semibold text-slate-500">Awaiting approver</span>
                ) : (
                    <PersonCell name={item.processedByName} sub={item.comment} />
                ),
        },
        {
            key: "submittedAt",
            title: "Submitted At",
            className: "text-[14px] font-medium text-slate-500",
            render: (item) => formatDateTime(item.submittedAt),
        },
        {
            key: "updatedAt",
            title: "Last Updated",
            className: "text-[14px] font-medium text-slate-500",
            render: (item) => formatDateTime(item.updatedAt),
        },
        {
            key: "status",
            title: "Status",
            render: (item) => <ApprovalStatusBadge status={item.status} overdue={isOverdue(item)} />,
        },
        {
            key: "actions",
            title: "Actions",
            render: (item) =>
                item.status === "Pending" ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => void handleWithdraw(item)}
                    >
                        <Undo2 className="h-4 w-4" />
                        Withdraw
                    </Button>
                ) : (
                    <span className="text-sm text-slate-400">-</span>
                ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="My Submitted Requests"
                    description="Track approval progress, outcomes, and current workflow status for requests you have submitted."
                    actions={[
                        {
                            label: "Export All",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            disabled: filteredData.length === 0,
                            onClick: () =>
                                exportToCsv("my-requests", filteredData, [
                                    { header: "Document No", value: (r) => r.documentNo },
                                    { header: "Type", value: (r) => r.businessType },
                                    { header: "Partner", value: (r) => r.partner },
                                    { header: "Summary", value: (r) => r.summary },
                                    { header: "Status", value: (r) => r.status },
                                    { header: "Approver", value: (r) => r.processedByName },
                                    { header: "Comment", value: (r) => r.comment },
                                    { header: "Submitted At", value: (r) => r.submittedAt },
                                    { header: "Last Updated", value: (r) => r.updatedAt },
                                ]),
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
                        title="Submitted This Month"
                        value={loading ? "..." : String(kpi.thisMonth)}
                        suffix="requests"
                        rightIcon={undefined}
                        description={`${items.length} submitted in total`}
                    />

                    <KpiCard
                        title="In Review"
                        value={loading ? "..." : String(kpi.pending)}
                        suffix="awaiting review"
                        rightIcon={undefined}
                        footer={
                            <div className="h-2 rounded-full bg-slate-100">
                                <div
                                    className="h-2 rounded-full bg-[#175CFF] transition-all"
                                    style={{ width: `${kpi.pendingPercent}%` }}
                                />
                            </div>
                        }
                    />

                    <KpiCard
                        title="Outcome Summary"
                        value=""
                        rightIcon={undefined}
                        customContent={
                            <div className="mt-2 flex items-center gap-6">
                                <OutcomeStat value={kpi.approved} label="Approved" className="text-emerald-600" />
                                <div className="h-14 w-px bg-slate-200" />
                                <OutcomeStat value={kpi.rejected} label="Rejected" className="text-rose-500" />
                                <div className="h-14 w-px bg-slate-200" />
                                <OutcomeStat value={kpi.withdrawn} label="Withdrawn" className="text-slate-400" />
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
                    selectable={false}
                    emptyText={loading ? "Loading your requests..." : "No submitted requests found"}
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} submitted items`}
                    pagination={{
                        currentPage: safePage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />
            </div>
        </div>
    );
}

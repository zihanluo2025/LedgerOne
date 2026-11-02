"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import type { DataTableColumn } from "@/components/common/data-table/types";

import { exportToCsv } from "@/lib/export";
import type { ApprovalRequest } from "@/types/approval";

import { useApprovals } from "../_components/use-approvals";
import {
    ApprovalStatusBadge,
    businessTypeOptions,
    cn,
    DocumentCell,
    formatDateTime,
    formatDuration,
    hoursBetween,
    isThisMonth,
    OutcomeStat,
    PersonCell,
    TypeBadge,
} from "../_components/shared";

// Processing time from submission to decision, in hours.
function processingHours(item: ApprovalRequest) {
    return item.processedAt ? hoursBetween(item.submittedAt, item.processedAt) : NaN;
}

const TARGET_HOURS = 6;

export default function CompletedApprovalsPage() {
    const { items, loading, error, reload } = useApprovals("Completed");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [type, setType] = useState("all");
    const [outcome, setOutcome] = useState("all");

    const pageSize = 8;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return items.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.documentNo.toLowerCase().includes(keyword) ||
                item.requesterName.toLowerCase().includes(keyword) ||
                (item.processedByName ?? "").toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword);

            const matchType = type === "all" || item.businessType === type;
            const matchOutcome = outcome === "all" || item.status === outcome;

            return matchKeyword && matchType && matchOutcome;
        });
    }, [items, search, type, outcome]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const pagedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, safePage]);

    const kpi = useMemo(() => {
        const thisMonth = items.filter((item) => isThisMonth(item.processedAt));
        const durations = items.map(processingHours).filter(Number.isFinite);
        const avg = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : NaN;

        return {
            thisMonth: thisMonth.length,
            avg,
            approved: items.filter((item) => item.status === "Approved").length,
            rejected: items.filter((item) => item.status === "Rejected").length,
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
            placeholder: "Search Doc No, Requester, Approver...",
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
            key: "outcome",
            type: "select",
            label: "Outcome",
            value: outcome,
            onChange: (value) => {
                setOutcome(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Outcomes", value: "all" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
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
            key: "requester",
            title: "Requester",
            render: (item) => <PersonCell name={item.requesterName} />,
        },
        {
            key: "processedBy",
            title: "Processed By",
            render: (item) => <PersonCell name={item.processedByName} />,
        },
        {
            key: "completedAt",
            title: "Completed At",
            className: "text-[14px] font-medium text-slate-500",
            render: (item) => formatDateTime(item.processedAt),
        },
        {
            key: "processingTime",
            title: "Proc. Time",
            className: "text-[15px] font-semibold",
            render: (item) => {
                const hours = processingHours(item);
                return (
                    <span className={cn(hours <= TARGET_HOURS ? "text-emerald-600" : "text-orange-500")}>
                        {formatDuration(hours)}
                    </span>
                );
            },
        },
        {
            key: "outcome",
            title: "Outcome",
            render: (item) => (
                <div className="max-w-[220px]">
                    <ApprovalStatusBadge status={item.status} />
                    {item.comment ? (
                        <div className="mt-1 truncate text-xs text-slate-500" title={item.comment}>
                            “{item.comment}”
                        </div>
                    ) : null}
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Completed Approvals"
                    description="Review completed approval records and processing outcomes from the audit trail."
                    actions={[
                        {
                            label: "Export All",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            disabled: filteredData.length === 0,
                            onClick: () =>
                                exportToCsv("completed-approvals", filteredData, [
                                    { header: "Document No", value: (r) => r.documentNo },
                                    { header: "Type", value: (r) => r.businessType },
                                    { header: "Partner", value: (r) => r.partner },
                                    { header: "Summary", value: (r) => r.summary },
                                    { header: "Requester", value: (r) => r.requesterName },
                                    { header: "Processed By", value: (r) => r.processedByName },
                                    { header: "Submitted At", value: (r) => r.submittedAt },
                                    { header: "Completed At", value: (r) => r.processedAt },
                                    { header: "Processing Hours", value: (r) => processingHours(r).toFixed(2) },
                                    { header: "Outcome", value: (r) => r.status },
                                    { header: "Comment", value: (r) => r.comment },
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
                        title="Completed This Month"
                        value={loading ? "..." : String(kpi.thisMonth)}
                        suffix="items"
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Avg. Completion Time"
                        value={loading ? "..." : formatDuration(kpi.avg)}
                        description={`Target: < ${TARGET_HOURS}h for standard documents`}
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Approval Outcome"
                        value=""
                        rightIcon={undefined}
                        customContent={
                            <div className="mt-2 flex items-center gap-8">
                                <OutcomeStat value={kpi.approved} label="Approved" className="text-emerald-600" />
                                <div className="h-14 w-px bg-slate-200" />
                                <OutcomeStat value={kpi.rejected} label="Rejected" className="text-rose-500" />
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
                    emptyText={loading ? "Loading completed approvals..." : "No completed approvals found"}
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} completed items`}
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

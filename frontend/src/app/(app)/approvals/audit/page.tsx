"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Download, ListChecks, RefreshCw, TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import type { DataTableColumn } from "@/components/common/data-table/types";

import { listApprovalLogs } from "@/lib/apis/approvals";
import { getErrorMessage } from "@/lib/api";
import { exportToCsv } from "@/lib/export";
import type { ApprovalAction, ApprovalLog } from "@/types/approval";

import { useApprovals } from "../_components/use-approvals";
import {
    ApprovalStatusBadge,
    businessTypeOptions,
    cn,
    formatDateTime,
    isOverdue,
    isThisMonth,
    PersonCell,
    TypeBadge,
} from "../_components/shared";

const actionClassMap: Record<ApprovalAction, string> = {
    Submit: "border-blue-200 bg-blue-50 text-blue-700",
    Approve: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Reject: "border-rose-200 bg-rose-50 text-rose-700",
    Withdraw: "border-slate-200 bg-slate-100 text-slate-600",
};

function ActionBadge({ action }: { action: ApprovalAction }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.04em]",
                actionClassMap[action]
            )}
        >
            {action}
        </span>
    );
}

export default function ApprovalAuditPage() {
    const requests = useApprovals("All");

    const [logs, setLogs] = useState<ApprovalLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);
    const [logsError, setLogsError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [action, setAction] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 10;

    const loadLogs = useCallback(async () => {
        setLogsLoading(true);
        setLogsError(null);
        try {
            const res = await listApprovalLogs();
            setLogs(res.items ?? []);
        } catch (e) {
            setLogsError(getErrorMessage(e, "Failed to load audit logs."));
            setLogs([]);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    const refresh = () => {
        void loadLogs();
        void requests.reload();
    };

    const kpi = useMemo(() => {
        const items = requests.items;
        const monthItems = items.filter((item) => isThisMonth(item.submittedAt));
        const decided = items.filter((item) => item.status === "Approved" || item.status === "Rejected").length;
        const closed = items.filter((item) => item.status !== "Pending").length;

        return {
            thisMonth: monthItems.length,
            pending: items.filter((item) => item.status === "Pending").length,
            completionRate: closed > 0 ? Math.round((decided / closed) * 100) : 0,
            overdue: items.filter(isOverdue).length,
        };
    }, [requests.items]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return logs.filter((log) => {
            const matchKeyword =
                !keyword ||
                log.documentNo.toLowerCase().includes(keyword) ||
                log.requesterName.toLowerCase().includes(keyword) ||
                log.operatorName.toLowerCase().includes(keyword) ||
                (log.comment ?? "").toLowerCase().includes(keyword);

            const matchType = type === "all" || log.businessType === type;
            const matchAction = action === "all" || log.action === action;

            return matchKeyword && matchType && matchAction;
        });
    }, [logs, search, type, action]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);

    const pagedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, safePage]);

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            onChange: (value) => {
                setSearch(value);
                setCurrentPage(1);
            },
            placeholder: "Search Doc No, Operator, Requester, Comment...",
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
            key: "action",
            type: "select",
            label: "",
            value: action,
            onChange: (value) => {
                setAction(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Actions", value: "all" },
                { label: "Submit", value: "Submit" },
                { label: "Approve", value: "Approve" },
                { label: "Reject", value: "Reject" },
                { label: "Withdraw", value: "Withdraw" },
            ],
        },
    ];

    const columns: DataTableColumn<ApprovalLog>[] = [
        {
            key: "createdAt",
            title: "Time",
            className: "text-[14px] font-medium text-slate-500",
            render: (log) => formatDateTime(log.createdAt),
        },
        {
            key: "docNo",
            title: "Document No",
            render: (log) => <span className="font-bold text-[#1557E5]">{log.documentNo}</span>,
        },
        {
            key: "type",
            title: "Type",
            render: (log) => <TypeBadge type={log.businessType} />,
        },
        {
            key: "action",
            title: "Action",
            render: (log) => <ActionBadge action={log.action} />,
        },
        {
            key: "transition",
            title: "Transition",
            render: (log) => (
                <div className="flex items-center gap-2">
                    {log.fromStatus ? (
                        <>
                            <ApprovalStatusBadge status={log.fromStatus} />
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                        </>
                    ) : null}
                    <ApprovalStatusBadge status={log.toStatus} />
                </div>
            ),
        },
        {
            key: "operator",
            title: "Operator",
            render: (log) => <PersonCell name={log.operatorName} sub={`Requester: ${log.requesterName}`} />,
        },
        {
            key: "comment",
            title: "Comment",
            render: (log) => (
                <span className="block max-w-[240px] truncate text-sm text-slate-600" title={log.comment ?? ""}>
                    {log.comment || "-"}
                </span>
            ),
        },
    ];

    const error = logsError ?? requests.error;
    const loading = logsLoading || requests.loading;

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Approval Audit Center"
                    description="Monitor all approval activities, workflow status, and audit trails across the organization."
                    actions={[
                        {
                            label: "Export All",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            disabled: filteredData.length === 0,
                            onClick: () =>
                                exportToCsv("approval-audit", filteredData, [
                                    { header: "Log Id", value: (r) => r.id },
                                    { header: "Time", value: (r) => r.createdAt },
                                    { header: "Document No", value: (r) => r.documentNo },
                                    { header: "Type", value: (r) => r.businessType },
                                    { header: "Action", value: (r) => r.action },
                                    { header: "From", value: (r) => r.fromStatus },
                                    { header: "To", value: (r) => r.toStatus },
                                    { header: "Operator", value: (r) => r.operatorName },
                                    { header: "Requester", value: (r) => r.requesterName },
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

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Requests"
                        value={requests.loading ? "..." : String(kpi.thisMonth)}
                        rightIcon={
                            <div className="rounded-lg bg-[#EEF4FF] p-2 text-[#5B7BEA]">
                                <ListChecks className="h-4 w-4" />
                            </div>
                        }
                        description="submitted this month"
                    />

                    <KpiCard
                        title="In Review"
                        value={requests.loading ? "..." : String(kpi.pending)}
                        rightIcon={
                            <div className="rounded-lg bg-[#EEF1FF] p-2 text-[#7A88A8]">
                                <TimerReset className="h-4 w-4" />
                            </div>
                        }
                        description="currently awaiting a decision"
                    />

                    <KpiCard
                        title="Decision Rate"
                        value={requests.loading ? "..." : `${kpi.completionRate}%`}
                        rightIcon={
                            <div className="rounded-lg bg-[#EAFBF5] p-2 text-[#30A46C]">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        }
                        description="closed requests approved or rejected"
                    />

                    <KpiCard
                        title="Overdue Items"
                        value={requests.loading ? "..." : String(kpi.overdue)}
                        rightIcon={
                            <div className="rounded-lg bg-[#FFF1EF] p-2 text-[#E85D4E]">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        }
                        description="pending longer than 48 hours"
                    />
                </div>

                <DataFilterBar
                    fields={filterFields}
                    actionSlot={
                        <Button
                            variant="outline"
                            className="h-12 rounded-sm border-slate-200 bg-white px-4 text-[#183B6B] hover:bg-slate-50"
                            onClick={refresh}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                            Refresh
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row) => row.id}
                    selectable={false}
                    emptyText={logsLoading ? "Loading audit logs..." : "No audit records found"}
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} entries`}
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

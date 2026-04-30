"use client";

import { useMemo, useState } from "react";
import {
    Download,
    Filter
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import { DataTableColumn } from "@/components/common/data-table/types";

type SubmittedItem = {
    id: string;
    docNo: string;
    type: "Inbound" | "Sales";
    summary: string;
    currentApprover: string;
    approverRole?: string;
    submittedAt: string;
    lastUpdated: string;
    status: "In Progress" | "Approved" | "Rejected" | "Cancelled";
};

const submittedData: SubmittedItem[] = [
    {
        id: "1",
        docNo: "INB-20260405-001",
        type: "Inbound",
        summary: "500x Steel Chassis, Main Warehouse",
        currentApprover: "Amanda T.",
        approverRole: "Finance Lead",
        submittedAt: "2026-04-05 09:45",
        lastUpdated: "2026-04-06 14:20",
        status: "In Progress",
    },
    {
        id: "2",
        docNo: "SLS-20260403-112",
        type: "Sales",
        summary: "Q2 Enterprise License Renewal",
        currentApprover: "Completed",
        submittedAt: "2026-04-03 16:12",
        lastUpdated: "2026-04-04 09:00",
        status: "Approved",
    },
    {
        id: "3",
        docNo: "INB-20260401-045",
        type: "Inbound",
        summary: "Emergency Lab Supplies",
        currentApprover: "Completed",
        submittedAt: "2026-04-01 11:30",
        lastUpdated: "2026-04-01 15:45",
        status: "Rejected",
    },
    {
        id: "4",
        docNo: "SLS-20260328-099",
        type: "Sales",
        summary: "Wholesale Furniture Bulk Order",
        currentApprover: "-",
        submittedAt: "2026-03-28 14:05",
        lastUpdated: "2026-03-29 10:20",
        status: "Cancelled",
    },
    {
        id: "5",
        docNo: "INB-20260406-017",
        type: "Inbound",
        summary: "Sensor Component Restock - Building A",
        currentApprover: "Michael J.",
        approverRole: "Ops Manager",
        submittedAt: "2026-04-06 08:40",
        lastUpdated: "2026-04-06 13:10",
        status: "In Progress",
    },
    {
        id: "6",
        docNo: "SLS-20260402-084",
        type: "Sales",
        summary: "Strategic Discount for Key Account",
        currentApprover: "Completed",
        submittedAt: "2026-04-02 10:15",
        lastUpdated: "2026-04-03 17:30",
        status: "Approved",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
    if (!name || name === "-" || name === "Completed") return name;
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function TypeBadge({ type }: { type: SubmittedItem["type"] }) {
    const isInbound = type === "Inbound";

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                isInbound
                    ? "bg-[#DCEBFF] text-[#2D6BCF]"
                    : "bg-[#E8DFFC] text-[#6C5AAE]"
            )}
        >
            {type.toUpperCase()}
        </span>
    );
}

function StatusBadge({ status }: { status: SubmittedItem["status"] }) {
    const statusMap = {
        "In Progress":
            "border-blue-200 bg-blue-50 text-blue-700",
        Approved:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        Rejected:
            "border-rose-200 bg-rose-50 text-rose-700",
        Cancelled:
            "border-slate-200 bg-slate-100 text-slate-500",
    };

    const dotMap = {
        "In Progress": "bg-blue-500",
        Approved: "bg-emerald-500",
        Rejected: "bg-rose-500",
        Cancelled: "bg-slate-400",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.04em]",
                statusMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotMap[status])} />
            {status}
        </span>
    );
}

export default function MySubmittedRequestsPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("all");

    const pageSize = 4;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return submittedData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.docNo.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword) ||
                item.currentApprover.toLowerCase().includes(keyword);

            const matchType =
                type === "all" || item.type.toLowerCase() === type;

            const normalizedStatus = (item.status ?? "").toLowerCase().replace(/\s+/g, "-");
            const matchStatus =
                status === "all" || normalizedStatus === status;

            return matchKeyword && matchType && matchStatus;
        });
    }, [search, type, status]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

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
            options: [
                { label: "All Business", value: "all" },
                { label: "Inbound", value: "inbound" },
                { label: "Sales", value: "sales" },
            ],
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
                { label: "In Progress", value: "in-progress" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
                { label: "Cancelled", value: "cancelled" },
            ],
        },
        {
            key: "dateRange",
            type: "dateRange",
            value: "Submitted At Range",
        },
    ];

    const columns: DataTableColumn<SubmittedItem>[] = [
        {
            key: "docNo",
            title: "Document No",
            render: (item: SubmittedItem) => (
                <button className="max-w-[180px] text-left font-bold leading-8 text-[#1557E5] hover:underline">
                    {item.docNo}
                </button>
            ),
        },
        {
            key: "type",
            title: "Type",
            render: (item: SubmittedItem) => <TypeBadge type={item.type} />,
        },
        {
            key: "currentApprover",
            title: "Current Approver",
            render: (item: SubmittedItem) => {
                if (item.currentApprover === "Completed" || item.currentApprover === "-") {
                    return (
                        <span className="text-[15px] font-semibold text-slate-400">
                            {item.currentApprover}
                        </span>
                    );
                }

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFE5FF] text-sm font-bold text-[#4763B4]">
                            {getInitials(item.currentApprover)}
                        </div>

                        <div>
                            <div className="text-[15px] font-semibold leading-5 text-[#183B6B]">
                                {item.currentApprover}
                            </div>
                            <div className="text-xs font-medium text-slate-400">
                                {item.approverRole}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "submittedAt",
            title: "Submitted At",
            className: "text-[15px] font-medium text-slate-500",
            render: (item: SubmittedItem) => (
                <span className="whitespace-pre-line">
                    {item.submittedAt}
                </span>
            ),
        },
        {
            key: "lastUpdated",
            title: "Last Updated",
            className: "text-[15px] font-medium text-slate-500",
            render: (item: SubmittedItem) => (
                <span className="whitespace-pre-line">
                    {item.lastUpdated}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item: SubmittedItem) => <StatusBadge status={item.status} />,
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
                            onClick: () => console.log("Export All clicked")
                        },
                    ]}
                />

                <div className="grid gap-5 lg:grid-cols-3">
                    <KpiCard
                        title="Submitted This Month"
                        value="24"
                        suffix="requests"
                        rightIcon={undefined}
                        description="↗ 12% increase vs last month"
                    />

                    <KpiCard
                        title="In Progress"
                        value="7"
                        suffix="awaiting review"
                        rightIcon={undefined}
                        footer={
                            <div className="h-2 rounded-full bg-slate-100">
                                <div className="h-2 w-[34%] rounded-full bg-[#175CFF]" />
                            </div>
                        }
                    />

                    <KpiCard
                        title="Outcome Summary"
                        value=""
                        rightIcon={undefined}
                        customContent={
                            <div className="mt-2 flex items-center gap-6">
                                <div>
                                    <div className="text-5xl font-bold leading-none text-emerald-600">
                                        14
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Approved
                                    </div>
                                </div>

                                <div className="h-14 w-px bg-slate-200" />

                                <div>
                                    <div className="text-5xl font-bold leading-none text-rose-500">
                                        3
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Rejected
                                    </div>
                                </div>

                                <div className="h-14 w-px bg-slate-200" />

                                <div>
                                    <div className="text-5xl font-bold leading-none text-slate-400">
                                        7
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Other
                                    </div>
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
                            className="h-12 w-12 rounded-xl text-slate-500 hover:bg-white"
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: SubmittedItem) => row.id}
                    selectable={false}
                    emptyText="No submitted requests found"
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} submitted items`}
                    pagination={{
                        currentPage,
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
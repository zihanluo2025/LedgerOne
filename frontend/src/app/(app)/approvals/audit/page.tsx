"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Filter,
    ListChecks,
    TimerReset,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";

type AuditItem = {
    id: string;
    docNo: string;
    type: "Inbound" | "Sales";
    requester: string;
    summary: string;
    currentApprover: string;
    department: string;
    submittedAt: string;
    status: "In Progress" | "Approved" | "Rejected" | "Cancelled" | "Overdue";
};

const auditData: AuditItem[] = [
    {
        id: "1",
        docNo: "INB-20260405-001",
        type: "Inbound",
        requester: "David Chen",
        summary: "Quarterly Server Hardware Replenishment",
        currentApprover: "Marcus Aurelius",
        department: "Engineering",
        submittedAt: "Apr 05, 10:24 AM",
        status: "In Progress",
    },
    {
        id: "2",
        docNo: "SAL-20260404-042",
        type: "Sales",
        requester: "Sarah Jenkins",
        summary: "Global SaaS License Renewal",
        currentApprover: "Completed",
        department: "Finance",
        submittedAt: "Apr 04, 02:15 PM",
        status: "Approved",
    },
    {
        id: "3",
        docNo: "INB-20260401-089",
        type: "Inbound",
        requester: "Robert Miller",
        summary: "Office Renovation Supply Request",
        currentApprover: "Linda V.",
        department: "Operations",
        submittedAt: "Apr 01, 09:00 AM",
        status: "Overdue",
    },
    {
        id: "4",
        docNo: "SAL-20260330-015",
        type: "Sales",
        requester: "Kevin Zhang",
        summary: "Client Hospitality Procurement",
        currentApprover: "—",
        department: "Marketing",
        submittedAt: "Mar 30, 04:45 PM",
        status: "Cancelled",
    },
    {
        id: "5",
        docNo: "SAL-20260403-018",
        type: "Sales",
        requester: "Amanda White",
        summary: "Regional Pricing Exception Approval",
        currentApprover: "Completed",
        department: "Sales",
        submittedAt: "Apr 03, 11:35 AM",
        status: "Rejected",
    },
    {
        id: "6",
        docNo: "INB-20260402-021",
        type: "Inbound",
        requester: "Jason Clark",
        summary: "Warehouse Safety Equipment Restock",
        currentApprover: "Helen Brooks",
        department: "Operations",
        submittedAt: "Apr 02, 08:10 AM",
        status: "In Progress",
    },
    {
        id: "7",
        docNo: "INB-20260402-034",
        type: "Inbound",
        requester: "Olivia Brown",
        summary: "Production Line Spare Parts Purchase",
        currentApprover: "Completed",
        department: "Engineering",
        submittedAt: "Apr 02, 01:20 PM",
        status: "Approved",
    },
    {
        id: "8",
        docNo: "SAL-20260401-051",
        type: "Sales",
        requester: "Ethan Scott",
        summary: "Enterprise Client Bulk Discount Request",
        currentApprover: "Grace Lee",
        department: "Finance",
        submittedAt: "Apr 01, 03:05 PM",
        status: "Overdue",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
    if (!name || name === "—" || name === "Completed") return name;

    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function TypeBadge({ type }: { type: AuditItem["type"] }) {
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

function StatusBadge({ status }: { status: AuditItem["status"] }) {
    const statusClassMap = {
        "In Progress": "border-blue-200 bg-blue-50 text-blue-700",
        Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
        Rejected: "border-rose-200 bg-rose-50 text-rose-700",
        Cancelled: "border-slate-200 bg-slate-100 text-slate-500",
        Overdue: "border-orange-200 bg-orange-50 text-orange-600",
    };

    const dotClassMap = {
        "In Progress": "bg-blue-500",
        Approved: "bg-emerald-500",
        Rejected: "bg-rose-500",
        Cancelled: "bg-slate-400",
        Overdue: "bg-orange-500",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.04em]",
                statusClassMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotClassMap[status])} />
            {status}
        </span>
    );
}

export default function ApprovalAuditCenterPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [type, setType] = useState("all");
    const [status, setStatus] = useState("all");
    const [department, setDepartment] = useState("all");

    const pageSize = 4;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return auditData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.docNo.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword) ||
                item.requester.toLowerCase().includes(keyword) ||
                item.currentApprover.toLowerCase().includes(keyword);

            const matchType =
                type === "all" || item.type.toLowerCase() === type;

            const normalizedStatus = item.status.toLowerCase().replace(/\s+/g, "-");
            const matchStatus =
                status === "all" || normalizedStatus === status;

            const normalizedDepartment = item.department.toLowerCase();
            const matchDepartment =
                department === "all" || normalizedDepartment === department;

            return matchKeyword && matchType && matchStatus && matchDepartment;
        });
    }, [search, type, status, department]);

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
            placeholder: "Search Doc No / Summary / Requester...",
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
            options: [
                { label: "All Business", value: "all" },
                { label: "Inbound", value: "inbound" },
                { label: "Sales", value: "sales" },
            ],
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            value: status,
            onChange: (value) => {
                setStatus(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All", value: "all" },
                { label: "In Progress", value: "in-progress" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
                { label: "Cancelled", value: "cancelled" },
                { label: "Overdue", value: "overdue" },
            ],
        },
        {
            key: "department",
            type: "select",
            label: "Department",
            value: department,
            onChange: (value) => {
                setDepartment(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All", value: "all" },
                { label: "Engineering", value: "engineering" },
                { label: "Finance", value: "finance" },
                { label: "Operations", value: "operations" },
                { label: "Marketing", value: "marketing" },
                { label: "Sales", value: "sales" },
            ],
        },
    ];

    const columns = [
        {
            key: "docNo",
            title: "Document No",
            render: (item: AuditItem) => (
                <button className="max-w-[180px] text-left font-bold leading-8 text-[#1557E5] hover:underline">
                    {item.docNo}
                </button>
            ),
        },
        {
            key: "type",
            title: "Type",
            render: (item: AuditItem) => <TypeBadge type={item.type} />,
        },
        {
            key: "requester",
            title: "Requester",
            render: (item: AuditItem) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFE5FF] text-sm font-bold text-[#4763B4]">
                        {getInitials(item.requester)}
                    </div>
                    <span className="max-w-[100px] text-[15px] font-semibold leading-6 text-slate-700">
                        {item.requester}
                    </span>
                </div>
            ),
        },
        {
            key: "currentApprover",
            title: "Current Approver",
            render: (item: AuditItem) => {
                if (item.currentApprover === "Completed" || item.currentApprover === "—") {
                    return (
                        <span
                            className={cn(
                                "text-[14px] font-semibold",
                                item.currentApprover === "Completed"
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                            )}
                        >
                            {item.currentApprover}
                        </span>
                    );
                }

                return (
                    <span
                        className={cn(
                            "text-[14px] font-semibold",
                            item.status === "Overdue" ? "text-rose-600" : "text-[#183B6B]"
                        )}
                    >
                        {item.currentApprover}
                    </span>
                );
            },
        },
        {
            key: "department",
            title: "Dept.",
            className: "text-[14px] font-medium text-slate-500",
            render: (item: AuditItem) => item.department,
        },
        {
            key: "submittedAt",
            title: "Submitted",
            className: "text-[14px] font-medium text-slate-400",
            render: (item: AuditItem) => (
                <span className="whitespace-pre-line">
                    {item.submittedAt.replace(", ", ",\n")}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item: AuditItem) => <StatusBadge status={item.status} />,
        },
    ];

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
                            onClick: () => console.log("Export All clicked")
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Requests"
                        value="248"
                        rightIcon={
                            <div className="rounded-lg bg-[#EEF4FF] p-2 text-[#5B7BEA]">
                                <ListChecks className="h-4 w-4" />
                            </div>
                        }
                        description="all requests this month"
                    />

                    <KpiCard
                        title="In Progress"
                        value="36"
                        rightIcon={
                            <div className="rounded-lg bg-[#EEF1FF] p-2 text-[#7A88A8]">
                                <TimerReset className="h-4 w-4" />
                            </div>
                        }
                        description="currently under review"
                    />

                    <KpiCard
                        title="Completed Rate"
                        value="82%"
                        rightIcon={
                            <div className="rounded-lg bg-[#EAFBF5] p-2 text-[#30A46C]">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        }
                        description="completed successfully"
                    />

                    <KpiCard
                        title="Overdue Items"
                        value="9"
                        rightIcon={
                            <div className="rounded-lg bg-[#FFF1EF] p-2 text-[#E85D4E]">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                        }
                        description="require attention"
                        className="border border-rose-100 bg-rose-50/40"
                        valueClassName="text-[#B5473E]"
                        descriptionClassName="font-semibold uppercase tracking-[0.06em] text-[#D46357]"
                    />
                </div>

                <DataFilterBar
                    fields={filterFields}
                    actionSlot={
                        <Button
                            variant="outline"
                            className="h-12 rounded-sm border-slate-200 bg-white px-4 text-[#183B6B] hover:bg-slate-50"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Advanced Filter
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: AuditItem) => row.id}
                    selectable={false}
                    emptyText="No audit records found"
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} entries`}
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
"use client";

import { useMemo, useState } from "react";
import { CheckCheck, Filter, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import KpiCard from "@/components/common/kpi-card";

import DataFilterBar from "@/components/common/data-filter-bar";
import DataTable from "@/components/common/data-table/index";

import type { DataTableColumn } from "@/components/common/data-table/types";
import type { FilterField } from "@/components/common/data-filter-bar/types";

import {
    PendingItem,
    pendingData,
    getInitials,
    StatusBadge,
    TypeBadge,
} from "./data";

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export default function PendingPage() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [priority, setPriority] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 10;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return pendingData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.docNo.toLowerCase().includes(keyword) ||
                item.requester.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword);

            const matchType = type === "all" || item.type.toLowerCase() === type;

            const matchPriority =
                priority === "all" ||
                (priority === "urgent" && item.urgent) ||
                (priority === "normal" && !item.urgent);

            return matchKeyword && matchType && matchPriority;
        });
    }, [search, type, priority]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const allChecked =
        pagedData.length > 0 && pagedData.every((item) => selectedIds.includes(item.id));

    const toggleRow = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            const pageIds = pagedData.map((item) => item.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        } else {
            const pageIds = pagedData.map((item) => item.id);
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        }
    };

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            onChange: setSearch,
            placeholder: "Search Doc No, Requester...",
        },
        {
            key: "type",
            type: "select",
            label: "Type",
            value: type,
            onChange: setType,
            options: [
                { label: "All Business", value: "all" },
                { label: "Inbound", value: "inbound" },
                { label: "Sales", value: "sales" },
            ],
        },
        {
            key: "priority",
            type: "select",
            label: "Priority",
            value: priority,
            onChange: setPriority,
            options: [
                { label: "All", value: "all" },
                { label: "Urgent", value: "urgent" },
                { label: "Normal", value: "normal" },
            ],
        },
        {
            key: "dateRange",
            type: "dateRange",
            value: "Apr 01 - Apr 30",
        },
    ];

    const columns: DataTableColumn<PendingItem>[] = [
        {
            key: "docNo",
            title: "Document No",
            render: (item) => (
                <button className="max-w-[180px] text-left font-bold leading-8 text-[#245BDB] hover:underline">
                    {item.docNo}
                </button>
            ),
        },
        {
            key: "type",
            title: "Type",
            render: (item) => <TypeBadge type={item.type} />,
        },
        {
            key: "requester",
            title: "Requester",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
                        {getInitials(item.requester)}
                    </div>
                    <span className="text-sm font-semibold leading-6 text-slate-800">
                        {item.requester}
                    </span>
                </div>
            ),
        },
        {
            key: "submittedAt",
            title: "Submitted At",
            className: "text-[15px] font-semibold",
            render: (item) => (
                <span className={cn(item.urgent ? "text-[#C95A52]" : "text-slate-500")}>
                    {item.submittedAt}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item) => <StatusBadge urgent={item.urgent} />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-[var(--erp-text)]">
                            Approval Workflow news
                        </h1>
                        <p className="text-base text-[var(--erp-text-secondary)]">
                            Review and action pending operational requests across the organization.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-11 rounded-xl border-[#D9E5FF] bg-[#EAF1FF] px-5 text-[#0A3B72] hover:bg-[#DFE9FF]"
                        >
                            <History className="mr-2 h-4 w-4" />
                            View History
                        </Button>

                        <Button className="h-11 rounded-xl bg-[#175CFF] px-5 text-white shadow-md shadow-blue-300/40 hover:bg-[#0F4FE8]">
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Batch Approve
                        </Button>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                    <KpiCard
                        title="My Pending Tasks"
                        value="18"
                        suffix="tasks waiting"
                        badge={
                            <span className="rounded-md bg-[#FF8A80]/20 px-2.5 py-1 text-xs font-bold text-[#D9534F]">
                                6 CRITICAL
                            </span>
                        }
                        footer={
                            <div className="h-2 rounded-full bg-slate-100">
                                <div className="h-2 w-[66%] rounded-full bg-[#175CFF]" />
                            </div>
                        }
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Today's New"
                        value="5"
                        suffix="new entries"
                        description="↗ 25% increase from yesterday"
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Avg. Processing Time"
                        value="4.2"
                        suffix="h"
                        description="Target: < 6.0h for standard docs"
                        suffixText={
                            <span className="text-sm font-semibold text-emerald-600">↓ 12%</span>
                        }
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
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row) => row.id}
                    selectable
                    allChecked={allChecked}
                    selectedRowKeys={selectedIds}
                    onSelectRow={toggleRow}
                    onSelectAll={toggleAll}
                    rowClassName={(row) => (row.urgent ? "bg-rose-50/40" : undefined)}
                    emptyText="No pending requests found"
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} pending requests`}
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
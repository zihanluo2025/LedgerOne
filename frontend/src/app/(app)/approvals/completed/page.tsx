"use client";

import { useMemo, useState } from "react";
import {
    Download,
    Filter,
    TrendingDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";

import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";


type CompleteItem = {
    id: string;
    docNo: string;
    type: "Inbound" | "Sales";
    requester: string;
    summary: string;
    completedAt: string;
    processingTime: string;
    outcome: "Approved" | "Rejected";
};

const completeData: CompleteItem[] = [
    {
        id: "1",
        docNo: "INB-20260401-005",
        type: "Inbound",
        requester: "James D.",
        summary: "500x Steel Chassis, Main Warehouse",
        completedAt: "Apr 05, 14:30",
        processingTime: "2.4h",
        outcome: "Approved",
    },
    {
        id: "2",
        docNo: "SAL-20260401-012",
        type: "Sales",
        requester: "Sarah K.",
        summary: "Priority Shipment: Electronics",
        completedAt: "Apr 05, 11:20",
        processingTime: "5.1h",
        outcome: "Rejected",
    },
    {
        id: "5",
        docNo: "INB-20260327-072",
        type: "Inbound",
        requester: "Alice M.",
        summary: "Replacement Sensors for North Wing",
        completedAt: "Apr 03, 17:10",
        processingTime: "2.1h",
        outcome: "Approved",
    },
    {
        id: "6",
        docNo: "SAL-20260327-061",
        type: "Sales",
        requester: "John C.",
        summary: "Bulk Component Purchase - Tech Supply",
        completedAt: "Apr 03, 10:40",
        processingTime: "6.2h",
        outcome: "Rejected",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function TypeBadge({ type }: { type: CompleteItem["type"] }) {
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

function OutcomeBadge({ outcome }: { outcome: CompleteItem["outcome"] }) {
    const approved = outcome === "Approved";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold",
                approved
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-600"
            )}
        >
            <span
                className={cn(
                    "h-2 w-2 rounded-full",
                    approved ? "bg-emerald-500" : "bg-rose-500"
                )}
            />
            {outcome.toUpperCase()}
        </span>
    );
}



export default function MyCompletePage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [type, setType] = useState("all");
    const [priority, setPriority] = useState("all");

    const pageSize = 4;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return completeData;

        return completeData.filter(
            (item) =>
                item.docNo.toLowerCase().includes(keyword) ||
                item.requester.toLowerCase().includes(keyword) ||
                item.summary.toLowerCase().includes(keyword)
        );
    }, [search]);

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

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const columns = [
        {
            key: "docNo",
            title: "Document No",
            render: (item: CompleteItem) => (
                <button className="max-w-[180px] text-left  font-bold leading-8 text-[#1557E5] hover:underline">
                    {item.docNo}
                </button>
            ),
        },
        {
            key: "type",
            title: "Type",
            render: (item: CompleteItem) => <TypeBadge type={item.type} />,
        },
        {
            key: "requester",
            title: "Requester",
            render: (item: CompleteItem) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFE5FF] text-sm font-bold text-[#4763B4]">
                        {getInitials(item.requester)}
                    </div>
                    <span className="max-w-[82px] text-[15px] font-semibold leading-6 text-slate-700">
                        {item.requester}
                    </span>
                </div>
            ),
        },

        {
            key: "completedAt",
            title: "Completed At",
            className: "text-[15px] font-medium text-slate-500",
            render: (item: CompleteItem) => item.completedAt,
        },
        {
            key: "processingTime",
            title: "Proc. Time",
            className: "text-[15px] font-semibold",
            render: (item: CompleteItem) => {
                const value = parseFloat(item.processingTime);

                return (
                    <span className={cn(value <= 3 ? "text-emerald-600" : "text-orange-500")}>
                        {item.processingTime}
                    </span>
                );
            },
        },
        {
            key: "outcome",
            title: "Outcome",
            render: (item: CompleteItem) => <OutcomeBadge outcome={item.outcome} />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="My Completed Approvals"
                    description="Review completed approval records and processing outcomes from
                            your historical audit trail."
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
                        title="Completed This Month"
                        value="32"
                        suffix="items"
                        rightIcon={undefined}
                    />

                    <KpiCard
                        title="Avg. Completion Time"
                        value="3.6"
                        suffix="h"
                        rightIcon={undefined}
                        suffixText={
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                <TrendingDown className="mr-1 h-4 w-4" />
                                8%
                            </span>
                        }
                    />

                    <KpiCard
                        title="Approval Outcome"
                        value=""
                        rightIcon={undefined}
                        customContent={
                            <div className="mt-2 flex items-center gap-8">
                                <div>
                                    <div className="text-5xl font-bold leading-none text-emerald-600">
                                        26
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Approved
                                    </div>
                                </div>

                                <div className="h-14 w-px bg-slate-200" />

                                <div>
                                    <div className="text-5xl font-bold leading-none text-rose-500">
                                        6
                                    </div>
                                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
                                        Rejected
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>

                {/* <CompleteFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    typeValue="All Business"
                    outcomeValue="All Outcomes"
                /> */}
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
                    rowKey={(row: CompleteItem) => row.id}
                    selectable={false}
                    emptyText="No completed approvals found"
                    footerLeft={`Showing ${pagedData.length} of ${filteredData.length} completed items`}
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
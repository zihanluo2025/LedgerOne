"use client";

import { useState } from "react";
import {
    Plus,
    Filter,
    Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/data-table";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import PageHeader from "@/components/common/PageHeader";

type InboundStatus =
    | "Completed"
    | "Partially Received"
    | "Exception"
    | "Pending";

type InboundItem = {
    id: string;
    supplier: string;
    supplierId: string;
    warehouse: string;
    items: number;
    expectedQty: number;
    receivedQty: number;
    date: string;
    status: InboundStatus;
};

const inboundData: InboundItem[] = [
    {
        id: "#INB-8842-X",
        supplier: "Global Logistics Co.",
        supplierId: "SUP-2991",
        warehouse: "Central DC",
        items: 24,
        expectedQty: 1200,
        receivedQty: 1200,
        date: "Today, 09:45 AM",
        status: "Completed",
    },
    {
        id: "#INB-8839-A",
        supplier: "Advanced Electronics Ltd",
        supplierId: "SUP-1102",
        warehouse: "West Coast Hub",
        items: 12,
        expectedQty: 850,
        receivedQty: 420,
        date: "Yesterday",
        status: "Partially Received",
    },
    {
        id: "#INB-8835-E",
        supplier: "Summit Manufacturing",
        supplierId: "SUP-5582",
        warehouse: "East Coast Annex",
        items: 5,
        expectedQty: 300,
        receivedQty: 280,
        date: "Oct 24, 2023",
        status: "Exception",
    },
    {
        id: "#INB-8831-P",
        supplier: "Northern Sourcing Group",
        supplierId: "SUP-0041",
        warehouse: "Central DC",
        items: 105,
        expectedQty: 5000,
        receivedQty: 0,
        date: "Expected Oct 31",
        status: "Pending",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function ProgressBar({
    expected,
    received,
}: {
    expected: number;
    received: number;
}) {
    const percent = Math.min((received / expected) * 100, 100);

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
    const map = {
        Completed: "bg-emerald-50 text-emerald-600",
        "Partially Received": "bg-blue-50 text-blue-600",
        Exception: "bg-rose-50 text-rose-600",
        Pending: "bg-slate-100 text-slate-500",
    };

    return (
        <span className={cn("px-3 py-1 text-xs rounded-full font-semibold", map[status])}>
            {status.toUpperCase()}
        </span>
    );
}

export default function InboundPage() {
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 4;

    const paged = inboundData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const filterFields: FilterField[] = [
        {
            key: "warehouse",
            type: "select",
            label: "Warehouse",
            value: "central",
            onChange: () => { },
            options: [
                { label: "Central Distribution Center", value: "central" },
            ],
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            value: "all",
            onChange: () => { },
            options: [{ label: "All Statuses", value: "all" }],
        },
        {
            key: "date",
            type: "select",
            label: "Date Range",
            value: "oct",
            onChange: () => { },
            options: [{ label: "Oct 01 - Oct 31", value: "oct" }],
        },
    ];

    const columns = [
        {
            key: "id",
            title: "Inbound No",
            render: (i: InboundItem) => (
                <span className="text-[#175CFF] font-semibold">{i.id}</span>
            ),
        },
        {
            key: "supplier",
            title: "Supplier",
            render: (i: InboundItem) => (
                <div>
                    <div className="font-semibold">{i.supplier}</div>
                    <div className="text-xs text-slate-400">ID: {i.supplierId}</div>
                </div>
            ),
        },
        {
            key: "warehouse",
            title: "Warehouse",
            render: (i: InboundItem) => i.warehouse,
        },
        {
            key: "items",
            title: "Items",
            render: (i: InboundItem) => `${i.items} SKUs`,
        },
        {
            key: "qty",
            title: "Qty (Exp/Rec)",
            render: (i: InboundItem) => (
                <div>
                    <div className="font-semibold">
                        {i.expectedQty.toLocaleString()} / {i.receivedQty.toLocaleString()}
                    </div>
                    <ProgressBar expected={i.expectedQty} received={i.receivedQty} />
                </div>
            ),
        },
        {
            key: "date",
            title: "Received At",
            render: (i: InboundItem) => i.date,
        },
        {
            key: "status",
            title: "Status",
            render: (i: InboundItem) => <StatusBadge status={i.status} />,
        },
        {
            key: "actions",
            title: "Actions",
            render: () => (
                <span className="text-slate-400 text-xl">⋯</span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Inbound"
                description=" Manage and track inventory incoming into your facilities."
                actions={[
                    {
                        label: "Export",
                        icon: <Download size={22} strokeWidth={2.2} />,
                        onClick: () => console.log("Export clicked")
                    },
                    {
                        label: "Create Inbound",
                        icon: <Plus size={22} strokeWidth={2.2} />,
                        onClick: () => console.log("Create Inbound clicked")
                    },
                ]}
            />

            {/* KPI */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard title="Inbound This Month" value="42" />
                <KpiCard title="Pending Receiving" value="8" />
                <KpiCard title="Received Today" value="5" />
                <KpiCard title="Exceptions" value="2" />
            </div>

            {/* Filters */}
            <DataFilterBar
                fields={filterFields}
                actionSlot={
                    <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                            <Filter />
                        </Button>
                        <Button size="icon" variant="ghost">
                            <Download />
                        </Button>
                    </div>
                }
            />

            {/* Table */}
            <DataTable
                data={paged}
                columns={columns}
                rowKey={(i: InboundItem) => i.id}
                selectable={false}
                pagination={{
                    currentPage,
                    totalPages: Math.ceil(inboundData.length / pageSize),
                    totalItems: inboundData.length,
                    pageSize,
                    onPageChange: setCurrentPage,
                }}
            />
        </div>
    );
}
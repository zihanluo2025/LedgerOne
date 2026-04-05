"use client";

import { useMemo, useState } from "react";
import {
    Ban,
    CalendarDays,
    Download,
    Plus,
    RotateCcw,
    Search,
    ClipboardCheck,
    AlertTriangle,
    MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";

type ReturnType = "Customer" | "Supplier";
type ReturnStatus = "Inspecting" | "Completed" | "Rejected";

type ReturnItem = {
    id: string;
    returnNo: string;
    type: ReturnType;
    partnerName: string;
    partnerRole: string;
    partnerInitials: string;
    productName: string;
    productMeta: string;
    qty: number;
    requestedAt: string;
    status: ReturnStatus;
};

const returnData: ReturnItem[] = [
    {
        id: "1",
        returnNo: "RET-2023-4412",
        type: "Customer",
        partnerName: "Johnathan Doe",
        partnerRole: "Retail Channel",
        partnerInitials: "JD",
        productName: "Quantum Pro Headphone",
        productMeta: "Serial: #QN-88219",
        qty: 1,
        requestedAt: "24 Oct, 09:45 AM",
        status: "Inspecting",
    },
    {
        id: "2",
        returnNo: "RET-2023-4410",
        type: "Supplier",
        partnerName: "Astro Logistics Ltd.",
        partnerRole: "Core Supplier",
        partnerInitials: "AL",
        productName: "Mainboard X-200 Chipsets",
        productMeta: "Bulk Lot #A-22",
        qty: 450,
        requestedAt: "22 Oct, 03:20 PM",
        status: "Completed",
    },
    {
        id: "3",
        returnNo: "RET-2023-4398",
        type: "Customer",
        partnerName: "Sarah Miller",
        partnerRole: "Private Client",
        partnerInitials: "SM",
        productName: "Titan Mesh Chair (Black)",
        productMeta: "SKU: TM-420-B",
        qty: 1,
        requestedAt: "20 Oct, 11:15 AM",
        status: "Rejected",
    },
    {
        id: "4",
        returnNo: "RET-2023-4386",
        type: "Supplier",
        partnerName: "Northline Components",
        partnerRole: "Electronics Vendor",
        partnerInitials: "NC",
        productName: "Sensor Module Batch",
        productMeta: "PO Ref: SUP-1192",
        qty: 120,
        requestedAt: "18 Oct, 02:00 PM",
        status: "Inspecting",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function ReturnTypeBadge({ type }: { type: ReturnType }) {
    const map = {
        Customer: "bg-[#DCEBFF] text-[#2563EB]",
        Supplier: "bg-slate-100 text-slate-500",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                map[type]
            )}
        >
            {type}
        </span>
    );
}

function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
    const classMap = {
        Inspecting: "border-orange-200 bg-orange-50 text-orange-600",
        Completed: "border-emerald-200 bg-emerald-50 text-emerald-600",
        Rejected: "border-rose-200 bg-rose-50 text-rose-600",
    };

    const dotMap = {
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

function PartnerCell({ item }: { item: ReturnItem }) {
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

function ProductCell({ item }: { item: ReturnItem }) {
    return (
        <div>
            <div className="text-[15px] font-semibold leading-6 text-[#183B6B]">
                {item.productName}
            </div>
            <div className="text-sm text-[#4F7AB8]">{item.productMeta}</div>
        </div>
    );
}

function ActionCell() {
    return (
        <button className="text-slate-400 transition hover:text-[#175CFF]">
            <MoreVertical className="h-5 w-5" />
        </button>
    );
}

function ReturnsFilterPanel({
    search,
    onSearchChange,
}: {
    search: string;
    onSearchChange: (value: string) => void;
}) {
    return (
        <div className="rounded-3xl border border-slate-200/70 bg-[#EEF3FB] p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr_1fr]">
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5E7AA2]">
                        Search Returns
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Return No / Product / Customer..."
                            className="h-12 rounded-xl border border-slate-200 bg-white pl-11 text-sm shadow-none placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5E7AA2]">
                        Return Type
                    </p>
                    <Button
                        variant="outline"
                        className="h-12 w-full justify-between rounded-xl border-slate-200 bg-white px-4 text-[#183B6B] hover:bg-slate-50"
                    >
                        <span className="font-medium">All Types</span>
                        <span className="text-slate-400">⌄</span>
                    </Button>
                </div>

                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5E7AA2]">
                        Status
                    </p>
                    <Button
                        variant="outline"
                        className="h-12 w-full justify-between rounded-xl border-slate-200 bg-white px-4 text-[#183B6B] hover:bg-slate-50"
                    >
                        <span className="font-medium">All Statuses</span>
                        <span className="text-slate-400">⌄</span>
                    </Button>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="w-full lg:max-w-[260px]">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#5E7AA2]">
                        Date Range
                    </p>
                    <Button
                        variant="outline"
                        className="h-12 w-full justify-start rounded-xl border-slate-200 bg-white px-4 text-[#183B6B] hover:bg-slate-50"
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Oct 01, 2023 - Oct 31, 2023
                    </Button>
                </div>

                <Button className="h-12 rounded-xl bg-[#0B3A6E] px-8 text-white hover:bg-[#082C53]">
                    Apply
                </Button>
            </div>
        </div>
    );
}

export default function ReturnsPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 4;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return returnData;

        return returnData.filter(
            (item) =>
                item.returnNo.toLowerCase().includes(keyword) ||
                item.productName.toLowerCase().includes(keyword) ||
                item.partnerName.toLowerCase().includes(keyword)
        );
    }, [search]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    const columns = [
        {
            key: "returnNo",
            title: "Return No",
            render: (item: ReturnItem) => (
                <button className="max-w-[120px] text-left text-[16px] font-bold leading-8 text-[#175CFF] hover:underline">
                    {item.returnNo.replace(/-/g, "-\n")}
                </button>
            ),
        },
        {
            key: "type",
            title: "Type",
            render: (item: ReturnItem) => <ReturnTypeBadge type={item.type} />,
        },
        {
            key: "partner",
            title: "Source / Partner",
            render: (item: ReturnItem) => <PartnerCell item={item} />,
        },
        {
            key: "product",
            title: "Product & Items",
            render: (item: ReturnItem) => <ProductCell item={item} />,
        },
        {
            key: "qty",
            title: "Qty",
            className: "text-[16px] font-medium text-[#183B6B]",
            render: (item: ReturnItem) => String(item.qty).padStart(2, "0"),
        },
        {
            key: "requestedAt",
            title: "Requested",
            className: "text-[16px] font-medium text-[#4F6786]",
            render: (item: ReturnItem) => (
                <span className="whitespace-pre-line">
                    {item.requestedAt.replace(", ", ",\n")}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item: ReturnItem) => <ReturnStatusBadge status={item.status} />,
        },
        {
            key: "actions",
            title: "",
            render: () => <ActionCell />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                {/* header */}
                <PageHeader
                    title="Returns"
                    description="Manage and track customer and supplier return records."
                    actions={[
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Export clicked")
                        },
                        {
                            label: "Create Return",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Create Return clicked")
                        },
                    ]}
                />

                {/* kpi */}
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Returns This Month"
                        value="42"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#2563EB]">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                    +12% vs LY
                                </span>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Pending Inspection"
                        value="8"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-[#A94442]">
                                    Urgent
                                </span>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Refunded"
                        value="15"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#F2EAFE] p-3 text-[#6E56A8]">
                                    <RotateCcw className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-sm font-semibold text-[#5E7AA2]">
                                    In Sync
                                </span>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Rejected Returns"
                        value="2"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#0B3A6E]">
                                    <Ban className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-sm font-semibold text-[#2563EB]">
                                    Active
                                </span>
                            </div>
                        }
                    />
                </div>

                {/* filter panel */}
                <ReturnsFilterPanel search={search} onSearchChange={setSearch} />

                {/* table */}
                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: ReturnItem) => row.id}
                    selectable={false}
                    emptyText="No return records found"
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length} return records`}
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
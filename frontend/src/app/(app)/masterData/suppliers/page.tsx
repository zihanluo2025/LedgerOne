"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Filter,
    Plus,
    Upload,
    Users,
    ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";


type SupplierStatus = "Active" | "Risk" | "Pending" | "Inactive";

type SupplierItem = {
    id: string;
    name: string;
    code: string;
    category: "Electronics" | "Raw Materials" | "Logistics";
    contactPerson: string;
    email: string;
    region: "North America" | "East Asia" | "Europe";
    status: SupplierStatus;
    lastOrder: string;
    updated: string;
};

const supplierData: SupplierItem[] = [
    {
        id: "1",
        name: "Global Semi Co.",
        code: "GS-4002",
        category: "Electronics",
        contactPerson: "Alex Rivera",
        email: "alex.r@globalsemi.com",
        region: "North America",
        status: "Active",
        lastOrder: "Oct 24, 2023",
        updated: "12m ago",
    },
    {
        id: "2",
        name: "Titanium Alloy Works",
        code: "TAW-1102",
        category: "Raw Materials",
        contactPerson: "Chen Wei",
        email: "c.wei@titanium.asia",
        region: "East Asia",
        status: "Risk",
        lastOrder: "Oct 20, 2023",
        updated: "2h ago",
    },
    {
        id: "3",
        name: "Swift Logistics EU",
        code: "SLE-3081",
        category: "Logistics",
        contactPerson: "Emma Bauer",
        email: "e.bauer@swift-log.de",
        region: "Europe",
        status: "Pending",
        lastOrder: "Sep 12, 2023",
        updated: "1d ago",
    },
    {
        id: "4",
        name: "Quantum Materials",
        code: "QM-5501",
        category: "Electronics",
        contactPerson: "Jordan Smith",
        email: "j.smith@qmaterials.com",
        region: "North America",
        status: "Inactive",
        lastOrder: "Aug 05, 2023",
        updated: "3w ago",
    },
    {
        id: "5",
        name: "Pacific Circuit Parts",
        code: "PCP-7840",
        category: "Electronics",
        contactPerson: "Naoko Ito",
        email: "n.ito@pcparts.jp",
        region: "East Asia",
        status: "Active",
        lastOrder: "Oct 25, 2023",
        updated: "8m ago",
    },
    {
        id: "6",
        name: "Nova Freight Systems",
        code: "NFS-6622",
        category: "Logistics",
        contactPerson: "Daniel Moore",
        email: "d.moore@novafreight.com",
        region: "North America",
        status: "Pending",
        lastOrder: "Oct 18, 2023",
        updated: "5h ago",
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

function CategoryBadge({ category }: { category: SupplierItem["category"] }) {
    const classMap = {
        Electronics: "bg-[#DCEBFF] text-[#2D6BCF]",
        "Raw Materials": "bg-[#E8DFFC] text-[#6C5AAE]",
        Logistics: "bg-[#E9F7F1] text-[#1F8A5B]",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                classMap[category]
            )}
        >
            {category}
        </span>
    );
}

function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
    const statusClassMap = {
        Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
        Risk: "border-rose-200 bg-rose-50 text-rose-600",
        Pending: "border-blue-200 bg-blue-50 text-blue-700",
        Inactive: "border-slate-200 bg-slate-100 text-slate-500",
    };

    const dotClassMap = {
        Active: "bg-emerald-500",
        Risk: "bg-rose-500",
        Pending: "bg-blue-500",
        Inactive: "bg-slate-400",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold",
                statusClassMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotClassMap[status])} />
            {status}
        </span>
    );
}

function SupplierCell({ item }: { item: SupplierItem }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DFE5FF] text-sm font-bold text-[#4763B4]">
                {getInitials(item.name)}
            </div>

            <div>
                <button className="text-left text-[16px] font-bold leading-6 text-[#183B6B] hover:underline">
                    {item.name}
                </button>
                <div className="text-xs font-medium text-slate-400">ID: {item.code}</div>
            </div>
        </div>
    );
}

function ContactCell({ item }: { item: SupplierItem }) {
    return (
        <div>
            <div className="text-[14px] font-semibold text-[#183B6B]">
                {item.contactPerson}
            </div>
            <div className="text-xs text-slate-400">{item.email}</div>
        </div>
    );
}

function ActionCell() {
    return (
        <button className="text-slate-400 transition hover:text-[#175CFF]">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
        </button>
    );
}

export default function SuppliersPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState("all");
    const [region, setRegion] = useState("all");
    const [category, setCategory] = useState("all");

    const pageSize = 4;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return supplierData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.name.toLowerCase().includes(keyword) ||
                item.contactPerson.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword);

            const normalizedStatus = item.status.toLowerCase();
            const matchStatus = status === "all" || normalizedStatus === status;

            const normalizedRegion = item.region.toLowerCase().replace(/\s+/g, "-");
            const matchRegion = region === "all" || normalizedRegion === region;

            const normalizedCategory = item.category.toLowerCase().replace(/\s+/g, "-");
            const matchCategory =
                category === "all" || normalizedCategory === category;

            return matchKeyword && matchStatus && matchRegion && matchCategory;
        });
    }, [search, status, region, category]);

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
            placeholder: "Search Supplier Name / Contact / Category",
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
                { label: "Supplier Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Risk", value: "risk" },
                { label: "Pending", value: "pending" },
                { label: "Inactive", value: "inactive" },
            ],
        },
        {
            key: "region",
            type: "select",
            label: "",
            value: region,
            onChange: (value) => {
                setRegion(value);
                setCurrentPage(1);
            },
            options: [
                { label: "Region", value: "all" },
                { label: "North America", value: "north-america" },
                { label: "East Asia", value: "east-asia" },
                { label: "Europe", value: "europe" },
            ],
        },
        {
            key: "category",
            type: "select",
            label: "",
            value: category,
            onChange: (value) => {
                setCategory(value);
                setCurrentPage(1);
            },
            options: [
                { label: "Product Category", value: "all" },
                { label: "Electronics", value: "electronics" },
                { label: "Raw Materials", value: "raw-materials" },
                { label: "Logistics", value: "logistics" },
            ],
        },
    ];

    const columns = [
        {
            key: "supplier",
            title: "Supplier",
            render: (item: SupplierItem) => <SupplierCell item={item} />,
        },
        {
            key: "category",
            title: "Category",
            render: (item: SupplierItem) => <CategoryBadge category={item.category} />,
        },
        {
            key: "contactPerson",
            title: "Contact Person",
            render: (item: SupplierItem) => <ContactCell item={item} />,
        },
        {
            key: "region",
            title: "Region",
            className: "text-[14px] font-medium text-[#32577E]",
            render: (item: SupplierItem) => (
                <span className="whitespace-pre-line">
                    {item.region.replace(" ", "\n")}
                </span>
            ),
        },
        {
            key: "status",
            title: "Status",
            render: (item: SupplierItem) => <SupplierStatusBadge status={item.status} />,
        },
        {
            key: "lastOrder",
            title: "Last Order",
            className: "text-[14px] font-medium text-slate-500",
            render: (item: SupplierItem) => (
                <span className="whitespace-pre-line">
                    {item.lastOrder.replace(", ", ",\n")}
                </span>
            ),
        },
        {
            key: "updated",
            title: "Updated",
            className: "text-[14px] font-medium text-slate-500",
            render: (item: SupplierItem) => item.updated,
        },
        {
            key: "actions",
            title: "Actions",
            render: () => <ActionCell />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Suppliers"
                    description="Manage your strategic partnerships, contact details with precision and oversight."
                    actions={[
                        {
                            label: "Import",
                            icon: <Upload size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Import clicked")
                        },
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Export clicked")
                        },
                        {
                            label: "Add Supplier",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Add Supplier clicked")
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Suppliers"
                        value="124"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#5B7BEA]">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-semibold text-emerald-600">+4.5%</span>
                            </div>
                        }
                        className="border-l-4 border-l-[#175CFF]"
                    />

                    <KpiCard
                        title="Active Suppliers"
                        value="112"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-semibold text-slate-400">90.3%</span>
                            </div>
                        }
                        className="border-l-4 border-l-emerald-500"
                    />

                    <KpiCard
                        title="Pending Review"
                        value="5"
                        description="Review required"
                        rightIcon={
                            <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        }
                        className="border-l-4 border-l-orange-400"
                    />

                    <KpiCard
                        title="High Risk Suppliers"
                        value="7"
                        description="Critical Action"
                        rightIcon={
                            <div className="rounded-lg bg-rose-50 p-3 text-rose-500">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        }
                        className="border border-rose-100 bg-rose-50/40"
                        valueClassName="text-[#B5473E]"
                        descriptionClassName="font-semibold text-[#D46357]"
                    />
                </div>

                <DataFilterBar
                    fields={filterFields}
                    actionSlot={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl bg-[#EAF1FF] text-[#5B7BEA] hover:bg-[#DFE9FF]"
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: SupplierItem) => row.id}
                    selectable={false}
                    emptyText="No suppliers found"
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length} results`}
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
"use client";

import { useMemo, useState } from "react";
import {
    Crown,
    Download,
    Filter,
    Plus,
    RefreshCw,
    Sparkles,
    Users,
    UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";

type CustomerStatus = "VIP" | "Active" | "New" | "Inactive";
type CustomerSegment = "Enterprise" | "SME" | "Startup";
type CustomerRegion = "North America" | "Europe" | "Asia Pacific";

type CustomerItem = {
    id: string;
    name: string;
    avatar: string;
    company: string;
    segment: CustomerSegment;
    email: string;
    phone: string;
    orders: number;
    totalSpend: number;
    status: CustomerStatus;
    region: CustomerRegion;
};

const customerData: CustomerItem[] = [
    {
        id: "1",
        name: "Marcus Thorne",
        avatar:
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus",
        company: "Thorne Dynamics",
        segment: "Enterprise",
        email: "m.thorne@thdyn.com",
        phone: "+1 (555) 012-9988",
        orders: 142,
        totalSpend: 248120,
        status: "VIP",
        region: "North America",
    },
    {
        id: "2",
        name: "Elena Rodriguez",
        avatar:
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Elena",
        company: "Global Logistics Corp",
        segment: "SME",
        email: "elena.r@glc.io",
        phone: "+1 (555) 882-1100",
        orders: 56,
        totalSpend: 84500.5,
        status: "Active",
        region: "Europe",
    },
    {
        id: "3",
        name: "Julian Park",
        avatar:
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Julian",
        company: "Nova Stream Studio",
        segment: "Startup",
        email: "jpark@novastream.com",
        phone: "+1 (555) 443-2211",
        orders: 12,
        totalSpend: 12940,
        status: "New",
        region: "Asia Pacific",
    },
    {
        id: "4",
        name: "Sarah Jenkins",
        avatar:
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
        company: "Jenkins Estates",
        segment: "SME",
        email: "s.jenkins@estates.org",
        phone: "+1 (555) 990-8877",
        orders: 84,
        totalSpend: 112000,
        status: "Inactive",
        region: "North America",
    },
    {
        id: "5",
        name: "Daniel Foster",
        avatar:
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Daniel",
        company: "Foster Industrial",
        segment: "Enterprise",
        email: "daniel@fosterind.com",
        phone: "+1 (555) 731-4100",
        orders: 97,
        totalSpend: 198450,
        status: "Active",
        region: "Europe",
    },
    {
        id: "6",
        name: "Ava Kim",
        avatar:
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Ava",
        company: "BluePeak Labs",
        segment: "Startup",
        email: "ava@bluepeak.ai",
        phone: "+1 (555) 120-4433",
        orders: 8,
        totalSpend: 6840,
        status: "New",
        region: "Asia Pacific",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function formatCurrency(amount: number) {
    return `$${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function CustomerCell({ item }: { item: CustomerItem }) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div>
                <button className="text-left text-[16px] font-bold leading-6 text-[#183B6B] hover:underline">
                    {item.name}
                </button>
            </div>
        </div>
    );
}

function CompanyCell({ item }: { item: CustomerItem }) {
    return (
        <div className="max-w-[160px] text-[15px] font-semibold leading-8 text-[#4A5C78]">
            {item.company}
        </div>
    );
}

function ContactCell({ item }: { item: CustomerItem }) {
    return (
        <div>
            <div className="text-[16px] font-semibold text-[#111827]">
                {item.email}
            </div>
            <div className="text-sm text-slate-400">{item.phone}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
    const classMap = {
        VIP: "border-[#E6D9FA] bg-[#F2EAFE] text-[#6E56A8]",
        Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
        New: "border-blue-200 bg-blue-50 text-[#2563EB]",
        Inactive: "border-slate-200 bg-slate-100 text-slate-500",
    };

    const dotMap = {
        VIP: "bg-[#8B5CF6]",
        Active: "bg-emerald-500",
        New: "bg-[#2563EB]",
        Inactive: "bg-slate-400",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.04em]",
                classMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotMap[status])} />
            {status}
        </span>
    );
}

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [segment, setSegment] = useState("all");
    const [status, setStatus] = useState("all");
    const [region, setRegion] = useState("all");

    const pageSize = 4;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return customerData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.name.toLowerCase().includes(keyword) ||
                item.company.toLowerCase().includes(keyword) ||
                item.id.toLowerCase().includes(keyword);

            const matchSegment =
                segment === "all" || item.segment.toLowerCase() === segment;

            const matchStatus =
                status === "all" || item.status.toLowerCase() === status;

            const normalizedRegion = item.region.toLowerCase().replace(/\s+/g, "-");
            const matchRegion = region === "all" || normalizedRegion === region;

            return matchKeyword && matchSegment && matchStatus && matchRegion;
        });
    }, [search, segment, status, region]);

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
            placeholder: "Filter by Name, Company or ID...",
        },
        {
            key: "segment",
            type: "select",
            label: "Segment",
            value: segment,
            onChange: (value) => {
                setSegment(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All", value: "all" },
                { label: "Enterprise", value: "enterprise" },
                { label: "SME", value: "sme" },
                { label: "Startup", value: "startup" },
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
                { label: "VIP", value: "vip" },
                { label: "Active", value: "active" },
                { label: "New", value: "new" },
                { label: "Inactive", value: "inactive" },
            ],
        },
        {
            key: "region",
            type: "select",
            label: "Region",
            value: region,
            onChange: (value) => {
                setRegion(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All", value: "all" },
                { label: "North America", value: "north-america" },
                { label: "Europe", value: "europe" },
                { label: "Asia Pacific", value: "asia-pacific" },
            ],
        },
    ];

    const columns = [
        {
            key: "customer",
            title: "Customer",
            render: (item: CustomerItem) => <CustomerCell item={item} />,
        },
        {
            key: "company",
            title: "Company",
            render: (item: CustomerItem) => <CompanyCell item={item} />,
        },
        {
            key: "segment",
            title: "Segment",
            className: "text-[16px] font-medium text-[#5A6B86]",
            render: (item: CustomerItem) => item.segment,
        },
        {
            key: "contact",
            title: "Contact",
            render: (item: CustomerItem) => <ContactCell item={item} />,
        },
        {
            key: "orders",
            title: "Orders",
            className: "text-[18px] font-bold text-[#175CFF]",
            render: (item: CustomerItem) => item.orders,
        },
        {
            key: "totalSpend",
            title: "Total Spend",
            className: "text-[18px] font-bold text-[#111827]",
            render: (item: CustomerItem) => formatCurrency(item.totalSpend),
        },
        {
            key: "status",
            title: "Status",
            render: (item: CustomerItem) => <StatusBadge status={item.status} />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Customers"
                    description="Manage and monitor your enterprise customer relations."
                    actions={[
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Export clicked")
                        },
                        {
                            label: "Add Customer",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Add Customer clicked")
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Customers"
                        value="12,482"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#5B7BEA]">
                                    <Users className="h-5 w-5" />
                                </div>
                                <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                    +12%
                                </span>
                            </div>
                        }
                        className="border-l-4 border-l-[#175CFF]"
                    />

                    <KpiCard
                        title="Active Customers"
                        value="9,210"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#E8FAF6] p-3 text-[#14B8A6]">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-[#0F8F83]">
                                    +5%
                                </span>
                            </div>
                        }
                        className="border-l-4 border-l-[#2DD4BF]"
                    />

                    <KpiCard
                        title="VIP Accounts"
                        value="428"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#F2EAFE] p-3 text-[#8B5CF6]">
                                    <Crown className="h-5 w-5" />
                                </div>
                                <span className="text-base font-semibold text-slate-400">
                                    Target: 500
                                </span>
                            </div>
                        }
                        className="border-l-4 border-l-[#7C6A9B]"
                    />

                    <KpiCard
                        title="New This Month"
                        value="156"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#2563EB]">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <span className="rounded-md bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-500">
                                    -2%
                                </span>
                            </div>
                        }
                        className="border-l-4 border-l-[#175CFF]"
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
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: CustomerItem) => row.id}
                    selectable={false}
                    emptyText="No customers found"
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length.toLocaleString()} customers`}
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
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Crown,
    Download,
    Pencil,
    Plus,
    RefreshCw,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import { DataTableColumn } from "@/components/common/data-table/types";
import CustomerDrawer from "./_components/CustomerDrawer";

import { useConfirm } from "@/hooks/use-confirm";
import { exportToCsv } from "@/lib/export";
import { toastApiError, toastSuccess } from "@/lib/tools/toast";

import {
    createCustomer,
    deleteCustomer,
    listCustomers,
    updateCustomer,
} from "@/lib/apis/customers";

import type {
    Customer,
    CustomerFormValues,
    CustomerSegment,
    CustomerStatus,
} from "@/types/customer";

type DrawerMode = "create" | "edit";

type CustomerViewItem = {
    id: string;
    customerCode: string;
    customerName: string;
    companyName: string;
    segment: CustomerSegment;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    status: CustomerStatus;
    region: string;
};

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function normalizeValue(value?: string | null) {
    return (value ?? "").toLowerCase().trim().replace(/\s+/g, "-");
}

function mapCustomerToViewItem(customer: Customer): CustomerViewItem {
    return {
        id: String(customer.id ?? ""),
        customerCode: customer.customerCode ?? "-",
        customerName: customer.customerName ?? "Unnamed Customer",
        companyName: customer.companyName ?? "-",
        segment: customer.segment ?? "SME",
        contactPerson: customer.contactPerson ?? "-",
        contactEmail: customer.contactEmail ?? "-",
        contactPhone: customer.contactPhone ?? "-",
        status: customer.status ?? "Active",
        region: customer.region ?? "-",
    };
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function CustomerCell({ item }: { item: CustomerViewItem }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-[#EEF4FF] text-sm font-bold text-[#5B7BEA]">
                {getInitials(item.customerName)}
            </div>

            <div>
                <button className="text-left text-[16px] font-bold leading-6 text-[#183B6B] hover:underline">
                    {item.customerName}
                </button>
                <div className="text-xs text-slate-400">ID: {item.customerCode}</div>
            </div>
        </div>
    );
}

function CompanyCell({ item }: { item: CustomerViewItem }) {
    return (
        <div className="max-w-[180px] text-[15px] font-semibold leading-6 text-[#4A5C78]">
            {item.companyName}
        </div>
    );
}

function ContactCell({ item }: { item: CustomerViewItem }) {
    return (
        <div>
            <div className="text-[14px] font-semibold text-[#111827]">
                {item.contactEmail}
            </div>
            <div className="text-sm text-slate-400">{item.contactPhone}</div>
        </div>
    );
}

function SegmentBadge({ segment }: { segment: CustomerSegment }) {
    const classMap: Record<CustomerSegment, string> = {
        Enterprise: "bg-[#E8EEFF] text-[#2D6BCF]",
        SME: "bg-[#E8FAF6] text-[#0F8F83]",
        Startup: "bg-[#F2EAFE] text-[#8B5CF6]",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                classMap[segment]
            )}
        >
            {segment}
        </span>
    );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
    const classMap: Record<CustomerStatus, string> = {
        Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
        Inactive: "border-slate-200 bg-slate-100 text-slate-500",
        Prospect: "border-blue-200 bg-blue-50 text-[#2563EB]",
    };

    const dotMap: Record<CustomerStatus, string> = {
        Active: "bg-emerald-500",
        Inactive: "bg-slate-400",
        Prospect: "bg-[#2563EB]",
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
    const { confirm } = useConfirm();

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [segment, setSegment] = useState("all");
    const [status, setStatus] = useState("all");
    const [region, setRegion] = useState("all");

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const pageSize = 4;

    async function loadCustomers() {
        try {
            setLoading(true);
            const data = await listCustomers();
            setCustomers(data.items ?? []);
        } catch (error) {
            toastApiError(error, "Failed to load customers");
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomers();
    }, []);

    function handleOpenCreate() {
        setDrawerMode("create");
        setEditingCustomer(null);
        setDrawerOpen(true);
    }

    function handleOpenEdit(customer: Customer) {
        setDrawerMode("edit");
        setEditingCustomer(customer);
        setDrawerOpen(true);
    }

    async function handleDelete(customer: Customer) {
        const ok = await confirm({
            title: "Delete customer?",
            description: `This action will permanently delete "${customer.customerName}". This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });

        if (!ok) return;

        try {
            await deleteCustomer(customer.id);
            toastSuccess(`"${customer.customerName}" has been deleted.`, "Customer Deleted");
            await loadCustomers();
        } catch (error) {
            toastApiError(error, "Delete Failed");
        }
    }

    async function handleSubmit(values: CustomerFormValues) {
        try {
            if (drawerMode === "create") {
                await createCustomer(values);
            } else if (editingCustomer) {
                await updateCustomer(editingCustomer.id, values);
            }
        } catch (error) {
            toastApiError(error, "Save Failed");
            throw error;
        }

        toastSuccess(
            drawerMode === "create" ? "Customer created successfully." : "Customer updated successfully.",
            "Customer Saved"
        );
        setDrawerOpen(false);
        await loadCustomers();
    }

    const tableData = useMemo<CustomerViewItem[]>(() => {
        return customers.map(mapCustomerToViewItem);
    }, [customers]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return tableData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.customerName.toLowerCase().includes(keyword) ||
                item.companyName.toLowerCase().includes(keyword) ||
                item.customerCode.toLowerCase().includes(keyword) ||
                item.contactEmail.toLowerCase().includes(keyword);

            const matchSegment =
                segment === "all" || normalizeValue(item.segment) === segment;

            const matchStatus =
                status === "all" || normalizeValue(item.status) === status;

            const matchRegion =
                region === "all" || normalizeValue(item.region) === region;

            return matchKeyword && matchSegment && matchStatus && matchRegion;
        });
    }, [tableData, search, segment, status, region]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const regionOptions = useMemo(() => {
        const uniqueRegions = Array.from(
            new Set(tableData.map((item) => item.region).filter(Boolean))
        );

        return [
            { label: "All Regions", value: "all" },
            ...uniqueRegions.map((item) => ({
                label: item,
                value: normalizeValue(item),
            })),
        ];
    }, [tableData]);

    const totalCustomers = tableData.length;
    const activeCustomers = tableData.filter((item) => item.status === "Active").length;
    const enterpriseCustomers = tableData.filter((item) => item.segment === "Enterprise").length;
    const prospectCustomers = tableData.filter((item) => item.status === "Prospect").length;

    const filterFields: FilterField[] = [
        {
            key: "search",
            type: "search",
            value: search,
            onChange: (value) => {
                setSearch(value);
                setCurrentPage(1);
            },
            placeholder: "Filter by Name, Company, Email or ID...",
        },
        {
            key: "segment",
            type: "select",
            label: "",
            value: segment,
            onChange: (value) => {
                setSegment(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Segments", value: "all" },
                { label: "Enterprise", value: "enterprise" },
                { label: "SME", value: "sme" },
                { label: "Startup", value: "startup" },
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
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Prospect", value: "prospect" },
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
            options: regionOptions,
        },
    ];

    const columns: DataTableColumn<CustomerViewItem>[] = [
        {
            key: "customer",
            title: "Customer",
            render: (item: CustomerViewItem) => <CustomerCell item={item} />,
        },
        {
            key: "company",
            title: "Company",
            render: (item: CustomerViewItem) => <CompanyCell item={item} />,
        },
        {
            key: "segment",
            title: "Segment",
            render: (item: CustomerViewItem) => (
                <SegmentBadge segment={item.segment} />
            ),
        },
        {
            key: "contact",
            title: "Contact",
            render: (item: CustomerViewItem) => <ContactCell item={item} />,
        },
        {
            key: "region",
            title: "Region",
            className: "text-[14px] font-medium text-[#5A6B86]",
            render: (item: CustomerViewItem) => item.region,
        },
        {
            key: "status",
            title: "Status",
            render: (item: CustomerViewItem) => <StatusBadge status={item.status} />,
        },
        {
            key: "actions",
            title: "Actions",
            render: (item: CustomerViewItem) => {
                const originalCustomer = customers.find((c) => String(c.id) === item.id);

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => {
                                if (originalCustomer) {
                                    handleOpenEdit(originalCustomer);
                                }
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                                if (originalCustomer) {
                                    handleDelete(originalCustomer);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
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
                            onClick: () => exportToCsv("customers", filteredData, [
                                { header: "Code", value: (r) => r.customerCode },
                                { header: "Name", value: (r) => r.customerName },
                                { header: "Company", value: (r) => r.companyName },
                                { header: "Segment", value: (r) => r.segment },
                                { header: "Contact", value: (r) => r.contactPerson },
                                { header: "Email", value: (r) => r.contactEmail },
                                { header: "Phone", value: (r) => r.contactPhone },
                                { header: "Region", value: (r) => r.region },
                                { header: "Status", value: (r) => r.status },
                            ]),
                        },
                        {
                            label: "Add Customer",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: handleOpenCreate,
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Customers"
                        value={loading ? "..." : totalCustomers.toString()}
                        description=""
                        footer={
                            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                Live data
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#5B7BEA]">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Active Customers"
                        value={loading ? "..." : activeCustomers.toString()}
                        description=""
                        footer={
                            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-[#0F8F83]">
                                Operational
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#E8FAF6] p-3 text-[#14B8A6]">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Enterprise Accounts"
                        value={loading ? "..." : enterpriseCustomers.toString()}
                        description=""
                        footer={
                            <span className="text-base font-semibold text-slate-400">
                                Key accounts
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#F2EAFE] p-3 text-[#8B5CF6]">
                                    <Crown className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Prospects"
                        value={loading ? "..." : prospectCustomers.toString()}
                        description=""
                        footer={
                            <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                                Pipeline
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#2563EB]">
                                    <Sparkles className="h-5 w-5" />
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
                            className="h-12 w-12 rounded-xl bg-[#EAF1FF] text-[#5B7BEA] hover:bg-[#DFE9FF]"
                            onClick={loadCustomers}
                        >
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: CustomerViewItem) => row.id}
                    selectable={false}
                    emptyText={loading ? "Loading customers..." : "No customers found"}
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length
                        } customers`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />

                <CustomerDrawer
                    open={drawerOpen}
                    mode={drawerMode}
                    initialData={editingCustomer}
                    onClose={() => setDrawerOpen(false)}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
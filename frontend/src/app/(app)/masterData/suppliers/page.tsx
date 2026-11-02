"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Filter,
    Plus,
    Users,
    ClipboardList,
    Trash2,
    Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";
import { DataTableColumn } from "@/components/common/data-table/types";
import SupplierDrawer from "./_components/SupplierDrawer";

import { useConfirm } from "@/hooks/use-confirm";
import { exportToCsv } from "@/lib/export";
import { toastApiError, toastSuccess } from "@/lib/tools/toast";

import type {
    Supplier,
    SupplierFormValues,
    SupplierStatus,
} from "@/types/supplier";

import {
    createSupplier,
    listSuppliers,
    updateSupplier,
    deleteSupplier,
} from "@/lib/apis/supplier";

type DrawerMode = "create" | "edit";

type SupplierViewItem = {
    id: string;
    supplierCode: string;
    supplierName: string;
    primaryCategory: string;
    contactPerson: string;
    contactEmail: string;
    region: string;
    status: SupplierStatus;
    riskLevel: string;
    lastOrderDate: string;
    updatedAt: string;
};

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function normalizeValue(value?: string | null) {
    return (value ?? "").toLowerCase().trim().replace(/\s+/g, "-");
}

function formatDate(value?: string | null) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-AU", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function mapSupplierToViewItem(supplier: Supplier): SupplierViewItem {
    return {
        id: String(supplier.id ?? ""),
        supplierCode: supplier.supplierCode ?? "-",
        supplierName: supplier.supplierName ?? "Unnamed Supplier",
        primaryCategory: supplier.primaryCategory ?? "-",
        contactPerson: supplier.contactPerson ?? "-",
        contactEmail: supplier.contactEmail ?? "-",
        region: supplier.region ?? "-",
        status: supplier.status ?? "Active",
        riskLevel: supplier.riskLevel ?? "Low",
        lastOrderDate: formatDate(supplier.lastOrderDate),
        updatedAt: formatDate(supplier.updatedAt),
    };
}

function CategoryBadge({ category }: { category: string }) {
    const normalized = normalizeValue(category);

    const classMap: Record<string, string> = {
        electronics: "bg-[#DCEBFF] text-[#2D6BCF]",
        "raw-materials": "bg-[#E8DFFC] text-[#6C5AAE]",
        logistics: "bg-[#E9F7F1] text-[#1F8A5B]",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                classMap[normalized] ?? "bg-slate-100 text-slate-600"
            )}
        >
            {category}
        </span>
    );
}

function SupplierStatusBadge({ status }: { status: SupplierStatus }) {
    const statusClassMap = {
        Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
        Draft: "border-blue-200 bg-blue-50 text-blue-700",
        Inactive: "border-slate-200 bg-slate-100 text-slate-500",
    };

    const dotClassMap = {
        Active: "bg-emerald-500",
        Draft: "bg-blue-500",
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

function SupplierCell({ item }: { item: SupplierViewItem }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DFE5FF] text-sm font-bold text-[#4763B4]">
                {getInitials(item.supplierName)}
            </div>

            <div>
                <button className="text-left text-[16px] font-bold leading-6 text-[#183B6B] hover:underline">
                    {item.supplierName}
                </button>
                <div className="text-xs font-medium text-slate-400">
                    ID: {item.supplierCode}
                </div>
            </div>
        </div>
    );
}

function ContactCell({ item }: { item: SupplierViewItem }) {
    return (
        <div>
            <div className="text-[14px] font-semibold text-[#183B6B]">
                {item.contactPerson}
            </div>
            <div className="text-xs text-slate-400">{item.contactEmail}</div>
        </div>
    );
}

export default function SuppliersPage() {
    const { confirm } = useConfirm();

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [status, setStatus] = useState("all");
    const [region, setRegion] = useState("all");
    const [category, setCategory] = useState("all");

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const pageSize = 4;

    async function loadSuppliers() {
        try {
            setLoading(true);
            const data = await listSuppliers();
            setSuppliers(data.items ?? []);
        } catch (error) {
            toastApiError(error, "Failed to load suppliers");
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSuppliers();
    }, []);

    function handleOpenCreate() {
        setDrawerMode("create");
        setEditingSupplier(null);
        setDrawerOpen(true);
    }

    function handleOpenEdit(supplier: Supplier) {
        setDrawerMode("edit");
        setEditingSupplier(supplier);
        setDrawerOpen(true);
    }

    async function handleDelete(supplier: Supplier) {
        const ok = await confirm({
            title: "Delete supplier?",
            description: `This action will permanently delete "${supplier.supplierName}". This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });

        if (!ok) return;

        try {
            await deleteSupplier(supplier.id);
            toastSuccess(`"${supplier.supplierName}" has been deleted.`, "Supplier Deleted");
            await loadSuppliers();
        } catch (error) {
            toastApiError(error, "Delete Failed");
        }
    }

    async function handleSubmit(values: SupplierFormValues) {
        try {
            if (drawerMode === "create") {
                await createSupplier(values);
            } else if (editingSupplier) {
                await updateSupplier(editingSupplier.id, values);
            }
        } catch (error) {
            toastApiError(error, "Save Failed");
            throw error;
        }

        toastSuccess(
            drawerMode === "create" ? "Supplier created successfully." : "Supplier updated successfully.",
            "Supplier Saved"
        );
        setDrawerOpen(false);
        await loadSuppliers();
    }

    const tableData = useMemo<SupplierViewItem[]>(() => {
        return suppliers.map(mapSupplierToViewItem);
    }, [suppliers]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return tableData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.supplierName.toLowerCase().includes(keyword) ||
                item.contactPerson.toLowerCase().includes(keyword) ||
                item.primaryCategory.toLowerCase().includes(keyword) ||
                item.supplierCode.toLowerCase().includes(keyword);

            const matchStatus =
                status === "all" || normalizeValue(item.status) === status;

            const matchRegion =
                region === "all" || normalizeValue(item.region) === region;

            const matchCategory =
                category === "all" || normalizeValue(item.primaryCategory) === category;

            return matchKeyword && matchStatus && matchRegion && matchCategory;
        });
    }, [tableData, search, status, region, category]);

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

    const categoryOptions = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(tableData.map((item) => item.primaryCategory).filter(Boolean))
        );

        return [
            { label: "Product Category", value: "all" },
            ...uniqueCategories.map((item) => ({
                label: item,
                value: normalizeValue(item),
            })),
        ];
    }, [tableData]);

    const regionOptions = useMemo(() => {
        const uniqueRegions = Array.from(
            new Set(tableData.map((item) => item.region).filter(Boolean))
        );

        return [
            { label: "Region", value: "all" },
            ...uniqueRegions.map((item) => ({
                label: item,
                value: normalizeValue(item),
            })),
        ];
    }, [tableData]);

    const totalSuppliers = tableData.length;
    const activeSuppliers = tableData.filter((item) => item.status === "Active").length;
    const draftSuppliers = tableData.filter((item) => item.status === "Draft").length;
    const highRiskSuppliers = tableData.filter((item) => item.riskLevel === "High").length;

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
                { label: "Draft", value: "draft" },
                { label: "Active", value: "active" },
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
            options: regionOptions,
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
            options: categoryOptions,
        },
    ];

    const columns: DataTableColumn<SupplierViewItem>[] = [
        {
            key: "supplier",
            title: "Supplier",
            render: (item: SupplierViewItem) => <SupplierCell item={item} />,
        },
        {
            key: "category",
            title: "Category",
            render: (item: SupplierViewItem) => (
                <CategoryBadge category={item.primaryCategory} />
            ),
        },
        {
            key: "contactPerson",
            title: "Contact Person",
            render: (item: SupplierViewItem) => <ContactCell item={item} />,
        },
        {
            key: "region",
            title: "Region",
            className: "text-[14px] font-medium text-[#32577E]",
            render: (item: SupplierViewItem) => item.region,
        },
        {
            key: "status",
            title: "Status",
            render: (item: SupplierViewItem) => (
                <SupplierStatusBadge status={item.status} />
            ),
        },
        {
            key: "lastOrderDate",
            title: "Last Order",
            className: "text-[14px] font-medium text-slate-500",
            render: (item: SupplierViewItem) => item.lastOrderDate,
        },
        {
            key: "actions",
            title: "Actions",
            render: (item: SupplierViewItem) => {
                const originalSupplier = suppliers.find((s) => String(s.id) === item.id);

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={() => {
                                if (originalSupplier) {
                                    handleOpenEdit(originalSupplier);
                                }
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (originalSupplier) {
                                    handleDelete(originalSupplier);
                                }
                            }}
                            className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
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
                    title="Suppliers"
                    description="Manage your strategic partnerships, contact details with precision and oversight."
                    actions={[
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => exportToCsv("suppliers", filteredData, [
                                { header: "Code", value: (r) => r.supplierCode },
                                { header: "Name", value: (r) => r.supplierName },
                                { header: "Category", value: (r) => r.primaryCategory },
                                { header: "Contact", value: (r) => r.contactPerson },
                                { header: "Email", value: (r) => r.contactEmail },
                                { header: "Region", value: (r) => r.region },
                                { header: "Status", value: (r) => r.status },
                                { header: "Risk", value: (r) => r.riskLevel },
                                { header: "Last Order", value: (r) => r.lastOrderDate },
                            ]),
                        },
                        {
                            label: "Add Supplier",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: handleOpenCreate,
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Suppliers"
                        value={loading ? "..." : totalSuppliers.toString()}
                        description=""
                        footer={
                            <span className="text-sm font-semibold text-emerald-600">
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
                        title="Active Suppliers"
                        value={loading ? "..." : activeSuppliers.toString()}
                        description=""
                        footer={
                            <span className="text-sm font-semibold text-slate-400">
                                Operational
                            </span>
                        }
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Draft Suppliers"
                        value={loading ? "..." : draftSuppliers.toString()}
                        description="Pending completion"
                        rightIcon={
                            <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                        }
                        className="border-l-4 border-l-orange-400"
                    />

                    <KpiCard
                        title="High Risk Suppliers"
                        value={loading ? "..." : highRiskSuppliers.toString()}
                        description="Critical attention"
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
                    rowKey={(row: SupplierViewItem) => row.id}
                    selectable={false}
                    emptyText={loading ? "Loading suppliers..." : "No suppliers found"}
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length
                        } suppliers`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />

                <SupplierDrawer
                    open={drawerOpen}
                    mode={drawerMode}
                    initialData={editingSupplier}
                    onClose={() => setDrawerOpen(false)}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
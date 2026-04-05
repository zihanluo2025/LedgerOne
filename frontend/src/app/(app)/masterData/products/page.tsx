"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Filter,
    Package,
    Plus,
    Upload,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import DataFilterBar from "@/components/common/data-filter-bar";
import type { FilterField } from "@/components/common/data-filter-bar/types";
import KpiCard from "@/components/common/kpi-card";
import DataTable from "@/components/common/data-table";
import PageHeader from "@/components/common/PageHeader";

type ProductItem = {
    id: string;
    name: string;
    sku: string;
    category: "Hardware" | "Electronics" | "Raw Material";
    price: number;
    stock: number;
    supplier: string;
    updatedAt: string;
    image: string;
};

const productData: ProductItem[] = [
    {
        id: "1",
        name: "Steel Chassis",
        sku: "INB-CH-001",
        category: "Hardware",
        price: 450,
        stock: 500,
        supplier: "Allied Steel",
        updatedAt: "Oct 12, 2023",
        image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: "2",
        name: "Precision Sensor",
        sku: "ELE-SN-042",
        category: "Electronics",
        price: 89,
        stock: 15,
        supplier: "TechLogix",
        updatedAt: "Oct 11, 2023",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: "3",
        name: "Circuit Board V2",
        sku: "ELE-CB-015",
        category: "Electronics",
        price: 120,
        stock: 0,
        supplier: "MicroPhase",
        updatedAt: "Oct 10, 2023",
        image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: "4",
        name: "Aluminum Sheet",
        sku: "RAW-AS-021",
        category: "Raw Material",
        price: 55,
        stock: 130,
        supplier: "MetalWorks",
        updatedAt: "Oct 09, 2023",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: "5",
        name: "Connector Kit",
        sku: "ELE-CK-118",
        category: "Electronics",
        price: 39,
        stock: 8,
        supplier: "VoltEdge",
        updatedAt: "Oct 08, 2023",
        image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?q=80&w=200&auto=format&fit=crop",
    },
    {
        id: "6",
        name: "Support Bracket",
        sku: "HRD-SB-203",
        category: "Hardware",
        price: 25,
        stock: 260,
        supplier: "Allied Steel",
        updatedAt: "Oct 07, 2023",
        image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=200&auto=format&fit=crop",
    },
];

function cn(...classes: Array<string | false | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function getStockStatus(stock: number) {
    if (stock === 0) return "Out of Stock";
    if (stock <= 20) return "Low Stock";
    return "In Stock";
}

function CategoryBadge({ category }: { category: ProductItem["category"] }) {
    const classMap = {
        Hardware: "bg-[#DCEBFF] text-[#2D6BCF]",
        Electronics: "bg-[#DCEBFF] text-[#2D6BCF]",
        "Raw Material": "bg-[#E8DFFC] text-[#6C5AAE]",
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

function StockStatusBadge({ stock }: { stock: number }) {
    const status = getStockStatus(stock);

    const statusClassMap = {
        "In Stock": "border-emerald-200 bg-emerald-50 text-emerald-700",
        "Low Stock": "border-orange-200 bg-orange-50 text-orange-600",
        "Out of Stock": "border-rose-200 bg-rose-50 text-rose-600",
    };

    const dotClassMap = {
        "In Stock": "bg-emerald-500",
        "Low Stock": "bg-orange-500",
        "Out of Stock": "bg-rose-500",
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

function ProductCell({ item }: { item: ProductItem }) {
    return (
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                />
            </div>

            <div>
                <button className="text-left text-[18px] font-bold leading-7 text-[#183B6B] hover:underline">
                    {item.name}
                </button>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState("all");
    const [stockStatus, setStockStatus] = useState("all");
    const [supplier, setSupplier] = useState("all");

    const pageSize = 3;

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return productData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.name.toLowerCase().includes(keyword) ||
                item.sku.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword);

            const matchCategory =
                category === "all" ||
                item.category.toLowerCase().replace(/\s+/g, "-") === category;

            const currentStockStatus = getStockStatus(item.stock)
                .toLowerCase()
                .replace(/\s+/g, "-");

            const matchStockStatus =
                stockStatus === "all" || currentStockStatus === stockStatus;

            const normalizedSupplier = item.supplier.toLowerCase().replace(/\s+/g, "-");
            const matchSupplier =
                supplier === "all" || normalizedSupplier === supplier;

            return matchKeyword && matchCategory && matchStockStatus && matchSupplier;
        });
    }, [search, category, stockStatus, supplier]);

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
            placeholder: "Search Product Name / SKU / Category",
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
                { label: "All Categories", value: "all" },
                { label: "Hardware", value: "hardware" },
                { label: "Electronics", value: "electronics" },
                { label: "Raw Material", value: "raw-material" },
            ],
        },
        {
            key: "stockStatus",
            type: "select",
            label: "",
            value: stockStatus,
            onChange: (value) => {
                setStockStatus(value);
                setCurrentPage(1);
            },
            options: [
                { label: "Stock Status: All", value: "all" },
                { label: "In Stock", value: "in-stock" },
                { label: "Low Stock", value: "low-stock" },
                { label: "Out of Stock", value: "out-of-stock" },
            ],
        },
        {
            key: "supplier",
            type: "select",
            label: "",
            value: supplier,
            onChange: (value) => {
                setSupplier(value);
                setCurrentPage(1);
            },
            options: [
                { label: "All Suppliers", value: "all" },
                { label: "Allied Steel", value: "allied-steel" },
                { label: "TechLogix", value: "techlogix" },
                { label: "MicroPhase", value: "microphase" },
                { label: "MetalWorks", value: "metalworks" },
                { label: "VoltEdge", value: "voltedge" },
            ],
        },
    ];

    const columns = [
        {
            key: "product",
            title: "Product",
            render: (item: ProductItem) => <ProductCell item={item} />,
        },
        {
            key: "sku",
            title: "SKU",
            className: "text-[15px] font-medium text-[#32577E]",
            render: (item: ProductItem) => (
                <span className="whitespace-pre-line break-words">{item.sku.replace(/-/g, "-\n")}</span>
            ),
        },
        {
            key: "category",
            title: "Category",
            render: (item: ProductItem) => <CategoryBadge category={item.category} />,
        },
        {
            key: "price",
            title: "Price",
            className: "text-[18px] font-bold text-[#183B6B]",
            render: (item: ProductItem) => `$${item.price.toFixed(2)}`,
        },
        {
            key: "stock",
            title: "Stock",
            className: "text-[18px] font-semibold text-[#183B6B]",
            render: (item: ProductItem) => item.stock,
        },
        {
            key: "status",
            title: "Status",
            render: (item: ProductItem) => <StockStatusBadge stock={item.stock} />,
        },
        {
            key: "supplier",
            title: "Supplier",
            className: "text-[16px] font-medium text-[#32577E]",
            render: (item: ProductItem) => item.supplier,
        },
        {
            key: "updatedAt",
            title: "Updated",
            className: "text-[16px] font-medium text-[#2D6BCF]",
            render: (item: ProductItem) => (
                <span className="whitespace-pre-line">{item.updatedAt.replace(", ", ",\n")}</span>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#F6F8FC]">
            <div className="mx-auto w-full max-w-[1440px] space-y-6">
                <PageHeader
                    title="Products"
                    description="Product catalog, pricing with architectural precision across your global inventory."
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
                            label: "Add Product",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Add Product clicked")
                        },
                    ]}
                />




                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Products"
                        value="1,248"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#5B7BEA]">
                                    <Package className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                    +12% vs last month
                                </span>
                            </div>
                        }
                    />

                    <KpiCard
                        title="In Stock"
                        value="1,180"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                    Normal
                                </span>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Low Stock"
                        value="42"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-500">
                                    Warning status
                                </span>
                            </div>
                        }
                    />

                    <KpiCard
                        title="Out of Stock"
                        value="26"
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-rose-50 p-3 text-rose-500">
                                    <XCircle className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-500">
                                    Critical status
                                </span>
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
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                    }
                />

                <DataTable
                    data={pagedData}
                    columns={columns}
                    rowKey={(row: ProductItem) => row.id}
                    selectable={false}
                    emptyText="No products found"
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length} products`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />
            </div>
        </div >
    );
}
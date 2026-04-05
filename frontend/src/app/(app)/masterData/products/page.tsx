"use client";

import { useEffect, useMemo, useState } from "react";
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
import ProductDrawer from "./_components/ProductDrawer";

import { useConfirm } from "@/hooks/use-confirm";

import {
    createProduct,
    listProducts,
    updateProduct,
    deleteProduct
} from "@/lib/apis/products";

import type {
    Product,
    ProductFormValues,
} from "@/types/product";
import { fi } from "zod/locales";

type DrawerMode = "create" | "edit";

type ProductViewItem = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    supplier: string;
    updatedAt: string;
    image: string;
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

function getStockStatus(stock: number) {
    if (stock === 0) return "Out of Stock";
    if (stock <= 20) return "Low Stock";
    return "In Stock";
}

function mapProductToViewItem(product: Product): ProductViewItem {
    return {
        id: String(product.id ?? ""),
        name: product.name ?? "Unnamed Product",
        sku: product.sku ?? "-",
        category: product.category ?? "Uncategorized",
        price: Number(product.price ?? 0),
        stock: Number(product.stock ?? 0),
        supplier: product.supplier ?? "-",
        updatedAt: formatDate(
            (product as Product & {
                updatedAt?: string;
                updated_at?: string;
                modifiedAt?: string;
                createdAt?: string;
            }).updatedAt ??
            (product as Product & { updated_at?: string }).updated_at ??
            (product as Product & { modifiedAt?: string }).modifiedAt ??
            (product as Product & { createdAt?: string }).createdAt
        ),
        image:
            product.image ??
            product.imageUrl ??
            "https://placehold.co/96x96/EAF1FF/5B7BEA?text=IMG",
    };
}

function CategoryBadge({ category }: { category: string }) {
    const normalized = normalizeValue(category);

    const classMap: Record<string, string> = {
        hardware: "bg-[#DCEBFF] text-[#2D6BCF]",
        electronics: "bg-[#DCEBFF] text-[#2D6BCF]",
        "raw-material": "bg-[#E8DFFC] text-[#6C5AAE]",
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
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold",
                statusClassMap[status]
            )}
        >
            <span className={cn("h-2 w-2 rounded-full", dotClassMap[status])} />
            {status}
        </span>
    );
}

function ProductCell({ item }: { item: ProductViewItem }) {
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
                <button className="text-left  text-[#183B6B] hover:underline">
                    {item.name}
                </button>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const { confirm } = useConfirm();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState("all");
    const [stockStatus, setStockStatus] = useState("all");
    const [supplier, setSupplier] = useState("all");

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const pageSize = 3;

    async function loadProducts() {
        try {
            setLoading(true);
            const data = await listProducts();
            setProducts(data.items ?? []);
        } catch (error) {
            console.error("Failed to load products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    function handleOpenCreate() {
        setDrawerMode("create");
        setEditingProduct(null);
        setDrawerOpen(true);
    }

    function handleOpenEdit(product: Product) {
        setDrawerMode("edit");
        setEditingProduct(product);
        setDrawerOpen(true);
    }

    async function handleDelete(product: Product) {
        const ok = await confirm({
            title: "Delete product?",
            description: `This action will permanently delete "${product.name}". This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "destructive",
        });

        if (!ok) return;

        try {
            await deleteProduct(product.id);
            await loadProducts();
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    }

    async function handleSubmit(values: ProductFormValues) {
        if (drawerMode === "create") {
            await createProduct(values);
        } else if (editingProduct) {
            await updateProduct(editingProduct.id, values);
        }

        setDrawerOpen(false);
        await loadProducts();
    }

    const tableData = useMemo<ProductViewItem[]>(() => {
        return products.map(mapProductToViewItem);
    }, [products]);

    const filteredData = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return tableData.filter((item) => {
            const matchKeyword =
                !keyword ||
                item.name.toLowerCase().includes(keyword) ||
                item.sku.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword) ||
                item.supplier.toLowerCase().includes(keyword);

            const matchCategory =
                category === "all" || normalizeValue(item.category) === category;

            const currentStockStatus = normalizeValue(getStockStatus(item.stock));
            const matchStockStatus =
                stockStatus === "all" || currentStockStatus === stockStatus;

            const normalizedSupplier = normalizeValue(item.supplier);
            const matchSupplier =
                supplier === "all" || normalizedSupplier === supplier;

            return matchKeyword && matchCategory && matchStockStatus && matchSupplier;
        });
    }, [tableData, search, category, stockStatus, supplier]);

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
            new Set(
                tableData
                    .map((item) => item.category)
                    .filter(Boolean)
            )
        );

        return [
            { label: "All Categories", value: "all" },
            ...uniqueCategories.map((item) => ({
                label: item,
                value: normalizeValue(item),
            })),
        ];
    }, [tableData]);

    const supplierOptions = useMemo(() => {
        const uniqueSuppliers = Array.from(
            new Set(
                tableData
                    .map((item) => item.supplier)
                    .filter((item) => item && item !== "-")
            )
        );

        return [
            { label: "All Suppliers", value: "all" },
            ...uniqueSuppliers.map((item) => ({
                label: item,
                value: normalizeValue(item),
            })),
        ];
    }, [tableData]);

    const totalProducts = tableData.length;
    const inStockCount = tableData.filter((item) => getStockStatus(item.stock) === "In Stock").length;
    const lowStockCount = tableData.filter((item) => getStockStatus(item.stock) === "Low Stock").length;
    const outOfStockCount = tableData.filter((item) => getStockStatus(item.stock) === "Out of Stock").length;

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
            options: categoryOptions,
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
            options: supplierOptions,
        },
    ];

    const columns = [
        {
            key: "product",
            title: "Product",


            render: (item: ProductViewItem) => <ProductCell item={item} />,
        },
        {
            key: "sku",
            title: "SKU",
            className: "text-[#32577E]",
            render: (item: ProductViewItem) => (
                <span className="whitespace-pre-line break-words">
                    {item.sku.replace(/-/g, "-\n")}
                </span>
            ),
        },
        {
            key: "category",
            title: "Category",
            render: (item: ProductViewItem) => <CategoryBadge category={item.category} />,
        },
        {
            key: "price",
            title: "Price",
            className: "text-[#183B6B]",
            render: (item: ProductViewItem) => `$${item.price.toFixed(2)}`,
        },
        {
            key: "status",
            title: "Status",
            render: (item: ProductViewItem) => <StockStatusBadge stock={item.stock} />,
        },
        {
            key: "supplier",
            title: "Supplier",
            className: "text-[#32577E]",
            render: (item: ProductViewItem) => item.supplier,
        },
        {
            key: "updatedAt",
            title: "Updated",
            className: "text-[#2D6BCF]",
            render: (item: ProductViewItem) => (
                <span className="whitespace-pre-line">
                    {item.updatedAt === "-" ? "-" : item.updatedAt.replace(", ", ",\n")}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (item: ProductViewItem) => {
                const originalProduct = products.find((p) => String(p.id) === item.id);

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (originalProduct) {
                                    handleOpenEdit(originalProduct);
                                }
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => {
                                if (originalProduct) {
                                    handleDelete(originalProduct);
                                }
                            }}
                        >
                            Delete
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
                    title="Products"
                    description="Product catalog, pricing with architectural precision across your global inventory."
                    actions={[
                        {
                            label: "Import",
                            icon: <Upload size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Import clicked"),
                        },
                        {
                            label: "Export",
                            icon: <Download size={22} strokeWidth={2.2} />,
                            onClick: () => console.log("Export clicked"),
                        },
                        {
                            label: "Add Product",
                            icon: <Plus size={22} strokeWidth={2.2} />,
                            onClick: handleOpenCreate,
                        },
                    ]}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Total Products"
                        value={loading ? "..." : totalProducts.toString()}
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-[#EEF4FF] p-3 text-[#5B7BEA]">
                                    <Package className="h-5 w-5" />
                                </div>
                                {/* <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                    Live data
                                </span> */}
                            </div>
                        }
                    />

                    <KpiCard
                        title="In Stock"
                        value={loading ? "..." : inStockCount.toString()}
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                {/* <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                                    Normal
                                </span> */}
                            </div>
                        }
                    />

                    <KpiCard
                        title="Low Stock"
                        value={loading ? "..." : lowStockCount.toString()}
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                {/* <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-500">
                                    Warning status
                                </span> */}
                            </div>
                        }
                    />

                    <KpiCard
                        title="Out of Stock"
                        value={loading ? "..." : outOfStockCount.toString()}
                        description=""
                        rightIcon={
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-rose-50 p-3 text-rose-500">
                                    <XCircle className="h-5 w-5" />
                                </div>
                                {/* <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-500">
                                    Critical status
                                </span> */}
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
                    rowKey={(row: ProductViewItem) => row.id}
                    selectable={false}
                    emptyText={loading ? "Loading products..." : "No products found"}
                    footerLeft={`Showing ${filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                        } to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length
                        } products`}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredData.length,
                        pageSize,
                        onPageChange: setCurrentPage,
                    }}
                />

                <ProductDrawer
                    open={drawerOpen}
                    mode={drawerMode}
                    initialData={editingProduct}
                    onClose={() => setDrawerOpen(false)}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
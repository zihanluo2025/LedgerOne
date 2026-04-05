"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Product, ProductFormValues, ProductStatus } from "@/types/product";

type ProductDrawerMode = "create" | "edit";

type ProductDrawerProps = {
    open: boolean;
    mode: ProductDrawerMode;
    initialData?: Product | null;
    onClose: () => void;
    onSubmit: (values: ProductFormValues) => Promise<void>;
};

const productFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(100, "Product name must be within 100 characters"),
    supplier: z
        .string()
        .trim()
        .max(100, "Supplier must be within 100 characters"),
    origin: z
        .string()
        .trim()
        .max(100, "Origin must be within 100 characters"),
    price: z.coerce
        .number()
        .min(0, "Unit price must be greater than or equal to 0"),
    stock: z.coerce
        .number()
        .int("Stock must be an integer")
        .min(0, "Stock must be greater than or equal to 0"),
    status: z.enum(["Draft", "Active", "Inactive"]),
});

type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormOutput = z.output<typeof productFormSchema>;

const defaultValues: ProductFormInput = {
    name: "",
    supplier: "",
    origin: "",
    price: 0,
    stock: 0,
    status: "Active",
};

export default function ProductDrawer({
    open,
    mode,
    initialData,
    onClose,
    onSubmit,
}: ProductDrawerProps) {
    const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
        resolver: zodResolver(productFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const title = useMemo(
        () => (mode === "create" ? "New Product" : "Edit Product"),
        [mode]
    );

    const submitText = useMemo(() => {
        if (isSubmitting) {
            return mode === "create" ? "Saving..." : "Updating...";
        }
        return mode === "create" ? "Save Product" : "Update Product";
    }, [isSubmitting, mode]);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            reset({
                name: initialData.name ?? "",
                supplier: initialData.supplier ?? "",
                origin: initialData.origin ?? "",
                price: initialData.price ?? 0,
                stock: initialData.stock ?? 0,
                status: (initialData.status ?? "Active") as ProductStatus,
            });
            return;
        }

        reset(defaultValues);
    }, [open, mode, initialData, reset]);

    async function submit(values: ProductFormOutput) {
        await onSubmit({
            name: values.name.trim(),
            supplier: values.supplier.trim(),
            origin: values.origin.trim(),
            price: values.price,
            stock: values.stock,
            status: values.status,
        });
        onClose();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/30" onClick={onClose} />

            <div className="flex h-screen w-full max-w-[720px] flex-col bg-white shadow-2xl">
                <div className="shrink-0 border-b bg-white px-6 py-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[20px] font-semibold text-[var(--erp-text)]">
                            {title}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md p-2 transition hover:bg-gray-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={handleSubmit(submit)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="mb-5">
                                        <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                            Basic Information
                                        </h3>
                                    </div>

                                    <div className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="e.g. Enterprise Server Blade X1"
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="supplier"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Supplier</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="e.g. Global Tech Solutions"
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="origin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Origin</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="e.g. China / Australia / Germany"
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="mb-5">
                                        <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                            Pricing & Stock
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit Price</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            name={field.name}
                                                            ref={field.ref}
                                                            onBlur={field.onBlur}
                                                            value={typeof field.value === "number" ? field.value : 0}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === "" ? 0 : Number(value));
                                                            }}
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="stock"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Stock</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step="1"
                                                            name={field.name}
                                                            ref={field.ref}
                                                            onBlur={field.onBlur}
                                                            value={typeof field.value === "number" ? field.value : 0}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === "" ? 0 : Number(value));
                                                            }}
                                                            className="h-11 rounded-xl"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="mb-5">
                                        <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                            Status
                                        </h3>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Product Status</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 rounded-xl">
                                                            <SelectValue placeholder="Select product status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Draft">Draft</SelectItem>
                                                        <SelectItem value="Active">Active</SelectItem>
                                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 border-t bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.04)]">
                            <div className="flex items-center justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {submitText}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
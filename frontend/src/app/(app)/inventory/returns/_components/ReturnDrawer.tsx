"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import FormDrawer from "@/components/common/form-drawer";

import type {
    ReturnRecord,
    ReturnStatus,
    ReturnType,
} from "@/types/return";

export type ReturnFormValues = {
    type: ReturnType;
    partnerName: string;
    partnerRole: string;
    productName: string;
    productMeta: string;
    qty: number;
    status: ReturnStatus;
};

type DrawerMode = "create" | "edit";

type ReturnDrawerProps = {
    open: boolean;
    mode: DrawerMode;
    initialData?: ReturnRecord | null;
    onClose: () => void;
    onSubmit: (values: ReturnFormValues) => Promise<void>;
};

const returnFormSchema = z.object({
    type: z.enum(["Customer", "Supplier"]),

    partnerName: z
        .string()
        .trim()
        .min(1, "Partner name is required")
        .max(120, "Partner name must be within 120 characters"),

    partnerRole: z
        .string()
        .trim()
        .max(100, "Partner role must be within 100 characters"),

    productName: z
        .string()
        .trim()
        .min(1, "Product name is required")
        .max(200, "Product name must be within 200 characters"),

    productMeta: z
        .string()
        .trim()
        .max(300, "Product meta must be within 300 characters"),

    qty: z
        .string()
        .trim()
        .min(1, "Quantity is required")
        .refine((value) => !Number.isNaN(Number(value)), {
            message: "Quantity must be a valid number",
        })
        .refine((value) => Number(value) >= 0, {
            message: "Quantity must be 0 or greater",
        }),

    status: z.enum(["Inspecting", "Completed", "Rejected"]),
});

type ReturnFormInput = z.input<typeof returnFormSchema>;
type ReturnFormOutput = z.output<typeof returnFormSchema>;

const defaultValues: ReturnFormInput = {
    type: "Customer",
    partnerName: "",
    partnerRole: "",
    productName: "",
    productMeta: "",
    qty: "1",
    status: "Inspecting",
};

export default function ReturnDrawer({
    open,
    mode,
    initialData,
    onClose,
    onSubmit,
}: ReturnDrawerProps) {
    const form = useForm<ReturnFormInput, unknown, ReturnFormOutput>({
        resolver: zodResolver(returnFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const title = useMemo(
        () => (mode === "create" ? "Create Return" : "Edit Return"),
        [mode]
    );

    const submitText = useMemo(() => {
        if (isSubmitting) {
            return mode === "create" ? "Creating..." : "Saving...";
        }
        return mode === "create" ? "Create Return" : "Save Changes";
    }, [isSubmitting, mode]);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            reset({
                type: initialData.type,
                partnerName: initialData.partnerName ?? "",
                partnerRole:
                    initialData.partnerRole === "—"
                        ? ""
                        : (initialData.partnerRole ?? ""),
                productName: initialData.productName ?? "",
                productMeta:
                    initialData.productMeta === "—"
                        ? ""
                        : (initialData.productMeta ?? ""),
                qty: String(initialData.qty),
                status: initialData.status,
            });
            return;
        }

        reset(defaultValues);
    }, [open, mode, initialData, reset]);

    async function submit(values: ReturnFormOutput) {
        await onSubmit({
            type: values.type,
            partnerName: values.partnerName.trim(),
            partnerRole: values.partnerRole.trim(),
            productName: values.productName.trim(),
            productMeta: values.productMeta.trim(),
            qty: Number(values.qty),
            status: values.status,
        });

        onClose();
    }

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(submit)} className="contents">
                <FormDrawer
                    open={open}
                    title={title}
                    onClose={onClose}
                    onSubmit={handleSubmit(submit)}
                    isSubmitting={isSubmitting}
                    submitText={submitText}
                >
                    <div className="space-y-6">
                        {mode === "edit" && initialData && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Return number
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[var(--erp-text)]">
                                    {initialData.returnNo}
                                </p>
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-5">
                                <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                    Return details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 w-full rounded-xl">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Customer">
                                                        Customer
                                                    </SelectItem>
                                                    <SelectItem value="Supplier">
                                                        Supplier
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 w-full rounded-xl">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Inspecting">
                                                        Inspecting
                                                    </SelectItem>
                                                    <SelectItem value="Completed">
                                                        Completed
                                                    </SelectItem>
                                                    <SelectItem value="Rejected">
                                                        Rejected
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="partnerName"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Partner name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Northline Components"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="partnerRole"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Partner role</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Core supplier"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="productName"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Product name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Sensor module batch"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="productMeta"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Product meta</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="SKU, serial, lot, PO reference..."
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="qty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min={0}
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </FormDrawer>
            </form>
        </Form>
    );
}

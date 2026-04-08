"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

import type { OrderRecord, OrderStatus } from "@/types/order";

export type OrderFormValues = {
    customerName: string;
    orderDate: string;
    status: OrderStatus;
    currency: string;
    totalAmount: string;
    notes: string;
};

type DrawerMode = "create" | "edit";

type OrderDrawerProps = {
    open: boolean;
    mode: DrawerMode;
    initialData?: OrderRecord | null;
    onClose: () => void;
    onSubmit: (values: OrderFormValues) => Promise<void>;
};

const orderStatuses: OrderStatus[] = [
    "Draft",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

const orderFormSchema = z.object({
    customerName: z
        .string()
        .trim()
        .min(1, "Customer name is required")
        .max(200, "Customer name must be within 200 characters"),

    orderDate: z.string().trim().min(1, "Order date is required"),

    status: z.enum([
        "Draft",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ]),

    currency: z
        .string()
        .trim()
        .min(1, "Currency is required")
        .max(3, "Use a 3-letter currency code")
        .refine((v) => /^[A-Za-z]{3}$/.test(v), {
            message: "Currency must be 3 letters (e.g. AUD)",
        }),

    totalAmount: z
        .string()
        .trim()
        .min(1, "Total amount is required")
        .refine((value) => !Number.isNaN(Number(value)), {
            message: "Total amount must be a valid number",
        })
        .refine((value) => Number(value) >= 0, {
            message: "Total amount must be 0 or greater",
        }),

    notes: z
        .string()
        .trim()
        .max(2000, "Notes must be within 2000 characters"),
});

type OrderFormInput = z.input<typeof orderFormSchema>;
type OrderFormOutput = z.output<typeof orderFormSchema>;

function toDateInputValue(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

const defaultValues: OrderFormInput = {
    customerName: "",
    orderDate: toDateInputValue(new Date().toISOString()),
    status: "Draft",
    currency: "AUD",
    totalAmount: "0",
    notes: "",
};

export default function OrderDrawer({
    open,
    mode,
    initialData,
    onClose,
    onSubmit,
}: OrderDrawerProps) {
    const form = useForm<OrderFormInput, unknown, OrderFormOutput>({
        resolver: zodResolver(orderFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const title = useMemo(
        () => (mode === "create" ? "Create Order" : "Edit Order"),
        [mode]
    );

    const submitText = useMemo(() => {
        if (isSubmitting) {
            return mode === "create" ? "Creating..." : "Saving...";
        }
        return mode === "create" ? "Create Order" : "Save Changes";
    }, [isSubmitting, mode]);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            reset({
                customerName: initialData.customerName ?? "",
                orderDate: toDateInputValue(initialData.orderDate),
                status: initialData.status,
                currency: (initialData.currency ?? "AUD").slice(0, 3),
                totalAmount: String(initialData.totalAmount ?? 0),
                notes: initialData.notes ?? "",
            });
            return;
        }

        reset({
            ...defaultValues,
            orderDate: toDateInputValue(new Date().toISOString()),
        });
    }, [open, mode, initialData, reset]);

    async function submit(values: OrderFormOutput) {
        await onSubmit({
            customerName: values.customerName.trim(),
            orderDate: values.orderDate.trim(),
            status: values.status,
            currency: values.currency.trim().toUpperCase(),
            totalAmount: values.totalAmount.trim(),
            notes: values.notes.trim(),
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
                                    Order number
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[var(--erp-text)]">
                                    {initialData.orderNo}
                                </p>
                            </div>
                        )}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-5">
                                <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                    Order details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Customer name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Acme Retail Pty Ltd"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="orderDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Order date</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="date"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
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
                                                        <SelectValue placeholder="Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {orderStatuses.map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="AUD"
                                                    maxLength={3}
                                                    className="h-11 rounded-xl uppercase"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="totalAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total amount</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Optional notes for this order"
                                                    className="min-h-[100px] rounded-xl"
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

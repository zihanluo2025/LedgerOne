"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

import type { InboundItem, UpdateInboundRequest } from "@/types/inbound";

export type SupplierOption = {
    id: string;
    name: string;
};

type InboundDrawerProps = {
    open: boolean;
    mode: "create" | "edit";
    initialData?: InboundItem | null;
    suppliers: SupplierOption[];
    suppliersLoading?: boolean;
    onClose: () => void;
    onSubmit: (values: UpdateInboundRequest) => Promise<void>;
};

const positiveNumber = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} is required`)
        .refine((value) => Number.isInteger(Number(value)), {
            message: `${label} must be a whole number`,
        })
        .refine((value) => Number(value) > 0, {
            message: `${label} must be greater than 0`,
        });

const inboundFormSchema = z
    .object({
        supplierId: z.string().trim().min(1, "Supplier is required"),

        warehouse: z
            .string()
            .trim()
            .min(1, "Warehouse is required")
            .max(100, "Warehouse must be within 100 characters"),

        expectedQty: positiveNumber("Expected quantity"),

        items: positiveNumber("Items count"),

        receivedQty: z
            .string()
            .trim()
            .refine((value) => value === "" || (Number.isInteger(Number(value)) && Number(value) >= 0), {
                message: "Received quantity must be a whole number >= 0",
            }),

        hasException: z.boolean(),

        expectedDate: z.string().trim().min(1, "Expected date is required"),

        notes: z
            .string()
            .trim()
            .max(1000, "Notes must be within 1000 characters"),
    })
    .refine((values) => Number(values.receivedQty || 0) <= Number(values.expectedQty), {
        path: ["receivedQty"],
        message: "Received quantity cannot exceed expected quantity",
    });

type InboundFormInput = z.input<typeof inboundFormSchema>;
type InboundFormOutput = z.output<typeof inboundFormSchema>;

const defaultValues: InboundFormInput = {
    supplierId: "",
    warehouse: "",
    expectedQty: "",
    items: "",
    receivedQty: "0",
    hasException: false,
    expectedDate: "",
    notes: "",
};

export default function InboundDrawer({
    open,
    mode,
    initialData,
    suppliers,
    suppliersLoading,
    onClose,
    onSubmit,
}: InboundDrawerProps) {
    const form = useForm<InboundFormInput, unknown, InboundFormOutput>({
        resolver: zodResolver(inboundFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const isEdit = mode === "edit" && !!initialData;
    // Legacy records without an approval status are treated as approved.
    const canReceive = !isEdit || !initialData?.approvalStatus || initialData.approvalStatus === "Approved";

    const title = isEdit ? `Edit Inbound #${initialData?.inboundNo}` : "Create Inbound";
    const submitText = useMemo(() => {
        if (isSubmitting) return isEdit ? "Saving..." : "Creating...";
        return isEdit ? "Save Changes" : "Create Inbound";
    }, [isSubmitting, isEdit]);

    // Keep the current supplier selectable even if it was removed from master data.
    const supplierOptions = useMemo(() => {
        if (!initialData || suppliers.some((s) => s.id === initialData.supplierId)) return suppliers;
        return [{ id: initialData.supplierId, name: initialData.supplier }, ...suppliers];
    }, [suppliers, initialData]);

    useEffect(() => {
        if (!open) return;

        if (isEdit && initialData) {
            reset({
                supplierId: initialData.supplierId,
                warehouse: initialData.warehouse,
                expectedQty: String(initialData.expectedQty),
                items: String(initialData.items),
                receivedQty: String(initialData.receivedQty ?? 0),
                hasException: initialData.status === "Exception",
                expectedDate: initialData.date?.slice(0, 10) ?? "",
                notes: initialData.notes ?? "",
            });
            return;
        }

        reset(defaultValues);
    }, [open, isEdit, initialData, reset]);

    async function submit(values: InboundFormOutput) {
        try {
            await onSubmit({
                supplierId: values.supplierId,
                warehouse: values.warehouse.trim(),
                expectedQty: Number(values.expectedQty),
                items: Number(values.items),
                receivedQty: Number(values.receivedQty || 0),
                hasException: values.hasException,
                expectedDate: values.expectedDate.trim(),
                notes: values.notes.trim() || undefined,
            });
            onClose();
        } catch {
            // Keep the drawer open so the user can fix the input; the page reports the error.
        }
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
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-5">
                                <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                    Basic Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={suppliersLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 w-full rounded-xl">
                                                        <SelectValue
                                                            placeholder={
                                                                suppliersLoading
                                                                    ? "Loading suppliers..."
                                                                    : supplierOptions.length === 0
                                                                        ? "No suppliers - add one in Master Data"
                                                                        : "Select supplier"
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {supplierOptions.map((supplier) => (
                                                        <SelectItem key={supplier.id} value={supplier.id}>
                                                            {supplier.name}
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
                                    name="warehouse"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Warehouse</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Central DC"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="expectedQty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="e.g. 1200"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="items"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Items Count</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="e.g. 24"
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
                                    Schedule Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="expectedDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Date</FormLabel>
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
                            </div>
                        </div>

                        {isEdit ? (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="mb-5 space-y-1">
                                    <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                        Receiving
                                    </h3>
                                    {!canReceive ? (
                                        <p className="text-sm text-amber-600">
                                            Goods can be received once this inbound is approved
                                            (current approval: {initialData?.approvalStatus}).
                                        </p>
                                    ) : null}
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="receivedQty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Received Quantity</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        disabled={!canReceive}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hasException"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Flag Exception</FormLabel>
                                                <div className="flex h-11 items-center gap-3">
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <span className="text-sm text-slate-500">
                                                        Damaged, short-shipped or mismatched goods
                                                    </span>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="mb-5">
                                <h3 className="text-[16px] font-semibold text-[var(--erp-text)]">
                                    Notes
                                </h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Add notes for this inbound"
                                                className="min-h-[120px] rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </FormDrawer>
            </form>
        </Form>
    );
}

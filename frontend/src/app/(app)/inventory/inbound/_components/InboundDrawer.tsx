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
import FormDrawer from "@/components/common/form-drawer";

import type {
    CreateInboundFormValues,
    CreateInboundRequest,
} from "@/types/inbound";

type InboundDrawerProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: CreateInboundRequest) => Promise<void>;
};

const inboundFormSchema = z.object({
    supplierId: z
        .string()
        .trim()
        .min(1, "Supplier ID is required")
        .max(50, "Supplier ID must be within 50 characters"),

    warehouse: z
        .string()
        .trim()
        .min(1, "Warehouse is required")
        .max(100, "Warehouse must be within 100 characters"),

    expectedQty: z
        .string()
        .trim()
        .min(1, "Expected quantity is required")
        .refine((value) => !Number.isNaN(Number(value)), {
            message: "Expected quantity must be a valid number",
        })
        .refine((value) => Number(value) > 0, {
            message: "Expected quantity must be greater than 0",
        }),

    items: z
        .string()
        .trim()
        .min(1, "Items count is required")
        .refine((value) => !Number.isNaN(Number(value)), {
            message: "Items count must be a valid number",
        })
        .refine((value) => Number(value) > 0, {
            message: "Items count must be greater than 0",
        }),

    expectedDate: z
        .string()
        .trim()
        .min(1, "Expected date is required"),

    notes: z
        .string()
        .trim()
        .max(1000, "Notes must be within 1000 characters"),
});

type InboundFormInput = z.input<typeof inboundFormSchema>;
type InboundFormOutput = z.output<typeof inboundFormSchema>;

const defaultValues: InboundFormInput = {
    supplierId: "",
    warehouse: "",
    expectedQty: "",
    items: "",
    expectedDate: "",
    notes: "",
};

export default function InboundDrawer({
    open,
    onClose,
    onSubmit,
}: InboundDrawerProps) {
    const form = useForm<InboundFormInput, unknown, InboundFormOutput>({
        resolver: zodResolver(inboundFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const title = useMemo(() => "Create Inbound", []);
    const submitText = useMemo(() => {
        return isSubmitting ? "Creating..." : "Create Inbound";
    }, [isSubmitting]);

    useEffect(() => {
        if (!open) return;
        reset(defaultValues);
    }, [open, reset]);

    async function submit(values: InboundFormOutput) {
        await onSubmit({
            supplierId: values.supplierId.trim(),
            warehouse: values.warehouse.trim(),
            expectedQty: Number(values.expectedQty),
            items: Number(values.items),
            expectedDate: values.expectedDate.trim(),
            notes: values.notes.trim() || undefined,
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
                                            <FormLabel>Supplier ID</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. SUP-2991"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
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
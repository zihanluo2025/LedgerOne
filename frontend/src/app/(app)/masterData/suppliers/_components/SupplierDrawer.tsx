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

import type {
    Supplier,
    SupplierFormValues,
    SupplierRiskLevel,
    SupplierStatus,
} from "@/types/supplier";

type SupplierDrawerMode = "create" | "edit";

type SupplierDrawerProps = {
    open: boolean;
    mode: SupplierDrawerMode;
    initialData?: Supplier | null;
    onClose: () => void;
    onSubmit: (values: SupplierFormValues) => Promise<void>;
};

const supplierFormSchema = z.object({
    supplierCode: z
        .string()
        .trim()
        .min(1, "Supplier code is required")
        .max(50, "Supplier code must be within 50 characters"),

    supplierName: z
        .string()
        .trim()
        .min(1, "Supplier name is required")
        .max(100, "Supplier name must be within 100 characters"),

    primaryCategory: z
        .string()
        .trim()
        .min(1, "Primary category is required")
        .max(100, "Primary category must be within 100 characters"),

    contactPerson: z
        .string()
        .trim()
        .min(1, "Contact person is required")
        .max(100, "Contact person must be within 100 characters"),

    contactEmail: z
        .string()
        .trim()
        .max(100, "Contact email must be within 100 characters")
        .refine((value) => value === "" || z.string().email().safeParse(value).success, {
            message: "Please enter a valid email address",
        }),

    contactPhone: z
        .string()
        .trim()
        .max(50, "Contact phone must be within 50 characters"),

    region: z
        .string()
        .trim()
        .min(1, "Region is required")
        .max(100, "Region must be within 100 characters"),

    address: z
        .string()
        .trim()
        .max(255, "Address must be within 255 characters"),

    website: z
        .string()
        .trim()
        .max(255, "Website must be within 255 characters")
        .refine(
            (value) =>
                value === "" ||
                /^https?:\/\/.+/i.test(value) ||
                /^www\..+/i.test(value),
            {
                message: "Please enter a valid website URL",
            }
        ),

    status: z.enum(["Draft", "Active", "Inactive"]),

    riskLevel: z.enum(["Low", "Medium", "High"]),

    lastOrderDate: z.string().trim().optional(),

    notes: z
        .string()
        .trim()
        .max(1000, "Notes must be within 1000 characters"),
});

type SupplierFormInput = z.input<typeof supplierFormSchema>;
type SupplierFormOutput = z.output<typeof supplierFormSchema>;

const defaultValues: SupplierFormInput = {
    supplierCode: "",
    supplierName: "",
    primaryCategory: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    region: "",
    address: "",
    website: "",
    status: "Active",
    riskLevel: "Low",
    lastOrderDate: "",
    notes: "",
};

export default function SupplierDrawer({
    open,
    mode,
    initialData,
    onClose,
    onSubmit,
}: SupplierDrawerProps) {
    const form = useForm<SupplierFormInput, unknown, SupplierFormOutput>({
        resolver: zodResolver(supplierFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const title = useMemo(
        () => (mode === "create" ? "New Supplier" : "Edit Supplier"),
        [mode]
    );

    const submitText = useMemo(() => {
        if (isSubmitting) {
            return mode === "create" ? "Saving..." : "Updating...";
        }
        return mode === "create" ? "Save Supplier" : "Update Supplier";
    }, [isSubmitting, mode]);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            reset({
                supplierCode: initialData.supplierCode ?? "",
                supplierName: initialData.supplierName ?? "",
                primaryCategory: initialData.primaryCategory ?? "",
                contactPerson: initialData.contactPerson ?? "",
                contactEmail: initialData.contactEmail ?? "",
                contactPhone: initialData.contactPhone ?? "",
                region: initialData.region ?? "",
                address: initialData.address ?? "",
                website: initialData.website ?? "",
                status: (initialData.status ?? "Active") as SupplierStatus,
                riskLevel: (initialData.riskLevel ?? "Low") as SupplierRiskLevel,
                lastOrderDate: initialData.lastOrderDate
                    ? initialData.lastOrderDate.slice(0, 10)
                    : "",
                notes: initialData.notes ?? "",
            });
            return;
        }

        reset(defaultValues);
    }, [open, mode, initialData, reset]);

    async function submit(values: SupplierFormOutput) {
        try {
            await onSubmit({
                supplierCode: values.supplierCode.trim(),
                supplierName: values.supplierName.trim(),
                primaryCategory: values.primaryCategory.trim(),
                contactPerson: values.contactPerson.trim(),
                contactEmail: values.contactEmail.trim() || null,
                contactPhone: values.contactPhone.trim() || null,
                region: values.region.trim(),
                address: values.address.trim() || null,
                website: values.website.trim() || null,
                status: values.status,
                riskLevel: values.riskLevel,
                lastOrderDate: values.lastOrderDate?.trim() ? values.lastOrderDate : null,
                notes: values.notes.trim() || null,
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
                                    name="supplierCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. SUP-001"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="supplierName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier Name</FormLabel>
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
                                    name="primaryCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Category</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Hardware / Electronics"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Region</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Australia"
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
                                    Contact Information
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. John Smith"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contactPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Phone</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. +61 4xx xxx xxx"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contactEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="e.g. contact@supplier.com"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. https://supplier.com"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mt-5">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    placeholder="Enter supplier address"
                                                    className="min-h-[96px] rounded-xl"
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
                                    Status & Risk
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select status" />
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

                                <FormField
                                    control={form.control}
                                    name="riskLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Risk Level</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select risk level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastOrderDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Order Date</FormLabel>
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
                                                placeholder="Add notes about this supplier"
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
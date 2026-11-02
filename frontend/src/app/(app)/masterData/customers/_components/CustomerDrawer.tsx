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
    Customer,
    CustomerFormValues,
    CustomerSegment,
    CustomerStatus,
} from "@/types/customer";

type DrawerMode = "create" | "edit";

type CustomerDrawerProps = {
    open: boolean;
    mode: DrawerMode;
    initialData?: Customer | null;
    onClose: () => void;
    onSubmit: (values: CustomerFormValues) => Promise<void>;
};

const customerFormSchema = z.object({
    customerCode: z
        .string()
        .trim()
        .min(1, "Customer code is required")
        .max(50, "Customer code must be within 50 characters"),

    customerName: z
        .string()
        .trim()
        .min(1, "Customer name is required")
        .max(100, "Customer name must be within 100 characters"),

    companyName: z
        .string()
        .trim()
        .min(1, "Company name is required")
        .max(150, "Company name must be within 150 characters"),

    segment: z.enum(["Enterprise", "SME", "Startup"]),

    contactPerson: z
        .string()
        .trim()
        .min(1, "Contact person is required")
        .max(100, "Contact person must be within 100 characters"),

    contactEmail: z
        .string()
        .trim()
        .max(100, "Contact email must be within 100 characters")
        .refine(
            (value) => value === "" || z.string().email().safeParse(value).success,
            {
                message: "Please enter a valid email address",
            }
        ),

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

    status: z.enum(["Active", "Inactive", "Prospect"]),

    notes: z
        .string()
        .trim()
        .max(1000, "Notes must be within 1000 characters"),
});

type CustomerFormInput = z.input<typeof customerFormSchema>;
type CustomerFormOutput = z.output<typeof customerFormSchema>;

const defaultValues: CustomerFormInput = {
    customerCode: "",
    customerName: "",
    companyName: "",
    segment: "SME",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    region: "",
    address: "",
    status: "Active",
    notes: "",
};

export default function CustomerDrawer({
    open,
    mode,
    initialData,
    onClose,
    onSubmit,
}: CustomerDrawerProps) {
    const form = useForm<CustomerFormInput, unknown, CustomerFormOutput>({
        resolver: zodResolver(customerFormSchema),
        defaultValues,
    });

    const { reset, handleSubmit, formState } = form;
    const { isSubmitting } = formState;

    const title = useMemo(
        () => (mode === "create" ? "New Customer" : "Edit Customer"),
        [mode]
    );

    const submitText = useMemo(() => {
        if (isSubmitting) {
            return mode === "create" ? "Saving..." : "Updating...";
        }
        return mode === "create" ? "Save Customer" : "Update Customer";
    }, [isSubmitting, mode]);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && initialData) {
            reset({
                customerCode: initialData.customerCode ?? "",
                customerName: initialData.customerName ?? "",
                companyName: initialData.companyName ?? "",
                segment: (initialData.segment ?? "SME") as CustomerSegment,
                contactPerson: initialData.contactPerson ?? "",
                contactEmail: initialData.contactEmail ?? "",
                contactPhone: initialData.contactPhone ?? "",
                region: initialData.region ?? "",
                address: initialData.address ?? "",
                status: (initialData.status ?? "Active") as CustomerStatus,
                notes: initialData.notes ?? "",
            });
            return;
        }

        reset(defaultValues);
    }, [open, mode, initialData, reset]);

    async function submit(values: CustomerFormOutput) {
        try {
            await onSubmit({
                customerCode: values.customerCode.trim(),
                customerName: values.customerName.trim(),
                companyName: values.companyName.trim(),
                segment: values.segment,
                contactPerson: values.contactPerson.trim(),
                contactEmail: values.contactEmail.trim() || null,
                contactPhone: values.contactPhone.trim() || null,
                region: values.region.trim(),
                address: values.address.trim() || null,
                status: values.status,
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
                                    name="customerCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. CUS-001"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Marcus Thorne"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Thorne Dynamics"
                                                    className="h-11 rounded-xl"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="segment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Segment</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select segment" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                                                    <SelectItem value="SME">SME</SelectItem>
                                                    <SelectItem value="Startup">Startup</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                    placeholder="e.g. Marcus Thorne"
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
                                                    placeholder="e.g. contact@company.com"
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
                                                    placeholder="e.g. South Australia"
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
                                                    placeholder="Enter customer address"
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
                                    Status
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Customer Status</FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                        <SelectValue placeholder="Select customer status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                    <SelectItem value="Prospect">Prospect</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                                placeholder="Add notes about this customer"
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
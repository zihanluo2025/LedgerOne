"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Mirrors the default Cognito password policy; Cognito remains the source of truth.
const schema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(8, "At least 8 characters")
            .regex(/[a-z]/, "Include a lowercase letter")
            .regex(/[A-Z]/, "Include an uppercase letter")
            .regex(/[0-9]/, "Include a number")
            .regex(/[^A-Za-z0-9]/, "Include a symbol"),
        confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    })
    .refine((v) => v.newPassword !== v.currentPassword, {
        path: ["newPassword"],
        message: "New password must differ from the current one",
    });

type Values = z.infer<typeof schema>;

const defaults: Values = { currentPassword: "", newPassword: "", confirmPassword: "" };

type ChangePasswordDialogProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
};

const fields: { name: keyof Values; label: string; autoComplete: string }[] = [
    { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
    { name: "newPassword", label: "New password", autoComplete: "new-password" },
    { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
];

export default function ChangePasswordDialog({ open, onClose, onSubmit }: ChangePasswordDialogProps) {
    const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults });
    const { isSubmitting } = form.formState;

    useEffect(() => {
        if (open) form.reset(defaults);
    }, [open, form]);

    async function submit(values: Values) {
        try {
            await onSubmit(values.currentPassword, values.newPassword);
            onClose();
        } catch {
            // Keep the dialog open; the page reports the error.
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !isSubmitting && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>
                        Use at least 8 characters with upper and lower case letters, a number and a symbol.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
                        {fields.map((f) => (
                            <FormField
                                key={f.name}
                                control={form.control}
                                name={f.name}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{f.label}</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                autoComplete={f.autoComplete}
                                                className="h-11 rounded-xl"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Updating..." : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

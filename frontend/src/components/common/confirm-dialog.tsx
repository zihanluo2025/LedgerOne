"use client";

import * as React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ConfirmOptions = {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
};

type ConfirmContextValue = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = React.createContext<ConfirmContextValue | null>(null);

type ConfirmState = ConfirmOptions & {
    open: boolean;
    resolve?: (value: boolean) => void;
};

export function ConfirmProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [state, setState] = React.useState<ConfirmState>({
        open: false,
        title: "",
        description: "",
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "default",
    });

    const confirm = React.useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setState({
                open: true,
                title: options.title,
                description: options.description ?? "",
                confirmText: options.confirmText ?? "Confirm",
                cancelText: options.cancelText ?? "Cancel",
                variant: options.variant ?? "default",
                resolve,
            });
        });
    }, []);

    const closeDialog = React.useCallback((result: boolean) => {
        setState((prev) => {
            prev.resolve?.(result);

            return {
                open: false,
                title: "",
                description: "",
                confirmText: "Confirm",
                cancelText: "Cancel",
                variant: "default",
            };
        });
    }, []);

    const value = React.useMemo(
        () => ({
            confirm,
        }),
        [confirm]
    );

    const isDestructive = state.variant === "destructive";

    return (
        <ConfirmContext.Provider value={value}>
            {children}

            <AlertDialog
                open={state.open}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog(false);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{state.title}</AlertDialogTitle>
                        {state.description ? (
                            <AlertDialogDescription>
                                {state.description}
                            </AlertDialogDescription>
                        ) : null}
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => closeDialog(false)}>
                            {state.cancelText}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className={
                                isDestructive
                                    ? "bg-rose-600 text-white hover:bg-rose-700"
                                    : ""
                            }
                            onClick={(e) => {
                                e.preventDefault();
                                closeDialog(true);
                            }}
                        >
                            {state.confirmText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ConfirmContext.Provider>
    );
}

export function useConfirmContext() {
    const context = React.useContext(ConfirmContext);

    if (!context) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }

    return context;
}
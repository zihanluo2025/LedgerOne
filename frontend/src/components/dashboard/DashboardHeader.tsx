"use client";

import { useCurrentUser } from "@/lib/use-current-user";

export default function DashboardHeader() {
    const { displayName, loading } = useCurrentUser();

    return (
        <section className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--erp-text)]">
                Hello, {loading ? "..." : displayName} ! Welcome to Loger One.
            </h2>

            <p className="text-base text-[var(--erp-text-secondary)]">
                Here&apos;s your architectural overview for today.
            </p>
        </section>
    );
}
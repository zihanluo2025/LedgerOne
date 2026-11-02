"use client";

import { useCallback, useEffect, useState } from "react";

import { listApprovals } from "@/lib/apis/approvals";
import { getErrorMessage } from "@/lib/api";
import type { ApprovalRequest, ApprovalScope } from "@/types/approval";

export function useApprovals(scope: ApprovalScope) {
    const [items, setItems] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listApprovals({ scope });
            setItems(res.items ?? []);
        } catch (e) {
            setError(getErrorMessage(e, "Failed to load approval requests."));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [scope]);

    useEffect(() => {
        void reload();
    }, [reload]);

    return { items, loading, error, reload };
}

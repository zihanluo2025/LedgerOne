"use client";

import { useConfirmContext } from "@/components/common/confirm-dialog";

export function useConfirm() {
    return useConfirmContext();
}
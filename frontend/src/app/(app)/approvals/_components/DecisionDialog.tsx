"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export type DecisionKind = "approve" | "reject" | "batch";

type DecisionDialogProps = {
    open: boolean;
    kind: DecisionKind;
    subject: string;
    onCancel: () => void;
    onConfirm: (comment: string) => Promise<void>;
};

const copy: Record<DecisionKind, { title: string; action: string; required: boolean }> = {
    approve: { title: "Approve request", action: "Approve", required: false },
    reject: { title: "Reject request", action: "Reject", required: true },
    batch: { title: "Batch approve", action: "Approve All", required: false },
};

const MAX_COMMENT = 500;

export default function DecisionDialog({ open, kind, subject, onCancel, onConfirm }: DecisionDialogProps) {
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (open) {
            setComment("");
            setTouched(false);
        }
    }, [open]);

    const { title, action, required } = copy[kind];
    const trimmed = comment.trim();
    const invalid = (required && trimmed.length === 0) || trimmed.length > MAX_COMMENT;

    async function handleConfirm() {
        setTouched(true);
        if (invalid) return;

        setSubmitting(true);
        try {
            await onConfirm(trimmed);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !submitting && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{subject}</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <label htmlFor="decision-comment" className="text-sm font-medium text-slate-700">
                        Comment {required ? <span className="text-rose-600">*</span> : "(optional)"}
                    </label>
                    <Textarea
                        id="decision-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={required ? "Explain why this request is rejected" : "Add a note for the audit trail"}
                        className="min-h-[110px] rounded-xl"
                    />
                    {touched && invalid ? (
                        <p className="text-sm text-rose-600">
                            {trimmed.length > MAX_COMMENT
                                ? `Comment must be within ${MAX_COMMENT} characters.`
                                : "A comment is required to reject."}
                        </p>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        variant={kind === "reject" ? "destructive" : "default"}
                        onClick={handleConfirm}
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : action}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

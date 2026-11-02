"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";

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

type TwoFactorDialogProps = {
    open: boolean;
    setup: { secret: string; setupUri: string } | null;
    onClose: () => void;
    onVerify: (code: string) => Promise<void>;
};

export default function TwoFactorDialog({ open, setup, onClose, onVerify }: TwoFactorDialogProps) {
    const [code, setCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setCode("");
            setCopied(false);
        }
    }, [open]);

    const valid = /^\d{6}$/.test(code);

    async function copySecret() {
        if (!setup) return;
        await navigator.clipboard.writeText(setup.secret);
        setCopied(true);
    }

    async function verify() {
        if (!valid) return;
        setSubmitting(true);
        try {
            await onVerify(code);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !submitting && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enable two-factor authentication</DialogTitle>
                    <DialogDescription>
                        Add this key to an authenticator app (Google Authenticator, 1Password, Authy), then enter
                        the 6-digit code it shows.
                    </DialogDescription>
                </DialogHeader>

                {setup ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700">Setup key</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
                                    {setup.secret}
                                </code>
                                <Button type="button" variant="outline" size="icon" onClick={copySecret} title="Copy key">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                {copied ? "Copied to clipboard. " : null}
                                On a phone you can also{" "}
                                <a href={setup.setupUri} className="font-medium text-[#1658DC] underline">
                                    open the setup link
                                </a>{" "}
                                directly in your authenticator app.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="totp-code" className="text-sm font-medium text-slate-700">
                                Verification code
                            </label>
                            <Input
                                id="totp-code"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="123456"
                                className="h-11 rounded-xl tracking-[0.3em]"
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Preparing setup key...</p>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={verify} disabled={!setup || !valid || submitting}>
                        {submitting ? "Verifying..." : "Verify & Enable"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

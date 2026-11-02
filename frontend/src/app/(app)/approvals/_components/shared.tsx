import { CircleAlert } from "lucide-react";

import {
    APPROVAL_OVERDUE_HOURS,
    type ApprovalBusinessType,
    type ApprovalRequest,
    type ApprovalStatus,
} from "@/types/approval";

export function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function getInitials(name: string) {
    return name
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function formatDateTime(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-AU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function hoursBetween(from: string, to: string | Date = new Date()) {
    return (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000;
}

export function formatDuration(hours: number) {
    if (!Number.isFinite(hours) || hours < 0) return "-";
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
    if (hours < 48) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
}

export function isOverdue(item: ApprovalRequest) {
    return item.status === "Pending" && hoursBetween(item.submittedAt) > APPROVAL_OVERDUE_HOURS;
}

export function isThisMonth(value?: string | null) {
    if (!value) return false;
    const date = new Date(value);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function isToday(value?: string | null) {
    if (!value) return false;
    return new Date(value).toDateString() === new Date().toDateString();
}

export function describeRequest(item: ApprovalRequest) {
    if (item.businessType === "Sales" && item.amount !== null && item.amount !== undefined) {
        return `${item.currency ?? ""} ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`.trim();
    }
    if (item.quantity !== null && item.quantity !== undefined) {
        return `${item.quantity.toLocaleString()} units${item.location ? ` → ${item.location}` : ""}`;
    }
    return item.summary;
}

export function TypeBadge({ type }: { type: ApprovalBusinessType }) {
    const isInbound = type === "Inbound";

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                isInbound ? "bg-[#DCEBFF] text-[#2D6BCF]" : "bg-[#E8DFFC] text-[#6C5AAE]"
            )}
        >
            {type.toUpperCase()}
        </span>
    );
}

const statusClassMap: Record<ApprovalStatus, string> = {
    Pending: "border-blue-200 bg-blue-50 text-blue-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-rose-200 bg-rose-50 text-rose-700",
    Withdrawn: "border-slate-200 bg-slate-100 text-slate-500",
};

const statusDotMap: Record<ApprovalStatus, string> = {
    Pending: "bg-blue-500",
    Approved: "bg-emerald-500",
    Rejected: "bg-rose-500",
    Withdrawn: "bg-slate-400",
};

export function ApprovalStatusBadge({ status, overdue }: { status: ApprovalStatus; overdue?: boolean }) {
    return (
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span
                className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.04em]",
                    statusClassMap[status]
                )}
            >
                <span className={cn("h-2 w-2 rounded-full", statusDotMap[status])} />
                {status === "Pending" ? "In Review" : status}
            </span>
            {overdue ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                    <CircleAlert className="h-4 w-4" />
                    Overdue
                </span>
            ) : null}
        </span>
    );
}

export function PersonCell({ name, sub }: { name?: string | null; sub?: string | null }) {
    if (!name) return <span className="text-[15px] font-semibold text-slate-400">-</span>;

    return (
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DFE5FF] text-sm font-bold text-[#4763B4]">
                {getInitials(name)}
            </div>
            <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold leading-5 text-[#183B6B]">{name}</div>
                {sub ? <div className="truncate text-xs font-medium text-slate-400">{sub}</div> : null}
            </div>
        </div>
    );
}

export function DocumentCell({ item }: { item: ApprovalRequest }) {
    return (
        <div className="max-w-[240px]">
            <div className="whitespace-nowrap font-bold leading-6 text-[#1557E5]">{item.documentNo}</div>
            <div className="truncate text-xs font-medium text-slate-500">{item.partner}</div>
        </div>
    );
}

export function OutcomeStat({ value, label, className }: { value: number; label: string; className: string }) {
    return (
        <div>
            <div className={cn("text-5xl font-bold leading-none", className)}>{value}</div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</div>
        </div>
    );
}

export const businessTypeOptions = [
    { label: "All Business", value: "all" },
    { label: "Inbound", value: "Inbound" },
    { label: "Sales", value: "Sales" },
];

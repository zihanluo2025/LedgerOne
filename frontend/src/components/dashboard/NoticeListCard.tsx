"use client";

import { Bell, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type NoticeItem = {
    title: string;
    content: string;
    tag: "NEW" | "ALERT" | "UPDATE";
    time: string;
};

type NoticeListCardProps = {
    items: NoticeItem[];
};

const noticeStyles: Record<
    NoticeItem["tag"],
    {
        accent: string;
        iconBg: string;
        iconText: string;
        tagBg: string;
        tagText: string;
        Icon: typeof Bell;
    }
> = {
    NEW: {
        accent: "bg-blue-500",
        iconBg: "bg-blue-50",
        iconText: "text-blue-600",
        tagBg: "bg-slate-100",
        tagText: "text-slate-700",
        Icon: Bell,
    },
    ALERT: {
        accent: "bg-amber-500",
        iconBg: "bg-amber-50",
        iconText: "text-amber-600",
        tagBg: "bg-slate-100",
        tagText: "text-slate-700",
        Icon: AlertTriangle,
    },
    UPDATE: {
        accent: "bg-emerald-500",
        iconBg: "bg-emerald-50",
        iconText: "text-emerald-600",
        tagBg: "bg-slate-100",
        tagText: "text-slate-700",
        Icon: RefreshCw,
    },
};

export default function NoticeListCard({ items }: NoticeListCardProps) {
    return (
        <Card className="rounded-lg bg-[#EFF4FF] shadow-none">
            <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                            Notices
                        </span>
                    </div>

                    <button
                        type="button"
                        className="text-[14px] font-medium text-[#2f5d9b] transition hover:text-[#163d73]"
                    >
                        View Archive
                    </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    {items.map((item) => {
                        const style = noticeStyles[item.tag];
                        const Icon = style.Icon;

                        return (
                            <div
                                key={`${item.title}-${item.time}`}
                                className="relative overflow-hidden rounded-sm border border-[var(--erp-border)] bg-white"
                            >
                                <div className={`absolute left-0 top-0 h-full w-1 ${style.accent}`} />

                                <div className="p-5 pl-6">
                                    <div className="mb-4 flex items-start gap-3">
                                        <div
                                            className={[
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                                style.iconBg,
                                                style.iconText,
                                            ].join(" ")}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-[15px] font-semibold leading-6 text-[#163d73]">
                                                    {item.title}
                                                </h4>

                                                <span
                                                    className={[
                                                        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                                        style.tagBg,
                                                        style.tagText,
                                                    ].join(" ")}
                                                >
                                                    {item.tag}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mb-4 text-[14px] leading-6 text-[#6e7f99]">
                                        {item.content}
                                    </p>

                                    <p className="text-[12px] font-medium text-[#9aa8bc]">
                                        {item.time}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
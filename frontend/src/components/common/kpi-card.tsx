"use client";

// import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

// const trendClasses: Record<KpiItem["trendType"], string> = {
//     positive:
//         "bg-emerald-50 text-emerald-700",
//     neutral:
//         " bg-slate-50 text-slate-600",
//     warning:
//         " bg-amber-50 text-amber-700",
// };



// const progressClasses: Record<KpiItem["trendType"], string> = {
//     positive: "bg-emerald-100",
//     neutral: "bg-slate-200",
//     warning: "bg-amber-500",
// };

export default function KpiCard({
    title,
    value,
    suffix,
    description,
    rightIcon,
    badge,
    footer,
    suffixText,
    customContent,
    className,
    valueClassName,
    descriptionClassName,
    icon,
    trend
}: {
    title: string;
    value: string;
    suffix?: string;
    description?: string;
    rightIcon?: React.ReactNode;
    badge?: React.ReactNode;
    footer?: React.ReactNode;
    suffixText?: React.ReactNode;
    customContent?: React.ReactNode;
    className?: string;
    valueClassName?: string;
    descriptionClassName?: string;
    icon?: React.ReactNode;
    trend?: {
        value: string;
        positive?: boolean;
    };
}) {
    return (
        <Card className="rounded-l  bg-white shadow-none">
            <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            {title}
                        </p>

                    </div>

                    <div className="flex items-center gap-2">

                        {rightIcon ? <div className="text-[#1D62F0]">{rightIcon}</div> : null}
                    </div>
                </div>

                <div className="flex items-end gap-2">
                    {/* <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            {title}
                        </p>
                    </div> */}

                    <span className="text-xl font-bold leading-none text-[#0A3B72]">
                        {value}

                    </span>
                    {suffix ? (
                        <span className="pb-1 text-lg font-semibold text-slate-400">
                            {suffix}
                            {suffixText ? <span className="ml-5">{suffixText}</span> : null}
                        </span>

                    ) : null}


                </div>

                {description ? (
                    <p className="mt-3 text-sm font-medium text-slate-400">{description}</p>
                ) : null}

                {footer ? <div className="mt-5">{footer}</div> : customContent}
            </CardContent>
        </Card>
    );
}

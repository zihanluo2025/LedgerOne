"use client";


import { Card, CardContent } from "@/components/ui/card";



export default function KpiCard({
    title,
    value,
    suffix,
    description,
    rightIcon,
    footer,
    suffixText,
    customContent
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
            <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="space-y-1 ">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            {title}
                        </p>


                    </div>

                    <div className="flex items-center gap-2">

                        {rightIcon ? <div className="text-[#1D62F0]">{rightIcon}</div> : null}
                    </div>
                </div>

                <div className="flex items-end gap-2">

                    <span className="text-[42px] font-bold leading-none text-[#0A3B72]">
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

                {footer ? <div className="mt-3">{footer}</div> : customContent}
            </CardContent>
        </Card>
    );
}

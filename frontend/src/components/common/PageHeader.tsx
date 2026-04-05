import { ReactNode } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "../ui/button";


type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

type HeaderAction = {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    show?: boolean;
    disabled?: boolean;
    className?: string;
};

type PageSectionHeaderProps = {
    title?: string;
    description?: string;

    showTitle?: boolean;
    showDescription?: boolean;
    showActions?: boolean;

    actions?: HeaderAction[];

    className?: string;
};

export default function PageSectionHeader({
    title = "",
    description = "",

    showTitle = true,
    showDescription = true,
    showActions = true,

    actions = [],

    className = "",
}: PageSectionHeaderProps) {
    const visibleActions = actions.filter((item) => item.show !== false);

    return (
        <div
            className={[
                "flex flex-col gap-5 md:flex-row md:items-start md:justify-between",
                className,
            ].join(" ")}
        >
            <div className="min-w-0 flex-1 space-y-2">
                {showTitle && title ? (
                    <h1 className="text-3xl font-semibold tracking-tight text-[var(--erp-text)]">
                        {title}
                    </h1>
                ) : null}

                {showDescription && description ? (
                    <p className="text-base text-[var(--erp-text-secondary)]">
                        {description}
                    </p>
                ) : null}
            </div>

            {showActions && visibleActions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-4 md:justify-end">
                    {visibleActions.map((action, index) => {
                        const isLast = index === visibleActions.length - 1;
                        return (
                            <Button
                                key={`${action.label}-${index}`}
                                type="button"
                                onClick={action.onClick}
                                disabled={action.disabled}
                                variant={isLast ? "default" : "outline"}
                                size="lg"
                                className={cn(
                                    "rounded-md px-4 text-base",
                                    !isLast &&
                                    "border-[#d7e3f4] bg-[#eef3fb] text-[#1f3b64] hover:bg-[#e6eef9] hover:text-[#1f3b64]"
                                )}
                            >
                                {action.icon ? (
                                    <span className="flex items-center">
                                        {action.icon}
                                    </span>
                                ) : null}
                                <span>{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
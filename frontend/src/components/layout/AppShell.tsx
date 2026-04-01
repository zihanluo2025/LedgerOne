"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV } from "@/lib/nav";
import type { NavItem } from "@/lib/nav";
import { isAdmin as checkIsAdmin } from "@/lib/authz";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator as DmSep,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import NavGroup from "@/components/layout/NavGroup";
import { fetchAuthSession } from "aws-amplify/auth";
import { logout } from "@/lib/auth";

type UserInfo = {
    email?: string;
    name?: string;
    preferred_username?: string;
};

function filterNav(items: NavItem[], isAdmin: boolean): NavItem[] {
    return items
        .filter((item) => (item.requiredRole === "admin" ? isAdmin : true))
        .map((item) => {
            if ("children" in item) {
                const children = item.children.filter((c) =>
                    c.requiredRole === "admin" ? isAdmin : true
                );
                return { ...item, children };
            }
            return item;
        })
        .filter((item) => !("children" in item) || item.children.length > 0);
}

function getInitials(email?: string, name?: string) {
    const base = (name || email || "U").trim();
    const parts = base.split(/\s+/).filter(Boolean);

    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatSegment(segment: string) {
    return segment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBreadcrumbItems(pathname: string) {
    if (!pathname || pathname === "/") {
        return ["Home"];
    }

    const segments = pathname.split("/").filter(Boolean);
    return ["Home", ...segments.map(formatSegment)];
}

function getPageTitle(pathname: string) {
    if (!pathname || pathname === "/") return "Home";

    const segments = pathname.split("/").filter(Boolean);
    return formatSegment(segments[segments.length - 1]);
}

export default function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const nav = useMemo(() => filterNav(NAV, isAdmin), [isAdmin]);

    useEffect(() => {
        checkIsAdmin().then(setIsAdmin);
    }, []);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const session = await fetchAuthSession();
                const claims = session.tokens?.idToken?.payload as
                    | { email?: string; name?: string; preferred_username?: string }
                    | undefined;

                if (!mounted) return;

                setUser({
                    email: claims?.email,
                    name: claims?.name,
                    preferred_username: claims?.preferred_username,
                });
            } catch {
                if (!mounted) return;
                setUser(null);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const breadcrumbItems = useMemo(
        () => getBreadcrumbItems(pathname || "/"),
        [pathname]
    );



    return (
        <div className="h-screen overflow-hidden erp-shell">
            <div className="grid h-full grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <aside className="flex h-full flex-col erp-sidebar">
                    <div className="erp-brand shrink-0">LOGER ONE</div>

                    <nav className="erp-nav min-h-0 flex-1 overflow-y-auto">
                        {nav.map((item) => {
                            if ("href" in item) {
                                const active =
                                    pathname === item.href || pathname.startsWith(item.href + "/");

                                const Icon = item.icon;

                                return (
                                    <Link key={item.href} href={item.href} className="block">
                                        <div
                                            className={[
                                                "erp-nav-item flex items-center gap-2",
                                                active ? "active" : "",
                                            ].join(" ")}
                                        >
                                            <Icon size={16} />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <NavGroup
                                    key={item.label}
                                    label={item.label}
                                    icon={item.icon}
                                    childrenItems={item.children}
                                    pathname={pathname || "/"}
                                />
                            );
                        })}
                    </nav>
                </aside>

                <main className="flex h-full min-w-0 flex-col overflow-hidden">
                    <header className="erp-header shrink-0 px-6 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm text-[var(--erp-text-muted)]">
                                    {breadcrumbItems.map((item, index) => {
                                        const isLast = index === breadcrumbItems.length - 1;

                                        return (
                                            <div key={`${item}-${index}`} className="flex items-center gap-2">
                                                {index > 0 && <span>/</span>}
                                                <span
                                                    className={
                                                        isLast
                                                            ? "text-[var(--erp-text-secondary)]"
                                                            : "text-[var(--erp-text-muted)]"
                                                    }
                                                >
                                                    {item}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>


                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="relative h-10 w-10 rounded-full border border-[var(--erp-border)] bg-[var(--erp-surface)] text-[var(--erp-text-secondary)] hover:bg-[var(--erp-surface-muted)]"
                                >
                                    <span className="text-base">🔔</span>
                                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-10 rounded-full px-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {getInitials(user?.email, user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Account</DropdownMenuLabel>

                                        <div className="break-all px-2 pb-2 text-xs text-muted-foreground">
                                            {user?.email || "—"}
                                        </div>

                                        <DmSep />

                                        <DropdownMenuItem asChild>
                                            <Link href="/settings/profile">Profile</Link>
                                        </DropdownMenuItem>

                                        <DmSep />

                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600"
                                            onClick={async () => {
                                                await logout();
                                            }}
                                        >
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <div className="erp-content min-h-0 flex-1 overflow-y-auto">
                        <div className="p-4 md:p-6">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
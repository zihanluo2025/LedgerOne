"use client";

import { useState } from "react";

import {
    Bell,
    BriefcaseBusiness,
    ChevronDown,
    KeyRound,
    Laptop,
    LockKeyhole,
    Mail,
    Shield,
    UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";




export default function ProfilePage() {


    const [form, setForm] = useState({
        fullName: "Alexander Sterling",
        email: "a.sterling@executivelayer.com",
        jobTitle: "Senior Controller",
        department: "Executive Management",
        emailAlerts: true,
        desktopNotifications: false,
        twoFactorEnabled: true,
    });

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <div className="space-y-6">


            {/* Main layout */}
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                {/* Left column */}
                <div className="space-y-6">
                    {/* Profile summary */}
                    <section className="rounded-sm border border-[var(--erp-border)] bg-white p-6 shadow-none">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-5">
                                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-[#d9e2ef] bg-[#EFF4FF] text-[#163d73]">
                                    <UserRound className="h-10 w-10" />
                                </div>

                                <button
                                    type="button"
                                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#1658DC] text-white shadow-sm transition hover:bg-[#104cc5]"
                                >
                                    <span className="text-sm">✎</span>
                                </button>
                            </div>

                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                                {form.fullName}
                            </h3>
                            <p className="mt-1 text-[15px] text-[#5f7190]">{form.jobTitle}</p>

                            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                ACTIVE STATUS
                            </div>
                        </div>
                    </section>

                    {/* Sidebar menu */}
                    {/* Notification Settings */}
                    <section className="rounded-sm border border-[var(--erp-border)] bg-white p-6 shadow-none">
                        <div className="mb-6 flex items-center gap-3">
                            <Bell className="h-5 w-5 text-[#1658DC]" />
                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                                Notification Settings
                            </h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-1">
                            <InfoActionCard
                                icon={<Mail className="h-5 w-5 text-[#1658DC]" />}
                                title="Email Alerts"
                                description=""
                                action={
                                    <Switch
                                        checked={form.emailAlerts}
                                        onCheckedChange={(checked) =>
                                            handleChange("emailAlerts", checked)
                                        }
                                    />
                                }
                            />

                            <InfoActionCard
                                icon={<Laptop className="h-5 w-5 text-[#1658DC]" />}
                                title="Desktop Notifications"
                                description=""
                                action={
                                    <Switch
                                        checked={form.desktopNotifications}
                                        onCheckedChange={(checked) =>
                                            handleChange("desktopNotifications", checked)
                                        }
                                    />
                                }
                            />
                        </div>
                    </section>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Personal Information */}
                    <section className="rounded-sm border border-[var(--erp-border)] bg-white p-6 shadow-none">
                        <div className="mb-6 flex items-center gap-3">
                            <BriefcaseBusiness className="h-5 w-5 text-[#1658DC]" />
                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <FieldBlock label="FULL NAME">
                                <Input
                                    value={form.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    className="h-12 rounded-xl border-[#d9e2ef] bg-white text-[15px] text-[#163d73] shadow-none"
                                />
                            </FieldBlock>

                            <FieldBlock label="EMAIL ADDRESS">
                                <Input
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className="h-12 rounded-xl border-[#d9e2ef] bg-white text-[15px] text-[#163d73] shadow-none"
                                />
                            </FieldBlock>

                            <FieldBlock label="JOB TITLE">
                                <Input
                                    value={form.jobTitle}
                                    onChange={(e) => handleChange("jobTitle", e.target.value)}
                                    className="h-12 rounded-xl border-[#d9e2ef] bg-white text-[15px] text-[#163d73] shadow-none"
                                />
                            </FieldBlock>

                            <FieldBlock label="DEPARTMENT">
                                <button
                                    type="button"
                                    className="flex h-12 w-full items-center justify-between rounded-xl border border-[#d9e2ef] bg-white px-4 text-[15px] text-[#163d73]"
                                >
                                    <span>{form.department}</span>
                                    <ChevronDown className="h-4 w-4 text-[#7b8ba5]" />
                                </button>
                            </FieldBlock>
                        </div>
                    </section>

                    {/* Security & Access */}
                    <section className="rounded-sm border border-[var(--erp-border)] bg-white p-6 shadow-none">
                        <div className="mb-6 flex items-center gap-3">
                            <Shield className="h-5 w-5 text-[#1658DC]" />
                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                                Security & Access
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <InfoActionCard
                                icon={<KeyRound className="h-5 w-5 text-[#1658DC]" />}
                                title="Change Password"
                                description="Last updated: Oct 12, 2023"
                                action={
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-xl border-[#d9e2ef] bg-white px-5 text-[#2f5d9b] hover:bg-[#f8fbff]"
                                    >
                                        Update
                                    </Button>
                                }
                            />

                            <InfoActionCard
                                icon={<LockKeyhole className="h-5 w-5 text-[#1658DC]" />}
                                title="Two-Factor Authentication"
                                description="Add an extra layer of protection"
                                action={
                                    <Switch
                                        checked={form.twoFactorEnabled}
                                        onCheckedChange={(checked) =>
                                            handleChange("twoFactorEnabled", checked)
                                        }
                                    />
                                }
                            />
                        </div>
                    </section>



                    {/* Footer actions */}
                    <section className=" pt-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <Button
                                variant="ghost"
                                className="h-11 rounded-xl px-5 text-[#2f5d9b] hover:bg-[#EFF4FF]"
                            >
                                Discard Changes
                            </Button>

                            <Button className="h-11 rounded-xl bg-[#1658DC] px-6 text-white hover:bg-[#104cc5]">
                                Save Configuration
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function FieldBlock({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="text-[13px] font-semibold tracking-[0.08em] text-[#3f69a1]">
                {label}
            </label>
            {children}
        </div>
    );
}

function InfoActionCard({
    icon,
    title,
    description,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7FAFF] px-5 py-5">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF]">
                    {icon}
                </div>

                <div className="min-w-0">
                    <h4 className="text-[15px] font-semibold text-[#163d73]">{title}</h4>
                    {description ? (
                        <p className="mt-1 text-[14px] text-[#6e7f99]">{description}</p>
                    ) : null}
                </div>
            </div>

            <div className="shrink-0">{action}</div>
        </div>
    );
}
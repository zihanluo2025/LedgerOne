"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Bell,
    BriefcaseBusiness,
    KeyRound,
    Laptop,
    LockKeyhole,
    Mail,
    Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useConfirm } from "@/hooks/use-confirm";
import { getErrorMessage } from "@/lib/api";
import { getMyProfile, listDepartments, recordPasswordChanged, updateMyProfile } from "@/lib/apis/profile";
import {
    changePassword,
    confirmTotpSetup,
    describeAuthError,
    disableTotp,
    isTotpEnabled,
    startTotpSetup,
} from "@/lib/security";
import { toastApiError, toastError, toastSuccess } from "@/lib/tools/toast";
import { useCurrentUser } from "@/lib/use-current-user";
import type { UpdateUserProfileRequest, UserProfile } from "@/types/profile";

import ChangePasswordDialog from "./_components/ChangePasswordDialog";
import TwoFactorDialog from "./_components/TwoFactorDialog";

type FormState = {
    fullName: string;
    jobTitle: string;
    department: string;
    emailAlerts: boolean;
    desktopNotifications: boolean;
};

const NO_DEPARTMENT = "none";
const FULL_NAME_MAX = 100;

function toForm(profile: UserProfile): FormState {
    return {
        fullName: profile.fullName,
        jobTitle: profile.jobTitle ?? "",
        department: profile.department ?? NO_DEPARTMENT,
        emailAlerts: profile.emailAlerts,
        desktopNotifications: profile.desktopNotifications,
    };
}

function toRequest(form: FormState): UpdateUserProfileRequest {
    return {
        fullName: form.fullName.trim(),
        jobTitle: form.jobTitle.trim() || null,
        department: form.department === NO_DEPARTMENT ? null : form.department,
        emailAlerts: form.emailAlerts,
        desktopNotifications: form.desktopNotifications,
    };
}

function getInitials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"
    );
}

function formatDate(value?: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

// Browser permission is required before desktop notifications can be enabled.
async function ensureNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    return (await Notification.requestPermission()) === "granted";
}

export default function ProfilePage() {
    const { confirm } = useConfirm();
    const { user, loading: userLoading } = useCurrentUser();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [departments, setDepartments] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
    const [totpBusy, setTotpBusy] = useState(false);
    const [totpSetup, setTotpSetup] = useState<{ secret: string; setupUri: string } | null>(null);
    const [totpDialogOpen, setTotpDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const [me, deps] = await Promise.all([getMyProfile(), listDepartments()]);
            setProfile(me);
            setForm(toForm(me));
            setDepartments(deps);
        } catch (e) {
            setLoadError(getErrorMessage(e, "Failed to load your profile."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
        isTotpEnabled()
            .then(setTotpEnabled)
            .catch(() => setTotpEnabled(null));
    }, [load]);

    const dirty = useMemo(() => {
        if (!profile || !form) return false;
        return JSON.stringify(toRequest(form)) !== JSON.stringify(toRequest(toForm(profile)));
    }, [profile, form]);

    const nameError =
        form && form.fullName.trim().length === 0
            ? "Full name is required"
            : form && form.fullName.trim().length > FULL_NAME_MAX
                ? `Full name must be within ${FULL_NAME_MAX} characters`
                : null;

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    async function handleDesktopToggle(checked: boolean) {
        if (checked && !(await ensureNotificationPermission())) {
            toastError("Allow notifications for this site in your browser settings first.", "Permission Required");
            return;
        }
        update("desktopNotifications", checked);
    }

    async function handleSave() {
        if (!form || nameError) return;
        setSaving(true);
        try {
            const saved = await updateMyProfile(toRequest(form));
            setProfile(saved);
            setForm(toForm(saved));
            toastSuccess("Your profile has been updated.", "Profile Saved");
        } catch (e) {
            toastApiError(e, "Save Failed");
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword(currentPassword: string, newPassword: string) {
        try {
            await changePassword(currentPassword, newPassword);
        } catch (e) {
            toastError(describeAuthError(e, "Failed to change password."), "Password Not Changed");
            throw e;
        }

        toastSuccess("Your password has been changed.", "Password Updated");
        try {
            const updated = await recordPasswordChanged();
            setProfile((prev) => (prev ? { ...prev, passwordChangedAt: updated.passwordChangedAt } : updated));
        } catch {
            // The password change succeeded; failing to record the timestamp is not user-facing.
        }
    }

    async function handleTotpToggle(checked: boolean) {
        setTotpBusy(true);
        try {
            if (checked) {
                setTotpSetup(null);
                setTotpDialogOpen(true);
                setTotpSetup(await startTotpSetup(user?.email));
                return;
            }

            const ok = await confirm({
                title: "Disable two-factor authentication?",
                description: "You will only need your password to sign in.",
                confirmText: "Disable",
                cancelText: "Cancel",
                variant: "destructive",
            });
            if (!ok) return;

            await disableTotp();
            setTotpEnabled(false);
            toastSuccess("Two-factor authentication is now off.", "2FA Disabled");
        } catch (e) {
            setTotpDialogOpen(false);
            toastError(describeAuthError(e, "Unable to update two-factor settings."), "2FA Update Failed");
        } finally {
            setTotpBusy(false);
        }
    }

    async function handleTotpVerify(code: string) {
        try {
            await confirmTotpSetup(code);
            setTotpEnabled(true);
            setTotpDialogOpen(false);
            toastSuccess("Two-factor authentication is now on.", "2FA Enabled");
        } catch (e) {
            toastError(describeAuthError(e, "Verification failed."), "2FA Not Enabled");
        }
    }

    if (loading && !form) {
        return <div className="p-6 text-sm text-[#6e7f99]">Loading profile...</div>;
    }

    if (!form || !profile) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {loadError ?? "Failed to load your profile."}
                </div>
                <Button variant="outline" onClick={() => void load()}>
                    Retry
                </Button>
            </div>
        );
    }

    const passwordChanged = formatDate(profile.passwordChangedAt);
    const email = userLoading ? "..." : user?.email ?? "-";

    return (
        <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                {/* Left column */}
                <div className="space-y-6">
                    <section className="rounded-sm border border-[var(--erp-border)] bg-white p-6 shadow-none">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-2xl border border-[#d9e2ef] bg-[#EFF4FF] text-[32px] font-semibold text-[#163d73]">
                                {getInitials(profile.fullName)}
                            </div>

                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                                {profile.fullName}
                            </h3>
                            <p className="mt-1 text-[15px] text-[#5f7190]">
                                {[profile.jobTitle, profile.department].filter(Boolean).join(" · ") || "No job title yet"}
                            </p>

                            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[13px] font-semibold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                ACTIVE STATUS
                            </div>
                        </div>
                    </section>

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
                                description="Approvals & stock alerts"
                                action={
                                    <Switch
                                        checked={form.emailAlerts}
                                        onCheckedChange={(checked) => update("emailAlerts", checked)}
                                    />
                                }
                            />

                            <InfoActionCard
                                icon={<Laptop className="h-5 w-5 text-[#1658DC]" />}
                                title="Desktop Notifications"
                                description="On this device"
                                action={
                                    <Switch
                                        checked={form.desktopNotifications}
                                        onCheckedChange={(checked) => void handleDesktopToggle(checked)}
                                    />
                                }
                            />
                        </div>
                    </section>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <section className="rounded-sm border border-[var(--erp-border)] bg-white p-6 shadow-none">
                        <div className="mb-6 flex items-center gap-3">
                            <BriefcaseBusiness className="h-5 w-5 text-[#1658DC]" />
                            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#163d73]">
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <FieldBlock label="FULL NAME" htmlFor="profile-full-name" error={nameError}>
                                <Input
                                    id="profile-full-name"
                                    value={form.fullName}
                                    maxLength={FULL_NAME_MAX + 1}
                                    onChange={(e) => update("fullName", e.target.value)}
                                    aria-invalid={!!nameError}
                                    className="h-12 rounded-xl border-[#d9e2ef] bg-white text-[15px] text-[#163d73] shadow-none"
                                />
                            </FieldBlock>

                            <FieldBlock
                                label="EMAIL ADDRESS"
                                htmlFor="profile-email"
                                hint="Sign-in email is managed by your administrator."
                            >
                                <Input
                                    id="profile-email"
                                    value={email}
                                    readOnly
                                    disabled
                                    className="h-12 rounded-xl border-[#d9e2ef] bg-slate-50 text-[15px] text-[#163d73] shadow-none"
                                />
                            </FieldBlock>

                            <FieldBlock label="JOB TITLE" htmlFor="profile-job-title">
                                <Input
                                    id="profile-job-title"
                                    value={form.jobTitle}
                                    maxLength={100}
                                    placeholder="e.g. Senior Controller"
                                    onChange={(e) => update("jobTitle", e.target.value)}
                                    className="h-12 rounded-xl border-[#d9e2ef] bg-white text-[15px] text-[#163d73] shadow-none"
                                />
                            </FieldBlock>

                            <FieldBlock label="DEPARTMENT">
                                <Select value={form.department} onValueChange={(value) => update("department", value)}>
                                    <SelectTrigger className="h-12 w-full rounded-xl border-[#d9e2ef] bg-white px-4 text-[15px] text-[#163d73]">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_DEPARTMENT}>Not set</SelectItem>
                                        {departments.map((d) => (
                                            <SelectItem key={d} value={d}>
                                                {d}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldBlock>
                        </div>
                    </section>

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
                                description={passwordChanged ? `Last updated: ${passwordChanged}` : "Not changed from this portal yet"}
                                action={
                                    <Button
                                        variant="outline"
                                        onClick={() => setPasswordDialogOpen(true)}
                                        className="h-10 rounded-xl border-[#d9e2ef] bg-white px-5 text-[#2f5d9b] hover:bg-[#f8fbff]"
                                    >
                                        Update
                                    </Button>
                                }
                            />

                            <InfoActionCard
                                icon={<LockKeyhole className="h-5 w-5 text-[#1658DC]" />}
                                title="Two-Factor Authentication"
                                description={
                                    totpEnabled === null
                                        ? "Status unavailable for this session"
                                        : totpEnabled
                                            ? "Enabled with an authenticator app"
                                            : "Add an extra layer of protection"
                                }
                                action={
                                    <Switch
                                        checked={totpEnabled === true}
                                        disabled={totpEnabled === null || totpBusy}
                                        onCheckedChange={(checked) => void handleTotpToggle(checked)}
                                    />
                                }
                            />
                        </div>
                    </section>

                    <section className="pt-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <Button
                                variant="ghost"
                                disabled={!dirty || saving}
                                onClick={() => setForm(toForm(profile))}
                                className="h-11 rounded-xl px-5 text-[#2f5d9b] hover:bg-[#EFF4FF]"
                            >
                                Discard Changes
                            </Button>

                            <Button
                                disabled={!dirty || saving || !!nameError}
                                onClick={() => void handleSave()}
                                className="h-11 rounded-xl bg-[#1658DC] px-6 text-white hover:bg-[#104cc5]"
                            >
                                {saving ? "Saving..." : "Save Configuration"}
                            </Button>
                        </div>
                    </section>
                </div>
            </div>

            <ChangePasswordDialog
                open={passwordDialogOpen}
                onClose={() => setPasswordDialogOpen(false)}
                onSubmit={handleChangePassword}
            />

            <TwoFactorDialog
                open={totpDialogOpen}
                setup={totpSetup}
                onClose={() => setTotpDialogOpen(false)}
                onVerify={handleTotpVerify}
            />
        </div>
    );
}

function FieldBlock({
    label,
    htmlFor,
    hint,
    error,
    children,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    error?: string | null;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={htmlFor} className="text-[13px] font-semibold tracking-[0.08em] text-[#3f69a1]">
                {label}
            </label>
            {children}
            {error ? (
                <p className="text-sm text-rose-600">{error}</p>
            ) : hint ? (
                <p className="text-xs text-[#7b8ba5]">{hint}</p>
            ) : null}
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
                    {description ? <p className="mt-1 text-[14px] text-[#6e7f99]">{description}</p> : null}
                </div>
            </div>

            <div className="shrink-0">{action}</div>
        </div>
    );
}

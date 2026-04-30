"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { Mail, Lock, Fingerprint, ArrowRight } from "lucide-react";

import { startHostedLogin, isSignedIn, loginWithPassword, setAuthCookie } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { toastError, toastSuccess, toastWarning } from "@/lib/tools/toast";



export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("admin@example.com");
    const [password, setPassword] = useState("Admin12345.");

    useEffect(() => {
        (async () => {
            if (await isSignedIn()) {
                setAuthCookie();
                router.replace("/dashboard");
            }
        })();
    }, [router]);

    const handleLogin = async () => {
        if (!email || !password) {
            toastWarning("Please enter email and password");
            return;
        }

        try {
            const res = await loginWithPassword(email, password);

            if (res.isSignedIn) {
                setAuthCookie();
                toastSuccess(res.alreadySignedIn ? "Welcome back!" : "Login successful!");
                router.push("/dashboard");
                return;
            }

            toastError("Additional authentication step is required.");
        } catch (err: unknown) {
            toastError((err as Error)?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#efefef]">
            <div className="overflow-hidden  bg-[#f7f7fb] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                <div className="grid  grid-cols-1 lg:grid-cols-[470px_1fr]">
                    {/* Left branding panel */}
                    <div className="relative flex flex-col justify-between bg-[#1f2a44] px-10 py-12 text-white">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center bg-[#0d56c9]">
                                    <span className="text-lg font-semibold text-white">L</span>
                                </div>
                                <div className="text-[18px] font-semibold tracking-tight">
                                    LedgerOne
                                </div>
                            </div>

                            <div className="mt-12 inline-flex items-center bg-[#0d56c9] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white">
                                Enterprise Resource Planning
                            </div>



                            <p className="mt-12 max-w-[330px] text-[18px] leading-9 text-white/65">
                                Secure enterprise workspace for managing operations, finance, and business resources in one place.
                            </p>
                        </div>

                        <div className="relative mt-12 overflow-hidden bg-[linear-gradient(180deg,rgba(20,31,58,0.75),rgba(14,23,43,0.9))] px-10 py-12">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-[24px] font-semibold text-white">99.9%</div>
                                    <div className="mt-1 text-[12px] uppercase tracking-[0.08em] text-white/35">
                                        Platform Availability
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[24px] font-semibold text-white">
                                        Enterprise
                                    </div>
                                    <div className="mt-1 text-[12px] uppercase tracking-[0.08em] text-white/35">
                                        Security
                                    </div>
                                </div>
                            </div>

                            <div className="mt-28 flex items-center gap-4 text-white/35">
                                <div className="h-[4px] w-12 rounded-full bg-white/35" />
                                <span className="text-[12px] uppercase tracking-[0.22em]">
                                    LedgerOne Core v1.0.0
                                </span>
                            </div>

                            {/* Decorative chain-like block */}
                            <div className="pointer-events-none absolute bottom-0 right-0 h-[220px] w-[220px] rounded-tl-[120px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_40%,transparent_70%)] opacity-70" />
                        </div>
                    </div>

                    {/* Right login panel */}
                    <div className="flex items-center justify-center bg-[#f7f7fb] px-8 py-12 md:px-16 lg:px-24">
                        <div className="w-full max-w-[520px]">
                            <h2 className="text-[56px] font-semibold leading-tight tracking-[-0.04em] text-[#101828]">
                                Sign in to workspace
                            </h2>



                            <div className="mt-14 space-y-7">
                                <div>
                                    <label className="mb-3 block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#3f3f46]">
                                        Email
                                    </label>
                                    <div className="flex h-14 items-center gap-3 bg-[#eef1f7] px-4 text-[#98a2b3]">
                                        <Mail className="h-4 w-4" />
                                        <input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email"
                                            placeholder="name@company.com"
                                            className="w-full bg-transparent text-[16px] text-[#111827] outline-none placeholder:text-[#b0b8c7]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <label className="block text-[13px] font-semibold uppercase tracking-[0.08em] text-[#3f3f46]">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            className="text-[14px] font-medium text-[#0d56c9] hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    <div className="flex h-14 items-center gap-3 bg-[#eef1f7] px-4 text-[#98a2b3]">
                                        <Lock className="h-4 w-4" />
                                        <input
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            type="password"
                                            placeholder="••••••••••••"
                                            className="w-full bg-transparent text-[16px] text-[#111827] outline-none placeholder:text-[#b0b8c7]"
                                        />
                                    </div>
                                </div>



                                <Button
                                    onClick={handleLogin}
                                    className="h-14 w-full rounded-[6px] bg-[#0d56c9] text-[18px] font-semibold text-white shadow-[0_8px_20px_rgba(13,86,201,0.28)] hover:bg-[#0b4db5]"
                                >
                                    Sign In to Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>

                                <div className="flex items-center gap-4 pt-6">
                                    <div className="h-px flex-1 bg-[#d9deea]" />
                                    <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">
                                        Enterprise Authentication
                                    </span>
                                    <div className="h-px flex-1 bg-[#d9deea]" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => startHostedLogin()}
                                    className="flex h-14 w-full items-center justify-center gap-3 border border-[#d1d5db] bg-white text-[16px] font-semibold text-[#111827] transition hover:bg-[#f8fafc]"
                                >
                                    <Fingerprint className="h-5 w-5 text-[#0d56c9]" />
                                    Sign in with Corporate SSO
                                </button>

                                <div className="pt-20 text-center">
                                    <p className="text-[15px] text-[#6b7280]">
                                        Having trouble logging in?{" "}
                                        <button
                                            type="button"
                                            className="font-medium text-[#0d56c9] hover:underline"
                                        >
                                            Contact System Administrator
                                        </button>
                                    </p>


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
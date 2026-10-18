"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginStart, loginSuccess, loginFailure } from "@/store/slices/authSlice";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import { AuthShell } from "@/components/site/AuthShell";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<"identifier" | "password">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated:
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleIdentifierNext = () => {
    if (!identifier.trim()) {
      toast.error("Please enter your email or username.");
      return;
    }
    setStep("password");
  };

  const handleLoginSubmit = async () => {
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setSubmitting(true);
    dispatch(loginStart());

    try {
      const res = await api.post("/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      const loggedInUser = res.data.data.user;
      dispatch(loginSuccess({ user: loggedInUser }));
      toast.success(`Welcome back, ${loggedInUser.name}!`);

      if (!loggedInUser.isOnboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      dispatch(loginFailure(msg));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      tagline="Welcome back."
      topRight={
        step === "password" && (
          <button
            type="button"
            onClick={() => setStep("identifier")}
            className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>change username</span>
          </button>
        )
      }
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-zinc-900 underline underline-offset-4 hover:text-black">
            Create free account
          </Link>
        </>
      }
    >
      <h1 className="mb-10 font-display text-4xl tracking-[-0.03em] text-zinc-950">Sign in to remind</h1>
      {step === "identifier" && (
        <SmoothInput
          variant="underline"
          label="SIGN IN"
          placeholder="you@example.com or @username"
          value={identifier}
          autoFocus
          onChange={(e) => setIdentifier(e.target.value)}
          onEnter={handleIdentifierNext}
          statusMessage={
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 font-mono">
              <span>Enter your email or @username</span>
              {identifier.length > 2 && (
                <span className="text-neutral-900 font-medium">Press [ enter ↵ ]</span>
              )}
            </div>
          }
        />
      )}

      {step === "password" && (
        <SmoothInput
          variant="underline"
          label="PASSWORD"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
          onEnter={handleLoginSubmit}
          rightElement={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : password ? (
                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  className="text-xs font-mono text-neutral-400 hover:text-black transition-colors cursor-pointer"
                >
                  [ enter ↵ ]
                </button>
              ) : (
                <span className="text-neutral-400 text-sm">→</span>
              )}
            </div>
          }
          statusMessage={
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 font-mono">
              <span>Logging in as {identifier}</span>
              <span className="text-neutral-900 font-medium">Press [ enter ↵ ]</span>
            </div>
          }
        />
      )}
    </AuthShell>
  );
}

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

type LoginStep = "identifier" | "password" | "code" | "newPassword";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<LoginStep>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Passwordless (email code) login
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // After a code login the session exists; we hold the user until the new password is set or skipped
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  // Resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const finishLogin = (loggedInUser: any) => {
    dispatch(loginSuccess({ user: loggedInUser }));
    toast.success(`Welcome back, ${loggedInUser.name}!`);
    router.push(loggedInUser.isOnboarded ? "/dashboard" : "/onboarding");
  };

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
      finishLogin(res.data.data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      dispatch(loginFailure(msg));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendCode = async () => {
    if (!identifier.trim()) {
      toast.error("Please enter your email or username first.");
      setStep("identifier");
      return;
    }

    setSendingCode(true);
    try {
      const res = await api.post("/auth/login/send-otp", { identifier: identifier.trim() });
      setMaskedEmail(res.data.maskedEmail || "your email");
      setDebugOtp(res.data.debugOtp || null);
      setCode("");
      setResendTimer(30);
      setStep("code");
      toast.success(res.data.message || "Login code sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not send a login code. Please try again.");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    dispatch(loginStart());

    try {
      const res = await api.post("/auth/login/verify-otp", {
        identifier: identifier.trim(),
        code: code.trim(),
      });
      // Signed in; offer a new password before entering the app
      setPendingUser(res.data.data.user);
      setNewPassword("");
      setStep("newPassword");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired code.";
      dispatch(loginFailure(msg));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNewPassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Use at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/password", { password: newPassword });
      toast.success("Password updated.");
      finishLogin(pendingUser);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not update the password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipNewPassword = () => finishLogin(pendingUser);

  const backLabel = step === "code" ? "use password" : "change username";

  return (
    <AuthShell
      tagline="Welcome back."
      topRight={
        step !== "identifier" && step !== "newPassword" && (
          <button
            type="button"
            onClick={() => setStep(step === "code" ? "password" : "identifier")}
            className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>{backLabel}</span>
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
      <h1 className="mb-10 font-display text-4xl tracking-[-0.03em] text-zinc-950">
        {step === "code" ? "Check your email" : step === "newPassword" ? "Set a new password" : "Sign in to remind"}
      </h1>

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
              {identifier.length > 2 && <span className="text-neutral-900 font-medium">Press [ enter ↵ ]</span>}
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
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Logging in as {identifier}</span>
                <span className="text-neutral-900 font-medium">Press [ enter ↵ ]</span>
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
                className="flex cursor-pointer items-center gap-2 text-xs font-mono text-neutral-500 hover:text-black transition-colors disabled:opacity-60"
              >
                {sendingCode && <Loader2 className="h-3 w-3 animate-spin" />}
                Forgot password? Email me a login code →
              </button>
            </div>
          }
        />
      )}

      {step === "code" && (
        <SmoothInput
          variant="underline"
          label="LOGIN CODE"
          placeholder="• • • • • •"
          value={code}
          autoFocus
          maxLength={6}
          inputMode="numeric"
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          onEnter={handleVerifyCode}
          rightElement={
            submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            ) : code.length === 6 ? (
              <button
                type="button"
                onClick={handleVerifyCode}
                className="text-xs font-mono text-neutral-400 hover:text-black transition-colors cursor-pointer"
              >
                [ enter ↵ ]
              </button>
            ) : undefined
          }
          statusMessage={
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Sent to {maskedEmail}. Valid for 5 minutes.</span>
                {resendTimer > 0 ? (
                  <span>resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="text-neutral-900 hover:underline cursor-pointer disabled:opacity-60"
                  >
                    resend code
                  </button>
                )}
              </div>
              {debugOtp && (
                <div className="text-[11px] font-mono text-neutral-500 pt-1">
                  Development OTP: <strong className="text-black">{debugOtp}</strong>
                </div>
              )}
            </div>
          }
        />
      )}

      {step === "newPassword" && (
        <SmoothInput
          variant="underline"
          label="NEW PASSWORD"
          type={showNewPassword ? "text" : "password"}
          placeholder="at least 6 characters"
          value={newPassword}
          autoFocus
          onChange={(e) => setNewPassword(e.target.value)}
          onEnter={handleSaveNewPassword}
          rightElement={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer p-0.5"
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : newPassword.length >= 6 ? (
                <button
                  type="button"
                  onClick={handleSaveNewPassword}
                  className="text-xs font-mono text-neutral-400 hover:text-black transition-colors cursor-pointer"
                >
                  [ enter ↵ ]
                </button>
              ) : undefined}
            </div>
          }
          statusMessage={
            <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>You&apos;re signed in. Choose a password you&apos;ll remember.</span>
              <button
                type="button"
                onClick={handleSkipNewPassword}
                disabled={submitting}
                className="text-neutral-900 hover:underline cursor-pointer disabled:opacity-60"
              >
                skip for now
              </button>
            </div>
          }
        />
      )}
    </AuthShell>
  );
}

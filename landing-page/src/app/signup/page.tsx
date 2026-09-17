"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { registerSuccess } from "@/store/slices/authSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { SmoothInput } from "@/components/ui/skiper-ui/skiper106";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";

type SignupStep = "email" | "otp" | "name" | "username" | "password";

export default function SignUpPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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

  const [currentStep, setCurrentStep] = useState<SignupStep>("email");

  // Step 1: Email & Brevo OTP
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Step 2: Name & Username
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const debouncedUsername = useDebounce(username.trim().toLowerCase(), 400);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({
    checked: false,
    available: false,
    message: "",
  });

  // Step 3: Password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Debounced check for username availability
  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameStatus({ checked: false, available: false, message: "" });
      setCheckingUsername(false);
      return;
    }

    const isValidFormat = /^[a-zA-Z0-9_]{3,20}$/.test(debouncedUsername);
    if (!isValidFormat) {
      setUsernameStatus({
        checked: true,
        available: false,
        message: "3-20 letters, numbers, or underscores only",
      });
      setCheckingUsername(false);
      return;
    }

    let isMounted = true;
    setCheckingUsername(true);

    api
      .get(`/auth/check-username?username=${encodeURIComponent(debouncedUsername)}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data.available) {
          setUsernameStatus({
            checked: true,
            available: true,
            message: `@${debouncedUsername} is available!`,
          });
        } else {
          setUsernameStatus({
            checked: true,
            available: false,
            message: res.data.message || `@${debouncedUsername} is already taken`,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setUsernameStatus({
          checked: true,
          available: false,
          message: err.response?.data?.message || "Error checking username",
        });
      })
      .finally(() => {
        if (isMounted) setCheckingUsername(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedUsername]);

  // 1. Send OTP
  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSendingOtp(true);
    setDebugOtp(null);

    try {
      const res = await api.post("/auth/send-otp", { identifier: email, type: "EMAIL" });
      setResendTimer(60);
      if (res.data.debugOtp) {
        setDebugOtp(res.data.debugOtp);
      }
      toast.success(`Verification code sent to ${email}`);
      setCurrentStep("otp");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    if (otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const res = await api.post("/auth/verify-otp", {
        identifier: email,
        code: otpCode.trim(),
        type: "EMAIL",
      });

      if (res.data.success && res.data.emailVerificationToken) {
        setEmailVerificationToken(res.data.emailVerificationToken);
        toast.success("Email verified!");
        setCurrentStep("name");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3. Name to Username
  const handleNameNext = () => {
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    setCurrentStep("username");
  };

  // 4. Username to Password
  const handleUsernameNext = () => {
    if (!usernameStatus.available || checkingUsername) {
      toast.error("Please pick an available username.");
      return;
    }
    setCurrentStep("password");
  };

  // 5. Final Register & Cookie Set
  const handleFinalRegister = async () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setCreatingAccount(true);

    try {
      const res = await api.post("/auth/register", {
        email,
        emailVerificationToken,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password,
      });

      const registeredUser = res.data.data.user;
      dispatch(registerSuccess({ user: registeredUser }));
      toast.success("Account created! Let's set up your reminder preferences.");
      router.push("/onboarding");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-6 sm:px-12 bg-white text-[#151515] font-sans antialiased selection:bg-neutral-200">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter text-[#151515] hover:opacity-70 transition-opacity"
        >
          remind
        </Link>

        {currentStep !== "email" && (
          <button
            type="button"
            onClick={() => {
              if (currentStep === "otp") setCurrentStep("email");
              else if (currentStep === "name") setCurrentStep("otp");
              else if (currentStep === "username") setCurrentStep("name");
              else if (currentStep === "password") setCurrentStep("username");
            }}
            className="text-xs font-mono text-neutral-400 hover:text-black flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>back</span>
          </button>
        )}
      </header>

      {/* Main Centered Minimalist Input Experience */}
      <main className="w-full max-w-xl mx-auto my-auto py-12">
        {/* ================= STEP 1: EMAIL ================= */}
        {currentStep === "email" && (
          <SmoothInput
            variant="underline"
            label="EMAIL ADDRESS"
            placeholder="you@example.com"
            value={email}
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            onEnter={handleSendOtp}
            rightElement={
              isSendingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : undefined
            }
            statusMessage={
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 font-mono">
                <span>Enter your email to receive a 6-digit verification code.</span>
              </div>
            }
          />
        )}

        {/* ================= STEP 2: OTP (Screen 3 style) ================= */}
        {currentStep === "otp" && (
          <SmoothInput
            variant="underline"
            label="ONE TIME PASSWORD"
            placeholder="• • • • • •"
            value={otpCode}
            autoFocus
            maxLength={6}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
            onEnter={handleVerifyOtp}
            rightElement={
              isVerifyingOtp ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : undefined
            }
            statusMessage={
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                  <span>Sent to {email}</span>
                  {resendTimer > 0 ? (
                    <span>resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-neutral-900 hover:underline cursor-pointer"
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

        {/* ================= STEP 3: FULL NAME ================= */}
        {currentStep === "name" && (
          <SmoothInput
            variant="underline"
            label="FULL NAME"
            placeholder="Alex Morgan"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onEnter={handleNameNext}
            statusMessage={
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {email} verified
                </span>
                <span>Press [ enter ↵ ]</span>
              </div>
            }
          />
        )}

        {/* ================= STEP 4: USERNAME WITH DEBOUNCING ================= */}
        {currentStep === "username" && (
          <SmoothInput
            variant="underline"
            label="CHOOSE USERNAME"
            placeholder="alexmorgan"
            value={username}
            autoFocus
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
            onEnter={handleUsernameNext}
            rightElement={
              checkingUsername ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : undefined
            }
            statusMessage={
              <div className="flex items-center justify-between text-xs pt-2 font-mono">
                {usernameStatus.checked ? (
                  <span
                    className={
                      usernameStatus.available ? "text-emerald-600 font-medium" : "text-red-500"
                    }
                  >
                    {usernameStatus.message}
                  </span>
                ) : (
                  <span className="text-neutral-400">Unique handle for your account.</span>
                )}
                {usernameStatus.available && (
                  <span className="text-neutral-400">Press [ enter ↵ ]</span>
                )}
              </div>
            }
          />
        )}

        {/* ================= STEP 5: PASSWORD ================= */}
        {currentStep === "password" && (
          <SmoothInput
            variant="underline"
            label="PASSWORD"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            onEnter={handleFinalRegister}
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
                {creatingAccount ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                ) : password ? (
                  <button
                    type="button"
                    onClick={handleFinalRegister}
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
                <span>At least 6 characters • 3-day free plan included</span>
                {password.length >= 6 && (
                  <span className="text-neutral-900 font-medium">Press [ enter ↵ ]</span>
                )}
              </div>
            }
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="max-w-4xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-neutral-900 underline underline-offset-4 hover:text-black"
          >
            Sign in
          </Link>
        </p>

        <p className="text-[11px] text-neutral-400">
          Remind Created & Developed by{" "}
          <a
            href="https://bpss.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 underline underline-offset-2 hover:text-black transition-colors"
          >
            bpss.in
          </a>{" "}
          &{" "}
          <a
            href="https://www.rambhardwaj.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 underline underline-offset-2 hover:text-black transition-colors"
          >
            rambhardwaj.in
          </a>
        </p>
      </footer>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, Mail, KeyRound, AlertCircle, ArrowLeft, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { setToken, isAuthenticated } from "@/lib/auth";
import { EMAIL_REGEX } from "@/lib/constants";

type FormState = "login" | "otp" | "forgot-password";

export default function LoginPage() {
  const router = useRouter();

  // State managers
  const [viewState, setViewState] = React.useState<FormState>("login");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Form fields
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");

  // Validation messages
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [otpAttempts, setOtpAttempts] = React.useState(3);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Clear inputs when state shifts
  React.useEffect(() => {
    setEmailError("");
    setPasswordError("");
    setOtpError("");
    setPassword("");
    setOtp("");
  }, [viewState]);

  // Paste handler for OTP input
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    if (pastedText && /^\d+$/.test(pastedText)) {
      setOtp(pastedText.slice(0, 8));
    }
  };

  // Submit standard login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    let isValid = true;
    if (!email) {
      setEmailError("Enter email");
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Invalid email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Enter a password");
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      // The API call returns a token or standard 200 status when OTP flow is triggered
      const res = await apiClient.post<any>(ENDPOINTS.auth.login, {
        body: { email, password },
      });

      // Backend config check: if response has no token and OTP is required
      // (either status is 200 without token, or has OTP request flag)
      if (res?.status === 200 && !res?.token) {
        setViewState("otp");
        toast.info("OTP code sent", {
          description: "Please check your email inbox for a temporary access code.",
        });
      } else if (res?.token) {
        setToken(res.token);
        toast.success("Login successful", {
          description: "Welcome back to VIEMS.",
        });
        router.push("/dashboard");
      } else {
        // Fallback checks
        setViewState("otp");
      }
    } catch (err: any) {
      const msg = err?.message || "Invalid credentials. Please try again.";
      toast.error("Login failed", { description: msg });
      
      // Specifically handle locked accounts
      if (msg.includes("locked") || msg.includes("3 times")) {
        setPasswordError(msg);
      } else {
        setPasswordError("Incorrect email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (!otp || otp.length < 4) {
      setOtpError("Enter the 4-digit access code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post<any>(ENDPOINTS.auth.otpVerify, {
        body: { email, otppass: otp },
      });

      if (res?.token) {
        setToken(res.token);
        toast.success("Verification successful", {
          description: "Welcome back to VIEMS.",
        });
        router.push("/dashboard");
      } else {
        throw new Error("No authentication token received.");
      }
    } catch (err: any) {
      const remaining = otpAttempts - 1;
      setOtpAttempts(remaining);

      const msg = err?.message || "Incorrect code. Please check it and try again.";
      setOtpError(msg);
      toast.error("Verification failed", { description: msg });

      if (remaining <= 0) {
        toast.error("Too many incorrect attempts", {
          description: "Please restart the login process.",
        });
        setViewState("login");
        setOtpAttempts(3);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password Recovery Request
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Enter email");
      return;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Invalid email");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(ENDPOINTS.auth.reset, {
        body: { email },
      });

      toast.success("Recovery instructions sent", {
        description: "Please check your email for password reset instructions.",
      });
      setViewState("login");
    } catch (err: any) {
      const msg = err?.message || "Failed to process recovery request.";
      setEmailError(msg);
      toast.error("Request failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* ─── STATE 1: Standard Login Card ────────────────────────────────────── */}
      {viewState === "login" && (
        <div className="flex-1 flex flex-col justify-center pb-30">
          <Card className="border-border bg-white text-card-foreground shadow-card-large p-xl rounded-card border border-neutral-200">
            <CardHeader className="text-center pb-md">
              <CardTitle className="text-h5-title font-bold tracking-tight text-neutral-900">
                Log in to Viems
              </CardTitle>
              <CardDescription className="text-paragraph-sm text-neutral-400">
                Enter your details to login.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-xl">
                {/* Social Login Buttons */}
                <div className="flex gap-md w-full">
                  <Button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-xs bg-black !text-white hover:bg-neutral-900 h-10 rounded-button text-label-sm font-semibold border-0 transition-colors cursor-pointer"
                    disabled={isLoading}
                  >
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.2005 7.96903C10.2216 10.239 12.1919 10.9944 12.2137 11.004C12.1971 11.0573 11.8989 12.0805 11.1757 13.1374C10.5505 14.0512 9.90163 14.9616 8.87947 14.9805C7.87509 14.999 7.55213 14.3849 6.40384 14.3849C5.25591 14.3849 4.89708 14.9616 3.94633 14.999C2.95968 15.0364 2.20834 14.0109 1.57798 13.1005C0.289852 11.2382 -0.694542 7.83808 0.62725 5.54296C1.28389 4.40319 2.45735 3.68144 3.73104 3.66293C4.6999 3.64445 5.61436 4.31475 6.20666 4.31475C6.79859 4.31475 7.90986 3.50866 9.07812 3.62704C9.5672 3.6474 10.9401 3.8246 11.8216 5.11495C11.7506 5.15898 10.1835 6.07125 10.2005 7.96903ZM8.31293 2.39498C8.83675 1.76092 9.1893 0.878249 9.09312 0C8.33808 0.0303463 7.42507 0.503138 6.88349 1.13685C6.39814 1.69803 5.97308 2.59623 6.08777 3.4571C6.92935 3.52221 7.78909 3.02944 8.31293 2.39498Z" fill="white"/>
                    </svg>
                    Log In with Apple
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-xs bg-[#F14336] !text-white hover:bg-[#d83529] h-10 rounded-button text-label-sm font-semibold border-0 transition-colors cursor-pointer"
                    disabled={isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.1531 8.63647V11.541H14.2718C14.091 12.4751 13.5482 13.2661 12.7342 13.7979L15.218 15.6866C16.6651 14.3775 17.5 12.4547 17.5 10.1706C17.5 9.63884 17.4513 9.12742 17.3609 8.63656L10.1531 8.63647Z" fill="white"/>
                      <path d="M3.32103 6.63867C2.79926 7.64773 2.50012 8.78639 2.50012 10C2.50012 11.2136 2.79926 12.3523 3.32103 13.3613C3.32103 13.3681 5.86747 11.425 5.86747 11.425C5.71441 10.975 5.62394 10.4977 5.62394 9.99993C5.62394 9.50214 5.71441 9.02489 5.86747 8.57489L3.32103 6.63867Z" fill="white"/>
                      <path d="M10.153 5.48638C11.2801 5.48638 12.2819 5.86819 13.082 6.60457L15.2736 4.45685C13.9447 3.24323 12.2194 2.5 10.153 2.5C7.16135 2.5 4.5802 4.1841 3.32092 6.63866L5.86728 8.57504C6.47254 6.80229 8.1632 5.48638 10.153 5.48638Z" fill="white"/>
                      <path d="M5.86399 11.4277L5.30381 11.848L3.32092 13.3616C4.5802 15.8093 7.1612 17.5003 10.1528 17.5003C12.2191 17.5003 13.9515 16.8321 15.2178 15.6866L12.734 13.798C12.0522 14.248 11.1825 14.5207 10.1528 14.5207C8.16304 14.5207 6.47245 13.2048 5.86712 11.4321L5.86399 11.4277Z" fill="white"/>
                    </svg>
                    Log In with Google
                  </Button>
                </div>

                {/* OR Separator */}
                <div className="flex items-center gap-sm text-neutral-400 text-label-xs font-semibold select-none">
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                  OR
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                <Field>
                  <FieldLabel className="text-label-sm font-semibold text-neutral-800">
                    Email Address
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="pl-10 rounded-input border-neutral-200 focus-visible:border-neutral-900 focus-visible:shadow-important-focus w-full"
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <FieldError className="flex items-center gap-xs text-error-dark mt-xs">
                      <AlertCircle className="size-3" />
                      {emailError}
                    </FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel className="text-label-sm font-semibold text-neutral-800">
                    Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 rounded-input border-neutral-200 focus-visible:border-neutral-900 focus-visible:shadow-important-focus w-full"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <FieldError className="flex items-center gap-xs text-error-dark mt-xs">
                      <AlertCircle className="size-3" />
                      {passwordError}
                    </FieldError>
                  )}
                </Field>

                <div className="flex items-center justify-between -mt-sm">
                  <div className="flex items-center gap-sm">
                    <Checkbox id="keep-logged-in" className="size-4 rounded-compact border-neutral-300 data-[state=checked]:bg-brand-medium data-[state=checked]:border-brand-medium" />
                    <label
                      htmlFor="keep-logged-in"
                      className="text-label-sm font-medium text-neutral-600 cursor-pointer select-none"
                    >
                      Keep me logged in
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewState("forgot-password")}
                    className="text-label-sm font-medium text-brand-medium hover:text-brand-dark hover:underline transition-colors bg-transparent border-0 cursor-pointer"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-11 font-medium bg-brand-medium text-white hover:bg-brand-dark rounded-button shadow-x-small transition-colors justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── STATE 2: OTP Verification (Canvas Integrated) ─────────────────── */}
      {viewState === "otp" && (
        <div className="flex flex-col w-full animate-fade-in max-w-[392px] mx-auto">
          {/* Back button above form title */}
          <div className="flex justify-start mb-[86px] md:-ml-[39px]">
            <button
              type="button"
              onClick={() => setViewState("login")}
              className="group inline-flex items-center gap-lg text-label-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center size-7 bg-white group-hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-compact shadow-x-small transition-colors">
                <ArrowLeft className="size-4 shrink-0" />
              </span>
              <span>Back</span>
            </button>
          </div>

          <div className="flex flex-col gap-2xl w-full">
            <div className="flex flex-col gap-sm text-center pb-lg border-b border-neutral-200">
              <h1 className="text-h5-title font-bold tracking-tight text-neutral-900">
                Enter verification code
              </h1>
              <p className="text-paragraph-md text-neutral-500">
                We've sent a code to <strong className="font-semibold text-neutral-900">{email}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2xl">
              <form onSubmit={handleOtpSubmit} className="flex flex-col gap-2xl">
                <div onPaste={handleOtpPaste} className="w-full flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={otp}
                    onChange={(val) => setOtp(val)}
                    disabled={isLoading}
                    autoFocus
                    containerClassName="w-full justify-center"
                  >
                    <InputOTPGroup className="w-full max-w-[392px] grid grid-cols-4 gap-[10px] justify-between">
                      <InputOTPSlot index={0} className="h-16 w-full border border-neutral-200 rounded-input bg-white text-[24px] font-medium text-neutral-900 shadow-x-small first:rounded-input last:rounded-input first:border-l data-[active=true]:border-neutral-900 data-[active=true]:ring-3 data-[active=true]:ring-neutral-900/10 transition-all" />
                      <InputOTPSlot index={1} className="h-16 w-full border border-neutral-200 rounded-input bg-white text-[24px] font-medium text-neutral-900 shadow-x-small first:rounded-input last:rounded-input first:border-l data-[active=true]:border-neutral-900 data-[active=true]:ring-3 data-[active=true]:ring-neutral-900/10 transition-all" />
                      <InputOTPSlot index={2} className="h-16 w-full border border-neutral-200 rounded-input bg-white text-[24px] font-medium text-neutral-900 shadow-x-small first:rounded-input last:rounded-input first:border-l data-[active=true]:border-neutral-900 data-[active=true]:ring-3 data-[active=true]:ring-neutral-900/10 transition-all" />
                      <InputOTPSlot index={3} className="h-16 w-full border border-neutral-200 rounded-input bg-white text-[24px] font-medium text-neutral-900 shadow-x-small first:rounded-input last:rounded-input first:border-l data-[active=true]:border-neutral-900 data-[active=true]:ring-3 data-[active=true]:ring-neutral-900/10 transition-all" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError && (
                  <FieldError className="flex items-center gap-xs text-error-dark text-center justify-center">
                    <AlertCircle className="size-3 shrink-0" />
                    {otpError}
                  </FieldError>
                )}

                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-9 font-semibold bg-[#7D52F4] text-white hover:bg-brand-dark rounded-[8px] shadow-x-small transition-colors justify-center disabled:bg-[#7D52F4] disabled:text-white disabled:opacity-50"
                  disabled={isLoading || otp.length < 4}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>

              <div className="flex flex-col items-center gap-xs">
                <span className="text-paragraph-sm text-neutral-500 font-medium">
                  Experiencing issues receiving the code?
                </span>
                <button
                  type="button"
                  className="text-label-sm font-medium text-neutral-900 underline hover:text-neutral-700 transition-colors bg-transparent border-0 cursor-pointer"
                  disabled={isLoading}
                >
                  Resend code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STATE 3: Reset Password (Canvas Integrated) ────────────────────── */}
      {viewState === "forgot-password" && (
        <div className="flex flex-col w-full animate-fade-in max-w-[392px] mx-auto">
          {/* Back button above form title */}
          <div className="flex justify-start mb-[86px] md:-ml-[39px]">
            <button
              type="button"
              onClick={() => setViewState("login")}
              className="group inline-flex items-center gap-lg text-label-sm text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center size-7 bg-white group-hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-compact shadow-x-small transition-colors">
                <ArrowLeft className="size-4 shrink-0" />
              </span>
              <span>Back</span>
            </button>
          </div>

          <div className="flex flex-col gap-2xl w-full">
            <div className="flex flex-col gap-sm text-center pb-lg border-b border-neutral-200">
              <h1 className="text-h5-title font-bold tracking-tight text-neutral-900">
                Reset Password
              </h1>
              <p className="text-paragraph-md text-neutral-500">
                Enter your email to reset your password.
              </p>
            </div>

            <div className="flex flex-col gap-2xl">
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-2xl">
                <Field>
                  <FieldLabel className="text-label-sm font-semibold text-neutral-800">
                    Email Address
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="pl-11 h-10 rounded-input border-neutral-200 bg-white focus-visible:border-neutral-900 focus-visible:shadow-important-focus w-full text-paragraph-sm"
                      disabled={isLoading}
                    />
                  </div>
                  {emailError && (
                    <FieldError className="flex items-center gap-xs text-error-dark mt-xs">
                      <AlertCircle className="size-3" />
                      {emailError}
                    </FieldError>
                  )}
                  {/* Info Tip below input */}
                  <div className="flex items-start gap-xs text-neutral-500 mt-sm select-none">
                    <Info className="size-4 text-neutral-400 shrink-0 mt-[2px]" />
                    <span className="text-paragraph-xs leading-normal">
                      Enter the email that you used to register with.
                    </span>
                  </div>
                </Field>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-11 font-medium bg-[#262626] text-white hover:bg-neutral-800 rounded-button shadow-x-small transition-colors justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      Sending...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>

              <div className="flex flex-col items-center gap-xs">
                <span className="text-paragraph-sm text-neutral-500 font-medium">Don't have access anymore?</span>
                <button
                  type="button"
                  className="text-label-sm font-medium text-neutral-900 underline hover:text-neutral-700 transition-colors bg-transparent border-0 cursor-pointer"
                  disabled={isLoading}
                >
                  Try another method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

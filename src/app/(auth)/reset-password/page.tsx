"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, AlertCircle, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters
  const token = searchParams.get("expired") || "";
  const expiredTimeStr = searchParams.get("expiredtime");

  const [isLinkValid, setIsLinkValid] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Form fields
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Validation errors
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");

  // Validate link expiration on mount
  React.useEffect(() => {
    if (!token || !expiredTimeStr) {
      setIsLinkValid(false);
      return;
    }

    const expiryMs = parseInt(expiredTimeStr, 10);
    if (isNaN(expiryMs) || expiryMs < Date.now()) {
      setIsLinkValid(false);
    }
  }, [token, expiredTimeStr]);

  // Submit new password setting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;
    if (!password) {
      setPasswordError("Enter a correct password");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password should be not less than 8 symbols");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("These passwords didn't match. Try again");
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      await apiClient.post(ENDPOINTS.auth.newPassword, {
        body: { password, confirmPassword, token },
      });

      toast.success("Password reset successful", {
        description: "Your password has been changed. Redirecting to login...",
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Failed to reset password. Link may have expired.";
      toast.error("Operation failed", { description: msg });
      setPasswordError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // If link is expired/invalid, show error card
  if (!isLinkValid) {
    return (
      <Card className="bg-transparent text-card-foreground p-lg border-none shadow-none ring-0">
        <CardHeader className="text-center pb-md">
          <CardTitle className="text-h5-title font-bold tracking-tight text-error-dark flex flex-col items-center gap-sm">
            <AlertCircle className="size-12 text-error-dark shrink-0" />
            Link Expired
          </CardTitle>
          <CardDescription className="text-paragraph-sm text-neutral-500 mt-sm">
            The link you followed has expired or is invalid. Please request a new password recovery link or contact your system Administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-md">
          <Button
            variant="ghost"
            className="h-11 font-medium rounded-button text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="size-4 mr-xs" />
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isFormValid = password && password.length >= 8 && confirmPassword && password === confirmPassword;

  return (
    <Card className="bg-transparent text-card-foreground p-lg border-none shadow-none ring-0">
      <CardHeader className="text-center pb-md">
        <CardTitle className="text-h5-title font-bold tracking-tight text-neutral-900 dark:text-white flex flex-col items-center gap-xs">
          <KeyRound className="size-8 text-brand-medium shrink-0" />
          Reset Password
        </CardTitle>
        <CardDescription className="text-paragraph-sm text-neutral-400">
          Enter your new password below to reset your credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
          <Field>
            <FieldLabel className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-200">
              New Password
            </FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
                <AlertCircle className="size-3 shrink-0" />
                {passwordError}
              </FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Confirm Password
            </FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="pl-10 pr-10 rounded-input border-neutral-200 focus-visible:border-neutral-900 focus-visible:shadow-important-focus w-full"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {confirmPasswordError && (
              <FieldError className="flex items-center gap-xs text-error-dark mt-xs">
                <AlertCircle className="size-3 shrink-0" />
                {confirmPasswordError}
              </FieldError>
            )}
          </Field>

          <Button
            type="submit"
            variant="default"
            className="w-full h-11 font-medium bg-brand-medium text-white hover:bg-brand-dark rounded-button shadow-x-small transition-colors justify-center"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin shrink-0" />
                Setting password...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="bg-transparent text-card-foreground p-lg flex flex-col items-center justify-center min-h-[400px] border-none shadow-none ring-0">
        <Loader2 className="size-8 animate-spin text-brand-medium" />
        <span className="text-paragraph-sm text-neutral-400 mt-sm">Verifying reset link...</span>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

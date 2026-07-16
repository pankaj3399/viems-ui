"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { EMAIL_REGEX, NAME_REGEX } from "@/lib/constants";

import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for required invite query parameter
  const inviteToken = searchParams.get("invite") || searchParams.get("token");

  // State managers
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Form fields
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  // Field validation errors
  const [firstNameError, setFirstNameError] = React.useState("");
  const [lastNameError, setLastNameError] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState("");

  // Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;

    if (!firstName) {
      setFirstNameError("Enter first name");
      isValid = false;
    } else if (!NAME_REGEX.test(firstName)) {
      setFirstNameError("First name contains invalid characters");
      isValid = false;
    }

    if (!lastName) {
      setLastNameError("Enter last name");
      isValid = false;
    } else if (!NAME_REGEX.test(lastName)) {
      setLastNameError("Last name contains invalid characters");
      isValid = false;
    }

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

    if (!agree) {
      toast.error("Terms agreement required", {
        description: "You must agree to the Terms of use to register.",
      });
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      await apiClient.post(ENDPOINTS.auth.register, {
        body: { firstName, lastName, email, password, token: inviteToken },
      });

      toast.success("Registration successful", {
        description: "Your account has been created. Redirecting to login...",
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Registration failed. Please check your inputs.";
      toast.error("Registration failed", { description: msg });
      if (msg.includes("exists") || msg.includes("email")) {
        setEmailError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If no invite code, block access with a clear message
  if (!inviteToken) {
    return (
      <Card className="border-border bg-card text-card-foreground shadow-card-large p-lg">
        <CardHeader className="text-center pb-md">
          <CardTitle className="text-h5-title font-bold tracking-tight text-error-dark flex flex-col items-center gap-sm">
            <AlertCircle className="size-12 text-error-dark shrink-0" />
            Invalid Invitation
          </CardTitle>
          <CardDescription className="text-paragraph-sm text-neutral-500 mt-sm">
            This registration link is invalid, incomplete, or has expired. Please contact your system Administrator or Manager for a new invitation link.
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

  // Check if form is completely valid to enable submit button
  const isFormValid =
    firstName &&
    NAME_REGEX.test(firstName) &&
    lastName &&
    NAME_REGEX.test(lastName) &&
    email &&
    EMAIL_REGEX.test(email) &&
    password &&
    password.length >= 8 &&
    confirmPassword &&
    password === confirmPassword &&
    agree;

  return (
    <Card className="border-border bg-card text-card-foreground shadow-card-large p-lg">
      <CardHeader className="text-center pb-md">
        <CardTitle className="text-h5-title font-bold tracking-tight text-neutral-900 dark:text-white">
          Create your account
        </CardTitle>
        <CardDescription className="text-paragraph-sm text-neutral-400">
          Enter your details below to activate your system profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
          <div className="grid grid-cols-2 gap-md">
            <Field>
              <FieldLabel className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-200">
                First Name
              </FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="pl-10 rounded-input border-neutral-200 focus-visible:border-neutral-900 focus-visible:shadow-important-focus w-full"
                  disabled={isLoading}
                />
              </div>
              {firstNameError && (
                <FieldError className="flex items-center gap-xs text-error-dark mt-xs">
                  <AlertCircle className="size-3 shrink-0" />
                  {firstNameError}
                </FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Last Name
              </FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="pl-10 rounded-input border-neutral-200 focus-visible:border-neutral-900 focus-visible:shadow-important-focus w-full"
                  disabled={isLoading}
                />
              </div>
              {lastNameError && (
                <FieldError className="flex items-center gap-xs text-error-dark mt-xs">
                  <AlertCircle className="size-3 shrink-0" />
                  {lastNameError}
                </FieldError>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-200">
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
                <AlertCircle className="size-3 shrink-0" />
                {emailError}
              </FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel className="text-label-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Password
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

          <div className="flex items-start gap-md">
            <Checkbox
              id="agree"
              checked={agree}
              onCheckedChange={(checked) => setAgree(!!checked)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="agree"
              className="text-paragraph-xs text-neutral-500 leading-normal select-none cursor-pointer"
            >
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                className="font-semibold text-brand-medium hover:text-brand-dark hover:underline transition-colors"
              >
                Terms of use
              </a>
            </label>
          </div>

          <div className="flex flex-col gap-sm pt-sm">
            <Button
              type="submit"
              variant="default"
              className="w-full h-11 font-medium bg-brand-medium text-white hover:bg-brand-dark rounded-button shadow-x-small transition-colors justify-center"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
            <div className="text-center text-paragraph-xs text-neutral-400">
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-brand-medium hover:text-brand-dark hover:underline transition-colors bg-transparent border-0 cursor-pointer"
                onClick={() => router.push("/login")}
                disabled={isLoading}
              >
                Log in
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Card className="border-border bg-card text-card-foreground shadow-card-large p-lg flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-brand-medium" />
        <span className="text-paragraph-sm text-neutral-400 mt-sm">Loading registration...</span>
      </Card>
    }>
      <RegisterForm />
    </Suspense>
  );
}

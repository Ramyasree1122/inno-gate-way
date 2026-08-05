"use client";

import React, { useState } from "react";
import { useForm as useRHForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, Eye, EyeOff, OctagonAlert, AlertCircle } from "lucide-react";
import SvgIcon from "@/components/svgIcons";
import { authService } from "@/services/authService";
import axios from "axios";
import { useRouter } from "next/navigation";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginForm() {
  const [view, setView] = useState<
    "login" | "forgot" | "create-password" | "success"
  >("login");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useAuth();
  const router = useRouter();

  // Forgot password states
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Create password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const form = useRHForm<AdminFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: AdminFormValues) => {
    setError("");
    try {
      const response: any = await authService.loginAdmin(data.email, data.password);
      
      if (response?.access_token || response?.data?.access_token) {
        localStorage.setItem('token', response.access_token || response.data.access_token);
      }
      
      const userObj = { id: '2', email: data.email, role: 'Admin', name: 'Admin' };
      localStorage.setItem('mockUser', JSON.stringify(userObj));

      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to login");
      }
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    const isEmailValid = z.string().email().safeParse(resetEmail).success;
    if (!isEmailValid) {
      setResetError("Please enter a valid email address");
      return;
    }
    setIsSendingReset(true);
    try {
      // Mock API call to send reset link
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResetSent(true);
    } catch (err: unknown) {
      setResetError("Failed to send reset link");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setResetEmail(val);
    if (!val) {
      setResetError("");
      return;
    }
    const isEmailValid = z.string().email().safeParse(val).success;
    if (!isEmailValid) {
      setResetError("Please enter a valid email address");
    } else {
      setResetError("");
    }
  };

  const emailValue = useWatch({ control: form.control, name: "email" });
  const passwordValue = useWatch({ control: form.control, name: "password" });
  const hasValues = emailValue?.length > 0 && passwordValue?.length > 0;

  // Password validation logic
  const isMinLength = newPassword.length >= 8;
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

  const allRulesMet =
    isMinLength && hasLowerCase && hasUpperCase && hasNumber && hasSpecialChar;
  const showMismatchError =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isFormValid = allRulesMet && newPassword === confirmPassword;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setUpdateError("");
    setIsUpdatingPassword(true);
    try {
      // Mock API call to update password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Reset password states
      setNewPassword("");
      setConfirmPassword("");
      setResetEmail("");
      setResetSent(false);
      setView("success");
    } catch (err: unknown) {
      setUpdateError("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col mx-auto">
      {view === "login" ? (
        <>
          {/* Logo */}
          <div className="flex justify-start mb-1">
            <SvgIcon type="radium-ai-icon" width={41} height={41} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-semibold text-neutral-900 mb-3 text-start">
            Sign In
          </h3>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-[#0A0A0A]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your Email"
                className={`flex w-full rounded-md border p-2 text-sm placeholder:text-[#737373] focus-visible:outline-none shadow-xs shadow-[#E5E5E5] disabled:cursor-not-allowed disabled:opacity-50 ${
                  error ? "border-red-500" : "border-[#E5E5E5] "
                }`}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-[#0A0A0A]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  className={`flex w-full rounded-md border p-2 text-sm placeholder:text-[#737373] focus-visible:outline-none focus-visible:ring-1 shadow-xs shadow-[#E5E5E5] focus-visible:ring-[var(--color-brand-purple)] disabled:cursor-not-allowed disabled:opacity-50 pr-10 ${
                    error ? "border-red-500" : "border-[#E5E5E5]"
                  }`}
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#404040]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#404040]" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password link */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setError("");
                }}
                className="text-xs font-semibold bg-gradient-to-r from-[#AC6AEE] to-[#3D30F4] bg-clip-text text-transparent hover:opacity-85 transition-opacity cursor-pointer focus:outline-none"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!form.formState.isValid || isLoading}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none h-10 px-4 py-2 w-full mt-2 ${
                hasValues
                  ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-white hover:opacity-90 cursor-pointer"
                  : "bg-zinc-400 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Continuing...
                </>
              ) : (
                "Continue"
              )}
            </button>
            {error && (
              <div className="text-[#B91C1C] text-xs font-normal p-3 mt-3 border border-[#FECACA] rounded-lg bg-[#FEF2F2] flex">
                <OctagonAlert className="h-4 w-4 me-2" />
                {error}
              </div>
            )}
          </form>
        </>
      ) : view === "forgot" ? (
        !resetSent ? (
          <>
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setView("login");
                setResetEmail("");
                setResetSent(false);
                setResetError("");
              }}
              className="flex items-center gap-2 text-base font-normal text-neutral-900 hover:text-zinc-900 mb-20 cursor-pointer self-start focus:outline-none"
            >
              <SvgIcon type="back-icon" />
              <span>Back</span>
            </button>

            {/* Logo */}
            <div className="flex justify-start mb-1">
              <SvgIcon type="radium-ai-icon" width={41} height={41} />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-semibold text-neutral-900 mb-2 text-start">
              Reset your password
            </h3>

            {/* Subtitle */}
            <p className="text-sm text-[#0A0A0A] mb-2 font-normal">
              Please enter your email and we&apos;ll send you a secure password
              reset link.
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="reset-email"
                  className="text-sm font-medium text-[#0A0A0A]"
                >
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your Email"
                  value={resetEmail}
                  onChange={handleResetEmailChange}
                  className={`flex w-full rounded-md border p-2 text-sm placeholder:text-[#737373] focus-visible:outline-none shadow-xs shadow-[#E5E5E5] disabled:cursor-not-allowed disabled:opacity-50 ${
                    resetError ? "border-red-500" : "border-[#E5E5E5]"
                  }`}
                />
                {resetError && (
                  <p className="text-xs text-red-500">{resetError}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!resetEmail || isSendingReset}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-normal transition-colors focus-visible:outline-none disabled:pointer-events-none h-10 px-4 py-2 w-full mt-2 ${
                  resetEmail && z.string().email().safeParse(resetEmail).success
                    ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-white hover:opacity-90 cursor-pointer"
                    : "bg-zinc-400 text-white"
                }`}
              >
                {isSendingReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center w-full">
            <SvgIcon type="otp-screen-icon" className="mb-6" />

            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">
              Check your inbox
            </h2>

            <p className="text-sm text-center font-normal text-[#0A0A0A] mb-4">
              We&apos;ve sent the password reset link, please check your inbox.
            </p>

            <div className="flex items-center justify-center gap-1 text-xs font-normal mb-4">
              <span className="text-[#0A0A0A]">Didn&apos;t receive it?</span>
              <button
                type="button"
                onClick={() => {
                  setView("create-password");
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] bg-clip-text text-transparent hover:opacity-80 font-medium cursor-pointer"
              >
                Resend Link
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setView("login");
                setResetEmail("");
                setResetSent(false);
                setResetError("");
              }}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none px-4 py-2 w-full bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#171717] cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        )
      ) : view === "create-password" ? (
        <form
          onSubmit={handleUpdatePassword}
          className="w-full flex flex-col text-start"
        >
          {/* Logo / Atom Icon */}
          <div className="flex justify-start mb-2">
            <SvgIcon type="radium-ai-icon" width={41} height={41} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-semibold text-neutral-900 mb-2">
            Create a new password
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-[#0A0A0A] mb-4 font-normal">
            Your new password must be different from your previous password.
          </p>

          {/* Password field */}
          <div className="mb-2">
            <label className="text-sm font-medium text-[#0A0A0A]">
              Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex w-full rounded-md border border-[#E5E5E5] px-3 py-2 text-sm placeholder:text-[#737373] focus-visible:outline-none shadow-xs shadow-[#E5E5E5] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-[#404040]" />
                ) : (
                  <Eye className="h-4 w-4 text-[#404040]" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="mb-4">
            <label className="text-sm font-medium text-[#0A0A0A]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-Enter Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`flex w-full rounded-md border px-3 py-2 text-sm placeholder:text-[#737373] focus-visible:outline-none  shadow-xs shadow-[#E5E5E5] pr-10 ${
                  showMismatchError ? "border-red-500 " : "border-[#E5E5E5] "
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-[#404040]" />
                ) : (
                  <Eye className="h-4 w-4 text-[#404040]" />
                )}
              </button>
            </div>
          </div>

          {/* Password mismatch error banner */}
          {showMismatchError && (
            <div className="text-[#B91C1C] text-xs font-normal p-3 mb-4 border border-[#FECACA] rounded-lg bg-[#FEF2F2] flex items-center justify-start">
              <AlertCircle className="h-4 w-4 me-2 text-[#B91C1C]" />
              <span>Passwords don&apos;t match</span>
            </div>
          )}

          {/* Validation Info Box */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-[#171717] mb-2">
              Your password must contain
            </p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li
                className={
                  isMinLength
                    ? "text-emerald-600 font-medium"
                    : "text-[#262626] font-normal"
                }
              >
                At least 8 characters
              </li>
              <li
                className={
                  hasLowerCase
                    ? "text-emerald-600 font-medium"
                    : "text-[#262626] font-normal"
                }
              >
                One lowercase letter
              </li>
              <li
                className={
                  hasUpperCase
                    ? "text-emerald-600 font-medium"
                    : "text-[#262626] font-normal"
                }
              >
                One uppercase letter
              </li>
              <li
                className={
                  hasNumber
                    ? "text-emerald-600 font-medium"
                    : "text-[#262626] font-normal"
                }
              >
                One number
              </li>
              <li
                className={
                  hasSpecialChar
                    ? "text-emerald-600 font-medium"
                    : "text-[#262626] font-normal"
                }
              >
                One special character
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isUpdatingPassword}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none h-10 px-4 py-2 w-full mt-2 shadow-xs ${
              isFormValid
                ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-[#FAFAFA] hover:opacity-90 cursor-pointer"
                : "bg-zinc-400 text-white"
            }`}
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </button>

          {updateError && (
            <div className="text-[#B91C1C] text-xs font-normal p-3 mt-4 border border-[#FECACA] rounded-lg bg-[#FEF2F2] flex items-center">
              <OctagonAlert className="h-4 w-4 me-2 text-[#B91C1C]" />
              {updateError}
            </div>
          )}
        </form>
      ) : view === "success" ? (
        <div className="flex flex-col items-center w-full text-center">
          <SvgIcon type="password-updated-icon" className="mb-6" />

          <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
            Password updated
          </h2>

          <p className="text-sm font-normal text-[#0A0A0A] mb-4 align-center">
            Your password has been updated successfully.
            <br />
            You can now sign in using your new password.
          </p>

          <button
            type="button"
            onClick={() => {
              setView("login");
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none h-10 px-4 py-2 w-full mt-2 bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-[#FAFAFA] hover:opacity-90 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      ) : null}
    </div>
  );
}

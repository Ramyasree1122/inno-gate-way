"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm as useRHForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, ArrowLeft } from "lucide-react";
import SvgIcon from "@/components/svgIcons";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authService } from "@/services/authService";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 characters"),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export function UserLoginForm() {
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [requestedEmail, setRequestedEmail] = useState("");
  const [error, setError] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const { loginUser, isLoading } = useAuth();
  const [timer, setTimer] = useState(0); // Starts at 0 (resend active, countdown idle)

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer > 0]);

  const handleResend = async () => {
    if (timer > 0) return;
    setError("");
    try {
      await authService.requestOTP(email);
      setTimer(299);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend OTP");
      }
    }
  };

  const emailForm = useRHForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onChange",
  });

  const otpForm = useRHForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setError("");
    const targetEmail = data.email.trim().toLowerCase();
    if (targetEmail === requestedEmail.trim().toLowerCase()) {
      setStep("otp");
      return;
    }

    setIsRequestingOtp(true);
    try {
      await authService.requestOTP(data.email);
      setEmail(data.email);
      setRequestedEmail(data.email);
      setTimer(0); // Initialize timer at 0 so it starts only after clicking Resend
      otpForm.reset({ otp: "" });
      setStep("otp");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to request OTP");
      }
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormValues) => {
    setError("");
    try {
      await loginUser(email, data.otp);
      setStep("success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to login");
      }
    }
  };

  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => {
        router.push("/chat");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  const emailValue = useWatch({ control: emailForm.control, name: "email" });
  const otpValue = useWatch({ control: otpForm.control, name: "otp" });
  const hasEmailValue = emailValue?.length > 0;
  const hasOtpValue = otpValue?.length === 6;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col relative">
      {step === "email" ? (
        <>
          <div className="flex justify-left mb-4">
            <div className="relative flex items-left">
              <SvgIcon type="radium-ai-icon" width={47} height={54} />
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="ff-primary text-2xl font-semibold leading-normal text-neutral-900 mb-2">
              Sign In
            </h3>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-zinc-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your Email"
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-purple)] disabled:cursor-not-allowed disabled:opacity-50"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!emailForm.formState.isValid || isRequestingOtp}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none h-10 px-4 py-2 w-full mt-2 ${
                  hasEmailValue
                    ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-white hover:opacity-90"
                    : "bg-zinc-400 text-white"
                }`}
              >
                {isRequestingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>
        </>
      ) : step === "otp" ? (
        <div className="relative w-full flex flex-col items-center">
          <button
            type="button"
            onClick={() => setStep("email")}
            className="absolute -top-16 -left-12 flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-zinc-900"
          >
            <SvgIcon type="back-icon" />
            <span>Back</span>
          </button>

          <SvgIcon type="otp-screen-icon" className="mb-6" />

          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Check your email
          </h2>
          <p className="text-sm text-center text-zinc-600 mb-6 leading-relaxed">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-semibold text-zinc-900">{email}</span>.
            <br />
            Enter the verification code to continue.
          </p>

          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="w-72 space-y-6"
          >
            <div className="space-y-2 flex flex-col items-center">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-zinc-900 mb-2"
              >
                Verification code
              </label>

              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(val) =>
                  otpForm.setValue("otp", val, { shouldValidate: true })
                }
                className="w-full justify-between"
              >
                <InputOTPGroup className="w-full justify-center">
                  <InputOTPSlot
                    index={0}
                    className="w-12 h-12 border-zinc-200 bg-white"
                  />
                  <InputOTPSlot
                    index={1}
                    className="w-12 h-12 border-zinc-200 bg-white"
                  />
                  <InputOTPSlot
                    index={2}
                    className="w-12 h-12 border-zinc-200 bg-white"
                  />
                  <InputOTPSlot
                    index={3}
                    className="w-12 h-12 border-zinc-200 bg-white"
                  />
                  <InputOTPSlot
                    index={4}
                    className="w-12 h-12 border-zinc-200 bg-white"
                  />
                  <InputOTPSlot
                    index={5}
                    className="w-12 h-12 border-zinc-200 bg-white"
                  />
                </InputOTPGroup>
              </InputOTP>

              {otpForm.formState.errors.otp && (
                <p className="text-xs text-red-500 self-start">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <div className="text-sm text-zinc-700 w-full flex justify-between mt-2">
              {timer > 0 ? (
                <span className="text-[#EF4444] font-medium">
                  {formatTime(timer)}
                </span>
              ) : (
                <span>Didn&apos;t receive the code? </span>
              )}
              <button
                type="button"
                disabled={timer > 0}
                onClick={handleResend}
                className={
                  timer > 0
                    ? "text-[#BDBDBD] cursor-not-allowed font-medium ml-1"
                    : "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] bg-clip-text text-transparent hover:opacity-80 font-medium ml-1 cursor-pointer"
                }
              >
                Resend
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !otpForm.formState.isValid}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none h-10 px-4 py-2 w-full mt-2 ${
                hasOtpValue
                  ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-white hover:opacity-90"
                  : "bg-zinc-400 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </form>
          <div className="bg-[#E9EDFB] rounded text-sm text-black p-3 mt-5">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-extrabold">{emailValue}.</span> Enter the
            Verification code to continue.
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
          <div className="mb-2">
            <SvgIcon type="email-verified-icon" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Email Verified
          </h2>
          <p className="text-sm text-zinc-600 font-medium">
            Your email has been successfully verified.
          </p>
          <p className="text-sm text-zinc-500 font-normal">
            You&apos;ll be redirected in a moment...
          </p>
          <div className="mt-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        </div>
      )}
    </div>
  );
}

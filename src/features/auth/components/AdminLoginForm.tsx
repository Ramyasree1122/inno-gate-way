"use client";

import React, { useState } from "react";
import { useForm as useRHForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminFormValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin, isLoading } = useAuth();

  const form = useRHForm<AdminFormValues>({
    // @ts-expect-error zod version mismatch
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: AdminFormValues) => {
    setError("");
    try {
      await loginAdmin(data.email, data.password);
      // loginAdmin in AuthProvider handles the router.push
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to login");
      }
    }
  };

  const emailValue = useWatch({ control: form.control, name: "email" });
  const passwordValue = useWatch({ control: form.control, name: "password" });
  const hasValues = emailValue?.length > 0 && passwordValue?.length > 0;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col relative">
      <div className="space-y-6">
        <h3 className="ff-primary text-2xl font-semibold leading-normal text-neutral-900 mb-2">
          Sign In
        </h3>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your Email"
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-purple)] disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-purple)] disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-start">
            <Link
              href="#"
              className="text-xs font-medium text-[var(--color-brand-purple)] hover:opacity-80"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none h-10 px-4 py-2 w-full mt-2 ${
              hasValues
                ? "bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-white hover:opacity-90"
                : "bg-[#8A8A8A] text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

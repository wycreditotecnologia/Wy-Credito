"use client";

import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { GoogleLoginButton } from "./GoogleLoginButton";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
}: LoginFormProps) {
  const supabase = createClient();
  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 w-full">
        <p className="text-red-500">Error: Variables de Supabase no configuradas en .env.local</p>
      </div>
    );
  }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const isLocalhost = window.location.hostname === "localhost";

    if (!isLocalhost && !captchaToken) {
      setError("Por favor, completa el captcha");
      setIsLoading(false);
      return;
    }

    try {
      if (!isLocalhost) {
        const verifyRes = await fetch("/api/captcha-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: captchaToken }),
        });
        const verifyData = await verifyRes.json();

        if (!verifyData?.success) {
          setError("Captcha inválido. Inténtalo nuevamente.");
          setIsLoading(false);
          return;
        }
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signInError) {
        setError(signInError.message || "Login failed. Please try again later");
      } else {
        onSuccess?.();
      }
    } catch (e) {
      setError("Fallo al verificar Captcha");
    }
    setIsLoading(false);
  };

  return (
    <div className="sm:rounded-lg sm:border sm:bg-card sm:text-card-foreground sm:shadow-sm w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="text-center text-2xl font-semibold">Welcome back</div>
      </div>
      <div className="p-6 pt-0">
        <div className="">
          <GoogleLoginButton onSuccess={onSuccess} />
          <div className="my-[20px] flex items-center">
            <Separator className="flex-1" />
            <span className="mx-3 text-xs uppercase text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="mb-[4px] h-[22px] text-sm font-medium">Email</div>
            <Input
              id="email"
              type="email"
              placeholder="email"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>



          <div className="my-4">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onSuccess={setCaptchaToken}
              options={{ theme: "dark" }}
            />
          </div>

          <Button
            type="submit"
            className="w-full my-[10px]"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>

          {onSwitchToRegister && (
            <div className="text-center text-sm flex items-center justify-center gap-2">
              <span className="text-center text-muted-foreground">
                Don't have an account?
              </span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="cursor-pointer hover:underline"
                disabled={isLoading}
              >
                Register now
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

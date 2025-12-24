"use client";

import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "The password must be at least six characters long"),
});

type CredentialsFormData = z.infer<typeof credentialsSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
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
  const [emailSent, setEmailSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const credentialsForm = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
  });

  const handleCredentialsSubmit = async (data: CredentialsFormData) => {
    setIsLoading(true);
    setError(null);

    // Validación de Captcha
    const isLocalhost = window.location.hostname === "localhost";

    // Validación de Captcha
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

      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message || "Registration failed. Please try again later");
        setEmailSent(false);
      } else {
        setEmailSent(true);
      }
    } catch (e) {
      setError("Fallo al verificar Captcha");
    }
    setIsLoading(false);
  };

  return (
    <div className="sm:rounded-lg sm:border sm:bg-card sm:text-card-foreground sm:shadow-sm w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center gap-[10px] py-[20px]">
        <div className="text-center text-2xl font-semibold">Create your account</div>
      </div>
      <div className="p-6 pt-0">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!emailSent && (
          <form
            onSubmit={credentialsForm.handleSubmit(handleCredentialsSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="mb-[4px] h-[22px] text-sm font-medium">Email</div>
              <Input
                id="email"
                type="email"
                placeholder="email"
                {...credentialsForm.register("email")}
                disabled={isLoading}
              />
              {credentialsForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {credentialsForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="mb-[4px] h-[22px] text-sm font-medium">
                Password
              </div>
              <Input
                id="password"
                type="password"
                placeholder="password"
                {...credentialsForm.register("password")}
                disabled={isLoading}
              />
              {credentialsForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {credentialsForm.formState.errors.password.message}
                </p>
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
              Create
            </Button>

            {onSwitchToLogin && (
              <div className="text-center text-sm flex items-center justify-center gap-2">
                <span className="text-center text-muted-foreground">
                  Already have an account?
                </span>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="cursor-pointer hover:underline"
                  disabled={isLoading}
                >
                  Login now
                </button>
              </div>
            )}
          </form>
        )}

        {emailSent && (
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground mb-6">
              We sent a verification link to your email. Please check your inbox to complete registration.
            </div>
            {onSwitchToLogin && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="cursor-pointer hover:underline"
                  disabled={isLoading}
                >
                  Go to login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

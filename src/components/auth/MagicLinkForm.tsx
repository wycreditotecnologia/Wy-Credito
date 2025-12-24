"use client";
import React, { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Schema for Login (Magic Link)
const loginSchema = z.object({
  email: z.string().email("Por favor ingresa un email válido"),
});

// Schema for Registration (Full Form)
const registerSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido"),
  phone: z.string().min(7, "El teléfono es requerido"),
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  terms: z.boolean().refine(val => val === true, "Debes aceptar los términos y condiciones"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export function MagicLinkForm({ redirectTo }: { redirectTo?: string }) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Forms
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const onLoginSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const isLocalhost = window.location.hostname === "localhost";

    // Captcha Check for Login
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

      const url = `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { emailRedirectTo: url },
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setSuccessMessage("Enviamos un enlace mágico a tu correo. Haz clic para ingresar.");
      }
    } catch (e: any) {
      setError(e.message || "Error inesperado al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // We define logic for registration here. 
    // Usually requires captcha too but for now enabling simple flow or reusing same token if valid.
    // Assuming captcha is needed for public registration endpoints.

    // Note: Default supabase signUp uses email/password. 
    const { error: signUpError, data: authData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      if (authData.user && !authData.session) {
        setSuccessMessage("Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta.");
      } else {
        // Use auto logged in
        window.location.href = redirectTo || "/solicitud";
      }
    }
    setIsLoading(false);
  };

  if (!supabase) return <div className="text-red-500">Error de configuración Supabase</div>;

  return (
    <Card className="w-full border-slate-200 shadow-sm bg-white dark:bg-black dark:border-gray-800">
      <CardHeader className="pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 gap-2 mb-6">
            <TabsTrigger
              value="login"
              className="h-10 rounded-md border text-slate-600 data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-transparent border-slate-200 dark:border-gray-700 transition-all font-medium"
            >
              Ingresar
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="h-10 rounded-md border text-slate-600 data-[state=active]:bg-brand-primary data-[state=active]:text-white data-[state=active]:border-transparent border-slate-200 dark:border-gray-700 transition-all font-medium"
            >
              Registrarme
            </TabsTrigger>
          </TabsList>

          {/* Common Messages */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && !isLoading && (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold font-heading mb-2 text-wy-dark dark:text-white">¡Listo!</h3>
              <p className="text-slate-600 dark:text-slate-400">{successMessage}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {!successMessage && (
            <TabsContent value="login" className="mt-0 space-y-4 animate-in slide-in-from-left-2 duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-heading text-wy-dark dark:text-white">Bienvenido de nuevo</h2>
                <p className="text-slate-500 text-sm mt-1">Ingresa con tu correo electrónico</p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-slate-700 dark:text-slate-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    {...loginForm.register("email")}
                    disabled={isLoading}
                    className="h-11 shadow-input"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="my-4">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={setCaptchaToken}
                    options={{ theme: "light" }}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-brand-primary hover:bg-brand-hover text-white font-bold text-base shadow-lg shadow-brand-primary/20">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ingresar con Email
                </Button>
              </form>
            </TabsContent>
          )}


          {/* REGISTER FORM */}
          {!successMessage && (
            <TabsContent value="register" className="mt-0 space-y-4 animate-in slide-in-from-right-2 duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-heading text-wy-dark dark:text-white">Crea tu cuenta</h2>
                <p className="text-slate-500 text-sm mt-1">Completa tus datos para empezar</p>
              </div>

              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-700 dark:text-slate-300">Nombre Completo</Label>
                    <Input
                      placeholder="Tu nombre"
                      {...registerForm.register("fullName")}
                      disabled={isLoading}
                      className="h-10 shadow-input"
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-700 dark:text-slate-300">Teléfono</Label>
                    <Input
                      placeholder="300 123 4567"
                      {...registerForm.register("phone")}
                      disabled={isLoading}
                      className="h-10 shadow-input"
                    />
                    {registerForm.formState.errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 dark:text-slate-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    {...registerForm.register("email")}
                    disabled={isLoading}
                    className="h-10 shadow-input"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-700 dark:text-slate-300">Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="........"
                    {...registerForm.register("password")}
                    disabled={isLoading}
                    className="h-10 shadow-input"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id="terms"
                    checked={registerForm.watch("terms")}
                    onCheckedChange={(checked) => registerForm.setValue("terms", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal text-slate-600 dark:text-slate-400 cursor-pointer">
                    Acepto las <span className="text-brand-primary underline">políticas de tratamiento de datos</span>
                  </Label>
                </div>
                {registerForm.formState.errors.terms && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.terms.message}</p>
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-brand-primary hover:bg-brand-hover text-white font-bold text-base shadow-lg shadow-brand-primary/20">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrarme
                </Button>
              </form>
            </TabsContent>
          )}

        </Tabs>
      </CardHeader>
    </Card >
  );
}

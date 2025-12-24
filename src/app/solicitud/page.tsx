"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MasterStepForm from "@/components/solicitud/MasterStepForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Header } from "@/components/landing/Header"; // Import Global Header
import { Footer } from "@/components/landing/Footer"; // Import Global Footer

export default function SolicitudPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login?redirect=/solicitud");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex bg-slate-50 dark:bg-black min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">W</span>
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
              Wy Crédito
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <MasterStepForm
          applicationId={null} // Se creará on-demand
          userId={user.id}
        />
      </main>
    </div>
  );
}

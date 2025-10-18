import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from './landing/Header';
import HeroKit from '@/components/ui/kits/HeroKit.jsx';
import CompactFooter from '@/components/Layout/CompactFooter.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('register'); // 'login' | 'register'

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/solicitud');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setMessageType(null);
    if (!accepted) {
      setError('Debes aceptar las políticas de tratamiento de datos.');
      return;
    }
    if (!email || !password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }
    try {
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            phone: phone || ''
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data?.session) {
        setMessage('Registro enviado. Revisa tu correo para confirmar la cuenta.');
        setMessageType('info');
      } else {
        setMessage('Registro exitoso. Redirigiendo...');
        setMessageType('success');
      }
    } catch (err) {
      setError('Error registrando usuario. ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setMessageType(null);
    if (!email || !password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }
    try {
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      setMessage('Ingreso exitoso. Redirigiendo...');
    } catch (err) {
      setError('Error iniciando sesión. ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/solicitud` : 'http://localhost:3002/solicitud'
        }
      });
    } catch (err) {
      setError('Error iniciando con Google. ' + (err?.message || ''));
    }
  };

  return (
    <>
      <Header />
      <HeroKit
        headline="Accede o crea tu cuenta,"
        highlight="de forma simple y segura."
        subtitle="Inicia sesión con tu correo y contraseña o regístrate para empezar tu solicitud."
        primaryCta={{ label: 'Ir a Solicitud', to: '/solicitud', icon: true }}
            secondaryCta={{ label: 'Conocer Beneficios', href: '#beneficios' }}
        showDefaultContent={false}
      >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <Card className="border border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-text-headline">Accede o crea tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                onClick={() => setMode('login')}
                variant={mode === 'login' ? 'default' : 'outline'}
                className={`flex-1 ${mode === 'login' ? 'bg-brand hover:bg-brand-hover text-white' : ''}`}
              >
                Ingresar
              </Button>
              <Button
                type="button"
                onClick={() => setMode('register')}
                variant={mode === 'register' ? 'default' : 'outline'}
                className={`flex-1 ${mode === 'register' ? 'bg-brand hover:bg-brand-hover text-white' : ''}`}
              >
                Registrarme
              </Button>
            </div>

            {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <Label className="mb-1 text-slate-700">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div>
                <Label className="mb-1 text-slate-700">Contraseña</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <Label className="mb-1 text-slate-700">Nombre Completo</Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre y Apellidos"
                />
              </div>
              <div>
                <Label className="mb-1 text-slate-700">Teléfono de Contacto</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="3001234567"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="accent-brand"
                />
                Acepto las políticas de tratamiento de datos
              </label>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {messageType === 'info' && (
              <Alert className="bg-white border border-slate-200 text-slate-900">
                <Mail className="h-4 w-4" />
                <AlertTitle>¡Último paso!</AlertTitle>
                <AlertDescription>
                  Hemos enviado un enlace de confirmación a tu correo. Por favor, revísalo para activar tu cuenta.
                </AlertDescription>
              </Alert>
            )}
            {messageType === 'success' && (
              <Alert className="bg-white border border-green-200 text-slate-900 [&>svg]:text-green-600">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>¡Registro Exitoso!</AlertTitle>
                <AlertDescription>
                  Tu cuenta ha sido creada. Redirigiendo a tu solicitud...
                </AlertDescription>
              </Alert>
            )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-white"
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </Button>
            </form>
            )}

            {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <Label className="mb-1 text-slate-700">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div>
                <Label className="mb-1 text-slate-700">Contraseña</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {message && <p className="text-green-600 text-sm">{message}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-white"
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
            )}

            <div className="mt-4">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full"
              >
                Continuar con Google
              </Button>
            </div>
          </CardContent>
            </Card>
          </div>
        </div>
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white">
            Accede o crea tu cuenta, {" "}
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              de forma simple y segura.
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-xl">
            Inicia sesión con tu correo y contraseña o regístrate para empezar tu solicitud.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-start justify-start gap-4">
            <Link to="/solicitud" className="inline-flex items-center px-5 py-3 rounded-md bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 shadow-lg shadow-blue-500/30">
              Ir a Solicitud
            </Link>
            <Link to="/#beneficios" className="inline-flex items-center px-5 py-3 rounded-md border border-black dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
              Conocer Beneficios
            </Link>
          </div>
        </div>
      </div>
      </HeroKit>
      <CompactFooter />
    </>
  );
}

export default LoginPage;
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const matchDomain = (value, domain) => {
  if (!isHttpUrl(value)) return false;
  try {
    const url = new URL(value);
    return url.hostname.toLowerCase().includes(domain);
  } catch {
    return false;
  }
};

const PreguntaPerfilDigital = ({ onComplete }) => {
  const [sitioWeb, setSitioWeb] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  const sitioWebValid = sitioWeb.trim() === '' || isHttpUrl(sitioWeb.trim());
  const linkedinValid = linkedin.trim() === '' || matchDomain(linkedin.trim(), 'linkedin.com');
  const instagramValid = instagram.trim() === '' || matchDomain(instagram.trim(), 'instagram.com');
  const facebookValid = facebook.trim() === '' || matchDomain(facebook.trim(), 'facebook.com');

  const anyInvalid = useMemo(() => {
    return !sitioWebValid || !linkedinValid || !instagramValid || !facebookValid;
  }, [sitioWebValid, linkedinValid, instagramValid, facebookValid]);

  const handleNext = () => {
    if (anyInvalid) return;
    const payload = {};
    if (sitioWeb.trim()) payload.sitio_web = sitioWeb.trim();
    const redes = {};
    if (linkedin.trim()) redes.linkedin = linkedin.trim();
    if (instagram.trim()) redes.instagram = instagram.trim();
    if (facebook.trim()) redes.facebook = facebook.trim();
    // Solo incluir redes_sociales si al menos hay una
    if (Object.keys(redes).length > 0) payload.redes_sociales = redes;
    onComplete(payload);
  };

  return (
    <div className="flex flex-col items-start w-full">
      <Label className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
        Completemos el perfil digital de tu empresa.
      </Label>

      {/* Página Web */}
      <div className="w-full max-w-xl mb-5">
        <Label className="text-sm text-foreground">Página Web (opcional)</Label>
        <Input
          type="url"
          placeholder="https://www.tuempresa.com"
          className="h-12 text-lg bg-background/50"
          value={sitioWeb}
          onChange={(e) => setSitioWeb(e.target.value)}
        />
        {!sitioWebValid && (
          <p className="text-xs text-red-600 mt-1">Ingresa una URL válida que comience con http:// o https://</p>
        )}
      </div>

      {/* LinkedIn */}
      <div className="w-full max-w-xl mb-5">
        <Label className="text-sm text-foreground">LinkedIn (opcional)</Label>
        <Input
          type="url"
          placeholder="https://www.linkedin.com/company/tuempresa"
          className="h-12 text-lg bg-background/50"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
        />
        {!linkedinValid && (
          <p className="text-xs text-red-600 mt-1">Ingresa una URL de LinkedIn válida.</p>
        )}
      </div>

      {/* Instagram */}
      <div className="w-full max-w-xl mb-5">
        <Label className="text-sm text-foreground">Instagram (opcional)</Label>
        <Input
          type="url"
          placeholder="https://www.instagram.com/tuempresa"
          className="h-12 text-lg bg-background/50"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
        {!instagramValid && (
          <p className="text-xs text-red-600 mt-1">Ingresa una URL de Instagram válida.</p>
        )}
      </div>

      {/* Facebook */}
      <div className="w-full max-w-xl mb-5">
        <Label className="text-sm text-foreground">Facebook (opcional)</Label>
        <Input
          type="url"
          placeholder="https://www.facebook.com/tuempresa"
          className="h-12 text-lg bg-background/50"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />
        {!facebookValid && (
          <p className="text-xs text-red-600 mt-1">Ingresa una URL de Facebook válida.</p>
        )}
      </div>

      <Button onClick={handleNext} className="mt-4 bg-black text-white hover:bg-black/80" disabled={anyInvalid}>
        Guardar y Continuar
      </Button>
    </div>
  );
};

export default PreguntaPerfilDigital;
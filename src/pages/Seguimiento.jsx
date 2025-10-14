import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, ArrowRight, Printer } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const formatCurrency = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'N/A';
  return `$ ${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
};

const Seguimiento = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const qp = searchParams.get('code');
    if (qp) setCode(qp);
  }, [searchParams]);

  const handleQuery = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const cleanCode = String(code).trim();
      if (!cleanCode) {
        setError('Ingresa un código de seguimiento válido.');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('solicitudes')
        .select('*, empresas(*)')
        .eq('codigo_seguimiento', cleanCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) {
        setError('No encontramos una solicitud con ese código.');
        return;
      }

      setResult(data);

      // Intentar cargar historial de estados desde la tabla conversaciones
      try {
        const { data: conv, error: convError } = await supabase
          .from('conversaciones')
          .select('accion, estado_anterior, estado_nuevo, created_at')
          .eq('solicitud_id', data.id)
          .order('created_at', { ascending: true });
        if (!convError) {
          setHistory(conv || []);
        }
      } catch (e) {
        // En silencio: si no existe la tabla o falla, omitimos historial
        setHistory([]);
      }
    } catch (e) {
      setError('Ocurrió un error consultando el estado.');
    } finally {
      setLoading(false);
    }
  };

  const estado = result?.estado || result?.status || 'pendiente';
  const empresa = Array.isArray(result?.empresas) ? result.empresas[0] : null;

  const filteredHistory = (history || []).filter((h) => {
    try {
      const ts = new Date(h.created_at).getTime();
      const start = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity;
      const end = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity;
      return ts >= start && ts <= end;
    } catch {
      return true;
    }
  });

  const handleDownloadPdf = () => {
    if (!result) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const formatMoney = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? `$ ${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })}` : 'N/A';
    };
    const created = new Date(result?.created_at).toLocaleString('es-CO');
    const hist = (filteredHistory || []).map(h => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd;">${new Date(h.created_at).toLocaleString('es-CO')}</td>
        <td style="padding:6px;border:1px solid #ddd;">${h.accion || '-'}</td>
        <td style="padding:6px;border:1px solid #ddd;">${h.estado_anterior || '-'}</td>
        <td style="padding:6px;border:1px solid #ddd;">${h.estado_nuevo || '-'}</td>
      </tr>
    `).join('');
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Comprobante de Seguimiento</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
            .meta { margin-bottom: 12px; }
            .meta p { margin: 4px 0; }
            table { border-collapse: collapse; width: 100%; }
            th { background: #f5f5f5; }
            th, td { font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Comprobante de Seguimiento</h1>
          <div class="meta">
            <p><strong>Código:</strong> ${result?.codigo_seguimiento}</p>
            <p><strong>Estado:</strong> ${estado}</p>
            <p><strong>Fecha de creación:</strong> ${created}</p>
            <p><strong>Email:</strong> ${result?.email_solicitante || result?.email || '-'}</p>
          </div>
          <h2>Resumen</h2>
          <table>
            <tr>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Campo</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Valor</th>
            </tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Monto Solicitado</td><td style="padding:6px;border:1px solid #ddd;">${formatMoney(result?.monto_solicitado)}</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Plazo Solicitado</td><td style="padding:6px;border:1px solid #ddd;">${result?.plazo_solicitado ? `${result.plazo_solicitado} meses` : 'N/A'}</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Destino del Crédito</td><td style="padding:6px;border:1px solid #ddd;">${result?.destino_credito || 'N/A'}</td></tr>
          </table>
          ${empresa ? `
          <h2>Datos de Empresa</h2>
          <table>
            <tr>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Campo</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Valor</th>
            </tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">NIT</td><td style="padding:6px;border:1px solid #ddd;">${empresa?.nit || '-'}</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Razón Social</td><td style="padding:6px;border:1px solid #ddd;">${empresa?.razon_social || '-'}</td></tr>
            <tr><td style="padding:6px;border:1px solid #ddd;">Tipo de Empresa</td><td style="padding:6px;border:1px solid #ddd;">${empresa?.tipo_empresa || '-'}</td></tr>
          </table>
          ` : ''}
          <h2>Historial de estados</h2>
          ${filteredHistory && filteredHistory.length ? `
            <table>
              <tr>
                <th style="padding:6px;border:1px solid #ddd;text-align:left;">Fecha</th>
                <th style="padding:6px;border:1px solid #ddd;text-align:left;">Acción</th>
                <th style="padding:6px;border:1px solid #ddd;text-align:left;">Anterior</th>
                <th style="padding:6px;border:1px solid #ddd;text-align:left;">Nuevo</th>
              </tr>
              ${hist}
            </table>
          ` : '<p>No hay eventos registrados.</p>'}
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { try { win.print(); } catch {} }, 250);
  };

  return (
    <div className="max-w-[800px] mx-auto p-3">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary text-center mb-6">
        Seguimiento de Solicitud
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        Ingresa tu código para consultar el estado.
      </p>

      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 md:col-span-9">
          <Label htmlFor="trackingCode">Código de seguimiento</Label>
          <Input
            id="trackingCode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="WY-2025-123456"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <Button type="button" onClick={handleQuery} disabled={loading} className="w-full">
            {loading ? (
              <span className="inline-flex items-center"><Spinner className="mr-2 w-4 h-4" />Consultando…</span>
            ) : (
              'Consultar'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="mt-8">
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Estado de tu solicitud</AlertTitle>
            <AlertDescription>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{estado}</span>
                <Badge variant="secondary" className="ml-1">{result?.codigo_seguimiento}</Badge>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 mb-4">
            <Button type="button" onClick={handleDownloadPdf} variant="secondary">
              <Printer className="w-4 h-4 mr-2" /> Descargar comprobante (PDF)
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6">
              <p className="text-sm text-muted-foreground">Fecha de creación</p>
              <p className="text-base">{new Date(result?.created_at).toLocaleString('es-CO')}</p>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <p className="text-sm text-muted-foreground">Monto Solicitado</p>
              <p className="text-base font-semibold">{formatCurrency(result?.monto_solicitado)}</p>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <p className="text-sm text-muted-foreground">Plazo Solicitado</p>
              <p className="text-base">{result?.plazo_solicitado ? `${result.plazo_solicitado} meses` : 'N/A'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <p className="text-sm text-muted-foreground">Email del Solicitante</p>
              <p className="text-base">{result?.email_solicitante || result?.email || 'N/A'}</p>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <p className="text-sm text-muted-foreground">Destino del Crédito</p>
              <p className="text-base">{result?.destino_credito || 'N/A'}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h2 className="text-xl font-semibold mb-3">Historial de estados</h2>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 sm:col-span-6">
                <Label htmlFor="fromDate">Desde</Label>
                <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <Label htmlFor="toDate">Hasta</Label>
                <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            {filteredHistory && filteredHistory.length ? (
              <div className="space-y-3">
                {filteredHistory.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-48">
                      {new Date(h.created_at).toLocaleString('es-CO')}
                    </span>
                    <span className="text-sm">
                      {h.accion || 'Actualización'}
                    </span>
                    <span className="text-sm inline-flex items-center gap-2">
                      <Badge variant="outline">{h.estado_anterior || '-'}</Badge>
                      <ArrowRight className="w-4 h-4" />
                      <Badge>{h.estado_nuevo || '-'}</Badge>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay eventos registrados.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Seguimiento;
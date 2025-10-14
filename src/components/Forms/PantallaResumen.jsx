// src/components/Forms/PantallaResumen.jsx
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
    Business as BusinessIcon,
    Description as DescriptionIcon,
    AccountBalance as AccountBalanceIcon,
    People as PeopleIcon,
    Gavel as GavelIcon,
    Security as SecurityIcon,
    Send as SendIcon
} from '@mui/icons-material';

const PantallaResumen = ({ sessionId, onStepComplete }) => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Formateo de moneda (sin decimales, con separadores y símbolo $)
    const formatCurrency = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return 'N/A';
        return `$ ${n.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
    };

    // Evaluación de estado (completado/pendiente)
    const isFilled = (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'number') return Number.isFinite(value) && value > 0;
        const s = String(value).trim();
        return s.length > 0;
    };

    const StatusBadge = ({ filled }) => (
        <Badge
            variant="secondary"
            className={`${filled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} ml-2`}
        >
            {filled ? 'Completado' : 'Pendiente'}
        </Badge>
    );

    // Estado global de la sección financiera
    const isSectionComplete = (sol) => {
        const keys = [
            'monto_solicitado',
            'plazo_solicitado',
            'destino_credito',
            'ingresos_mensuales',
            'egresos_mensuales',
            'patrimonio',
        ];
        return keys.every((k) => isFilled(sol?.[k]));
    };

    useEffect(() => {
        loadSummaryData();
    }, [sessionId]);

    const loadSummaryData = async () => {
        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_summary_data',
                    sessionId
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSummaryData(result.data);
            } else {
                setError(result.error || 'Error al cargar los datos del resumen');
            }
        } catch (err) {
            setError('Error de conexión al cargar el resumen');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmission = async () => {
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'complete_submission',
                    sessionId
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(`¡Solicitud enviada exitosamente! Código de seguimiento: ${result.trackingCode}`);
                // Persistir código de seguimiento para la pantalla de éxito
                try {
                    if (result.trackingCode) {
                        localStorage.setItem(`tracking_code_${sessionId}`, String(result.trackingCode));
                    }
                } catch {}
                if (onStepComplete) {
                    onStepComplete();
                }
            } else {
                setError(result.error || 'Error al enviar la solicitud');
            }
        } catch (err) {
            setError('Error de conexión al enviar la solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner className="w-14 h-14" />
                <p className="ml-2 text-lg font-semibold">Cargando resumen...</p>
            </div>
        );
    }

    if (!summaryData) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No se pudieron cargar los datos del resumen. Por favor, intente nuevamente.
                </AlertDescription>
            </Alert>
        );
    }

    const { solicitud, empresa, documentos, garantia } = summaryData;

    return (
        <div className="max-w-[800px] mx-auto p-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary text-center mb-6">
                Resumen de su Solicitud de Crédito
            </h1>
            
            <p className="mb-6 text-center text-muted-foreground">
                Revise cuidadosamente toda la información antes de enviar su solicitud.
            </p>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {/* Información de la Solicitud */}
            <div className="mt-12">
                <div className="flex items-center">
                    <AccountBalanceIcon sx={{ mr: 4, color: 'primary.main' }} />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Información de la Solicitud</h3>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                        <p className="text-sm text-muted-foreground">Monto Solicitado:</p>
                        <p className="text-lg font-semibold">
                            {formatCurrency(solicitud?.monto_solicitado)}
                        </p>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <p className="text-sm text-muted-foreground">Plazo:</p>
                        <p className="text-lg font-semibold">
                            {solicitud?.plazo_meses ?? solicitud?.plazo_solicitado ?? 'N/A'} meses
                        </p>
                    </div>
                    <div className="col-span-12">
                        <p className="text-sm text-muted-foreground">Propósito:</p>
                        <p className="text-base">{solicitud?.proposito || solicitud?.destino_credito || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Información Financiera */}
            <div className="mt-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <AccountBalanceIcon sx={{ mr: 4, color: 'primary.main' }} />
                        <h3 className="text-xl font-semibold border-b pb-2 mb-6">Información Financiera</h3>
                    </div>
                    <Badge
                        variant="secondary"
                        className={`${isSectionComplete(solicitud) ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'} ml-2`}
                    >
                        {isSectionComplete(solicitud) ? 'Sección completa' : 'Campos pendientes'}
                    </Badge>
                </div>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                        <p
                            className="text-sm text-muted-foreground flex items-center justify-between"
                            title={!isFilled(solicitud?.monto_solicitado) ? 'Ingresa el monto solicitado en COP.' : undefined}
                        >
                            <span>Monto Solicitado</span>
                            <StatusBadge filled={isFilled(solicitud?.monto_solicitado)} />
                        </p>
                        <p className="text-lg font-semibold">{formatCurrency(solicitud?.monto_solicitado)}</p>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <p
                            className="text-sm text-muted-foreground flex items-center justify-between"
                            title={!isFilled(solicitud?.plazo_solicitado) ? 'Indica el plazo solicitado en meses.' : undefined}
                        >
                            <span>Plazo Solicitado</span>
                            <StatusBadge filled={isFilled(solicitud?.plazo_solicitado)} />
                        </p>
                        <p className="text-lg font-semibold">{(solicitud?.plazo_solicitado ?? 'N/A')} meses</p>
                    </div>
                    <div className="col-span-12">
                        <p
                            className="text-sm text-muted-foreground flex items-center justify-between"
                            title={!isFilled(solicitud?.destino_credito) ? 'Describe el destino o propósito del crédito.' : undefined}
                        >
                            <span>Destino del Crédito</span>
                            <StatusBadge filled={isFilled(solicitud?.destino_credito)} />
                        </p>
                        <p className="text-base">{solicitud?.destino_credito || 'N/A'}</p>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <p
                            className="text-sm text-muted-foreground flex items-center justify-between"
                            title={!isFilled(solicitud?.ingresos_mensuales) ? 'Registra tus ingresos mensuales en COP.' : undefined}
                        >
                            <span>Ingresos Mensuales</span>
                            <StatusBadge filled={isFilled(solicitud?.ingresos_mensuales)} />
                        </p>
                        <p className="text-lg font-semibold">{formatCurrency(solicitud?.ingresos_mensuales)}</p>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <p
                            className="text-sm text-muted-foreground flex items-center justify-between"
                            title={!isFilled(solicitud?.egresos_mensuales) ? 'Registra tus egresos mensuales en COP.' : undefined}
                        >
                            <span>Egresos Mensuales</span>
                            <StatusBadge filled={isFilled(solicitud?.egresos_mensuales)} />
                        </p>
                        <p className="text-lg font-semibold">{formatCurrency(solicitud?.egresos_mensuales)}</p>
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <p
                            className="text-sm text-muted-foreground flex items-center justify-between"
                            title={!isFilled(solicitud?.patrimonio) ? 'Ingresa tu patrimonio estimado en COP.' : undefined}
                        >
                            <span>Patrimonio</span>
                            <StatusBadge filled={isFilled(solicitud?.patrimonio)} />
                        </p>
                        <p className="text-lg font-semibold">{formatCurrency(solicitud?.patrimonio)}</p>
                    </div>
                </div>
            </div>

            {/* Información de la Empresa */}
            <div className="mt-12">
                <div className="flex items-center">
                    <BusinessIcon sx={{ mr: 4, color: 'primary.main' }} />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Información de la Empresa</h3>
                </div>
                <ul className="space-y-2">
                    <li className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Razón Social</span>
                        <span className="font-medium">{empresa?.razon_social || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NIT</span>
                        <span className="font-medium">{empresa?.nit || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sector Económico</span>
                        <span className="font-medium">{empresa?.sector_economico || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Años de Funcionamiento</span>
                        <span className="font-medium">{empresa?.anos_funcionamiento || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Número de Empleados</span>
                        <span className="font-medium">{empresa?.numero_empleados || 'N/A'}</span>
                    </li>
                </ul>
            </div>

            {/* Documentos Cargados */}
            <div className="mt-12">
                <div className="flex items-center">
                    <DescriptionIcon sx={{ mr: 4, color: 'primary.main' }} />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Documentos Cargados</h3>
                </div>
                {documentos && documentos.length > 0 ? (
                    <div className="grid grid-cols-12 gap-2">
                        {documentos.map((doc, index) => (
                            <div key={index} className="col-span-12 sm:col-span-6">
                                <p className="text-sm text-muted-foreground">{doc.tipo_documento || 'Documento'}</p>
                                <Badge variant="secondary" className="mt-1">
                                    {doc.nombre_archivo || doc.tipo_documento || 'Archivo subido'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No hay documentos cargados</p>
                )}
                
            </div>

            {/* Referencias */}
            {(empresa?.nombre_referencia_1 || empresa?.nombre_referencia_2) && (
                <div className="mt-12">
                    <div className="flex items-center">
                    <PeopleIcon sx={{ mr: 4, color: 'primary.main' }} />
                        <h3 className="text-xl font-semibold border-b pb-2 mb-6">Referencias Comerciales</h3>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                        {empresa?.nombre_referencia_1 && (
                            <div className="col-span-12 sm:col-span-6">
                                <p className="text-sm text-muted-foreground">Referencia 1:</p>
                                <p className="text-base">{empresa.nombre_referencia_1}</p>
                                <p className="text-sm">{empresa.telefono_referencia_1}</p>
                            </div>
                        )}
                        {empresa?.nombre_referencia_2 && (
                            <div className="col-span-12 sm:col-span-6">
                                <p className="text-sm text-muted-foreground">Referencia 2:</p>
                                <p className="text-base">{empresa.nombre_referencia_2}</p>
                                <p className="text-sm">{empresa.telefono_referencia_2}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Garantía */}
            {garantia && (
                <div className="mt-12">
                    <div className="flex items-center">
                    <SecurityIcon sx={{ mr: 4, color: 'primary.main' }} />
                        <h3 className="text-xl font-semibold border-b pb-2 mb-6">Garantía Mobiliaria</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Descripción:</p>
                    <p className="text-base mb-6">{garantia.descripcion}</p>
                    <p className="text-sm text-muted-foreground">Valor Estimado:</p>
                    <p className="text-lg font-semibold">
                        ${garantia.valor_estimado?.toLocaleString() || 'N/A'}
                    </p>
                </div>
            )}

            {/* Declaraciones */}
            <div className="mt-12">
                <div className="flex items-center">
                    <GavelIcon sx={{ mr: 4, color: 'primary.main' }} />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Declaraciones Aceptadas</h3>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                    <li>✓ Acepto que el crédito será destinado únicamente para fines productivos</li>
                    <li>✓ Declaro que el crédito no será utilizado para gastos personales</li>
                    <li>✓ Autorizo el tratamiento de mis datos personales según la política de habeas data</li>
                </ul>
                </div>

            <Separator className="my-8" />

            {/* Botón de Envío Final */}
            <div className="flex justify-center">
                <Button
                    onClick={handleFinalSubmission}
                    size="lg"
                    disabled={submitting || success}
                    className={`min-w-[300px] py-2 text-lg font-bold ${success ? 'bg-green-600 text-white hover:bg-green-600/90' : ''}`}
                >
                    {submitting ? (
                        <span className="inline-flex items-center">
                            <Spinner className="mr-2 w-5 h-5" />
                            Enviando Solicitud...
                        </span>
                    ) : success ? (
                        'Solicitud Enviada'
                    ) : (
                        <span className="inline-flex items-center">
                            <SendIcon className="mr-2" />
                            Confirmar y Enviar Solicitud
                        </span>
                    )}
                </Button>
            </div>

            {success && (
                <p className="text-sm text-center mt-6 text-muted-foreground">
                    Recibirá un correo de confirmación con los detalles de su solicitud.
                </p>
            )}
        </div>
    );
};

export default PantallaResumen;
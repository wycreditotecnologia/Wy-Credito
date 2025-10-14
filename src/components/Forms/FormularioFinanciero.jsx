// src/components/Forms/FormularioFinanciero.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { 
    Assessment as AssessmentIcon, 
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import FileUpload from '../FileUpload/FileUpload';

const FormularioFinanciero = ({ onStepComplete, sessionId, onProgressUpdate }) => {
    // Estado para almacenar URLs de documentos y respuestas de preguntas
    const [formData, setFormData] = useState({
        monto_solicitado: '',
        plazo_solicitado: '',
        destino_credito: '',
        ingresos_mensuales: '',
        egresos_mensuales: '',
        patrimonio: '',
        url_declaracion_renta: '',
        url_estados_financieros: ''
    });
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Refs para navegación acelerada por teclado
    const montoRef = useRef(null);
    const plazoRef = useRef(null);
    const destinoRef = useRef(null);
    const ingresosRef = useRef(null);
    const egresosRef = useRef(null);
    const patrimonioRef = useRef(null);
    const inputRefs = [montoRef, plazoRef, destinoRef, ingresosRef, egresosRef, patrimonioRef];

    useEffect(() => {
        // Enfocar el primer campo al montar
        montoRef.current?.focus();
    }, []);

    // Reportar progreso del paso al montar
    useEffect(() => {
        if (typeof onProgressUpdate === 'function') {
            // 6 campos financieros + 2 documentos opcionales
            onProgressUpdate({ currentQuestion: 1, totalQuestions: 8 });
        }
    }, [onProgressUpdate]);

    // Manejar cambios en los campos de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo si existe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Manejar éxito en la subida de archivos
    const tipoDocumentoMap = {
        url_declaracion_renta: 'declaracion_renta',
        url_estados_financieros: 'estados_financieros'
    };

    const handleUploadSuccess = (url, documentType, meta = {}) => {
        setFormData(prev => ({ ...prev, [documentType]: url }));
        const tipo_documento = tipoDocumentoMap[documentType] || documentType;
        setUploadedFiles(prev => {
            const others = prev.filter(f => f.tipo_documento !== tipo_documento);
            return [
                ...others,
                {
                    tipo_documento,
                    nombre_archivo: meta.nombre_archivo || '',
                    url_storage: url,
                    tamaño_archivo: meta.tamaño_archivo || 0,
                    tipo_mime: meta.tipo_mime || 'application/pdf',
                }
            ];
        });
    };

    // Validar formulario
    const validate = () => {
        const newErrors = {};

        // Validar numéricos > 0
        const numFields = ['monto_solicitado','plazo_solicitado','ingresos_mensuales','egresos_mensuales','patrimonio'];
        numFields.forEach(field => {
            const raw = String(formData[field] || '').trim();
            const value = field === 'plazo_solicitado' ? parseInt(raw, 10) : parseFloat(raw);
            if (!raw) {
                newErrors[field] = 'Este campo es obligatorio';
            } else if (Number.isNaN(value) || value <= 0) {
                newErrors[field] = 'Debe ser un número mayor que 0';
            }
        });

        // Texto requerido
        if (!String(formData.destino_credito || '').trim()) {
            newErrors.destino_credito = 'Debe especificar el destino del crédito';
        }

        // Documentos requeridos
        const requiredDocs = ['declaracion_renta', 'estados_financieros'];
        const uploadedTypes = new Set(uploadedFiles.map(f => f.tipo_documento));
        requiredDocs.forEach(td => {
            if (!uploadedTypes.has(td)) {
                newErrors[td] = td === 'declaracion_renta'
                    ? 'Debe subir la declaración de renta en PDF (≤10MB).'
                    : 'Debe subir los estados financieros en PDF (≤10MB).';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        setSubmitError('');

        try {
            // Verificar que tenemos sessionId
            if (!sessionId) {
                throw new Error('No se encontró una sesión activa. Por favor, reinicie el proceso.');
            }

            // Preparar payload con todos los datos
            const payload = {
                monto_solicitado: parseFloat(formData.monto_solicitado),
                plazo_solicitado: parseInt(formData.plazo_solicitado, 10),
                destino_credito: String(formData.destino_credito || '').trim(),
                ingresos_mensuales: parseFloat(formData.ingresos_mensuales),
                egresos_mensuales: parseFloat(formData.egresos_mensuales),
                patrimonio: parseFloat(formData.patrimonio),
                documentos: uploadedFiles.map(f => ({
                    tipo_documento: f.tipo_documento,
                    nombre_archivo: f.nombre_archivo,
                    url_storage: f.url_storage,
                    tamaño_archivo: f.tamaño_archivo,
                    tipo_mime: f.tipo_mime,
                }))
            };

            console.log('📊 Enviando información financiera:', payload);

            // Llamada a la API del orquestador
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'submit_form_step',
                    sessionId: sessionId,
                    payload: payload,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al enviar la información financiera');
            }

            console.log('✅ Información financiera enviada exitosamente:', result);
            
            // Navegar al siguiente paso
            if (onStepComplete) {
                onStepComplete(result.nextStep || 4);
            }

        } catch (error) {
            console.error('❌ Error al enviar información financiera:', error);
            setSubmitError(error.message || 'Error al enviar los datos. Por favor, inténtelo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Gestor de tecla Enter: avanzar o enviar
    const handleKeyDown = (event, currentIndex) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            for (let i = currentIndex + 1; i < inputRefs.length; i++) {
                const next = inputRefs[i]?.current;
                if (next) {
                    next.focus();
                    return;
                }
            }
            handleSubmit();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[800px] mx-auto">
            {/* Título principal */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6">📊 Información Financiera</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
                Adjunte sus documentos financieros y proporcione información sobre el uso de los recursos
            </p>

            {/* Mostrar errores de envío */}
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

            {/* Sección 1: Documentos Financieros */}
            <div className="mt-12">
                <div className="flex items-center">
                    <CloudUploadIcon className="mr-2 text-primary" />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Documentos Financieros</h3>
                </div>
                <Separator className="my-8" />
                
                <p className="text-xs text-muted-foreground mb-6">
                    Todos los documentos deben estar en formato PDF y no superar los 10MB
                </p>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <div className="mb-6">
                            <FileUpload 
                                label="Declaración de Renta (Último año fiscal)"
                                sessionId={sessionId}
                                documentType="url_declaracion_renta"
                                onUploadSuccess={handleUploadSuccess}
                                helperText="PDF ≤ 10MB. Última declaración presentada."
                            />
                            {errors.declaracion_renta && (
                                <p className="text-xs text-destructive mt-1">{errors.declaracion_renta}</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12">
                        <div className="mb-6">
                            <FileUpload 
                                label="Estados Financieros (Últimos 2 años)"
                                sessionId={sessionId}
                                documentType="url_estados_financieros"
                                onUploadSuccess={handleUploadSuccess}
                                helperText="PDF ≤ 10MB. Estados auditados o certificados."
                            />
                            {errors.estados_financieros && (
                                <p className="text-xs text-destructive mt-1">{errors.estados_financieros}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección 2: Datos cuantitativos */}
            <div className="mt-12">
                <div className="flex items-center">
                    <AssessmentIcon className="mr-2 text-primary" />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Datos cuantitativos</h3>
                </div>
                <Separator className="my-8" />

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-6">
                            <Label htmlFor="monto_solicitado">Monto solicitado (COP)</Label>
                            <input
                                id="monto_solicitado"
                                name="monto_solicitado"
                                type="number"
                                step="0.01"
                                value={formData.monto_solicitado}
                                onChange={handleChange}
                                ref={montoRef}
                                onKeyDown={(e) => handleKeyDown(e, 0)}
                                placeholder="Ej: 50000000"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.monto_solicitado ? (
                                <p className="text-xs text-destructive mt-1">{errors.monto_solicitado}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">Ingrese el monto solicitado en COP, mayor que 0.</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 sm:col-span-6">
                        <div className="mb-6">
                            <Label htmlFor="plazo_solicitado">Plazo solicitado (meses)</Label>
                            <input
                                id="plazo_solicitado"
                                name="plazo_solicitado"
                                type="number"
                                step="1"
                                value={formData.plazo_solicitado}
                                onChange={handleChange}
                                ref={plazoRef}
                                onKeyDown={(e) => handleKeyDown(e, 1)}
                                placeholder="Ej: 24"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.plazo_solicitado ? (
                                <p className="text-xs text-destructive mt-1">{errors.plazo_solicitado}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">Meses de plazo, número entero mayor que 0.</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12">
                        <div className="mb-6">
                            <Label htmlFor="destino_credito">Destino del crédito</Label>
                            <input
                                id="destino_credito"
                                name="destino_credito"
                                type="text"
                                value={formData.destino_credito}
                                onChange={handleChange}
                                ref={destinoRef}
                                onKeyDown={(e) => handleKeyDown(e, 2)}
                                placeholder="Ej: Capital de trabajo, expansión, compra de maquinaria, etc."
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.destino_credito ? (
                                <p className="text-xs text-destructive mt-1">{errors.destino_credito}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">Describa el destino del crédito. Este campo es obligatorio.</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-6">
                            <Label htmlFor="ingresos_mensuales">Ingresos mensuales (COP)</Label>
                            <input
                                id="ingresos_mensuales"
                                name="ingresos_mensuales"
                                type="number"
                                step="0.01"
                                value={formData.ingresos_mensuales}
                                onChange={handleChange}
                                ref={ingresosRef}
                                onKeyDown={(e) => handleKeyDown(e, 3)}
                                placeholder="Ej: 80000000"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.ingresos_mensuales ? (
                                <p className="text-xs text-destructive mt-1">{errors.ingresos_mensuales}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">Total de ingresos mensuales, mayor que 0.</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-6">
                            <Label htmlFor="egresos_mensuales">Egresos mensuales (COP)</Label>
                            <input
                                id="egresos_mensuales"
                                name="egresos_mensuales"
                                type="number"
                                step="0.01"
                                value={formData.egresos_mensuales}
                                onChange={handleChange}
                                ref={egresosRef}
                                onKeyDown={(e) => handleKeyDown(e, 4)}
                                placeholder="Ej: 30000000"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.egresos_mensuales ? (
                                <p className="text-xs text-destructive mt-1">{errors.egresos_mensuales}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">Total de egresos mensuales, mayor que 0.</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                        <div className="mb-6">
                            <Label htmlFor="patrimonio">Patrimonio (COP)</Label>
                            <input
                                id="patrimonio"
                                name="patrimonio"
                                type="number"
                                step="0.01"
                                value={formData.patrimonio}
                                onChange={handleChange}
                                ref={patrimonioRef}
                                onKeyDown={(e) => handleKeyDown(e, 5)}
                                placeholder="Ej: 120000000"
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            {errors.patrimonio ? (
                                <p className="text-xs text-destructive mt-1">{errors.patrimonio}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">Patrimonio neto, mayor que 0.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end mt-12">
                <Button 
                    size="lg" 
                    type="submit"
                    disabled={loading}
                    className="min-w-[200px] bg-black text-white hover:bg-black/80"
                >
                    {loading ? (
                        <>
                            <Spinner className="mr-2 w-5 h-5" />
                            Enviando...
                        </>
                    ) : (
                        'Guardar y Continuar'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default FormularioFinanciero;
// src/components/Forms/FormularioGarantia.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import FileUploadImage from '../FileUpload/FileUploadImage';

const FormularioGarantia = ({ sessionId, onStepComplete, onProgressUpdate }) => {
    const [formData, setFormData] = useState({
        descripcion_garantia: '',
        valor_garantia: '',
        tipo_garantia: ''
    });
    const [uploadedFiles, setUploadedFiles] = useState([]); // opcional: foto de garantía
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    // Refs para navegación acelerada por teclado
    const descripcionRef = useRef(null);
    const valorRef = useRef(null);
    const tipoRef = useRef(null); // Ref en el SelectTrigger
    const inputRefs = [descripcionRef, valorRef, tipoRef];

    useEffect(() => {
        descripcionRef.current?.focus();
    }, []);

    // Reportar progreso del paso al montar
    useEffect(() => {
        if (typeof onProgressUpdate === 'function') {
            // Descripción, valor, tipo + 1 carga opcional de imagen
            onProgressUpdate({ currentQuestion: 1, totalQuestions: 4 });
        }
    }, [onProgressUpdate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (url, documentType, meta = {}) => {
        // documentType esperado: 'foto_garantia'
        const tipo_documento = 'foto_garantia';
        // Actualizar/Agregar documento con los metadatos disponibles
        setUploadedFiles(prev => {
            const others = prev.filter(f => f.tipo_documento !== tipo_documento);
            return [
                ...others,
                {
                    tipo_documento,
                    url_storage: url || '',
                    nombre_archivo: meta.nombre_archivo || '',
                    tamaño_archivo: meta.tamaño_archivo || 0,
                    tipo_mime: meta.tipo_mime || 'image/*',
                    storage_path: meta.storage_path || '',
                }
            ];
        });
    };

    const validateForm = () => {
        const newErrors = {};

        const desc = String(formData.descripcion_garantia || '').trim();
        if (!desc) {
            newErrors.descripcion_garantia = 'La descripción de la garantía es obligatoria';
        } else if (desc.length < 10) {
            newErrors.descripcion_garantia = 'La descripción debe tener al menos 10 caracteres';
        }

        const rawValor = String(formData.valor_garantia || '').trim();
        const valor = parseFloat(rawValor);
        if (!rawValor) {
            newErrors.valor_garantia = 'El valor de la garantía es obligatorio';
        } else if (Number.isNaN(valor) || valor <= 0) {
            newErrors.valor_garantia = 'Debe ser un número mayor que 0';
        }

        const tipo = String(formData.tipo_garantia || '').trim();
        if (!tipo) {
            newErrors.tipo_garantia = 'El tipo de garantía es obligatorio';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                descripcion_garantia: String(formData.descripcion_garantia || '').trim(),
                valor_estimado_garantia: parseFloat(formData.valor_garantia),
                tipo_garantia: String(formData.tipo_garantia || '').trim(),
                url_foto_garantia: uploadedFiles.length > 0 ? (uploadedFiles[0]?.url_storage || '') : ''
            };

            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'submit_form_step',
                    sessionId,
                    payload: {
                        currentStep: 6,
                        stepData: payload
                    }
                }),
            });

            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(result.error || 'Error al enviar la información de la garantía');
            }
            if (onStepComplete) {
                onStepComplete(7);
            }
        } catch (err) {
            setSubmitError(err.message || 'Error de conexión. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Avance con Enter: focos en orden y envío al final
    const handleKeyDown = (event, currentIndex) => {
        if (event.key === 'Enter') {
            // En el Select, permitir Enter para abrir si aún no hay valor
            if (currentIndex === 2 && !String(formData.tipo_garantia || '').trim()) {
                return;
            }
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
        <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto p-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Paso 6: Garantía Mobiliaria</h1>
            
            <p className="text-muted-foreground mb-6">Registre la información de la garantía que respalda su solicitud de crédito.</p>

            {submitError && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                </Alert>
            )}

            <div className="mt-12">
                <h3 className="text-xl font-semibold border-b pb-2 mb-6">Información de la Garantía</h3>

                {/* Foto de la Garantía (opcional) */}
                <div className="mb-6">
                    <FileUploadImage
                        label="Foto de la Garantía (opcional)"
                        onUploadSuccess={handleImageUpload}
                        sessionId={sessionId}
                        documentType="foto_garantia"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Puedes adjuntar una foto para facilitar la verificación (opcional).</p>
                </div>

                {/* Descripción */}
                <div className="mb-6">
                    <Label htmlFor="descripcion_garantia">Descripción de la Garantía</Label>
                    <textarea
                        id="descripcion_garantia"
                        name="descripcion_garantia"
                        value={formData.descripcion_garantia}
                        onChange={handleInputChange}
                        ref={descripcionRef}
                        onKeyDown={(e) => handleKeyDown(e, 0)}
                        placeholder="Describa detalladamente la garantía (marca, modelo, características, estado, etc.)"
                        rows={4}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                    {errors.descripcion_garantia && (
                        <p className="text-xs text-destructive mt-1">{errors.descripcion_garantia}</p>
                    )}
                </div>

                {/* Valor de la Garantía */}
                <div className="mb-6">
                    <Label htmlFor="valor_garantia">Valor de la Garantía</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                            id="valor_garantia"
                            type="number"
                            name="valor_garantia"
                            value={formData.valor_garantia}
                            onChange={handleInputChange}
                            ref={valorRef}
                            onKeyDown={(e) => handleKeyDown(e, 1)}
                            placeholder="Ingrese el valor de la garantía"
                            min={0}
                            step={0.01}
                            className="pl-7"
                        />
                    </div>
                    {errors.valor_garantia && (
                        <p className="text-xs text-destructive mt-1">{errors.valor_garantia}</p>
                    )}
                </div>

                {/* Tipo de Garantía */}
                <div className="mb-6">
                    <Label htmlFor="tipo_garantia">Tipo de Garantía</Label>
                    <Select value={formData.tipo_garantia} onValueChange={(val) => setFormData(prev => ({ ...prev, tipo_garantia: val }))}>
                        <SelectTrigger ref={tipoRef} onKeyDown={(e) => handleKeyDown(e, 2)} className="w-full">
                            <SelectValue placeholder="Seleccione el tipo de garantía" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Vehículo">Vehículo</SelectItem>
                            <SelectItem value="Inmueble">Inmueble</SelectItem>
                            <SelectItem value="Maquinaria">Maquinaria</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.tipo_garantia && (
                        <p className="text-xs text-destructive mt-1">{errors.tipo_garantia}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-center mt-12">
                <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="min-w-[200px] font-semibold"
                >
                    {loading ? (
                        <>
                            <Spinner className="mr-2 w-5 h-5" />
                            Guardando...
                        </>
                    ) : (
                        'Continuar al Resumen'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default FormularioGarantia;
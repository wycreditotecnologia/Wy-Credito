// src/components/Forms/FormularioDocumentacion.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Person as PersonIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import FileUpload from '../FileUpload/FileUpload'; // Importamos el componente reutilizable

const FormularioDocumentacion = ({ onStepComplete, sessionId, onProgressUpdate }) => {
    const [formData, setFormData] = useState({
        nombre_representante_legal: '',
        documento_representante_legal: '',
        celular_representante_legal: '',
        tipo_documento_rl: '',
        url_doc_identidad: '',
        url_certificado_existencia: '',
        url_composicion_accionaria: '',
    });
    const [uploadedFiles, setUploadedFiles] = useState([]); // lista con metadatos por archivo
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Refs para navegación con Enter
    const nombreRef = useRef(null);
    const documentoRef = useRef(null);
    const celularRef = useRef(null);
    const tipoDocRef = useRef(null);

    const fieldOrder = [nombreRef, documentoRef, celularRef, tipoDocRef];

    const focusNext = (currentRef) => {
        const idx = fieldOrder.findIndex(r => r === currentRef);
        const nextRef = fieldOrder[idx + 1];
        if (nextRef && nextRef.current) {
            nextRef.current.focus();
        } else {
            // Último campo: intentar enviar
            handleSubmit();
        }
    };

    const handleChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;
        // Forzar numérico en cédula y celular
        if (name === 'documento_representante_legal' || name === 'celular_representante_legal') {
            value = value.replace(/\D/g, '');
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e, currentRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            focusNext(currentRef);
        }
    };

    const tipoDocumentoMap = {
        url_doc_identidad: 'identidad_rl',
        url_certificado_existencia: 'certificado_existencia',
        url_composicion_accionaria: 'composicion_accionaria'
    };

    const handleUploadSuccess = (url, documentType, meta = {}) => {
        setFormData(prev => ({ ...prev, [documentType]: url }));
        const tipo_documento = tipoDocumentoMap[documentType] || documentType;
        // Agregar/actualizar entrada en uploadedFiles por tipo_documento
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

    const validate = () => {
        const newErrors = {};
        if (!formData.nombre_representante_legal.trim()) {
            newErrors.nombre_representante_legal = 'El nombre del representante es obligatorio';
        }
        if (!formData.documento_representante_legal.trim()) {
            newErrors.documento_representante_legal = 'El número de documento es obligatorio';
        }
        if (!formData.celular_representante_legal.trim()) {
            newErrors.celular_representante_legal = 'El celular del representante es obligatorio';
        }
        if (!formData.tipo_documento_rl) {
            newErrors.tipo_documento_rl = 'Debe seleccionar el tipo de documento del representante legal';
        }
        // Validar que los tres documentos se hayan subido
        const requiredDocs = ['identidad_rl', 'certificado_existencia', 'composicion_accionaria'];
        const uploadedTypes = new Set(uploadedFiles.map(f => f.tipo_documento));
        requiredDocs.forEach(td => {
            if (!uploadedTypes.has(td)) {
                if (td === 'identidad_rl') {
                    const tipoSel = formData.tipo_documento_rl || 'CC/CE';
                    newErrors[td] = `Debe subir el documento de identidad del representante legal (${tipoSel}) en PDF.`;
                } else if (td === 'certificado_existencia') {
                    newErrors[td] = 'Debe subir el certificado de existencia y representación legal vigente en PDF.';
                } else if (td === 'composicion_accionaria') {
                    newErrors[td] = 'Debe subir la composición accionaria con listado de accionistas y porcentajes en PDF.';
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setSubmitError('');

        try {
            const stepData = {
                nombre_representante_legal: formData.nombre_representante_legal,
                documento_representante_legal: formData.documento_representante_legal,
                celular_representante_legal: formData.celular_representante_legal,
                tipo_documento_rl: formData.tipo_documento_rl,
                // URLs mapeadas a la tabla 'documentos'
                url_doc_identidad: formData.url_doc_identidad,
                url_certificado_existencia: formData.url_certificado_existencia,
                url_composicion_accionaria: formData.url_composicion_accionaria,
            };

            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit_form_step',
                    sessionId,
                    payload: {
                        currentStep: 3,
                        stepData,
                    }
                }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Error desconocido del servidor.');
            onStepComplete(3);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[800px] mx-auto">
            <div className="mt-12">
                <div className="flex items-center">
                    <PersonIcon className="mr-2 text-primary" />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Datos del Representante Legal</h3>
                </div>
                <Separator className="my-8" />
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <div className="mb-6">
                            <Label htmlFor="nombre_representante_legal">Nombre Completo</Label>
                            <Input
                                id="nombre_representante_legal"
                                name="nombre_representante_legal"
                                ref={nombreRef}
                                value={formData.nombre_representante_legal}
                                onChange={handleChange}
                                onKeyDown={(e) => handleKeyDown(e, nombreRef)}
                            />
                            {errors.nombre_representante_legal && (
                                <p className="text-xs text-destructive mt-1">{errors.nombre_representante_legal}</p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="mb-6">
                            <Label htmlFor="documento_representante_legal">Número de cédula del representante legal</Label>
                            <Input
                                id="documento_representante_legal"
                                name="documento_representante_legal"
                                ref={documentoRef}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Solo números"
                                value={formData.documento_representante_legal}
                                onChange={handleChange}
                                onKeyDown={(e) => handleKeyDown(e, documentoRef)}
                            />
                            {errors.documento_representante_legal && (
                                <p className="text-xs text-destructive mt-1">{errors.documento_representante_legal}</p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="mb-6">
                            <Label htmlFor="celular_representante_legal">Número de Celular</Label>
                            <Input
                                id="celular_representante_legal"
                                name="celular_representante_legal"
                                ref={celularRef}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Solo números"
                                value={formData.celular_representante_legal}
                                onChange={handleChange}
                                onKeyDown={(e) => handleKeyDown(e, celularRef)}
                            />
                            {errors.celular_representante_legal && (
                                <p className="text-xs text-destructive mt-1">{errors.celular_representante_legal}</p>
                            )}
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="mb-6">
                            <Label htmlFor="tipo_documento_rl">¿Qué tipo de documento del representante legal vas a subir?</Label>
                            <Select value={formData.tipo_documento_rl} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_documento_rl: value }))}>
                                <SelectTrigger id="tipo_documento_rl" className="w-full" ref={tipoDocRef} onKeyDown={(e) => handleKeyDown(e, tipoDocRef)}>
                                    <SelectValue placeholder="Selecciona el tipo de documento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                                    <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.tipo_documento_rl && (
                                <p className="text-xs text-destructive mt-1">{errors.tipo_documento_rl}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <div className="flex items-center">
                    <CloudUploadIcon className="mr-2 text-primary" />
                    <h3 className="text-xl font-semibold border-b pb-2 mb-6">Documentos Requeridos</h3>
                </div>
                <Separator className="my-8" />
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12">
                        <div className="mb-6"><FileUpload label="Documento de Identidad del Representante Legal" sessionId={sessionId} documentType="url_doc_identidad" onUploadSuccess={handleUploadSuccess} helperText={`PDF ≤ 10MB. Debe coincidir con el tipo seleccionado (${formData.tipo_documento_rl || 'CC/CE'}).`} /></div>
                        {errors.identidad_rl && (
                            <p className="text-xs text-destructive mt-1">{errors.identidad_rl}</p>
                        )}
                    </div>
                    <div className="col-span-12">
                        <div className="mb-6"><FileUpload label="Certificado de Existencia y Representación" sessionId={sessionId} documentType="url_certificado_existencia" onUploadSuccess={handleUploadSuccess} helperText="PDF ≤ 10MB. Certificado vigente de Cámara de Comercio." /></div>
                        {errors.certificado_existencia && (
                            <p className="text-xs text-destructive mt-1">{errors.certificado_existencia}</p>
                        )}
                    </div>
                    <div className="col-span-12">
                        <div className="mb-6"><FileUpload label="Documento de Composición Accionaria" sessionId={sessionId} documentType="url_composicion_accionaria" onUploadSuccess={handleUploadSuccess} helperText="PDF ≤ 10MB. Detalle de socios y porcentajes." /></div>
                        {errors.composicion_accionaria && (
                            <p className="text-xs text-destructive mt-1">{errors.composicion_accionaria}</p>
                        )}
                    </div>
                </div>
            </div>

        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

            <div className="flex justify-end mt-12">
                <Button onClick={handleSubmit} disabled={loading} className="bg-black text-white hover:bg-black/80">
                    {loading ? <Spinner className="w-6 h-6" /> : 'Guardar y Continuar'}
                </Button>
            </div>
        </div>
    );
};

export default FormularioDocumentacion;
    // Reportar progreso del paso al montar
    useEffect(() => {
        if (typeof onProgressUpdate === 'function') {
            // Tipo de documento + 3 cargas de archivo
            onProgressUpdate({ currentQuestion: 1, totalQuestions: 4 });
        }
    }, [onProgressUpdate]);
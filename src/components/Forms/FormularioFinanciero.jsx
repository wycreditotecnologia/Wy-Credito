// src/components/Forms/FormularioFinanciero.jsx
import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Grid, 
    Paper, 
    Typography, 
    Divider, 
    Alert, 
    CircularProgress 
} from '@mui/material';
import { 
    Assessment as AssessmentIcon, 
    CloudUpload as CloudUploadIcon,
    HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import FileUpload from '../FileUpload/FileUpload';

const FormularioFinanciero = ({ onStepComplete, sessionId }) => {
    // Estado para almacenar URLs de documentos y respuestas de preguntas
    const [formData, setFormData] = useState({
        url_declaracion_renta: '',
        url_estados_financieros: '',
        proposito_recursos: '',
        detalle_activos_fijos: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

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
    const handleUploadSuccess = (url, documentType) => {
        setFormData(prev => ({ ...prev, [documentType]: url }));
        console.log(`✅ Documento ${documentType} subido:`, url);
    };

    // Validar formulario
    const validate = () => {
        const newErrors = {};

        // Validar que los documentos estén subidos
        if (!formData.url_declaracion_renta) {
            newErrors.url_declaracion_renta = 'La declaración de renta es requerida';
        }

        if (!formData.url_estados_financieros) {
            newErrors.url_estados_financieros = 'Los estados financieros son requeridos';
        }

        // Validar preguntas de texto
        if (!formData.proposito_recursos.trim()) {
            newErrors.proposito_recursos = 'Debe especificar el propósito de los recursos';
        } else if (formData.proposito_recursos.trim().length < 20) {
            newErrors.proposito_recursos = 'La descripción debe tener al menos 20 caracteres';
        }

        if (!formData.detalle_activos_fijos.trim()) {
            newErrors.detalle_activos_fijos = 'Debe responder sobre los activos fijos';
        } else if (formData.detalle_activos_fijos.trim().length < 10) {
            newErrors.detalle_activos_fijos = 'La respuesta debe tener al menos 10 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
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
                url_declaracion_renta: formData.url_declaracion_renta,
                url_estados_financieros: formData.url_estados_financieros,
                proposito_recursos: formData.proposito_recursos.trim(),
                detalle_activos_fijos: formData.detalle_activos_fijos.trim()
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

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Título principal */}
            <Typography variant="h4" component="h1" gutterBottom align="center">
                📊 Información Financiera
            </Typography>
            
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                Adjunte sus documentos financieros y proporcione información sobre el uso de los recursos
            </Typography>

            {/* Mostrar errores de envío */}
            {submitError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                </Alert>
            )}

            {/* Sección 1: Documentos Financieros */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CloudUploadIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Documentos Financieros
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Todos los documentos deben estar en formato PDF y no superar los 10MB
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FileUpload 
                            label="Declaración de Renta (Último año fiscal)"
                            sessionId={sessionId}
                            documentType="url_declaracion_renta"
                            onUploadSuccess={handleUploadSuccess}
                        />
                        {errors.url_declaracion_renta && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {errors.url_declaracion_renta}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <FileUpload 
                            label="Estados Financieros (Últimos 2 años)"
                            sessionId={sessionId}
                            documentType="url_estados_financieros"
                            onUploadSuccess={handleUploadSuccess}
                        />
                        {errors.url_estados_financieros && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {errors.url_estados_financieros}
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Sección 2: Propósito de los Recursos */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HelpOutlineIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Propósito de los Recursos
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name="proposito_recursos"
                            label="¿Para qué usará los recursos solicitados?"
                            value={formData.proposito_recursos}
                            onChange={handleChange}
                            error={!!errors.proposito_recursos}
                            helperText={errors.proposito_recursos || 'Describa detalladamente el destino de los recursos (mínimo 20 caracteres)'}
                            placeholder="Ejemplo: Capital de trabajo para aumentar inventario, expansión de operaciones, compra de maquinaria, etc."
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            name="detalle_activos_fijos"
                            label="¿Planea adquirir activos fijos con este crédito? Si es así, descríbalos."
                            value={formData.detalle_activos_fijos}
                            onChange={handleChange}
                            error={!!errors.detalle_activos_fijos}
                            helperText={errors.detalle_activos_fijos || 'Especifique qué activos fijos planea adquirir o escriba "No aplica" (mínimo 10 caracteres)'}
                            placeholder="Ejemplo: Maquinaria industrial, vehículos, equipos de cómputo, inmuebles, etc. O escriba 'No aplica' si no planea adquirir activos fijos."
                            required
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Botón de envío */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleSubmit} 
                    disabled={loading}
                    sx={{ minWidth: 200 }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Enviando...
                        </>
                    ) : (
                        'Guardar y Continuar'
                    )}
                </Button>
            </Box>
        </Box>
    );
};

export default FormularioFinanciero;
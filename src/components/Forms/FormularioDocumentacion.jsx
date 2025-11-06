// src/components/Forms/FormularioDocumentacion.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Paper, Typography, Divider, Alert, CircularProgress } from '@mui/material';
import { Person as PersonIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import FileUpload from '../FileUpload/FileUpload'; // Importamos el componente reutilizable

const FormularioDocumentacion = ({ onStepComplete, sessionId }) => {
    const [formData, setFormData] = useState({
        nombre_representante_legal: '',
        documento_representante_legal: '',
        celular_representante_legal: '',
        url_doc_identidad: '',
        url_certificado_existencia: '',
        url_composicion_accionaria: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadSuccess = (url, documentType) => {
        setFormData(prev => ({ ...prev, [documentType]: url }));
    };

    const validate = () => {
        // Aquí iría la lógica de validación completa...
        return true; // Simplificado por ahora
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setSubmitError('');

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit_form_step',
                    sessionId,
                    payload: formData,
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
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Datos del Representante Legal</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12}><TextField name="nombre_representante_legal" label="Nombre Completo" onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} md={6}><TextField name="documento_representante_legal" label="Número de Documento" onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} md={6}><TextField name="celular_representante_legal" label="Número de Celular" onChange={handleChange} fullWidth /></Grid>
                </Grid>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CloudUploadIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Documentos Requeridos</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12}><FileUpload label="Documento de Identidad del Representante Legal" sessionId={sessionId} documentType="url_doc_identidad" onUploadSuccess={handleUploadSuccess} /></Grid>
                    <Grid item xs={12}><FileUpload label="Certificado de Existencia y Representación" sessionId={sessionId} documentType="url_certificado_existencia" onUploadSuccess={handleUploadSuccess} /></Grid>
                    <Grid item xs={12}><FileUpload label="Documento de Composición Accionaria" sessionId={sessionId} documentType="url_composicion_accionaria" onUploadSuccess={handleUploadSuccess} /></Grid>
                </Grid>
            </Paper>

            {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button variant="contained" size="large" onClick={handleSubmit} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Guardar y Continuar'}
                </Button>
            </Box>
        </Box>
    );
};

export default FormularioDocumentacion;
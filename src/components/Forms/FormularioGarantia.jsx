// src/components/Forms/FormularioGarantia.jsx
import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper, 
    Alert,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import FileUploadImage from '../FileUpload/FileUploadImage';

const FormularioGarantia = ({ sessionId, onStepComplete }) => {
    const [formData, setFormData] = useState({
        descripcion_garantia: '',
        valor_estimado: '',
        url_foto: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({
            ...prev,
            url_foto: url
        }));
    };

    const validateForm = () => {
        if (!formData.descripcion_garantia.trim()) {
            setError('La descripción de la garantía es obligatoria');
            return false;
        }
        if (!formData.valor_estimado || parseFloat(formData.valor_estimado) <= 0) {
            setError('El valor estimado debe ser mayor a 0');
            return false;
        }
        if (!formData.url_foto) {
            setError('Debe adjuntar una foto de la garantía');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/orquestador', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save_data',
                    sessionId,
                    data: formData
                }),
            });

            const result = await response.json();

            if (result.success) {
                if (onStepComplete) {
                    onStepComplete();
                }
            } else {
                setError(result.error || 'Error al guardar la información de la garantía');
            }
        } catch (err) {
            setError('Error de conexión. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Paso 6: Garantía Mobiliaria
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Registre la información de la garantía que respalda su solicitud de crédito.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                    Información de la Garantía
                </Typography>

                {/* Foto de la Garantía */}
                <Box sx={{ mb: 3 }}>
                    <FileUploadImage
                        label="Foto de la Garantía"
                        onUploadSuccess={handleImageUpload}
                        sessionId={sessionId}
                        documentType="foto_garantia"
                    />
                </Box>

                {/* Descripción */}
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Descripción de la Garantía"
                    name="descripcion_garantia"
                    value={formData.descripcion_garantia}
                    onChange={handleInputChange}
                    placeholder="Describa detalladamente la garantía (marca, modelo, características, estado, etc.)"
                    required
                    sx={{ mb: 3 }}
                />

                {/* Valor Estimado */}
                <TextField
                    fullWidth
                    type="number"
                    label="Valor Estimado"
                    name="valor_estimado"
                    value={formData.valor_estimado}
                    onChange={handleInputChange}
                    placeholder="Ingrese el valor estimado de la garantía"
                    required
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{
                        min: 0,
                        step: 0.01
                    }}
                    sx={{ mb: 3 }}
                />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ 
                        minWidth: 200,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Guardando...
                        </>
                    ) : (
                        'Continuar al Resumen'
                    )}
                </Button>
            </Box>
        </Box>
    );
};

export default FormularioGarantia;
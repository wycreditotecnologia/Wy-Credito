// src/components/FileUpload/FileUploadImage.jsx
import React, { useState } from 'react';
import { Box, Button, Typography, LinearProgress, Alert, Paper, IconButton } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';

const FileUploadImage = ({ label, onUploadSuccess, sessionId, documentType }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [error, setError] = useState('');

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        // Validar que sea una imagen
        if (!selectedFile.type.startsWith('image/')) {
            setError('Error: Solo se permiten archivos de imagen (JPG, PNG, etc.).');
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) { // 5 MB para imágenes
            setError('Error: El archivo no puede superar los 5MB.');
            return;
        }
        setFile(selectedFile);
        setError('');
        setUploadedUrl('');
    };

    const handleUpload = async () => {
        if (!file || !sessionId) {
            setError('No hay un archivo seleccionado o falta el ID de sesión.');
            return;
        }
        setUploading(true);
        setError('');

        const fileExtension = file.name.split('.').pop();
        const fileName = `${sessionId}/${documentType}_${Date.now()}.${fileExtension}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('documentos') // Usando el mismo bucket
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documentos')
                .getPublicUrl(fileName);

            setUploadedUrl(publicUrl);
            if (onUploadSuccess) {
                onUploadSuccess(publicUrl, documentType);
            }
        } catch (err) {
            setError(`Fallo la subida: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setUploadedUrl('');
        setError('');
        if (onUploadSuccess) {
            onUploadSuccess('', documentType);
        }
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: uploadedUrl ? '#f8f9fa' : 'inherit' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>{label}</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!uploadedUrl ? (
                <>
                    <Button 
                        component="label" 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<PhotoCameraIcon />} 
                        disabled={uploading}
                        sx={{ mb: 1 }}
                    >
                        Seleccionar Imagen
                        <input 
                            type="file" 
                            hidden 
                            accept="image/jpeg,image/png,image/jpg" 
                            onChange={handleFileSelect} 
                        />
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                        Formatos permitidos: JPG, PNG (máximo 5MB)
                    </Typography>
                    {file && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">Archivo: {file.name}</Typography>
                            <Button onClick={handleUpload} variant="contained" sx={{ mt: 1 }} disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir Imagen'}
                            </Button>
                        </Box>
                    )}
                    {uploading && <LinearProgress sx={{ mt: 2 }} />}
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>¡Imagen subida con éxito!</Typography>
                    <IconButton onClick={handleRemove} size="small"><DeleteIcon /></IconButton>
                </Box>
            )}
        </Paper>
    );
};

export default FileUploadImage;
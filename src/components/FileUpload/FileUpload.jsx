// src/components/FileUpload/FileUpload.jsx
import React, { useState } from 'react';
import { Box, Button, Typography, LinearProgress, Alert, Paper, IconButton } from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient'; // Asegúrate que la ruta al cliente de Supabase es correcta

const FileUpload = ({ label, onUploadSuccess, sessionId, documentType }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [error, setError] = useState('');

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setError('Error: Solo se permiten archivos PDF.');
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // 10 MB
            setError('Error: El archivo no puede superar los 10MB.');
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

        const fileName = `${sessionId}/${documentType}_${Date.now()}.pdf`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('documentos') // Asegúrate que el bucket se llama 'documentos'
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
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: uploadedUrl ? '#f8f9fa' : 'inherit' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>{label}</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!uploadedUrl ? (
                <>
                    <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} disabled={uploading}>
                        Seleccionar PDF
                        <input type="file" hidden accept=".pdf" onChange={handleFileSelect} />
                    </Button>
                    {file && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">Archivo: {file.name}</Typography>
                            <Button onClick={handleUpload} variant="contained" sx={{ mt: 1 }} disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir Archivo'}
                            </Button>
                        </Box>
                    )}
                    {uploading && <LinearProgress sx={{ mt: 2 }} />}
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>¡Subido con éxito!</Typography>
                    <IconButton onClick={handleRemove} size="small"><DeleteIcon /></IconButton>
                </Box>
            )}
        </Paper>
    );
};

export default FileUpload;
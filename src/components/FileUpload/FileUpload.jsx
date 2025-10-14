// src/components/FileUpload/FileUpload.jsx
import React, { useState } from 'react';
import { Button, LinearProgress, IconButton } from '@mui/material';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';

const FileUpload = ({ label, onUploadSuccess, sessionId, documentType, helperText }) => {
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
                .from('documentos')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documentos')
                .getPublicUrl(fileName);

            setUploadedUrl(publicUrl);
            if (onUploadSuccess) {
                onUploadSuccess(publicUrl, documentType, {
                    nombre_archivo: file.name,
                    tamaño_archivo: file.size,
                    tipo_mime: file.type,
                    storage_path: fileName,
                });
            }
        } catch (err) {
            const msg = typeof err?.message === 'string' ? err.message : 'Error de red o credenciales inválidas';
            setError(`Fallo la subida: ${msg}`);
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
        <div className={`bg-card text-card-foreground rounded-lg border p-4 shadow-sm`}>
        <p className="text-sm font-medium mb-1">{label}</p>
            {error && (
                <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!uploadedUrl ? (
                <>
                    <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} disabled={uploading}>
                        Seleccionar PDF
                        <input type="file" hidden accept=".pdf" onChange={handleFileSelect} />
                    </Button>
                    {helperText && (
                        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
                    )}
                    {file && (
                        <div className="mt-2">
            <p className="text-sm">Archivo: {file.name}</p>
                            <Button onClick={handleUpload} variant="contained" sx={{ mt: 1 }} disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir Archivo'}
                            </Button>
                        </div>
                    )}
                    {uploading && <LinearProgress sx={{ mt: 2 }} />}
                </>
            ) : (
                <div className="flex items-center text-success">
                    <CheckCircleIcon className="mr-1" />
            <p className="text-sm flex-1">¡Subido con éxito!</p>
                    <IconButton onClick={handleRemove} size="small"><DeleteIcon /></IconButton>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
// src/components/FileUpload/FileUploadImage.jsx
import React, { useState } from 'react';
import { Button, LinearProgress, IconButton } from '@mui/material';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
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
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
            <p className="text-sm font-medium mb-1">{label}</p>
            {error && (
                <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

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
                    <p className="text-xs text-muted-foreground text-center">
                        Formatos permitidos: JPG, PNG (máximo 5MB)
                    </p>
                    {file && (
                        <div className="mt-2">
                            <p className="text-sm">Archivo: {file.name}</p>
                            <Button onClick={handleUpload} variant="contained" sx={{ mt: 1 }} disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir Imagen'}
                            </Button>
                        </div>
                    )}
                    {uploading && <LinearProgress sx={{ mt: 2 }} />}
                </>
            ) : (
                <div className="flex items-center text-success">
                    <CheckCircleIcon className="mr-1" />
                    <p className="text-sm flex-1">¡Imagen subida con éxito!</p>
                    <IconButton onClick={handleRemove} size="small"><DeleteIcon /></IconButton>
                </div>
            )}
        </div>
    );
};

export default FileUploadImage;
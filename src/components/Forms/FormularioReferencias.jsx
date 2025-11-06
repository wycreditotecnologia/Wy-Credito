import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import { logger } from '../../lib/logger.js';

const FormularioReferencias = ({ sessionId, onStepComplete }) => {
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    nombre_referencia_1: '',
    telefono_referencia_1: '',
    nombre_referencia_2: '',
    telefono_referencia_2: ''
  });

  // Estados para manejo de UI
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Función para manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validación de formato de teléfono (números, espacios, guiones, paréntesis)
  const validatePhone = (phone) => {
    // Permite dígitos, espacios, paréntesis, signo más y guiones
    const phoneRegex = /^[\d\s()+-]{7,15}$/;
    return phoneRegex.test(phone.trim());
  };

  // Función de validación
  const validateForm = () => {
    const newErrors = {};

    // Validar campos requeridos
    if (!formData.nombre_referencia_1.trim()) {
      newErrors.nombre_referencia_1 = 'El nombre de la primera referencia es requerido';
    }

    if (!formData.telefono_referencia_1.trim()) {
      newErrors.telefono_referencia_1 = 'El teléfono de la primera referencia es requerido';
    } else if (!validatePhone(formData.telefono_referencia_1)) {
      newErrors.telefono_referencia_1 = 'Formato de teléfono inválido';
    }

    if (!formData.nombre_referencia_2.trim()) {
      newErrors.nombre_referencia_2 = 'El nombre de la segunda referencia es requerido';
    }

    if (!formData.telefono_referencia_2.trim()) {
      newErrors.telefono_referencia_2 = 'El teléfono de la segunda referencia es requerido';
    } else if (!validatePhone(formData.telefono_referencia_2)) {
      newErrors.telefono_referencia_2 = 'Formato de teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Preparar payload para el orquestador
      const payload = {
        action: 'submit_form_step',
        sessionId: sessionId,
        step: 4,
        data: {
          nombre_referencia_1: formData.nombre_referencia_1.trim(),
          telefono_referencia_1: formData.telefono_referencia_1.trim(),
          nombre_referencia_2: formData.nombre_referencia_2.trim(),
          telefono_referencia_2: formData.telefono_referencia_2.trim()
        }
      };

      logger.log('Enviando datos de referencias:', payload);

      // Enviar al orquestador
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result = await response.json();
      logger.log('Respuesta del orquestador:', result);

      // Notificar al componente padre que el paso se completó
      if (onStepComplete) {
        onStepComplete(4);
      }

    } catch (error) {
      logger.error('Error al enviar referencias:', error);
      setSubmitError('Error al enviar la información. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Paso 4: Referencias Comerciales
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Proporcione información de dos referencias comerciales que puedan dar testimonio 
          de la actividad y reputación de su empresa.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Referencia 1 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Referencia Comercial #1
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Completo - Referencia 1"
                value={formData.nombre_referencia_1}
                onChange={(e) => handleInputChange('nombre_referencia_1', e.target.value)}
                error={!!errors.nombre_referencia_1}
                helperText={errors.nombre_referencia_1}
                required
                placeholder="Ej: Juan Carlos Pérez"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono - Referencia 1"
                value={formData.telefono_referencia_1}
                onChange={(e) => handleInputChange('telefono_referencia_1', e.target.value)}
                error={!!errors.telefono_referencia_1}
                helperText={errors.telefono_referencia_1}
                required
                placeholder="Ej: 300 123 4567"
              />
            </Grid>
          </Grid>

          {/* Referencia 2 */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Referencia Comercial #2
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre Completo - Referencia 2"
                value={formData.nombre_referencia_2}
                onChange={(e) => handleInputChange('nombre_referencia_2', e.target.value)}
                error={!!errors.nombre_referencia_2}
                helperText={errors.nombre_referencia_2}
                required
                placeholder="Ej: María Elena Rodríguez"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono - Referencia 2"
                value={formData.telefono_referencia_2}
                onChange={(e) => handleInputChange('telefono_referencia_2', e.target.value)}
                error={!!errors.telefono_referencia_2}
                helperText={errors.telefono_referencia_2}
                required
                placeholder="Ej: 301 987 6543"
              />
            </Grid>
          </Grid>

          {/* Error de envío */}
          {submitError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {submitError}
            </Alert>
          )}

          {/* Botón de envío */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ minWidth: 200 }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Enviando...
                </>
              ) : (
                'Continuar al Siguiente Paso'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormularioReferencias;
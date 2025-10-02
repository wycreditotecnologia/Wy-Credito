import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider
} from '@mui/material';

const FormularioAceptacion = ({ sessionId, onStepComplete }) => {
  // Estado para los checkboxes
  const [acceptances, setAcceptances] = useState({
    aceptacion_productiva: false,
    aceptacion_no_personal: false,
    aceptacion_habeas_data: false
  });

  // Estados para manejo de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Función para manejar cambios en los checkboxes
  const handleCheckboxChange = (field) => (event) => {
    setAcceptances(prev => ({
      ...prev,
      [field]: event.target.checked
    }));

    // Limpiar errores cuando el usuario interactúe
    if (validationError) {
      setValidationError('');
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  // Función de validación
  const validateForm = () => {
    const { aceptacion_productiva, aceptacion_no_personal, aceptacion_habeas_data } = acceptances;
    
    if (!aceptacion_productiva || !aceptacion_no_personal || !aceptacion_habeas_data) {
      setValidationError('Debe aceptar todas las declaraciones para continuar.');
      return false;
    }
    
    setValidationError('');
    return true;
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
        step: 5,
        data: {
          aceptacion_productiva: acceptances.aceptacion_productiva,
          aceptacion_no_personal: acceptances.aceptacion_no_personal,
          aceptacion_habeas_data: acceptances.aceptacion_habeas_data
        }
      };

      console.log('Enviando declaraciones y aceptaciones:', payload);

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
      console.log('Respuesta del orquestador:', result);

      // Notificar al componente padre que el paso se completó
      if (onStepComplete) {
        onStepComplete(5);
      }

    } catch (error) {
      console.error('Error al enviar declaraciones:', error);
      setSubmitError('Error al enviar la información. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Paso 5: Declaraciones y Aceptación
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Para completar su solicitud, debe leer y aceptar las siguientes declaraciones 
          y términos de servicio.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <FormGroup>
            {/* Declaración 1: Uso Productivo */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptances.aceptacion_productiva}
                  onChange={handleCheckboxChange('aceptacion_productiva')}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  <strong>Confirmo que los recursos solicitados se destinarán únicamente 
                  a actividades productivas de la empresa.</strong>
                  <br />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Los fondos serán utilizados exclusivamente para el crecimiento y 
                    operación de la empresa.
                  </Typography>
                </Typography>
              }
              sx={{ 
                mb: 3, 
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { mt: -0.5 }
              }}
            />

            {/* Declaración 2: No Uso Personal */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptances.aceptacion_no_personal}
                  onChange={handleCheckboxChange('aceptacion_no_personal')}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  <strong>Declaro que no serán usados para fines personales, 
                  especulativos o ajenos a la empresa.</strong>
                  <br />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Los recursos no se destinarán a gastos personales, inversiones 
                    especulativas o actividades no relacionadas con la empresa.
                  </Typography>
                </Typography>
              }
              sx={{ 
                mb: 3, 
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { mt: -0.5 }
              }}
            />

            {/* Declaración 3: Habeas Data y Términos */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptances.aceptacion_habeas_data}
                  onChange={handleCheckboxChange('aceptacion_habeas_data')}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  <strong>Acepto las políticas de Habeas Data y los términos 
                  y condiciones de Wy Credito.</strong>
                  <br />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Autorizo el tratamiento de mis datos personales según la política 
                    de privacidad y acepto los términos de servicio.
                  </Typography>
                </Typography>
              }
              sx={{ 
                mb: 3, 
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { mt: -0.5 }
              }}
            />
          </FormGroup>

          {/* Error de validación */}
          {validationError && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {validationError}
            </Alert>
          )}

          {/* Error de envío */}
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Botón de envío */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ 
                minWidth: 250,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Finalizando Solicitud...
                </>
              ) : (
                'Finalizar Solicitud de Crédito'
              )}
            </Button>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Al hacer clic en "Finalizar", su solicitud será enviada para evaluación.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormularioAceptacion;
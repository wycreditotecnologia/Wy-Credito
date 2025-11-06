import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Paper,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Language as WebIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';
import { logger } from '../../lib/logger.js';

const FormularioEmpresa = ({ onStepComplete, sessionId }) => {
  const [formData, setFormData] = useState({
    nit: '',
    razonSocial: '',
    tipoEmpresa: '',
    paginaWeb: '',
    redesSociales: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
    },
    autorizacionConsulta: false,
    habeasData: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Opciones para tipo de empresa
  const tiposEmpresa = [
    { value: 'sas', label: 'Sociedad por Acciones Simplificada (SAS)' },
    { value: 'sa', label: 'Sociedad Anónima (SA)' },
    { value: 'ltda', label: 'Sociedad de Responsabilidad Limitada (LTDA)' },
    { value: 'colectiva', label: 'Sociedad Colectiva' },
    { value: 'comandita_simple', label: 'Sociedad en Comandita Simple' },
    { value: 'comandita_acciones', label: 'Sociedad en Comandita por Acciones' },
    { value: 'empresa_unipersonal', label: 'Empresa Unipersonal' },
    { value: 'persona_natural', label: 'Persona Natural' },
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación NIT
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT es obligatorio';
    } else if (!/^\d{9,11}$/.test(formData.nit.replace(/[.-]/g, ''))) {
      newErrors.nit = 'El NIT debe tener entre 9 y 11 dígitos';
    }

    // Validación Razón Social
    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = 'La razón social es obligatoria';
    } else if (formData.razonSocial.trim().length < 3) {
      newErrors.razonSocial = 'La razón social debe tener al menos 3 caracteres';
    }

    // Validación Tipo de Empresa
    if (!formData.tipoEmpresa) {
      newErrors.tipoEmpresa = 'Debe seleccionar el tipo de empresa';
    }

    // Validación Página Web (opcional pero si se llena debe ser válida)
    if (formData.paginaWeb && !/^https?:\/\/.+\..+/.test(formData.paginaWeb)) {
      newErrors.paginaWeb = 'Ingrese una URL válida (ej: https://www.ejemplo.com)';
    }

    // Validación Autorizaciones
    if (!formData.autorizacionConsulta) {
      newErrors.autorizacionConsulta = 'Debe autorizar la consulta en centrales de riesgo';
    }

    if (!formData.habeasData) {
      newErrors.habeasData = 'Debe aceptar el tratamiento de datos personales';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    // Verificar que tenemos sessionId
    if (!sessionId) {
      setSubmitError('Error: No se encontró una sesión activa. Por favor, reinicie el proceso.');
      return;
    }

    setLoading(true);

    try {
      // Preparar los datos para enviar al orquestador
      const payload = {
        nit: formData.nit.trim(),
        razon_social: formData.razonSocial.trim(),
        tipo_empresa: formData.tipoEmpresa,
        pagina_web: formData.paginaWeb.trim() || null,
        facebook: formData.redesSociales.facebook.trim() || null,
        instagram: formData.redesSociales.instagram.trim() || null,
        linkedin: formData.redesSociales.linkedin.trim() || null,
        twitter: formData.redesSociales.twitter.trim() || null,
        autorizacion_consulta: formData.autorizacionConsulta,
        habeas_data: formData.habeasData,
      };

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
        throw new Error(result.error || 'Error al enviar los datos');
      }

      // Si todo salió bien, navegar al siguiente paso
      logger.log('Datos enviados correctamente:', result);
      
      // Llamar a la función de callback para avanzar al siguiente paso
      if (onStepComplete) {
        onStepComplete(2); // Avanzar al paso 2 (Documentación Legal)
      }

    } catch (error) {
      logger.error('Error al enviar formulario:', error);
      setSubmitError(error.message || 'Error al enviar los datos. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        {/* Información Básica de la Empresa */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1, color: '#3b82f6' }} />
            Información Básica de la Empresa
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="NIT de la Empresa"
                value={formData.nit}
                onChange={(e) => handleInputChange('nit', e.target.value)}
                error={!!errors.nit}
                helperText={errors.nit || 'Ingrese el NIT sin puntos ni guiones'}
                placeholder="123456789"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Razón Social"
                value={formData.razonSocial}
                onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                error={!!errors.razonSocial}
                helperText={errors.razonSocial || 'Nombre completo de la empresa'}
                placeholder="Empresa Ejemplo S.A.S."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.tipoEmpresa}>
                <InputLabel>Tipo de Empresa</InputLabel>
                <Select
                  value={formData.tipoEmpresa}
                  label="Tipo de Empresa"
                  onChange={(e) => handleInputChange('tipoEmpresa', e.target.value)}
                >
                  {tiposEmpresa.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tipoEmpresa && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.tipoEmpresa}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Presencia Digital */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <WebIcon sx={{ mr: 1, color: '#3b82f6' }} />
            Presencia Digital
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Página Web"
                value={formData.paginaWeb}
                onChange={(e) => handleInputChange('paginaWeb', e.target.value)}
                error={!!errors.paginaWeb}
                helperText={errors.paginaWeb || 'URL de la página web de la empresa (opcional)'}
                placeholder="https://www.miempresa.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WebIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook"
                value={formData.redesSociales.facebook}
                onChange={(e) => handleInputChange('redesSociales.facebook', e.target.value)}
                placeholder="https://facebook.com/miempresa"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram"
                value={formData.redesSociales.instagram}
                onChange={(e) => handleInputChange('redesSociales.instagram', e.target.value)}
                placeholder="https://instagram.com/miempresa"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn"
                value={formData.redesSociales.linkedin}
                onChange={(e) => handleInputChange('redesSociales.linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/miempresa"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Twitter"
                value={formData.redesSociales.twitter}
                onChange={(e) => handleInputChange('redesSociales.twitter', e.target.value)}
                placeholder="https://twitter.com/miempresa"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TwitterIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Autorizaciones */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Autorizaciones y Consentimientos
          </Typography>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.autorizacionConsulta}
                  onChange={(e) => handleInputChange('autorizacionConsulta', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Autorizo a Wy Crédito para consultar mi información en las centrales de riesgo 
                  (DataCrédito, CIFIN, etc.) para evaluar mi solicitud de crédito.
                </Typography>
              }
            />
            {errors.autorizacionConsulta && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.autorizacionConsulta}
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.habeasData}
                  onChange={(e) => handleInputChange('habeasData', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Acepto el tratamiento de mis datos personales de acuerdo con la 
                  <strong> Política de Tratamiento de Datos Personales</strong> de Wy Crédito 
                  y autorizo el uso de esta información para fines comerciales y de marketing.
                </Typography>
              }
            />
            {errors.habeasData && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.habeasData}
              </Alert>
            )}
          </Box>
        </Box>

        {/* Error de envío */}
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        {/* Botones de Acción */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              minWidth: 120,
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Guardando...' : 'Guardar y Continuar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormularioEmpresa;
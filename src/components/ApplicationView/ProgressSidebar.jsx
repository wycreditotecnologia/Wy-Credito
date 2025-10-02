import React from 'react';
import { Box, Stepper, Step, StepLabel, Typography, Paper } from '@mui/material';

// Estos pasos vienen de nuestro flujo definido en el CSV
const steps = [
  'Onboarding Personal',
  'Información de la Empresa',
  'Documentación Legal',
  'Información Financiera',
  'Referencias y Declaraciones',
  'Garantía',
  'Revisión Final',
];

const ProgressSidebar = ({ currentStep }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Segoe UI' }}>
        Progreso de Solicitud
      </Typography>
      <Stepper activeStep={currentStep} orientation="vertical">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

export default ProgressSidebar;
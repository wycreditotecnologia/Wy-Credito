import React, { useState, useMemo } from 'react';
import {
  Card, CardContent, Typography, Slider, Box, Button, Grid, Divider,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);

const CreditCalculator = ({ onStartApplication }) => {
  const [monto, setMonto] = useState(50000000);
  const [plazo, setPlazo] = useState(36);

  const { cuotaMensual } = useMemo(() => {
    const TASA_INTERES_MENSUAL = 0.019;
    const i = TASA_INTERES_MENSUAL;
    const n = plazo;
    const P = monto;
    const cuota = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    return { cuotaMensual: cuota };
  }, [monto, plazo]);

  const handleStart = () => {
    onStartApplication({ amount: monto, term: plazo });
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '70vh' }}>
      <Grid item xs={12} sm={10} md={8} lg={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom textAlign="center">
              Simula tu crédito empresarial
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={4}>
              Proyecta el crecimiento de tu negocio. Ajusta el monto y el plazo para ver una cuota estimada.
            </Typography>
            <Box mb={4}>
              <Typography gutterBottom fontWeight="medium">Monto a solicitar</Typography>
              <Typography variant="h4" color="primary.dark" fontWeight="bold">{formatCurrency(monto)}</Typography>
              <Slider value={monto} min={5000000} max={500000000} step={1000000} onChange={(_, newValue) => setMonto(newValue)} />
            </Box>
            <Box mb={4}>
              <Typography gutterBottom fontWeight="medium">Plazo</Typography>
              <Typography variant="h4" color="primary.dark" fontWeight="bold">{plazo} meses</Typography>
              <Slider value={plazo} min={12} max={60} step={1} onChange={(_, newValue) => setPlazo(newValue)} />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box textAlign="center">
                <Typography variant="h6" color="text.secondary">Cuota mensual estimada</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main" mb={3}>
                    {formatCurrency(cuotaMensual)}
                </Typography>
                <Button 
                    variant="contained" 
                    size="large" 
                    startIcon={<TrendingUp />} 
                    onClick={handleStart} 
                >
                    Iniciar mi Solicitud
                </Button>
                 <Typography variant="caption" display="block" color="text.secondary" mt={2}>
                    Este cálculo no constituye una oferta formal y está sujeto a estudio de crédito.
                </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreditCalculator;
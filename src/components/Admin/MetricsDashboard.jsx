import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { getDashboardMetrics } from '../../services/solicitud';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const MetricsDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar a la función PostgreSQL
      const data = await getDashboardMetrics();
      
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Error al cargar las métricas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        No se pudieron cargar las métricas
      </Alert>
    );
  }

  // Preparar datos para los gráficos
  const statusData = metrics.status_distribution?.map(item => ({
    name: item.status,
    value: item.count,
    label: item.status === 'pendiente' ? 'Pendiente' :
           item.status === 'aprobada' ? 'Aprobada' :
           item.status === 'rechazada' ? 'Rechazada' :
           item.status === 'incompleta' ? 'Incompleta' :
           item.status
  })) || [];

  const monthlyData = metrics.monthly_applications || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard de Métricas - Wy Crédito
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          sx={{ fontWeight: 'bold' }}
        >
          Volver al Panel Admin
        </Button>
      </Box>
      
      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Solicitudes
              </Typography>
              <Typography variant="h4" component="div">
                {formatNumber(metrics.total_applications)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monto Promedio
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(metrics.average_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Monto Total
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(metrics.total_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Solicitudes Hoy
              </Typography>
              <Typography variant="h4" component="div">
                {formatNumber(metrics.applications_today)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métricas por período */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Esta Semana
              </Typography>
              <Typography variant="h5" component="div">
                {formatNumber(metrics.applications_this_week)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Este Mes
              </Typography>
              <Typography variant="h5" component="div">
                {formatNumber(metrics.applications_this_month)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Estados de Solicitudes
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip 
                  label={`Pendientes: ${metrics.pending_applications}`} 
                  color="warning" 
                  size="small" 
                />
                <Chip 
                  label={`Aprobadas: ${metrics.approved_applications}`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`Rechazadas: ${metrics.rejected_applications}`} 
                  color="error" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Distribución por Estado */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribución por Estado
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Solicitudes por Mes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Solicitudes por Mes
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Solicitudes"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de barras por estado */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen por Estado
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Cantidad de Solicitudes" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsDashboard;
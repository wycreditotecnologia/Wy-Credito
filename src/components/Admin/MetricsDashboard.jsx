import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip, Button } from '@mui/material';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import Spinner from '@/components/ui/spinner';
import { AlertTriangle, Info } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert className="m-2">
        <Info className="h-4 w-4" />
        <AlertTitle>Advertencia</AlertTitle>
        <AlertDescription>No se pudieron cargar las métricas</AlertDescription>
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
    <div className="p-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-2xl font-semibold">
          Dashboard de Métricas - Wy Crédito
        </h4>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          sx={{ fontWeight: 'bold' }}
        >
          Volver al Panel Admin
        </Button>
      </div>
      
      {/* Métricas principales */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Total Solicitudes
              </p>
              <div className="text-2xl font-semibold">
                {formatNumber(metrics.total_applications)}
              </div>
            </div>
          </div>
        
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Monto Promedio
              </p>
              <div className="text-2xl font-semibold">
                {formatCurrency(metrics.average_amount)}
              </div>
            </div>
          </div>
        
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Monto Total
              </p>
              <div className="text-2xl font-semibold">
                {formatCurrency(metrics.total_amount)}
              </div>
            </div>
          </div>
        
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Solicitudes Hoy
              </p>
              <div className="text-2xl font-semibold">
                {formatNumber(metrics.applications_today)}
              </div>
            </div>
          </div>
      </div>

      {/* Métricas por período */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Esta Semana
              </p>
              <div className="text-xl font-semibold">
                {formatNumber(metrics.applications_this_week)}
              </div>
            </div>
          </div>
        
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Este Mes
              </p>
              <div className="text-xl font-semibold">
                {formatNumber(metrics.applications_this_month)}
              </div>
            </div>
          </div>
        
        <div className="col-span-12 sm:col-span-4">
          <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">
                Estados de Solicitudes
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
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
              </div>
            </div>
          </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-12 gap-3">
        {/* Distribución por Estado */}
        <div className="col-span-12 md:col-span-6">
          <div className="bg-card text-card-foreground rounded-lg border p-2 shadow-sm">
            <h6 className="text-lg font-semibold mb-2">
              Distribución por Estado
            </h6>
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
          </div>
        </div>

        {/* Solicitudes por Mes */}
        <div className="col-span-12 md:col-span-6">
          <div className="bg-card text-card-foreground rounded-lg border p-2 shadow-sm">
            <h6 className="text-lg font-semibold mb-2">
              Solicitudes por Mes
            </h6>
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
          </div>
        </div>

        {/* Gráfico de barras por estado */}
        <div className="col-span-12">
          <div className="bg-card text-card-foreground rounded-lg border p-2 shadow-sm">
            <h6 className="text-lg font-semibold mb-2">
              Resumen por Estado
            </h6>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
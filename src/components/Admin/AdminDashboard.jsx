import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { Box, Typography, Paper, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { supabase } from '../../lib/supabaseClient';

const columns = [
  { field: 'id', headerName: 'ID Solicitud', width: 250 },
  { field: 'created_at', headerName: 'Fecha', width: 150,
    valueFormatter: (params) => new Date(params.value).toLocaleDateString('es-CO'),
  },
  { field: 'estado', headerName: 'Estado', width: 120 },
  { field: 'monto_solicitado', headerName: 'Monto Solicitado', width: 180,
    valueFormatter: (params) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(params.value),
  },
  { field: 'plazo_seleccionado', headerName: 'Plazo (Meses)', width: 130 },
  { field: 'email_solicitante', headerName: 'Email del Solicitante', width: 250 },
];

const AdminDashboard = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook para navegar

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching solicitudes:', error);
      } else {
        setSolicitudes(data);
      }
      setLoading(false);
    };
    fetchSolicitudes();
  }, []);

  const handleRowClick = (params) => {
    navigate(`/admin/solicitud/${params.id}`); // Navegamos a la vista de detalle
  };

  return (
    <Paper sx={{ p: 3, m: 2, borderRadius: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Segoe UI', fontWeight: 'bold' }}>
          Panel de Administración de Solicitudes
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/admin/dashboard')}
          sx={{ fontWeight: 'bold' }}
        >
          Ver Dashboard de Métricas
        </Button>
      </Box>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={solicitudes}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          onRowClick={handleRowClick} // Añadimos el evento de clic
          sx={{ '& .MuiDataGrid-row:hover': { cursor: 'pointer' } }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default AdminDashboard;
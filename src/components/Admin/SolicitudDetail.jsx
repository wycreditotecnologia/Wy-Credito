import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Grid, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';

const SolicitudDetail = () => {
  const { id } = useParams(); // Obtiene el ID de la solicitud desde la URL
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitud = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          *,
          empresas(*),
          representantes_legales(*),
          documentos(*)
        `)
        .eq('id', id)
        .single(); // .single() para obtener un solo registro

      if (error) {
        console.error('Error fetching solicitud:', error);
      } else {
        setSolicitud(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchSolicitud();
    }
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!solicitud) {
    return <Typography>No se encontró la solicitud.</Typography>;
  }

  const empresa = solicitud.empresas[0] || {};
  const representantes = solicitud.representantes_legales || [];
  const documentos = solicitud.documentos || [];

  return (
    <Paper sx={{ p: 3, m: 2, borderRadius: 4 }}>
      <Button component={Link} to="/admin" sx={{ mb: 2 }}>&larr; Volver a la lista</Button>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Segoe UI', fontWeight: 'bold' }}>
        Detalle de Solicitud #{solicitud.id.substring(0, 8)}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Datos Generales</Typography>
          <List dense>
            <ListItem><ListItemText primary="Estado" secondary={solicitud.estado} /></ListItem>
            <ListItem><ListItemText primary="Monto Solicitado" secondary={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(solicitud.monto_solicitado)} /></ListItem>
            <ListItem><ListItemText primary="Plazo" secondary={`${solicitud.plazo_seleccionado} meses`} /></ListItem>
            <ListItem><ListItemText primary="Email Contacto" secondary={solicitud.email_solicitante} /></ListItem>
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Datos de la Empresa</Typography>
          <List dense>
            <ListItem><ListItemText primary="Razón Social" secondary={empresa.razon_social || 'N/A'} /></ListItem>
            <ListItem><ListItemText primary="NIT" secondary={empresa.nit || 'N/A'} /></ListItem>
            <ListItem><ListItemText primary="Sitio Web" secondary={empresa.sitio_web || 'N/A'} /></ListItem>
          </List>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Documentos Adjuntos</Typography>
          <List>
            {documentos.length > 0 ? documentos.map(doc => (
              <ListItem key={doc.id}>
                <Button variant="outlined" href={doc.url_archivo} target="_blank" rel="noopener noreferrer">
                  Ver {doc.tipo_documento.replace(/_/g, ' ')}
                </Button>
              </ListItem>
            )) : <Typography>No hay documentos adjuntos.</Typography>}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SolicitudDetail;
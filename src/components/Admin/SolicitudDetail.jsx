import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Button } from '@mui/material';
import { Separator } from '@/components/ui/separator';
import Spinner from '@/components/ui/spinner';
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
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (!solicitud) {
    return <p className="text-sm">No se encontró la solicitud.</p>;
  }

  const empresa = solicitud.empresas[0] || {};
  const representantes = solicitud.representantes_legales || [];
  const documentos = solicitud.documentos || [];

  return (
    <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm m-2">
      <Button component={Link} to="/admin" sx={{ mb: 2 }}>&larr; Volver a la lista</Button>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Detalle de Solicitud #{solicitud.id.substring(0, 8)}
      </h1>
      <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-6">
          <h3 className="text-xl font-semibold border-b pb-2 mb-2">Datos Generales</h3>
          <List dense>
            <ListItem><ListItemText primary="Estado" secondary={solicitud.estado} /></ListItem>
            <ListItem><ListItemText primary="Monto Solicitado" secondary={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(solicitud.monto_solicitado)} /></ListItem>
            <ListItem><ListItemText primary="Plazo" secondary={`${solicitud.plazo_seleccionado} meses`} /></ListItem>
            <ListItem><ListItemText primary="Email Contacto" secondary={solicitud.email_solicitante} /></ListItem>
          </List>
      </div>
        <div className="col-span-12 md:col-span-6">
          <h3 className="text-xl font-semibold border-b pb-2 mb-2">Datos de la Empresa</h3>
          <List dense>
            <ListItem><ListItemText primary="Razón Social" secondary={empresa.razon_social || 'N/A'} /></ListItem>
            <ListItem><ListItemText primary="NIT" secondary={empresa.nit || 'N/A'} /></ListItem>
            <ListItem><ListItemText primary="Sitio Web" secondary={empresa.sitio_web || 'N/A'} /></ListItem>
          </List>
        </div>
        <div className="col-span-12">
          <Separator className="my-2" />
          <h3 className="text-xl font-semibold border-b pb-2 mb-2">Documentos Adjuntos</h3>
          <List>
            {documentos.length > 0 ? documentos.map(doc => (
              <ListItem key={doc.id}>
                <Button variant="outlined" href={doc.url_archivo} target="_blank" rel="noopener noreferrer">
                  Ver {doc.tipo_documento.replace(/_/g, ' ')}
                </Button>
              </ListItem>
            )) : <p className="text-sm text-muted-foreground">No hay documentos adjuntos.</p>}
          </List>
        </div>
      </div>
    </div>
  );
};

export default SolicitudDetail;
// src/components/Forms/PantallaResumen.jsx
import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    Button, 
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Grid
} from '@mui/material';
import { 
    Business as BusinessIcon,
    Description as DescriptionIcon,
    AccountBalance as AccountBalanceIcon,
    People as PeopleIcon,
    Gavel as GavelIcon,
    Security as SecurityIcon,
    Send as SendIcon
} from '@mui/icons-material';

const PantallaResumen = ({ sessionId, onStepComplete }) => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let isActive = true;
        setLoading(true);

        const loadSummaryData = async () => {
            try {
                const response = await fetch('/api/orchestrator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'get_summary_data',
                        sessionId
                    }),
                });

                const result = await response.json();

                if (!isActive) return;

                if (result.success) {
                    setSummaryData(result.data);
                } else {
                    setError(result.error || 'Error al cargar los datos del resumen');
                }
            } catch (err) {
                if (!isActive) return;
                setError('Error de conexión al cargar el resumen');
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        loadSummaryData();
        return () => { isActive = false; };
    }, [sessionId]);

    const handleFinalSubmission = async () => {
        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/orchestrator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'complete_submission',
                    sessionId
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(`¡Solicitud enviada exitosamente! Código de seguimiento: ${result.trackingCode}`);
                if (onStepComplete) {
                    onStepComplete();
                }
            } else {
                setError(result.error || 'Error al enviar la solicitud');
            }
        } catch (err) {
            setError('Error de conexión al enviar la solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ ml: 2 }}>Cargando resumen...</Typography>
            </Box>
        );
    }

    if (!summaryData) {
        return (
            <Alert severity="error">
                No se pudieron cargar los datos del resumen. Por favor, intente nuevamente.
            </Alert>
        );
    }

    const { solicitud, empresa, documentos, garantia } = summaryData;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', textAlign: 'center' }}>
                Resumen de su Solicitud de Crédito
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
                Revise cuidadosamente toda la información antes de enviar su solicitud.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {/* Información de la Solicitud */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Información de la Solicitud
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Monto Solicitado:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            ${solicitud?.monto_solicitado?.toLocaleString() || 'N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Plazo:</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {solicitud?.plazo_meses || 'N/A'} meses
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Propósito:</Typography>
                        <Typography variant="body1">{solicitud?.proposito || 'N/A'}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Información de la Empresa */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Información de la Empresa
                    </Typography>
                </Box>
                <List dense>
                    <ListItem>
                        <ListItemText 
                            primary="Razón Social" 
                            secondary={empresa?.razon_social || 'N/A'} 
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText 
                            primary="NIT" 
                            secondary={empresa?.nit || 'N/A'} 
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText 
                            primary="Sector Económico" 
                            secondary={empresa?.sector_economico || 'N/A'} 
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText 
                            primary="Años de Funcionamiento" 
                            secondary={empresa?.anos_funcionamiento || 'N/A'} 
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText 
                            primary="Número de Empleados" 
                            secondary={empresa?.numero_empleados || 'N/A'} 
                        />
                    </ListItem>
                </List>
            </Paper>

            {/* Documentos Cargados */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Documentos Cargados
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {documentos && documentos.length > 0 ? (
                        documentos.map((doc, index) => (
                            <Chip 
                                key={index}
                                label={doc.tipo_documento}
                                color="success"
                                variant="outlined"
                            />
                        ))
                    ) : (
                        <Typography color="text.secondary">No hay documentos cargados</Typography>
                    )}
                </Box>
            </Paper>

            {/* Referencias */}
            {(empresa?.nombre_referencia_1 || empresa?.nombre_referencia_2) && (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Referencias Comerciales
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {empresa?.nombre_referencia_1 && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Referencia 1:</Typography>
                                <Typography variant="body1">{empresa.nombre_referencia_1}</Typography>
                                <Typography variant="body2">{empresa.telefono_referencia_1}</Typography>
                            </Grid>
                        )}
                        {empresa?.nombre_referencia_2 && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">Referencia 2:</Typography>
                                <Typography variant="body1">{empresa.nombre_referencia_2}</Typography>
                                <Typography variant="body2">{empresa.telefono_referencia_2}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            )}

            {/* Garantía */}
            {garantia && (
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Garantía Mobiliaria
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Descripción:</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>{garantia.descripcion}</Typography>
                    <Typography variant="body2" color="text.secondary">Valor Estimado:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ${garantia.valor_estimado?.toLocaleString() || 'N/A'}
                    </Typography>
                </Paper>
            )}

            {/* Declaraciones */}
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GavelIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Declaraciones Aceptadas
                    </Typography>
                </Box>
                <List dense>
                    <ListItem>
                        <ListItemText 
                            primary="✓ Acepto que el crédito será destinado únicamente para fines productivos"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText 
                            primary="✓ Declaro que el crédito no será utilizado para gastos personales"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText 
                            primary="✓ Autorizo el tratamiento de mis datos personales según la política de habeas data"
                        />
                    </ListItem>
                </List>
            </Paper>

            <Divider sx={{ mb: 4 }} />

            {/* Botón de Envío Final */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    onClick={handleFinalSubmission}
                    variant="contained"
                    size="large"
                    disabled={submitting || success}
                    startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ 
                        minWidth: 300,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        backgroundColor: success ? 'success.main' : 'primary.main'
                    }}
                >
                    {submitting ? 'Enviando Solicitud...' : success ? 'Solicitud Enviada' : 'Confirmar y Enviar Solicitud'}
                </Button>
            </Box>

            {success && (
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                    Recibirá un correo de confirmación con los detalles de su solicitud.
                </Typography>
            )}
        </Box>
    );
};

export default PantallaResumen;
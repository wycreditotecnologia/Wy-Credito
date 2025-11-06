import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

const ChatInterface = ({ initialAmount, initialTerm, onGoBack }) => {
  return (
    <Card>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Interfaz de Chat de Wally
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí comenzará la conversación con nuestro asistente &quot;Wally&quot;.
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Monto inicial: ${new Intl.NumberFormat('es-CO').format(initialAmount)}
        </Typography>
        <Typography variant="h6">
          Plazo: {initialTerm} meses
        </Typography>
        <Button variant="outlined" onClick={onGoBack} sx={{ mt: 3 }}>
          Volver a la Calculadora
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
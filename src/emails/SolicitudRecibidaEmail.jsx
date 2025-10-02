import React from 'react';
import { Html, Head, Preview, Body, Container, Heading, Text, Link, Hr } from '@react-email/components';

const SolicitudRecibidaEmail = ({
  nombreSolicitante = "Cliente",
  montoSolicitado = 50000000,
  plazo = 36,
  solicitudId = "WY-XXXX-YYYY",
}) => {
  const formattedAmount = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(montoSolicitado);

  return (
    <Html>
      <Head />
      <Preview>Confirmación de tu solicitud de crédito Wy</Preview>
      <Body style={{ backgroundColor: '#f5f7fa', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '20px', backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px' }}>
          <Heading style={{ color: '#3097CD', fontFamily: 'Segoe UI' }}>Wy Credito</Heading>
          <Text style={{ color: '#000000', fontFamily: 'Century Gothic Pro' }}>
            ¡Hola, {nombreSolicitante}!
          </Text>
          <Text style={{ color: '#318590', fontFamily: 'Century Gothic Pro' }}>
            Hemos recibido tu solicitud de crédito y nuestro equipo ya ha comenzado a trabajar en ella. A continuación, te dejamos un resumen de tu solicitud:
          </Text>
          <Hr />
          <Text style={{ fontFamily: 'Century Gothic Pro' }}>
            <strong>ID de Solicitud:</strong> {solicitudId}
            <br />
            <strong>Monto Solicitado:</strong> {formattedAmount}
            <br />
            <strong>Plazo:</strong> {plazo} meses
          </Text>
          <Hr />
          <Text style={{ fontFamily: 'Century Gothic Pro', fontSize: '12px', color: '#888' }}>
            Un asesor se comunicará contigo en las próximas 48 horas hábiles para informarte sobre los siguientes pasos. Puedes hacer seguimiento a tu solicitud con el ID proporcionado.
          </Text>
          <Link href="https://wy-credito.com" style={{ color: '#3097CD' }}>
            Visita nuestro sitio web
          </Link>
        </Container>
      </Body>
    </Html>
  );
};

export default SolicitudRecibidaEmail;
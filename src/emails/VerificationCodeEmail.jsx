import React from 'react';
import { Html, Head, Preview, Body, Container, Heading, Text, Hr } from '@react-email/components';

const VerificationCodeEmail = ({ nombre = 'Cliente', codigo = '------', expiracionMin = 10 }) => {
  return (
    <Html>
      <Head />
      <Preview>Tu código de verificación de Wy Crédito</Preview>
      <Body style={{ backgroundColor: '#f5f7fa', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ margin: '0 auto', padding: '20px', backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px' }}>
          <Heading style={{ color: '#3097CD', fontFamily: 'Segoe UI' }}>Verifica tu correo</Heading>
          <Text style={{ color: '#000000' }}>Hola, {nombre}.</Text>
          <Text style={{ color: '#333333' }}>Para continuar con tu solicitud, ingresa este código en la aplicación:</Text>
          <Heading style={{ letterSpacing: '6px', textAlign: 'center', color: '#0F172A' }}>{codigo}</Heading>
          <Text style={{ color: '#64748B' }}>Este código expira en {expiracionMin} minutos.</Text>
          <Hr />
          <Text style={{ fontSize: '12px', color: '#94A3B8' }}>Si no solicitaste este código, puedes ignorar este mensaje.</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationCodeEmail;
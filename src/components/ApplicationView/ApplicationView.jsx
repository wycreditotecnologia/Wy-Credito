import React, { useState, useEffect } from 'react';
import { Grid, Box, Button } from '@mui/material';
import ProgressSidebar from './ProgressSidebar';
import ChatInterface from './ChatInterface';
import { supabase } from '../../lib/supabaseClient';
import { OrquestadorWally } from '../../services/orquestador';
import MainLayout from '../MainLayout';

const ApplicationView = ({ initialData, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [orquestador] = useState(() => new OrquestadorWally());
  const [currentUiType, setCurrentUiType] = useState(null);
  const [currentOptions, setCurrentOptions] = useState(null);

  useEffect(() => {
    const createSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('solicitudes')
          .insert([{
            monto_solicitado: initialData.amount,
            plazo_seleccionado: initialData.term,
            estado: 'pendiente'
          }])
          .select('id')
          .single();
        
        if (error) throw error;
        
        setSessionId(data.id);
        
        // Lógica para construir el mensaje del paso 0
        const initialAmount = initialData.amount || 50000000; // O de donde provenga el monto inicial
        const formattedAmount = new Intl.NumberFormat('es-CO', { 
          style: 'currency', 
          currency: 'COP', 
          minimumFractionDigits: 0 
        }).format(initialAmount);
        
        const welcomeMessage = `¡Hola! Soy Wally, su asistente de crédito de Wy Crédito.\n\nVeo que deseas solicitar un crédito por un monto de ${formattedAmount} COP.\n\nPara dar inicio a tu solicitud, voy a realizarte una serie de preguntas y a solicitarte algunos documentos. ¿Estás listo para empezar? Primero, ¿cuál es tu nombre completo?`;
        
        setMessages([{
          sender: 'wally',
          text: welcomeMessage
        }]);
      } catch (error) {
        console.error("Error creating session:", error);
        setMessages([{
          sender: 'wally',
          text: 'Lo siento, hubo un problema al iniciar su solicitud. Por favor, intente de nuevo.'
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    createSession();
  }, [initialData]);

  const handleButtonClick = async (optionValue) => {
    if (isLoading || !sessionId) return;
    
    const userMessage = { sender: 'user', text: optionValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    
    // Limpiar las opciones actuales ya que el usuario seleccionó una
    setCurrentUiType(null);
    setCurrentOptions(null);
    
    try {
      const data = await orquestador.procesarMensaje({
        messages: newMessages,
        currentStep,
        sessionId
      });
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(prev => [...prev, { sender: 'wally', text: data.reply }]);
      setCurrentStep(data.nextStep);
      
      // Manejar uiType y options para el siguiente paso
      setCurrentUiType(data.uiType || null);
      setCurrentOptions(data.options || null);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        sender: 'wally',
        text: 'Hubo un problema de conexión. Por favor, intente de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading || !sessionId) return;
    
    const userMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      const data = await orquestador.procesarMensaje({
        messages: newMessages,
        currentStep,
        sessionId
      });
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(prev => [...prev, { sender: 'wally', text: data.reply }]);
      setCurrentStep(data.nextStep);
      
      // Manejar uiType y options para el siguiente paso
      setCurrentUiType(data.uiType || null);
      setCurrentOptions(data.options || null);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        sender: 'wally',
        text: 'Hubo un problema de conexión. Por favor, intente de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (file) => {
    if (!file || isLoading || !sessionId) return;
    setIsLoading(true);

    // 1. Subir archivo a Supabase Storage
    const filePath = `${sessionId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documentos-credito')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error subiendo el archivo:", uploadError);
      setMessages((prev) => [...prev, {
        sender: 'wally',
        text: 'Lo siento, hubo un error al subir tu archivo. Intenta de nuevo.'
      }]);
      setIsLoading(false);
      return;
    }

    // 2. Enviar la ruta del archivo al Orquestador para que la IA lo procese
    const userMessage = { sender: 'user', text: `Archivo subido: ${file.name}` };
    setMessages((prev) => [...prev, userMessage]);

    // Usar el servicio local del orquestador para manejar archivos
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('documentos-credito')
        .getPublicUrl(filePath);

      // Crear un mensaje con la URL del archivo
      const fileMessage = { sender: 'user', text: publicUrl };
      const messagesWithFile = [...messages, fileMessage];

      const data = await orquestador.procesarMensaje({
        messages: messagesWithFile,
        currentStep,
        sessionId,
        isFileUpload: true
      });

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { sender: 'wally', text: data.reply }]);
      setCurrentStep(data.nextStep);
    } catch (error) {
      console.error("Error processing file:", error);
      setMessages(prev => [...prev, {
        sender: 'wally',
        text: 'Lo siento, hubo un error al procesar tu archivo. Intenta de nuevo.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Restaurado: lógica de chat estilo Typeform/conversacional
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, height: 'calc(100vh - 80px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={4}>
          <ProgressSidebar currentStep={currentStep} />
        </Grid>
        <Grid item xs={12} md={8}>
          <ChatInterface
            messages={messages}
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            handleFileUpload={handleFileUpload}
            isLoading={isLoading}
            currentUiType={currentUiType}
            currentOptions={currentOptions}
            handleButtonClick={handleButtonClick}
          />
        </Grid>
      </Grid>
      <Button
        variant="text"
        onClick={onCancel}
        sx={{ position: 'absolute', top: 80, right: 20 }}
      >
        Cancelar Solicitud
      </Button>
    </Box>
  );
};

export default ApplicationView;
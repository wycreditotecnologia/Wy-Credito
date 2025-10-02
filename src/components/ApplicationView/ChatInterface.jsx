import React, { useEffect, useRef } from 'react';
import { Box, Paper, TextField, Button, Typography, CircularProgress, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AttachFile } from '@mui/icons-material';

const ChatInterface = ({ messages, input, setInput, handleSend, handleFileUpload, isLoading, currentUiType, currentOptions, handleButtonClick }) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validación básica del archivo
      if (file.size > 10485760) { // 10MB
        alert('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF.');
        return;
      }
      
      handleFileUpload(file);
    }
    // Limpiar el input para permitir subir el mismo archivo nuevamente
    e.target.value = '';
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: '800px', pt: 4 }}>
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    borderRadius: '20px',
                    borderTopLeftRadius: msg.sender === 'wally' ? '4px' : '20px',
                    borderTopRightRadius: msg.sender === 'user' ? '4px' : '20px',
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    maxWidth: '75%'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'Century Gothic Pro', 
                      whiteSpace: 'pre-wrap' 
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <Paper sx={{ p: 1.5, borderRadius: '20px', borderTopLeftRadius: '4px' }}>
                <CircularProgress size={24} />
              </Paper>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Box>
      
      {/* Renderizado condicional de botones */}
      {currentUiType === 'buttons' && currentOptions && !isLoading && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona una opción:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentOptions.map((option, index) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => handleButtonClick(option)}
                sx={{
                  borderRadius: '20px',
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: 2,
                  py: 1
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Input de texto - solo se muestra cuando no hay botones */}
      {currentUiType !== 'buttons' && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={handlePaperclipClick} 
              disabled={isLoading}
              sx={{ mr: 1 }}
            >
              <AttachFile />
            </IconButton>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={onFileChange}
              accept=".pdf"
              disabled={isLoading}
            />
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribe tu respuesta o adjunta un archivo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px'
                }
              }}
            />
            
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isLoading}
              sx={{
                ml: 1,
                borderRadius: '50px',
                px: 3
              }}
            >
              <Send sx={{ mr: 1 }} />
              Enviar
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ChatInterface;
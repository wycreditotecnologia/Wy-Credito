import React from 'react';
import { Box, Button } from '@mui/material';
import MainLayout from '../MainLayout';

const ApplicationView = ({ initialData, onCancel }) => {
  
  // TEMPORAL: Mostrando MainLayout para desarrollo de la nueva interfaz
  // TODO: Restaurar la lógica del chat cuando se complete la Fase 3
  return (
    <Box sx={{ height: '100vh' }}>
      <MainLayout />
      <Button
        variant="text"
        onClick={onCancel}
        sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}
      >
        Cancelar Solicitud
      </Button>
    </Box>
  );

  /* LÓGICA ORIGINAL DEL CHAT (COMENTADA TEMPORALMENTE)
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
  */
};

export default ApplicationView;
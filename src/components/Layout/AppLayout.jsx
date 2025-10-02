import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
// Aquí podrías poner el logo de Wy en formato SVG o PNG como un componente
// import WyLogo from '../../assets/wy-logo.svg';

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="transparent" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          {/* <WyLogo height={32} /> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'text.primary', ml: 2, fontFamily: 'Segoe UI' }}>
            Wy Credito
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 4 } }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
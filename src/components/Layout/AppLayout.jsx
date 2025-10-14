import React from 'react';
import { AppBar, Toolbar } from '@mui/material';
// Aquí podrías poner el logo de Wy en formato SVG o PNG como un componente
// import WyLogo from '../../assets/wy-logo.svg';

const AppLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar position="static" color="transparent" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Toolbar>
          {/* <WyLogo height={32} /> */}
          <h6 className="text-base font-semibold ml-2" style={{ flexGrow: 1 }}>
            Wy Credito
          </h6>
        </Toolbar>
      </AppBar>
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-4 w-full">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
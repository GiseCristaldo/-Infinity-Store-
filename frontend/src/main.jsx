// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CssBaseline para aplicar un CSS base consistente y reseteos */}
    <CssBaseline />
    {/* Contenedor raíz con fondo dinámico controlado por ThemeContext (via CSS variables) */}
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundImage: 'var(--background-gradient)',
        backgroundColor: '#ffffff',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <App />
    </Box>
  </React.StrictMode>,
);

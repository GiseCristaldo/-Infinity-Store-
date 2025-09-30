// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.js'; // Importa tu tema personalizado
import { Box } from '@mui/material';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CssBaseline para aplicar un CSS base consistente y reseteos */}
    <CssBaseline />
    {/* ThemeProvider para aplicar el tema de Material UI a toda la aplicación */}
     <ThemeProvider theme={theme}>
      {/* Envuelve tu App en un Box que ocupe toda la pantalla y use el color de fondo del tema */}
         <Box 
        sx={{ 
          minHeight: '100vh', // Asegura que el Box ocupe al menos el 100% del viewport height
          // Ahora usamos backgroundImage para el degradado y backgroundColor como fallback
          backgroundImage: '#ffffff', // <-- ¡Tu degradado aquí!
          backgroundColor: theme.palette.background.default, // Fallback sólido del tema
          backgroundAttachment: 'fixed', // Opcional: fija el degradado para que no se desplace con el scroll
          backgroundRepeat: 'no-repeat', // Opcional: evita que el degradado se repita
          backgroundSize: 'cover', // Opcional: asegura que el degradado cubra todo el Box
          display: 'flex', // Para que el contenido de App se distribuya bien
          flexDirection: 'column', // Contenido vertical
        }}
      >
        <App />
      </Box>
    </ThemeProvider>
  </React.StrictMode>,
);

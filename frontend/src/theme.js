import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Paleta de colores suaves y elegantes inspirada en tonos rosados
    primary: {
      main: '#d4a5a5', // Rosa suave principal, similar a la imagen de referencia
      light: '#e8c4c4', // Rosa muy claro para hover
      dark: '#b8888a',  // Rosa más oscuro para contraste
      contrastText: '#ffffff', // Texto blanco sobre colores primarios
    },
    secondary: {
      main: '#c9a9a9', // Beige rosado para elementos secundarios
      light: '#e0d0d0', // Beige muy claro para gradientes
      dark: '#a08080',  // Beige oscuro
      contrastText: '#5d4e4e', // Texto oscuro sobre colores secundarios claros
    },
    error: {
      main: '#d4a5a5', // Rosa suave para errores, manteniendo la armonía
    },
    warning: {
      main: '#e8c4a0', // Beige cálido para advertencias
    },
    info: {
      main: '#a5c4d4', // Azul suave para información
    },
    success: {
      main: '#a5d4a5', // Verde suave para éxito
    },
    background: {
      default: 'linear-gradient(135deg, #f8f4f4, #f0e8e8)', // Gradiente muy suave
      paper: '#ffffff',   // Fondo blanco para tarjetas y superficies elevadas
    },
    text: {
      primary: '#5d4e4e', // Texto marrón suave para mejor armonía
      secondary: '#8a7575', // Texto gris rosado para elementos secundarios
    },
  },
   typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Definimos una familia de fuentes separada para los títulos
    h1: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h1
      fontSize: '3rem',
      fontWeight: 700,
      color: '#d4a5a5' // Color principal actualizado con rosa suave
    },
    h2: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h2
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#5d4e4e' // Texto marrón suave para mejor armonía
    },
    h3: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h3
      fontSize: '2rem',
      fontWeight: 500,
      color: '#5d4e4e' // Texto marrón suave para mejor armonía
    },
    h4: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h4
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#5d4e4e' // Texto marrón suave para mejor armonía
    },
    h5: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h5
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#5d4e4e' // Texto marrón suave para mejor armonía
    },
    h6: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h6
      fontSize: '1.20rem',
      fontWeight: 600,
      color: '#5d4e4e' // Texto marrón suave para mejor armonía
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#3F0071',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(212, 165, 165, 0.3)',
          },
        },
        contained: {
          backgroundColor: '#d4a5a5',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#e8c4c4',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'linear-gradient(135deg, #f8f4f4, #f0e8e8)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(212, 165, 165, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#1A0033',
            color: '#E0E0E0',
            '& fieldset': {
              borderColor: '#6A0DAD',
            },
            '&:hover fieldset': {
              borderColor: '#E53E90',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E53E90',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#B0B0B0',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#E53E90',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2A004B',
          color: '#E0E0E0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(229, 62, 144, 0.1)',
          },
        },
      },
    },
  },
});


export default theme;

// src/components/HeroSection.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom'; // Para navegar a otras rutas
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * Componente Hero Section para la página de inicio.
 * Muestra un banner atractivo con un mensaje principal y una llamada a la acción.
 */
function HeroSection() {
  const { currentSettings } = useTheme();
  
  // Get dynamic hero image or fallback to default
  const heroImageUrl = currentSettings?.hero_image_url || '/banner.png';
  const siteName = currentSettings?.site_name || 'Infinity Store';

  return (
    <Box
      sx={{
        position: 'relative', // Necesario para posicionar el contenido sobre la imagen
        width: '100%',
        height:  { xs: '300px', sm: '350px', md: '400px', lg: '450px' }, // Altura responsiva para diferentes pantallas
        backgroundImage: `url(${heroImageUrl})`, // Imagen de fondo dinámica
        backgroundSize: 'cover', // Cubrirá todo el espacio
        backgroundPosition: 'center', // Centrar la imagen de fondo
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        textAlign: 'center',
        color: '#ffffff', // Color de texto blanco
        borderRadius: 12, // Bordes redondeados para el banner
        boxShadow: 3, // Sombra para darle profundidad
        p: { xs: 2, sm: 3, md: 4 }, // Padding responsivo
        mt: 4, // Margen superior para separarlo del AppBar
        mb: 6, // Margen inferior para separarlo de otros elementos de la página
      }}
    >
      {/* Overlay oscuro para mejorar la legibilidad del texto */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.41)', // 50% de opacidad negra
          borderRadius: 'inherit', // Hereda el border-radius del padre
        }}
      />

      {/* Contenido del Hero Section */}
      <Box sx={{ position: 'relative', zIndex: 1 }}> {/* Asegura que el contenido esté sobre el overlay */}
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, // Tamaño de fuente responsivo
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)', // Sombra para el texto
            color: 'secondary.light', // Usa un color de tu tema para el título
            fontFamily: 'var(--font-heading)', // Use dynamic heading font
          }}
        >
          Bienvenido a {siteName}
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{
            mt: 2,
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }, // Tamaño de fuente responsivo
            maxWidth: 800,
            mx: 'auto',
            color: 'text.secondary', // Un gris claro para el texto secundario
            fontFamily: 'var(--font-primary)', // Use dynamic primary font
          }}
        >
          Descubre productos únicos y ofertas especiales
        </Typography>
        <Button
          variant="contained"
          color="secondary" // Color secundario para el botón de llamada a la acción
          size="large"
          component={Link}
          to="/products" // Enlace a la página de productos o a una página de ofertas
          endIcon={<ArrowForwardIcon />}
          sx={{
             px: { xs: 1.5, sm: 3 }, // Padding horizontal responsivo del botón
                    py: { xs: 0.6, sm: 1.2 }, // Padding vertical responsivo del botón
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' }, // Font size responsivo del botón
            padding: '12px 30px',
            fontWeight: 600,
            borderRadius: 8,
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          Ver Todas las Ofertas
        </Button>
      </Box>
    </Box>
  );
}

export default HeroSection;
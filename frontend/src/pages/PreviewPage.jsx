import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Container, Grid } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Componente de vista previa que muestra cómo se vería el sitio con los nuevos colores/fuentes
function PreviewPage() {
  const [searchParams] = useSearchParams();
  const [previewTheme, setPreviewTheme] = useState(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const primaryColor = searchParams.get('primary') || '#d4a5a5';
    const secondaryColor = searchParams.get('secondary') || '#c9a9a9';
    const accentColor = searchParams.get('accent') || '#e8c4c4';
    const textColor = searchParams.get('text') || '#5d4e4e';
    const primaryFont = searchParams.get('primaryFont') || 'Inter';
    const headingFont = searchParams.get('headingFont') || 'Orbitron';
    const siteName = searchParams.get('siteName') || 'Infinity Store';

    // Crear tema dinámico
    const theme = createTheme({
      palette: {
        primary: {
          main: primaryColor,
          light: adjustBrightness(primaryColor, 20),
          dark: adjustBrightness(primaryColor, -20),
        },
        secondary: {
          main: secondaryColor,
          light: adjustBrightness(secondaryColor, 20),
          dark: adjustBrightness(secondaryColor, -20),
        },
        background: {
          default: adjustBrightness(accentColor, 30),
          paper: '#ffffff',
        },
        text: {
          primary: textColor,
          secondary: adjustBrightness(textColor, 30),
        },
      },
      typography: {
        fontFamily: `"${primaryFont}", sans-serif`,
        h1: { 
          fontFamily: `"${headingFont}", sans-serif`,
          fontSize: '3rem',
          fontWeight: 700,
          color: primaryColor,
        },
        h2: { 
          fontFamily: `"${headingFont}", sans-serif`,
          fontSize: '2.5rem',
          fontWeight: 600,
          color: textColor,
        },
        h3: { 
          fontFamily: `"${headingFont}", sans-serif`,
          fontSize: '2rem',
          fontWeight: 500,
          color: textColor,
        },
        h4: { 
          fontFamily: `"${headingFont}", sans-serif`,
          fontSize: '1.75rem',
          fontWeight: 500,
          color: textColor,
        },
        body1: {
          fontFamily: `"${primaryFont}", sans-serif`,
          fontSize: '1rem',
          color: textColor,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 600,
            },
            contained: {
              backgroundColor: primaryColor,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: adjustBrightness(primaryColor, -10),
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: `0 4px 12px ${hexToRgba(primaryColor, 0.1)}`,
            },
          },
        },
      },
    });

    setPreviewTheme(theme);

    // Cargar Google Fonts dinámicamente
    loadGoogleFonts([primaryFont, headingFont]);

    // Actualizar título de la página
    document.title = `Vista Previa - ${siteName}`;
  }, [searchParams]);

  // Helper functions
  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const loadGoogleFonts = (fonts) => {
    const fontFamilies = fonts.filter(font => 
      ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Dancing Script', 'Caveat',
       'Orbitron', 'Playfair Display', 'Montserrat', 'Poppins', 'Great Vibes', 'Pacifico'].includes(font)
    );
    
    if (fontFamilies.length === 0) return;

    const fontQuery = fontFamilies
      .map(font => `${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700`)
      .join('&family=');
    
    const linkId = 'preview-google-fonts';
    let linkElement = document.getElementById(linkId);
    
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.id = linkId;
      linkElement.rel = 'stylesheet';
      document.head.appendChild(linkElement);
    }
    
    linkElement.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
  };

  if (!previewTheme) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Cargando vista previa...</Typography>
      </Box>
    );
  }

  const siteName = searchParams.get('siteName') || 'Infinity Store';

  return (
    <ThemeProvider theme={previewTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header simulado */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 2, 
          mb: 4,
          boxShadow: 2
        }}>
          <Container>
            <Typography variant="h4" component="h1">
              {siteName} 🚀
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Vista previa del nuevo diseño
            </Typography>
          </Container>
        </Box>

        <Container>
          {/* Sección Hero simulada */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h1" gutterBottom>
              Bienvenido a {siteName}
            </Typography>
            <Typography variant="h4" color="text.secondary" gutterBottom>
              Descubre productos increíbles
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              Esta es una vista previa de cómo se vería tu sitio web con la nueva paleta de colores y tipografía seleccionada. 
              Puedes ver cómo los colores y fuentes se aplican a diferentes elementos.
            </Typography>
            <Button variant="contained" size="large" sx={{ mr: 2 }}>
              Botón Principal
            </Button>
            <Button variant="outlined" size="large">
              Botón Secundario
            </Button>
          </Box>

          {/* Tarjetas de ejemplo */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Producto Destacado
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Este es un ejemplo de cómo se verían las tarjetas de productos con la nueva tipografía y colores.
                  </Typography>
                  <Button variant="contained" size="small">
                    Ver Más
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Oferta Especial
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Los títulos usan la fuente de encabezados mientras que el texto usa la fuente principal.
                  </Typography>
                  <Button variant="outlined" size="small">
                    Aprovechar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Nuevo Lanzamiento
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Observa cómo los colores se combinan armoniosamente en toda la interfaz.
                  </Typography>
                  <Button variant="contained" size="small">
                    Explorar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sección de texto */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" gutterBottom>
              Diferentes Niveles de Títulos
            </Typography>
            <Typography variant="h3" gutterBottom>
              Este es un título H3
            </Typography>
            <Typography variant="h4" gutterBottom>
              Este es un título H4
            </Typography>
            <Typography variant="body1" paragraph>
              Este es el texto del cuerpo principal. Aquí puedes ver cómo se ve la fuente principal 
              en párrafos largos. La legibilidad es importante para la experiencia del usuario.
            </Typography>
            <Typography variant="body1" paragraph>
              Los colores de texto se ajustan automáticamente para mantener un buen contraste 
              con el fondo, asegurando que el contenido sea fácil de leer.
            </Typography>
          </Box>

          {/* Footer simulado */}
          <Box sx={{ 
            bgcolor: 'primary.dark', 
            color: 'white', 
            p: 3, 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2">
              © 2024 {siteName}. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>

        {/* Botón flotante para cerrar */}
        <Box sx={{ 
          position: 'fixed', 
          top: 16, 
          right: 16, 
          zIndex: 1000 
        }}>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => window.close()}
          >
            Cerrar Vista Previa
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default PreviewPage;
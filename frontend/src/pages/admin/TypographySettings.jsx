import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, FormControl, InputLabel,
  Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Snackbar, Paper, Divider, CircularProgress, Chip
} from '@mui/material';
import {
  FontDownload as FontIcon, Preview as PreviewIcon, Check as CheckIcon,
  Refresh as RefreshIcon, AutoAwesome as CursiveIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext.jsx';

function TypographySettings() {
  const [fonts, setFonts] = useState([]);
  const [currentSettings, setCurrentSettings] = useState({
    primary_font: 'Inter',
    heading_font: 'Orbitron'
  });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Use theme context for real-time updates and preview
  const { 
    currentSettings: themeSettings, 
    isPreviewMode, 
    enterPreviewMode, 
    exitPreviewMode, 
    refreshThemeSettings,
    triggerThemeUpdate
  } = useTheme();

  // Combinaciones predefinidas de fuentes
  const fontCombinations = [
    {
      name: 'Moderno Profesional',
      primary: 'Inter',
      heading: 'Orbitron',
      description: 'Combinación actual - Limpia y tecnológica'
    },
    {
      name: 'Elegante Clásico',
      primary: 'Open Sans',
      heading: 'Playfair Display',
      description: 'Sofisticada y legible'
    },
    {
      name: 'Casual Amigable',
      primary: 'Lato',
      heading: 'Poppins',
      description: 'Relajada y accesible'
    },
    {
      name: 'Artístico Cursivo ✨',
      primary: 'Roboto',
      heading: 'Great Vibes',
      description: 'Elegante con toques artísticos',
      cursive: true
    },
    {
      name: 'Creativo Manuscrito ✨',
      primary: 'Inter',
      heading: 'Dancing Script',
      description: 'Moderna con personalidad cursiva',
      cursive: true
    },
    {
      name: 'Relajado Surf ✨',
      primary: 'Open Sans',
      heading: 'Pacifico',
      description: 'Casual y relajada',
      cursive: true
    }
  ];

  useEffect(() => {
    loadFonts();
    loadCurrentSettings();
  }, []);

  const loadFonts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/super-admin/customization/fonts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFonts(response.data.fonts || []);
    } catch (error) {
      console.error('Error loading fonts:', error);
      showSnackbar('Error al cargar fuentes disponibles', 'error');
    }
  };

  const loadCurrentSettings = async () => {
    try {
      // Use current settings from theme context
      if (themeSettings) {
        setCurrentSettings({
          primary_font: themeSettings.primary_font || 'Inter',
          heading_font: themeSettings.heading_font || 'Orbitron'
        });
      } else {
        // Fallback to API call if context doesn't have settings yet
        const response = await axios.get('/api/settings/current');
        if (response.data.success) {
          setCurrentSettings({
            primary_font: response.data.data.primary_font || 'Inter',
            heading_font: response.data.data.heading_font || 'Orbitron'
          });
        }
      }
    } catch (error) {
      console.error('Error loading current settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePreview = (primaryFont, headingFont) => {
    // Abrir vista previa en nueva pestaña
    const previewUrl = new URL('/preview', window.location.origin);
    previewUrl.searchParams.set('primaryFont', primaryFont);
    previewUrl.searchParams.set('headingFont', headingFont);
    previewUrl.searchParams.set('siteName', themeSettings?.site_name || 'Infinity Store');
    
    // Usar colores actuales si están disponibles
    if (themeSettings?.color_palette) {
      previewUrl.searchParams.set('primary', themeSettings.color_palette.primary_color);
      previewUrl.searchParams.set('secondary', themeSettings.color_palette.secondary_color);
      previewUrl.searchParams.set('accent', themeSettings.color_palette.accent_color);
      previewUrl.searchParams.set('text', themeSettings.color_palette.text_color);
    }
    
    window.open(previewUrl.toString(), '_blank', 'width=1200,height=800');
    
    showSnackbar(`Vista previa de "${primaryFont}" + "${headingFont}" abierta en nueva pestaña`, 'info');
  };

  const handleCancelPreview = () => {
    // Exit preview mode using theme context
    exitPreviewMode();
    
    showSnackbar('Vista previa cancelada', 'info');
  };

  const handleApplyFonts = (primaryFont, headingFont) => {
    setConfirmDialog({
      primary_font: primaryFont,
      heading_font: headingFont
    });
  };

  const confirmApplyFonts = async () => {
    if (!confirmDialog || typeof confirmDialog !== 'object') return;

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/super-admin/customization/fonts', confirmDialog, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCurrentSettings(confirmDialog);
        setConfirmDialog(false);
        
        // Exit preview mode and refresh theme settings
        exitPreviewMode();
        await refreshThemeSettings(true);
        
        // Trigger theme update event for real-time updates
        triggerThemeUpdate();
        
        showSnackbar(`Tipografía actualizada: "${confirmDialog.primary_font}" + "${confirmDialog.heading_font}"`);
      } else {
        throw new Error(response.data.message || 'Error al aplicar tipografía');
      }
      
    } catch (error) {
      console.error('Error applying fonts:', error);
      const message = error.response?.data?.message || 'Error al aplicar tipografía';
      showSnackbar(message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const FontPreview = ({ fontName, type, isPreview = false }) => {
    // Load Google Font dynamically for preview
    React.useEffect(() => {
      if (fontName && fontName !== 'Inter' && fontName !== 'Arial' && fontName !== 'Helvetica') {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        link.id = `font-${fontName.replace(/\s+/g, '-')}`;
        
        // Check if font is already loaded
        if (!document.getElementById(link.id)) {
          document.head.appendChild(link);
        }
      }
    }, [fontName]);

    return (
      <Box 
        sx={{ 
          p: 2, 
          border: '1px solid #e0e0e0', 
          borderRadius: 1, 
          mb: 1,
          backgroundColor: isPreview ? '#fff3e0' : 'white'
        }}
      >
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          gutterBottom
        >
          {type} - {fontName}
        </Typography>
        <Typography 
          sx={{ 
            fontFamily: `"${fontName}", sans-serif`,
            fontSize: type === 'Títulos y Encabezados' ? '1.8rem' : '1rem',
            fontWeight: type === 'Títulos y Encabezados' ? 600 : 400,
            lineHeight: 1.4,
            mb: 1
          }}
        >
          {type === 'Títulos y Encabezados' ? 'Ejemplo de Título Principal' : 'Este es un ejemplo de texto con la fuente seleccionada para el contenido general del sitio web.'}
        </Typography>
        {type === 'Texto Principal' && (
          <Typography 
            variant="body2"
            sx={{ 
              fontFamily: `"${fontName}", sans-serif`,
              fontSize: '0.875rem',
              color: 'text.secondary'
            }}
          >
            También se aplica a textos secundarios y descripciones.
          </Typography>
        )}
      </Box>
    );
  };

  const CombinationCard = ({ combination, isActive, isPreview }) => {
    // Load fonts for preview
    React.useEffect(() => {
      if (combination.primary_font && combination.primary_font !== 'Inter' && combination.primary_font !== 'Arial') {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${combination.primary_font.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        link.id = `font-${combination.primary_font.replace(/\s+/g, '-')}`;
        
        if (!document.getElementById(link.id)) {
          document.head.appendChild(link);
        }
      }
      
      if (combination.heading_font && combination.heading_font !== 'Orbitron' && combination.heading_font !== 'Arial') {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${combination.heading_font.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        link.id = `font-${combination.heading_font.replace(/\s+/g, '-')}`;
        
        if (!document.getElementById(link.id)) {
          document.head.appendChild(link);
        }
      }
    }, [combination.primary_font, combination.heading_font]);

    return (
      <Card 
        sx={{ 
          position: 'relative',
        border: isActive ? '2px solid #1976d2' : isPreview ? '2px solid #ff9800' : '1px solid #e0e0e0',
        '&:hover': { boxShadow: 3 }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">{combination.name}</Typography>
            {combination.cursive && <CursiveIcon color="secondary" />}
          </Box>
          {isActive && <Chip label="Activa" color="primary" size="small" />}
          {isPreview && <Chip label="Vista Previa" color="warning" size="small" />}
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {combination.description}
        </Typography>
        
        <Box mb={2}>
          <FontPreview 
            fontName={combination.primary} 
            type="Texto" 
            isPreview={isPreview}
          />
          <FontPreview 
            fontName={combination.heading} 
            type="Título" 
            isPreview={isPreview}
          />
        </Box>

        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => handlePreview(combination.primary, combination.heading)}
            disabled={isPreview || applying}
          >
            Vista Previa
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => handleApplyFonts(combination.primary, combination.heading)}
            disabled={isActive || applying}
          >
            Aplicar
          </Button>
        </Box>
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando configuración de tipografía...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración de Tipografía
      </Typography>

      {isPreviewMode && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleCancelPreview}>
              Cancelar Vista Previa
            </Button>
          }
        >
          Modo vista previa activo. Las fuentes se aplicarán temporalmente a esta página.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuración Actual
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FontPreview 
                fontName={currentSettings.primary_font} 
                type="Texto Principal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FontPreview 
                fontName={currentSettings.heading_font} 
                type="Títulos y Encabezados"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Combinaciones Predefinidas
      </Typography>
      
      <Grid container spacing={3}>
        {fontCombinations.map((combination, index) => {
          const isActive = currentSettings.primary_font === combination.primary && 
                          currentSettings.heading_font === combination.heading;
          const isPreview = themeSettings?.primary_font === combination.primary && 
                           themeSettings?.heading_font === combination.heading && isPreviewMode;
          
          return (
            <Grid item xs={12} md={6} key={index}>
              <CombinationCard 
                combination={combination}
                isActive={isActive}
                isPreview={isPreview}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Selector personalizado */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selección Personalizada
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selecciona fuentes individuales y usa los botones de las combinaciones predefinidas arriba para una mejor experiencia.
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Fuente Principal Actual: <strong>{currentSettings.primary_font}</strong>
              </Typography>
              <Typography variant="subtitle2">
                Fuente de Títulos Actual: <strong>{currentSettings.heading_font}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                💡 Tip: Usa las combinaciones predefinidas arriba para obtener mejores resultados y vista previa en tiempo real.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar Cambio de Tipografía</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que quieres aplicar esta combinación de fuentes?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Este cambio se aplicará a toda la plataforma y será visible para todos los usuarios.
          </Typography>
          
          {confirmDialog && typeof confirmDialog === 'object' && (
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>Vista previa:</Typography>
              <FontPreview 
                fontName={confirmDialog.primary_font} 
                type="Texto Principal"
              />
              <FontPreview 
                fontName={confirmDialog.heading_font} 
                type="Títulos y Encabezados"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={applying}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmApplyFonts} 
            variant="contained" 
            disabled={applying}
            startIcon={applying ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            {applying ? 'Aplicando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TypographySettings;
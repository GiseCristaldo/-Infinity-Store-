import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, Chip, Paper,
  CircularProgress
} from '@mui/material';
import {
  Palette as PaletteIcon, Preview as PreviewIcon, Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext.jsx';

function ThemeCustomization() {
  const [palettes, setPalettes] = useState([]);
  const [currentPalette, setCurrentPalette] = useState(null);
  const [previewPalette, setPreviewPalette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Use theme context for real-time updates
  const { 
    currentSettings, 
    isPreviewMode, 
    enterPreviewMode, 
    exitPreviewMode, 
    refreshThemeSettings,
    triggerThemeUpdate
  } = useTheme();

  useEffect(() => {
    loadPalettes();
    loadCurrentSettings();
  }, []);

  const loadPalettes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/super-admin/customization/palettes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPalettes(response.data.data?.palettes || []);
    } catch (error) {
      console.error('Error loading palettes:', error);
      showSnackbar('Error al cargar paletas de colores', 'error');
    }
  };

  const loadCurrentSettings = async () => {
    try {
      // Use current settings from theme context
      if (currentSettings?.color_palette) {
        setCurrentPalette(currentSettings.color_palette);
      } else {
        // Fallback to API call if context doesn't have settings yet
        const response = await axios.get('/api/settings/current');
        if (response.data.success) {
          setCurrentPalette(response.data.data.color_palette);
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

  const handlePreview = (palette) => {
    // Abrir vista previa en nueva pestaña
    const previewUrl = new URL('/preview', window.location.origin);
    previewUrl.searchParams.set('primary', palette.primary_color);
    previewUrl.searchParams.set('secondary', palette.secondary_color);
    previewUrl.searchParams.set('accent', palette.accent_color);
    previewUrl.searchParams.set('text', palette.text_color);
    previewUrl.searchParams.set('siteName', currentSettings?.site_name || 'Infinity Store');
    previewUrl.searchParams.set('primaryFont', currentSettings?.primary_font || 'Inter');
    previewUrl.searchParams.set('headingFont', currentSettings?.heading_font || 'Orbitron');
    
    window.open(previewUrl.toString(), '_blank', 'width=1200,height=800');
    
    showSnackbar(`Vista previa de "${palette.name}" abierta en nueva pestaña`, 'info');
  };

  const handleCancelPreview = () => {
    setPreviewPalette(null);
    
    // Exit preview mode using theme context
    exitPreviewMode();
    
    showSnackbar('Vista previa cancelada', 'info');
  };

  const handleApplyPalette = (palette) => {
    setPreviewPalette(palette);
    setConfirmDialog(true);
  };

  const confirmApplyPalette = async () => {
    if (!previewPalette) return;

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/super-admin/customization/palette', 
        { palette_id: previewPalette.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setCurrentPalette(previewPalette);
        setConfirmDialog(false);
        
        // Exit preview mode and refresh theme settings
        exitPreviewMode();
        await refreshThemeSettings(true);
        
        // Trigger theme update event for real-time updates
        triggerThemeUpdate();
        
        showSnackbar(`Paleta "${previewPalette.name}" aplicada exitosamente`);
      } else {
        throw new Error(response.data.message || 'Error al aplicar la paleta');
      }
      
    } catch (error) {
      console.error('Error applying palette:', error);
      const message = error.response?.data?.message || 'Error al aplicar la paleta';
      showSnackbar(message, 'error');
    } finally {
      setApplying(false);
    }
  };

  const ColorSwatch = ({ color, label }) => (
    <Box display="flex" alignItems="center" mb={1}>
      <Box
        sx={{
          width: 24,
          height: 24,
          backgroundColor: color,
          border: '1px solid #ccc',
          borderRadius: 1,
          mr: 1
        }}
      />
      <Typography variant="body2" sx={{ minWidth: 80 }}>
        {label}:
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
        {color}
      </Typography>
    </Box>
  );

  const PaletteCard = ({ palette, isActive, isPreview }) => (
    <Card 
      sx={{ 
        position: 'relative',
        border: isActive ? '2px solid #1976d2' : isPreview ? '2px solid #ff9800' : '1px solid #e0e0e0',
        '&:hover': { boxShadow: 3 }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{palette.name}</Typography>
          {isActive && <Chip label="Activa" color="primary" size="small" />}
          {isPreview && <Chip label="Vista Previa" color="warning" size="small" />}
        </Box>
        
        <Box mb={2}>
          <ColorSwatch color={palette.primary_color} label="Primario" />
          <ColorSwatch color={palette.secondary_color} label="Secundario" />
          <ColorSwatch color={palette.accent_color} label="Acento" />
          <ColorSwatch color={palette.text_color} label="Texto" />
        </Box>

        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => handlePreview(palette)}
            disabled={isPreview || applying}
          >
            Vista Previa
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => handleApplyPalette(palette)}
            disabled={isActive || applying}
          >
            Aplicar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando paletas de colores...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Personalización de Tema
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
          Modo vista previa activo para "{previewPalette?.name}". Los colores se aplicarán temporalmente.
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Paleta Actual
          </Typography>
          {currentPalette ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>{currentPalette.name}</strong>
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <ColorSwatch color={currentPalette.primary_color} label="Primario" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ColorSwatch color={currentPalette.secondary_color} label="Secundario" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ColorSwatch color={currentPalette.accent_color} label="Acento" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ColorSwatch color={currentPalette.text_color} label="Texto" />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography color="text.secondary">
              No hay paleta configurada
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Paletas Disponibles
      </Typography>
      
      <Grid container spacing={3}>
        {palettes.map((palette) => (
          <Grid item xs={12} sm={6} md={4} key={palette.id}>
            <PaletteCard 
              palette={palette}
              isActive={currentPalette?.id === palette.id}
              isPreview={previewPalette?.id === palette.id && isPreviewMode}
            />
          </Grid>
        ))}
      </Grid>

      {palettes.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <PaletteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay paletas disponibles
          </Typography>
          <Typography color="text.secondary">
            Las paletas de colores se cargarán automáticamente desde el servidor.
          </Typography>
        </Paper>
      )}

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar Cambio de Paleta</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que quieres aplicar la paleta "{previewPalette?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Este cambio se aplicará a toda la plataforma y será visible para todos los usuarios.
          </Typography>
          
          {previewPalette && (
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>Vista previa de colores:</Typography>
              <ColorSwatch color={previewPalette.primary_color} label="Primario" />
              <ColorSwatch color={previewPalette.secondary_color} label="Secundario" />
              <ColorSwatch color={previewPalette.accent_color} label="Acento" />
              <ColorSwatch color={previewPalette.text_color} label="Texto" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={applying}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmApplyPalette} 
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

export default ThemeCustomization;
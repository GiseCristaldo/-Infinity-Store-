import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Paper,
  CircularProgress, Chip, Divider, FormHelperText
} from '@mui/material';
import {
  Save as SaveIcon, Preview as PreviewIcon, Refresh as RefreshIcon,
  BrandingWatermark as BrandingIcon, Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext.jsx';

function BrandingSettings() {
  const [currentSettings, setCurrentSettings] = useState({
    site_name: '',
    footer_content: ''
  });
  const [formData, setFormData] = useState({
    site_name: '',
    footer_content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  
  // Use theme context for real-time updates
  const { 
    currentSettings: themeSettings, 
    isPreviewMode, 
    enterPreviewMode, 
    exitPreviewMode, 
    refreshThemeSettings,
    triggerThemeUpdate
  } = useTheme();

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      // Use current settings from theme context
      if (themeSettings) {
        const settings = {
          site_name: themeSettings.site_name || '',
          footer_content: themeSettings.footer_content || ''
        };
        setCurrentSettings(settings);
        setFormData(settings);
      } else {
        // Fallback to API call if context doesn't have settings yet
        const response = await axios.get('/api/settings/current');
        if (response.data.success) {
          const settings = {
            site_name: response.data.data.site_name || '',
            footer_content: response.data.data.footer_content || ''
          };
          setCurrentSettings(settings);
          setFormData(settings);
        }
      }
    } catch (error) {
      console.error('Error loading current settings:', error);
      showSnackbar('Error al cargar configuración actual', 'error');
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.site_name.trim()) {
      newErrors.site_name = 'El nombre del sitio es requerido';
    } else if (formData.site_name.length > 50) {
      newErrors.site_name = 'El nombre del sitio no puede exceder 50 caracteres';
    }

    if (formData.footer_content.length > 1000) {
      newErrors.footer_content = 'El contenido del footer no puede exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePreview = async () => {
    if (!validateForm()) return;
    
    // Use theme context for preview
    await enterPreviewMode({
      site_name: formData.site_name,
      footer_content: formData.footer_content
    });
    
    showSnackbar('Vista previa activada - revisa el título de la página', 'info');
  };

  const handleCancelPreview = () => {
    // Exit preview mode using theme context
    exitPreviewMode();
    
    showSnackbar('Vista previa cancelada', 'info');
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setConfirmDialog(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/super-admin/customization/branding', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCurrentSettings(formData);
        setConfirmDialog(false);
        
        // Exit preview mode and refresh theme settings
        exitPreviewMode();
        await refreshThemeSettings(true);
        
        // Trigger theme update event for real-time updates
        triggerThemeUpdate();
        
        showSnackbar('Configuración de marca actualizada exitosamente');
      } else {
        throw new Error(response.data.message || 'Error al guardar configuración de marca');
      }
      
    } catch (error) {
      console.error('Error saving branding settings:', error);
      const message = error.response?.data?.message || 'Error al guardar configuración de marca';
      showSnackbar(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(currentSettings);
    setErrors({});
    if (isPreviewMode) {
      handleCancelPreview();
    }
  };

  const hasChanges = () => {
    return formData.site_name !== currentSettings.site_name ||
           formData.footer_content !== currentSettings.footer_content;
  };

  const BrandingPreview = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Vista Previa
        </Typography>
        
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Título del sitio:
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {formData.site_name || 'Sin nombre'}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Contenido del footer:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', minHeight: 60 }}>
            {formData.footer_content ? (
              <div dangerouslySetInnerHTML={{ __html: formData.footer_content }} />
            ) : (
              <Typography color="text.secondary" fontStyle="italic">
                Sin contenido de footer
              </Typography>
            )}
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando configuración de marca...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración de Marca
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
          Modo vista previa activo. Revisa el título de la página y la vista previa del footer.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración General
              </Typography>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  label="Nombre del Sitio"
                  value={formData.site_name}
                  onChange={(e) => handleInputChange('site_name', e.target.value)}
                  error={!!errors.site_name}
                  helperText={errors.site_name || `${formData.site_name.length}/50 caracteres`}
                  inputProps={{ maxLength: 50 }}
                  placeholder="Ej: Infinity Store"
                />
              </Box>
              
              <Box mb={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Contenido del Footer"
                  value={formData.footer_content}
                  onChange={(e) => handleInputChange('footer_content', e.target.value)}
                  error={!!errors.footer_content}
                  helperText={errors.footer_content || `${formData.footer_content.length}/1000 caracteres - HTML básico permitido`}
                  placeholder="Ej: © 2024 Infinity Store. Todos los derechos reservados. <br> Contacto: info@infinitystore.com"
                />
                <FormHelperText>
                  Puedes usar HTML básico como &lt;br&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt; para formato
                </FormHelperText>
              </Box>

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreview}
                  disabled={!hasChanges() || saving}
                >
                  Vista Previa
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!hasChanges() || saving}
                >
                  Guardar Cambios
                </Button>
                
                <Button
                  variant="text"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={!hasChanges() || saving}
                >
                  Restablecer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración Actual
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Nombre del sitio:
                </Typography>
                <Typography variant="body1">
                  {currentSettings.site_name || 'No configurado'}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Footer:
                </Typography>
                <Paper sx={{ p: 1, bgcolor: 'grey.50', maxHeight: 100, overflow: 'auto' }}>
                  {currentSettings.footer_content ? (
                    <Typography variant="body2">
                      <div dangerouslySetInnerHTML={{ __html: currentSettings.footer_content }} />
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Sin contenido
                    </Typography>
                  )}
                </Paper>
              </Box>

              {hasChanges() && (
                <Chip 
                  label="Cambios pendientes" 
                  color="warning" 
                  size="small"
                  icon={<EditIcon />}
                />
              )}
            </CardContent>
          </Card>

          {(formData.site_name || formData.footer_content) && (
            <BrandingPreview />
          )}
        </Grid>
      </Grid>

      {/* Dialog de confirmación */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar Cambios de Marca</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que quieres aplicar estos cambios de marca?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Los cambios se aplicarán a toda la plataforma y serán visibles para todos los usuarios.
          </Typography>
          
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>Resumen de cambios:</Typography>
            
            {formData.site_name !== currentSettings.site_name && (
              <Typography variant="body2" gutterBottom>
                • Nombre del sitio: "{currentSettings.site_name}" → "{formData.site_name}"
              </Typography>
            )}
            
            {formData.footer_content !== currentSettings.footer_content && (
              <Typography variant="body2">
                • Contenido del footer: {formData.footer_content ? 'Actualizado' : 'Eliminado'}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmSave} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Guardando...' : 'Confirmar'}
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

export default BrandingSettings;
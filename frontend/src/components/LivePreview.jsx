import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Fade,
  Divider,
  Stack
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * LivePreview component for real-time theme customization preview
 * Allows users to test changes before applying them permanently
 */
const LivePreview = ({ 
  previewSettings, 
  onApplyChanges, 
  onResetPreview,
  showPreviewToggle = true,
  title = "Vista Previa en Tiempo Real"
}) => {
  const { 
    isPreviewMode, 
    enterPreviewMode, 
    exitPreviewMode, 
    applyPreviewChanges,
    currentSettings,
    themeSettings
  } = useTheme();
  
  const [isPreviewEnabled, setIsPreviewEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if there are pending changes
  useEffect(() => {
    if (previewSettings && themeSettings) {
      const hasColorChanges = previewSettings.color_palette && 
        JSON.stringify(previewSettings.color_palette) !== JSON.stringify(themeSettings.color_palette);
      
      const hasFontChanges = 
        (previewSettings.primary_font && previewSettings.primary_font !== themeSettings.primary_font) ||
        (previewSettings.heading_font && previewSettings.heading_font !== themeSettings.heading_font);
      
      const hasBrandingChanges = 
        (previewSettings.site_name && previewSettings.site_name !== themeSettings.site_name) ||
        (previewSettings.footer_content && previewSettings.footer_content !== themeSettings.footer_content) ||
        (previewSettings.hero_image_url && previewSettings.hero_image_url !== themeSettings.hero_image_url);

      setHasChanges(hasColorChanges || hasFontChanges || hasBrandingChanges);
    } else {
      setHasChanges(false);
    }
  }, [previewSettings, themeSettings]);

  // Handle preview toggle
  const handlePreviewToggle = async (enabled) => {
    setIsPreviewEnabled(enabled);
    
    if (enabled && previewSettings) {
      await enterPreviewMode(previewSettings);
    } else {
      exitPreviewMode();
    }
  };

  // Handle apply changes
  const handleApplyChanges = async () => {
    try {
      await applyPreviewChanges();
      setIsPreviewEnabled(false);
      setHasChanges(false);
      
      if (onApplyChanges) {
        onApplyChanges();
      }
    } catch (error) {
      console.error('Failed to apply preview changes:', error);
    }
  };

  // Handle reset preview
  const handleResetPreview = () => {
    exitPreviewMode();
    setIsPreviewEnabled(false);
    setHasChanges(false);
    
    if (onResetPreview) {
      onResetPreview();
    }
  };

  // Auto-enable preview when settings change
  useEffect(() => {
    if (previewSettings && hasChanges && !isPreviewMode) {
      handlePreviewToggle(true);
    }
  }, [previewSettings, hasChanges]);

  if (!hasChanges && !isPreviewMode) {
    return null;
  }

  return (
    <Fade in={hasChanges || isPreviewMode}>
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          p: 3,
          minWidth: 320,
          maxWidth: 400,
          zIndex: 1300,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: isPreviewMode ? 'primary.main' : 'divider',
          boxShadow: isPreviewMode 
            ? '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px var(--color-primary)'
            : '0 8px 32px rgba(0,0,0,0.12)'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PreviewIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1rem', fontWeight: 600 }}>
            {title}
          </Typography>
          {isPreviewMode && (
            <Chip
              label="Activo"
              size="small"
              color="primary"
              icon={<VisibilityIcon />}
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Preview Toggle */}
        {showPreviewToggle && (
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPreviewEnabled}
                  onChange={(e) => handlePreviewToggle(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isPreviewEnabled ? <VisibilityIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> : <VisibilityOffIcon sx={{ mr: 0.5, fontSize: '1rem' }} />}
                  <Typography variant="body2">
                    {isPreviewEnabled ? 'Vista previa activa' : 'Activar vista previa'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}

        {/* Status Alert */}
        {isPreviewMode && (
          <Alert 
            severity="info" 
            sx={{ mb: 2, fontSize: '0.875rem' }}
            icon={<PreviewIcon />}
          >
            Los cambios son temporales. Aplícalos para hacerlos permanentes.
          </Alert>
        )}

        {/* Changes Summary */}
        {hasChanges && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
              Cambios pendientes:
            </Typography>
            <Stack spacing={0.5}>
              {previewSettings?.color_palette && (
                <Chip
                  label="Paleta de colores"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
              {(previewSettings?.primary_font || previewSettings?.heading_font) && (
                <Chip
                  label="Tipografía"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
              {(previewSettings?.site_name || previewSettings?.footer_content || previewSettings?.hero_image_url) && (
                <Chip
                  label="Branding"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CheckIcon />}
            onClick={handleApplyChanges}
            disabled={!hasChanges}
            sx={{ flex: 1 }}
          >
            Aplicar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleResetPreview}
            disabled={!hasChanges && !isPreviewMode}
            sx={{ flex: 1 }}
          >
            Resetear
          </Button>
        </Stack>

        {/* Preview Info */}
        {isPreviewMode && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 1, 
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            Vista previa • Los cambios no son permanentes
          </Typography>
        )}
      </Paper>
    </Fade>
  );
};

export default LivePreview;
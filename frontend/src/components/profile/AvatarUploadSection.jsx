import React from 'react';
import {
  Box, Typography, Avatar, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon, Person as PersonIcon
} from '@mui/icons-material';

/**
 * Componente para la sección de subida de avatar
 * @param {Object} props - Propiedades del componente
 * @param {string} props.avatarUrl - URL del avatar actual
 * @param {Function} props.onAvatarChange - Función para manejar cambio de avatar
 * @param {boolean} props.uploading - Estado de subida
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 * @returns {JSX.Element} Componente de subida de avatar
 */
function AvatarUploadSection({ 
  avatarUrl, 
  onAvatarChange, 
  uploading = false, 
  disabled = false 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));



  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mb: 4 
    }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Avatar
          src={avatarUrl}
          sx={{ 
            width: isMobile ? 80 : 100, 
            height: isMobile ? 80 : 100,
            border: `3px solid ${theme.palette.primary.main}`,
            opacity: uploading ? 0.7 : 1,
            transition: 'opacity 0.3s ease'
          }}
        >
          <PersonIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
        </Avatar>
        
        <IconButton
          component="label"
          disabled={disabled || uploading}
          sx={{
            position: 'absolute',
            bottom: -5,
            right: -5,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: 'grey.400',
              color: 'grey.600'
            },
            width: 35,
            height: 35,
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 18 }} />
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={onAvatarChange}
            disabled={disabled || uploading}
          />
        </IconButton>
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        textAlign="center"
        sx={{ maxWidth: 300 }}
      >
        {uploading 
          ? 'Subiendo imagen...' 
          : 'Haz clic en el ícono de cámara para cambiar tu foto de perfil'
        }
      </Typography>
      
      <Typography 
        variant="caption" 
        color="text.secondary" 
        textAlign="center"
        sx={{ mt: 1, opacity: 0.8 }}
      >
        Formatos soportados: JPEG, PNG, GIF, WebP (máx. 5MB)
      </Typography>
    </Box>
  );
}

export default AvatarUploadSection;
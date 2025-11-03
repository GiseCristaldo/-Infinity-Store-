import React, { useState } from 'react';
import {
  Grid, TextField, InputAdornment, IconButton, Typography, 
  Divider, Collapse, Button, LinearProgress, Box
} from '@mui/material';
import {
  Lock as LockIcon, Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';

/**
 * Componente para la sección de cambio de contraseña
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario
 * @param {Object} props.errors - Errores de validación
 * @param {Function} props.onInputChange - Función para manejar cambios
 * @param {boolean} props.disabled - Si los campos están deshabilitados
 * @param {boolean} props.expanded - Si la sección está expandida por defecto
 * @returns {JSX.Element} Componente de cambio de contraseña
 */
function PasswordChangeSection({ 
  formData, 
  errors, 
  onInputChange, 
  disabled = false,
  expanded = false
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const { 
    showPasswords, 
    togglePasswordVisibility, 
    validatePasswordStrength,
    getStrengthColor,
    getStrengthText
  } = usePasswordValidation();

  // Validar fortaleza de la nueva contraseña
  const passwordStrength = formData.newPassword 
    ? validatePasswordStrength(formData.newPassword)
    : null;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LockIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Cambiar Contraseña
        </Typography>
        <Button
          onClick={handleToggleExpand}
          endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ minWidth: 'auto' }}
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {isExpanded 
          ? 'Completa todos los campos para cambiar tu contraseña'
          : 'Haz clic en "Mostrar" si deseas cambiar tu contraseña'
        }
      </Typography>

      <Collapse in={isExpanded}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contraseña actual"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword || ''}
              onChange={onInputChange('currentPassword')}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              disabled={disabled}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                      disabled={disabled}
                    >
                      {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nueva contraseña"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword || ''}
              onChange={onInputChange('newPassword')}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              disabled={disabled}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                      disabled={disabled}
                    >
                      {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Indicador de fortaleza de contraseña */}
            {formData.newPassword && passwordStrength && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fortaleza:
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={`${getStrengthColor(passwordStrength.strength)}.main`}
                    sx={{ ml: 1, fontWeight: 'medium' }}
                  >
                    {getStrengthText(passwordStrength.strength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    passwordStrength.strength === 'weak' ? 33 :
                    passwordStrength.strength === 'medium' ? 66 : 100
                  }
                  color={getStrengthColor(passwordStrength.strength)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword || ''}
              onChange={onInputChange('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={disabled}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                      disabled={disabled}
                    >
                      {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </>
  );
}

export default PasswordChangeSection;
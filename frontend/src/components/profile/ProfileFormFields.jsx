import React from 'react';
import {
  Grid, TextField, InputAdornment
} from '@mui/material';
import {
  Person as PersonIcon, 
  Email as EmailIcon
} from '@mui/icons-material';

/**
 * Componente para los campos básicos del formulario de perfil
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.formData - Datos del formulario
 * @param {Object} props.errors - Errores de validación
 * @param {Function} props.onChange - Función para manejar cambios
 * @param {boolean} props.disabled - Si los campos están deshabilitados
 * @returns {JSX.Element} Componente de campos de formulario
 */
function ProfileFormFields({ 
  formData, 
  errors, 
  onChange, 
  disabled = false 
}) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Nombre completo"
          value={formData.nombre || ''}
          onChange={onChange('nombre')}
          error={!!errors.nombre}
          helperText={errors.nombre}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: disabled ? 'grey.300' : 'primary.main',
              },
            },
          }}
        />
      </Grid>
      
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={onChange('email')}
          error={!!errors.email}
          helperText={errors.email || "El email no se puede modificar por seguridad"}
          disabled={true} // Email siempre deshabilitado por seguridad
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'grey.300',
              },
            },
          }}
        />
      </Grid>
    </Grid>
  );
}

export default ProfileFormFields;
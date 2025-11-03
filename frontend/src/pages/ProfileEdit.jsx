import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Avatar, 
  IconButton, Alert, Snackbar, Grid, Divider, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon, PhotoCamera as PhotoCameraIcon, 
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon, Cancel as CancelIcon, Person as PersonIcon,
  Email as EmailIcon, Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function ProfileEdit() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('La imagen no puede ser mayor a 5MB', 'error');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        showSnackbar('Solo se permiten archivos de imagen', 'error');
        return;
      }
      
      setAvatarFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Si se quiere cambiar contraseña
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Contraseña actual requerida para cambiar contraseña';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Nueva contraseña requerida';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Datos básicos
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('email', formData.email);
      
      // Contraseñas (solo si se van a cambiar)
      if (formData.newPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }
      
      // Avatar (si se seleccionó uno nuevo)
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }
      
      const response = await axios.put('/api/users/profile', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Actualizar contexto de usuario
      updateUser(response.data.user);
      
      // Limpiar campos de contraseña
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Limpiar avatar preview
      setAvatarFile(null);
      setAvatarPreview(null);
      
      showSnackbar('Perfil actualizado exitosamente');
      setConfirmDialog(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      showSnackbar(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Editar Perfil
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[4] }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={avatarPreview || user.avatar}
                sx={{ 
                  width: isMobile ? 80 : 100, 
                  height: isMobile ? 80 : 100,
                  border: `3px solid ${theme.palette.primary.main}`,
                }}
              >
                <PersonIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
              </Avatar>
              
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
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
                  onChange={handleAvatarChange}
                />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Haz clic en el ícono de cámara para cambiar tu foto de perfil
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Form Fields */}
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Información Personal
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange('nombre')}
                error={!!errors.nombre}
                helperText={errors.nombre}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Cambio de Contraseña */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon color="primary" />
                Cambiar Contraseña (Opcional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Deja estos campos vacíos si no deseas cambiar tu contraseña
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraseña actual"
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange('currentPassword')}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword}
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
                value={formData.newPassword}
                onChange={handleInputChange('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword}
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
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar nueva contraseña"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 4, 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              fullWidth={isMobile}
              sx={{ minWidth: 120 }}
            >
              Cancelar
            </Button>
            
            <Button
              variant="contained"
              onClick={() => setConfirmDialog(true)}
              startIcon={<SaveIcon />}
              disabled={loading}
              fullWidth={isMobile}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[24],
          }
        }}
      >
        <DialogTitle>Confirmar Cambios</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas guardar los cambios en tu perfil?
          </Typography>
          {formData.newPassword && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Se cambiará tu contraseña. Tendrás que iniciar sesión nuevamente.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setConfirmDialog(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProfileEdit;
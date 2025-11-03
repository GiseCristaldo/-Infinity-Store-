// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Avatar, 
  Alert, Snackbar, Grid, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  useTheme, useMediaQuery, Chip
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, 
  Person as PersonIcon, Logout as LogoutIcon, ShoppingBag as OrdersIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfileForm } from '../hooks/useProfileForm';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import AvatarUploadSection from '../components/profile/AvatarUploadSection';
import ProfileFormFields from '../components/profile/ProfileFormFields';
import PasswordChangeSection from '../components/profile/PasswordChangeSection';
import axios from 'axios';

function ProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  
  // Estados principales
  const [editMode, setEditMode] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pageLoading, setPageLoading] = useState(true);

  // Hooks personalizados
  const {
    formData,
    errors,
    loading: formLoading,
    setLoading: setFormLoading,
    handleInputChange,
    validateForm,
    resetForm,
    clearPasswordFields,
    hasPasswordChange
  } = useProfileForm();

  const {
    avatarPreview,
    uploading: avatarUploading,
    handleAvatarChange,
    clearAvatar,
    getAvatarUrl,
    hasNewAvatar,
    getAvatarFile
  } = useAvatarUpload((error) => showSnackbar(error, 'error'));

  // Efectos
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setPageLoading(false);
  }, [isAuthenticated, navigate]);



  // Funciones auxiliares
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Salir del modo edición - resetear formulario
      resetForm();
      clearAvatar();
    }
    setEditMode(!editMode);
  };

  const handleSaveChanges = () => {
    if (!validateForm()) {
      showSnackbar('Por favor corrige los errores en el formulario', 'error');
      return;
    }
    setConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setFormLoading(true);
    setConfirmDialog(false);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Datos básicos
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('email', formData.email);
      
      // Contraseñas (solo si se van a cambiar)
      if (hasPasswordChange) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }
      
      // Avatar (si se seleccionó uno nuevo)
      const avatarFile = getAvatarFile();
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
      
      // Limpiar campos de contraseña y avatar
      clearPasswordFields();
      clearAvatar();
      
      // Salir del modo edición
      setEditMode(false);
      
      showSnackbar('Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      showSnackbar(message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      await logout();
      navigate('/auth');
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Estados de carga
  if (pageLoading || !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {editMode ? 'Editar Perfil' : 'Mi Perfil'}
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[4] }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {editMode ? (
            // MODO EDICIÓN
            <>
              {/* Sección de Avatar */}
              <AvatarUploadSection
                avatarUrl={getAvatarUrl(user?.avatar)}
                onAvatarChange={handleAvatarChange}
                uploading={avatarUploading}
                disabled={formLoading}
              />

              <Divider sx={{ mb: 3 }} />

              {/* Información Personal */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Información Personal
              </Typography>

              <ProfileFormFields
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                disabled={formLoading}
              />

              {/* Cambio de Contraseña */}
              <PasswordChangeSection
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                disabled={formLoading}
                expanded={false}
              />

              {/* Botones de Acción */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                mt: 4, 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'flex-end'
              }}>
                <Button
                  variant="outlined"
                  onClick={toggleEditMode}
                  startIcon={<CancelIcon />}
                  disabled={formLoading}
                  fullWidth={isMobile}
                  sx={{ minWidth: 120 }}
                >
                  Cancelar
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleSaveChanges}
                  startIcon={formLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                  disabled={formLoading}
                  fullWidth={isMobile}
                  sx={{ minWidth: 120 }}
                >
                  {formLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Box>
            </>
          ) : (
            // MODO VISUALIZACIÓN
            <>
              {/* Avatar y información básica */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{ 
                    width: isMobile ? 80 : 100, 
                    height: isMobile ? 80 : 100,
                    border: `3px solid ${theme.palette.primary.main}`,
                    mb: 2
                  }}
                >
                  <PersonIcon sx={{ fontSize: isMobile ? 40 : 50 }} />
                </Avatar>
                
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {user.nombre}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {user.email}
                </Typography>
                
                <Chip 
                  label={user.rol === 'super_admin' ? 'Super Administrador' : 
                        user.rol === 'admin' ? 'Administrador' : 'Cliente'} 
                  color={user.rol === 'super_admin' ? 'secondary' : 
                         user.rol === 'admin' ? 'primary' : 'default'}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Información adicional */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de registro
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.date_register).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Estado de la cuenta
                  </Typography>
                  <Chip 
                    label={user.is_active ? 'Activa' : 'Inactiva'} 
                    color={user.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Botones de Acción */}
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  onClick={toggleEditMode}
                  startIcon={<EditIcon />}
                  fullWidth={isMobile}
                  sx={{ minWidth: 140 }}
                >
                  Editar Perfil
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/mis-ordenes')}
                  startIcon={<OrdersIcon />}
                  fullWidth={isMobile}
                  sx={{ minWidth: 140 }}
                >
                  Mis Órdenes
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  startIcon={<HomeIcon />}
                  fullWidth={isMobile}
                  sx={{ minWidth: 140 }}
                >
                  Inicio
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  fullWidth={isMobile}
                  sx={{ minWidth: 140 }}
                >
                  Cerrar Sesión
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Confirmación */}
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
          {hasPasswordChange && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Se cambiará tu contraseña. Tendrás que iniciar sesión nuevamente.
            </Alert>
          )}
          {hasNewAvatar() && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Se actualizará tu foto de perfil.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setConfirmDialog(false)}
            disabled={formLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmSave}
            variant="contained"
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {formLoading ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
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

export default ProfilePage;
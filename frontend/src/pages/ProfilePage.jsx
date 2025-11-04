// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Container, Button, Card, CardContent, Avatar,
  Divider, IconButton, Chip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Cancel as CancelIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProfileForm } from '../hooks/useProfileForm.js';
import { useAvatarUpload } from '../hooks/useAvatarUpload.js';
import AvatarUploadSection from '../components/profile/AvatarUploadSection.jsx';
import ProfileFormFields from '../components/profile/ProfileFormFields.jsx';
import PasswordChangeSection from '../components/profile/PasswordChangeSection.jsx';

function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Hooks personalizados
  const profileForm = useProfileForm(user);
  const avatarUpload = useAvatarUpload();

  // Función para alternar modo de edición
  const toggleEditMode = () => {
    if (editMode) {
      // Si estamos saliendo del modo edición, resetear el formulario
      profileForm.resetForm();
      avatarUpload.clearAvatar();
    }
    setEditMode(!editMode);
  };

  // Función para guardar cambios
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Validar formulario
      if (!profileForm.validateForm()) {
        return;
      }

      // Preparar datos para enviar
      const profileData = {
        nombre: profileForm.formData.nombre,
        email: profileForm.formData.email,
        phone: profileForm.formData.phone || '',
        address: profileForm.formData.address || ''
      };

      // Enviar actualización del perfil
      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }

      // Subir avatar si hay uno nuevo
      if (avatarUpload.hasNewAvatar()) {
        const formData = new FormData();
        formData.append('avatar', avatarUpload.getAvatarFile());
        
        const avatarResponse = await fetch('http://localhost:3001/api/users/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!avatarResponse.ok) {
          throw new Error('Error al subir avatar');
        }
      }

      // Manejar cambio de contraseña si es necesario
      if (profileForm.hasPasswordChange) {
        const passwordData = {
          currentPassword: profileForm.formData.currentPassword,
          newPassword: profileForm.formData.newPassword
        };

        const passwordResponse = await fetch('http://localhost:3001/api/users/password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(passwordData)
        });

        if (!passwordResponse.ok) {
          throw new Error('Error al cambiar contraseña');
        }
      }

      // Actualizar contexto de usuario
      const updatedUser = { ...user, ...profileData };
      updateUser(updatedUser);
      
      // Salir del modo edición
      setEditMode(false);
      
      // Mostrar mensaje de éxito (puedes agregar un toast aquí)
      console.log('Perfil actualizado exitosamente');
      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      // Aquí puedes mostrar un mensaje de error al usuario
    } finally {
      setSaving(false);
    }
  };

  // Mover la lógica de redirección a un useEffect
  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!isAuthenticated) {
      navigate('/auth');
    }
    // Una vez que sabemos si el usuario está autenticado, podemos finalizar la carga
    setLoading(false);
  }, [isAuthenticated, navigate]);

  // Si está cargando o no hay usuario (aún no cargó o no existe), mostrar mensaje
  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Cargando información del perfil...</Typography>
      </Box>
    );
  }
const handleLogout = async () => {
    try {
      // Eliminar tokens y datos de usuario
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Ejecutar función de logout del contexto
      await logout();
      
      // Redirigir al login
      navigate('/auth');
      
      // Opcionalmente recargar para asegurar que todos los estados se resetean
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Si no hay usuario, mostrar un loader o nada mientras se redirige
  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ color: 'secondary.main' }}>
            {editMode ? 'Editar Perfil' : 'Mi Perfil'}
          </Typography>
          
          {!editMode && (
            <IconButton 
              onClick={toggleEditMode}
              color="primary"
              sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {!editMode ? (
          // Vista de perfil (modo lectura)
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar 
                sx={{ width: 80, height: 80, mr: 3, bgcolor: 'secondary.main' }}
                src={user.avatar_url}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ mb: 1 }}>
                  {user.nombre || 'Usuario'}
                </Typography>
                <Chip 
                  label={user.rol || user.role} 
                  color="secondary" 
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Email:</strong> {user.email}
                </Typography>
              </Box>
              
              {user.phone && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Teléfono:</strong> {user.phone}
                </Typography>
              )}
              
              {user.address && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Dirección:</strong> {user.address}
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Miembro desde: {user.date_register ? new Date(user.date_register).toLocaleDateString() : 'Fecha no disponible'}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/mis-ordenes')}
                sx={{ borderRadius: 2 }}
              >
                Ver Mis Órdenes
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/')}
                sx={{ borderRadius: 2 }}
              >
                Volver a Inicio
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                sx={{ borderRadius: 2 }}
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Box>
        ) : (
          // Formulario de edición
          <Box>
            {/* Sección de Avatar */}
            <AvatarUploadSection 
              currentAvatar={user.avatar_url}
              onAvatarChange={avatarUpload.handleAvatarChange}
              onAvatarRemove={avatarUpload.clearAvatar}
              previewUrl={avatarUpload.avatarPreview}
              uploading={avatarUpload.uploading}
            />

            <Divider sx={{ my: 3 }} />

            {/* Campos del formulario */}
            <ProfileFormFields 
              formData={profileForm.formData}
              errors={profileForm.errors}
              onChange={profileForm.handleInputChange}
            />

            <Divider sx={{ my: 3 }} />

            {/* Sección de cambio de contraseña */}
            <PasswordChangeSection 
              formData={profileForm.formData}
              errors={profileForm.errors}
              onInputChange={profileForm.handleInputChange}
            />

            <Divider sx={{ my: 3 }} />

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={toggleEditMode}
                disabled={saving}
                startIcon={<CancelIcon />}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Box>
        )}
      </Card>
    </Container>
  );
}

export default ProfilePage;
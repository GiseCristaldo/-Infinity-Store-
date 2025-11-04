import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, IconButton,
  CircularProgress, TextField, Switch, FormControlLabel, Chip
} from '@mui/material';
import {
  CloudUpload as UploadIcon, Delete as DeleteIcon,
  Image as ImageIcon, Visibility as PreviewIcon, Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import { getApiBaseUrl } from '../../utils/urlUtils.js';

// Configurar axios con la URL base correcta
const api = axios.create({
  baseURL: getApiBaseUrl()
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function ImageManagement() {
  // Estados principales - TODOS los hooks al inicio
  const [currentImages, setCurrentImages] = useState({
    hero_image_url: null,
    carousel_images: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [previewDialog, setPreviewDialog] = useState({ open: false, image: null });
  const [editDialog, setEditDialog] = useState({ open: false, index: null, title: '', subtitle: '' });
  // const [heroEnabled, setHeroEnabled] = useState(true); // TODO: Para uso futuro

  // useEffect - siempre después de useState
  useEffect(() => {
    loadCurrentImages();
  }, []);

  // Funciones
  const clearFrontendCache = () => {
    console.log('🧹 [Cache] Limpiando caché del frontend...');
    localStorage.removeItem('themeSettings');
    localStorage.removeItem('themeSettingsTimestamp');
    console.log('✅ [Cache] Caché del frontend limpiado');
  };

  const loadCurrentImages = async () => {
    try {
      console.log('🔄 [ImageManagement] Iniciando carga de imágenes...');
      
      // Usar fetch con URL relativa como ThemeContext
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/settings/current?_ts=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📡 [ImageManagement] Respuesta completa:', data);
      console.log('🎠 [ImageManagement] Carousel images recibidas:', data.data?.carousel_images);
      
      const newState = {
        hero_image_url: data.data?.hero_image_url,
        carousel_images: data.data?.carousel_images || []
      };
      
      console.log('📝 [ImageManagement] Nuevo estado a establecer:', newState);
      setCurrentImages(newState);
      console.log('✅ [ImageManagement] Estado actualizado');
    } catch (error) {
      console.error('Error loading current images:', error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        showSnackbar('No autorizado. Inicia sesión como Super Admin.', 'error');
      } else if (status === 403) {
        showSnackbar('Permisos insuficientes. Se requiere rol Super Admin.', 'error');
      } else {
        showSnackbar(serverMsg || 'Error al cargar imágenes actuales', 'error');
      }
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

  const handlePreviewImage = (imageUrl) => {
    setPreviewDialog({ open: true, image: imageUrl });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'carousel');

    try {
      console.log('📤 [Upload] Subiendo imagen...');
      
      // Usar fetch con URL relativa para aprovechar el proxy de Vite
      const token = localStorage.getItem('token');
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [Upload] Respuesta del servidor:', data);
      
      showSnackbar('Imagen agregada al carousel exitosamente', 'success');
      clearFrontendCache();
      console.log('🔄 [Upload] Recargando imágenes...');
      await loadCurrentImages();
      console.log('✅ [Upload] Proceso completado');
    } catch (error) {
      console.error('Error uploading image:', error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        showSnackbar('No autorizado. Inicia sesión como Super Admin.', 'error');
      } else if (status === 403) {
        showSnackbar('Permisos insuficientes para subir imágenes.', 'error');
      } else if (status === 400) {
        // Errores comunes de multer/validación
        showSnackbar(serverMsg || 'Solicitud inválida: verifica formato y tamaño (<=5MB).', 'error');
      } else {
        showSnackbar(serverMsg || 'Error al subir imagen', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddCarouselImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file, 'carousel');
      }
    };
    input.click();
  };

  const handleEditSlideText = (index) => {
    const slide = currentImages.carousel_images[index];
    setEditDialog({
      open: true,
      index,
      title: slide?.title || '',
      subtitle: slide?.subtitle || ''
    });
  };

  const handleSaveSlideText = async () => {
    try {
      console.log('📝 [EditText] Guardando texto:', { title: editDialog.title, subtitle: editDialog.subtitle });
      
      // Usar fetch con URL relativa para aprovechar el proxy de Vite
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/images/carousel/${editDialog.index}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editDialog.title,
          subtitle: editDialog.subtitle
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [EditText] Respuesta del servidor:', data);
      
      showSnackbar('Texto actualizado exitosamente', 'success');
      setEditDialog({ open: false, index: null, title: '', subtitle: '' });
      clearFrontendCache();
      console.log('🔄 [EditText] Recargando imágenes...');
      await loadCurrentImages();
      console.log('✅ [EditText] Proceso completado');
    } catch (error) {
      console.error('Error updating slide text:', error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        showSnackbar('No autorizado. Inicia sesión como Super Admin.', 'error');
      } else if (status === 403) {
        showSnackbar('Permisos insuficientes para editar texto.', 'error');
      } else {
        showSnackbar(serverMsg || 'Error al actualizar texto', 'error');
      }
    }
  };

  const handleDeleteCarouselImage = async (index) => {
    try {
      console.log('🗑️ [Delete] Eliminando imagen:', index);
      
      // Usar fetch con URL relativa para aprovechar el proxy de Vite
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/images/carousel/${index}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ [Delete] Imagen eliminada del servidor');
      showSnackbar('Imagen eliminada exitosamente', 'success');
      clearFrontendCache();
      console.log('🔄 [Delete] Recargando imágenes...');
      await loadCurrentImages();
      console.log('✅ [Delete] Proceso completado');
    } catch (error) {
      console.error('Error deleting image:', error);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        showSnackbar('No autorizado. Inicia sesión como Super Admin.', 'error');
      } else if (status === 403) {
        showSnackbar('Permisos insuficientes para eliminar imágenes.', 'error');
      } else {
        showSnackbar(serverMsg || 'Error al eliminar imagen', 'error');
      }
    }
  };

  // TODO: Función para controlar visibilidad del hero - Para uso futuro
  /*
  const handleToggleHero = async () => {
    try {
      await axios.put('/api/settings/hero-visibility', { enabled: !heroEnabled });
      setHeroEnabled(!heroEnabled);
      showSnackbar(`Hero section ${!heroEnabled ? 'habilitado' : 'deshabilitado'}`, 'success');
    } catch (error) {
      console.error('Error toggling hero:', error);
      showSnackbar('Error al cambiar visibilidad del hero', 'error');
    }
  };
  */

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Log del estado actual para debug (comentado para producción)
  // console.log('🖼️ [Render] Estado actual de currentImages:', currentImages);
  // console.log('🖼️ [Render] Cantidad de imágenes:', currentImages.carousel_images?.length);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión del Carousel
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Administra las imágenes y textos que se muestran en el carousel de la página principal.
      </Typography>

      {/* TODO: Sección Hero Image - Comentada para uso futuro */}
      {/* 
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon color="primary" />
            Imagen Hero Section (Próximamente)
          </Typography>
          <Alert severity="info">
            La funcionalidad del Hero Section estará disponible próximamente.
          </Alert>
        </CardContent>
      </Card>
      */}

      {/* Sección Carousel */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon color="primary" />
            Carousel Principal
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Puedes subir hasta 5 imágenes para el carousel. Cada imagen puede tener título y subtítulo.
            </Typography>
            <Chip 
              label={`${currentImages.carousel_images.length}/5 imágenes`} 
              color={currentImages.carousel_images.length >= 5 ? "error" : "primary"}
              size="small"
            />
          </Box>

          {currentImages.carousel_images.length > 0 ? (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {currentImages.carousel_images.map((imageData, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={imageData.image.startsWith('http') 
                          ? imageData.image 
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${imageData.image}`
                        }
                        alt={`Carousel ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                          }}
                          onClick={() => handlePreviewImage(imageData.image)}
                        >
                          <PreviewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                          }}
                          onClick={() => handleEditSlideText(index)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,0,0,0.8)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,0,0,0.9)' }
                          }}
                          onClick={() => handleDeleteCarouselImage(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {imageData.title || `Slide ${index + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {imageData.subtitle || 'Sin subtítulo'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No hay imágenes en el carousel. Puedes agregar hasta 5 imágenes.
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={currentImages.carousel_images.length >= 5 ? <ImageIcon /> : <AddIcon />}
            disabled={uploading || currentImages.carousel_images.length >= 5}
            onClick={handleAddCarouselImage}
          >
            {currentImages.carousel_images.length >= 5 
              ? 'Máximo 5 imágenes alcanzado' 
              : 'Agregar Imagen al Carousel'
            }
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de vista previa */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false, image: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Vista Previa de Imagen</DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {previewDialog.image && (
            <Box
              component="img"
              src={previewDialog.image.startsWith('http') 
                ? previewDialog.image 
                : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${previewDialog.image}`
              }
              alt="Preview"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPreviewDialog({ open: false, image: null })}
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar texto del slide */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, index: null, title: '', subtitle: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Editar Texto del Slide {editDialog.index !== null ? editDialog.index + 1 : ''}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            fullWidth
            variant="outlined"
            value={editDialog.title}
            onChange={(e) => setEditDialog({ ...editDialog, title: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Ej: Bienvenido a nuestra tienda"
          />
          <TextField
            margin="dense"
            label="Subtítulo"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={editDialog.subtitle}
            onChange={(e) => setEditDialog({ ...editDialog, subtitle: e.target.value })}
            placeholder="Ej: Descubre nuestros productos exclusivos"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, index: null, title: '', subtitle: '' })}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveSlideText}
            variant="contained"
          >
            Guardar
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

export default ImageManagement;
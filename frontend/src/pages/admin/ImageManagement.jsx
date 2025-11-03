import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, IconButton,
  CircularProgress
} from '@mui/material';
import {
  CloudUpload as UploadIcon, Delete as DeleteIcon,
  Image as ImageIcon, Visibility as PreviewIcon
} from '@mui/icons-material';
import axios from 'axios';

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

  // useEffect - siempre después de useState
  useEffect(() => {
    loadCurrentImages();
  }, []);

  // Funciones
  const loadCurrentImages = async () => {
    try {
      const response = await axios.get('/api/settings/current');
      setCurrentImages({
        hero_image_url: response.data.data?.hero_image_url,
        carousel_images: response.data.data?.carousel_images || []
      });
    } catch (error) {
      console.error('Error loading current images:', error);
      showSnackbar('Error al cargar imágenes actuales', 'error');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Imágenes
      </Typography>

      {/* Sección Hero Image */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon color="primary" />
            Imagen Hero Section
          </Typography>
          
          {currentImages.hero_image_url ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Imagen actual:
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={currentImages.hero_image_url.startsWith('http') 
                    ? currentImages.hero_image_url 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${currentImages.hero_image_url}`
                  }
                  alt="Hero actual"
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                  }}
                  onClick={() => handlePreviewImage(currentImages.hero_image_url)}
                >
                  <PreviewIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay imagen hero configurada
            </Alert>
          )}
          
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            disabled={uploading}
          >
            {currentImages.hero_image_url ? 'Cambiar Imagen Hero' : 'Subir Imagen Hero'}
          </Button>
        </CardContent>
      </Card>

      {/* Sección Carousel */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon color="primary" />
            Carousel de Imágenes
          </Typography>

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
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                        }}
                        onClick={() => handlePreviewImage(imageData.image)}
                      >
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <CardContent>
                      <Typography variant="body2">
                        {imageData.text || `Slide ${index + 1}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No hay imágenes en el carousel
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            disabled={uploading}
          >
            Agregar Imágenes al Carousel
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
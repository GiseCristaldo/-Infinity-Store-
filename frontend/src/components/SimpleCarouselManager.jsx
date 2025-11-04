import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, IconButton,
  CircularProgress, TextField
} from '@mui/material';
import {
  Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon
} from '@mui/icons-material';

function SimpleCarouselManager() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialog, setEditDialog] = useState({ open: false, id: null, title: '', subtitle: '' });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/carousel-new', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImages(data.data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      showSnackbar('Error al cargar imágenes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/carousel-new/upload', {
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
      setImages(data.data || []);
      showSnackbar('Imagen subida exitosamente', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showSnackbar('Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  const handleEditText = (image) => {
    setEditDialog({
      open: true,
      id: image.id,
      title: image?.title || '',
      subtitle: image?.subtitle || ''
    });
  };

  const handleSaveText = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/carousel-new/${editDialog.id}/text`, {
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
      setImages(data.data || []);
      setEditDialog({ open: false, id: null, title: '', subtitle: '' });
      showSnackbar('Texto actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating text:', error);
      showSnackbar('Error al actualizar texto', 'error');
    }
  };

  const handleDeleteImage = async (image) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/carousel-new/${image.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImages(data.data || []);
      showSnackbar('Imagen eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showSnackbar('Error al eliminar imagen', 'error');
    }
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
        Gestión Simple del Carousel
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Imágenes del Carousel ({images.length}/5)
          </Typography>
          
          {images.length > 0 ? (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {images.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <Box sx={{ position: 'relative' }}>
                      <img
                        src={image.image.startsWith('http') 
                          ? image.image 
                          : `http://localhost:3001${image.image}`
                        }
                        alt={`Carousel ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover'
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
                          onClick={() => handleEditText(image)}
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
                          onClick={() => handleDeleteImage(image)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {image.title || `Imagen ${index + 1}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {image.subtitle || 'Sin descripción'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay imágenes en el carousel. Agrega algunas imágenes.
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={uploading || images.length >= 5}
            onClick={handleAddImage}
          >
            {uploading ? 'Subiendo...' : 
             images.length >= 5 ? 'Máximo 5 imágenes' : 'Agregar Imagen'}
          </Button>
        </CardContent>
      </Card>

      {/* Dialog para editar texto */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, id: null, title: '', subtitle: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Editar Texto - Imagen {editDialog.id !== null ? `ID: ${editDialog.id}` : ''}
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
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, id: null, title: '', subtitle: '' })}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveText}
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SimpleCarouselManager;
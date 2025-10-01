import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, Avatar, Grid, IconButton, Chip } from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { getAllCategories } from '../../services/categoryService';

function ProductForm({ onSubmit, initialData = {}, isEdit = false }) {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Cargar categorías cuando el componente se monta
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getAllCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // Rellenar el formulario con datos iniciales cuando se abre para editar
  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      price: initialData.price || '',
      stock: initialData.stock || '',
      categoryId: initialData.categoryId || '',
    });

    // Si estamos editando y hay imágenes existentes, cargarlas
    if (isEdit && initialData.images && initialData.images.length > 0) {
      setImagePreviews(initialData.images.map(img => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
        isExisting: true
      })));
    } else if (isEdit && (initialData.imagenURL || initialData.image)) {
      // Compatibilidad con imagen única legacy
      setImagePreviews([{
        url: initialData.imagenURL || initialData.image,
        isPrimary: true,
        isExisting: true
      }]);
    }
  }, [initialData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar la selección de múltiples archivos de imagen
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validar que no exceda el límite de 5 imágenes
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 5) {
      alert('Máximo 5 imágenes permitidas por producto');
      return;
    }

    const newImages = [];
    const newPreviews = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = {
          file: file,
          url: reader.result,
          isPrimary: imagePreviews.length === 0 && index === 0, // Primera imagen es principal
          isExisting: false
        };
        
        newImages.push(file);
        newPreviews.push(imageData);

        // Cuando todas las imágenes se han procesado
        if (newPreviews.length === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Eliminar una imagen
  const handleRemoveImage = (indexToRemove) => {
    setImagePreviews(prev => {
      const newPreviews = prev.filter((_, index) => index !== indexToRemove);
      
      // Si eliminamos la imagen principal, hacer que la primera sea principal
      if (prev[indexToRemove]?.isPrimary && newPreviews.length > 0) {
        newPreviews[0].isPrimary = true;
      }
      
      return newPreviews;
    });

    setSelectedImages(prev => prev.filter((_, index) => {
      // Solo filtrar imágenes nuevas, no las existentes
      const imagePreview = imagePreviews[indexToRemove];
      return imagePreview?.isExisting || index !== indexToRemove;
    }));
  };

  // Establecer imagen principal
  const handleSetPrimary = (indexToSetPrimary) => {
    setImagePreviews(prev => prev.map((img, index) => ({
      ...img,
      isPrimary: index === indexToSetPrimary
    })));
  };

const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- VALIDACIÓN ADICIONAL ---
    if (imagePreviews.length === 0) {
      alert("Por favor, sube al menos una imagen para el producto.");
      return;
    }
    if (!formData.categoryId) {
      alert("Por favor, selecciona una categoría para el producto.");
      return;
    }

    // Preparar datos para envío
    const dataToSubmit = {
      ...formData,
      images: imagePreviews,
      newImages: selectedImages
    };

    onSubmit(dataToSubmit);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, maxHeight: '70vh', overflowY: 'auto', pr: 2 }}>
      <TextField margin="normal" required fullWidth label="Nombre del Producto" name="name" value={formData.name || ''} onChange={handleChange} />
      <TextField margin="normal" required fullWidth multiline rows={3} label="Descripción" name="description" value={formData.description || ''} onChange={handleChange} />
      <TextField margin="normal" required fullWidth type="number" label="Precio" name="price" value={formData.price || ''} onChange={handleChange} inputProps={{ step: "0.01" }} />
      <TextField margin="normal" required fullWidth type="number" label="Stock" name="stock" value={formData.stock || ''} onChange={handleChange} />
      
      {/* La propiedad 'required' en FormControl ayuda, pero la validación en handleSubmit es más segura */}
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="category-label">Categoría</InputLabel>
        <Select labelId="category-label" name="categoryId" value={formData.categoryId || ''} label="Categoría" onChange={handleChange}>
          {/* Es buena idea tener una opción deshabilitada para forzar la selección */}
          <MenuItem value="" disabled>
            <em>Selecciona una categoría</em>
          </MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{
            backgroundColor: '#d4a5a5',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e8c4c4',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(212, 165, 165, 0.4)',
            },
          }}
        >
          Subir Imágenes (máx. 5)
          <input 
            type="file" 
            hidden 
            accept="image/*" 
            multiple 
            onChange={handleFileChange} 
          />
        </Button>
        
        {imagePreviews.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Imágenes del producto ({imagePreviews.length}/5):
            </Typography>
            <Grid container spacing={2}>
              {imagePreviews.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={image.url} 
                      alt={`Imagen ${index + 1}`} 
                      variant="square" 
                      sx={{ 
                        width: '100%', 
                        height: 120, 
                        border: image.isPrimary ? '3px solid #d4a5a5' : '1px solid #ddd',
                        borderRadius: 1
                      }} 
                    />
                    
                    {/* Chip de imagen principal */}
                    {image.isPrimary && (
                      <Chip
                        label="Principal"
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                    
                    {/* Botones de acción */}
                    <Box sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Botón para establecer como principal */}
                    {!image.isPrimary && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSetPrimary(index)}
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          right: 4,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                        }}
                      >
                        Hacer Principal
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      <Button 
        type="submit" 
        fullWidth 
        variant="contained" 
        sx={{ 
          mt: 3, 
          mb: 2,
          backgroundColor: '#d4a5a5',
          color: '#ffffff',
          fontWeight: 600,
          borderRadius: 2,
          py: 1.5,
          fontSize: '1.1rem',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#e8c4c4',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(212, 165, 165, 0.4)',
          },
        }}
      >
        {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
      </Button>
    </Box>
  );
}

export default ProductForm;
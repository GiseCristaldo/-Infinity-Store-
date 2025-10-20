import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Avatar } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

function CategoryForm({ onSubmit, initialData = {} }) {
  const [name, setName] = useState('');
  const [imagenURL, setImagenURL] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Si hay datos iniciales (para editar), rellenamos los campos
    if (initialData.name) {
      setName(initialData.name);
    } else {
      setName(''); // Limpiamos para el modo 'crear'
    }
    
    if (initialData.imagenURL) {
      setImagenURL(initialData.imagenURL);
      setPreviewUrl(initialData.imagenURL);
    } else {
      setImagenURL(''); // Limpiamos para el modo 'crear'
      setPreviewUrl('');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre de la categoría no puede estar vacío.');
      return;
    }
    // Pasamos el archivo si existe; el servicio decidirá formato
    onSubmit({ name, imagenURL, imageFile: selectedImage || null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Los campos marcados con * son obligatorios
      </Typography>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Nombre de la Categoría"
        name="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        margin="normal"
        fullWidth
        id="imagenURL"
        label="URL de la Imagen (opcional)"
        name="imagenURL"
        value={imagenURL}
        onChange={(e) => setImagenURL(e.target.value)}
        helperText="Opcional. También puedes subir un archivo abajo."
      />

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}> 
          Subir Imagen
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {previewUrl && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={previewUrl} alt="Preview" variant="square" sx={{ width: 100, height: 100 }} />
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveImage}>
              Quitar imagen
            </Button>
          </Box>
        )}
      </Box>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        {initialData.id ? 'Guardar Cambios' : 'Crear Categoría'}
      </Button>
    </Box>
  );
}

export default CategoryForm;
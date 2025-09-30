import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function CategoryForm({ onSubmit, initialData = {} }) {
  const [name, setName] = useState('');
  const [imagenURL, setImagenURL] = useState('');

  useEffect(() => {
    // Si hay datos iniciales (para editar), rellenamos los campos
    if (initialData.name) {
      setName(initialData.name);
    } else {
      setName(''); // Limpiamos para el modo 'crear'
    }
    
    if (initialData.imagenURL) {
      setImagenURL(initialData.imagenURL);
    } else {
      setImagenURL(''); // Limpiamos para el modo 'crear'
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('El nombre de la categoría no puede estar vacío.');
      return;
    }
    // Si imagenURL está vacío, se usará una imagen por defecto en el backend
    onSubmit({ name, imagenURL });
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
        helperText="Si no se proporciona, se usará una imagen por defecto"
      />
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
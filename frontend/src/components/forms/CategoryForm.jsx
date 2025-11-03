import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const CategoryForm = ({ initialData = {}, onSubmit }) => {
  const [name, setName] = useState(initialData.name || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData.imagenURL || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setName(initialData.name || '');
    // Mantiene la imagen actual como preview si existe
    setPreviewUrl(initialData.imagenURL || '');
    setSelectedImage(null);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, imageFile: selectedImage || null });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file || null);
    setPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Nombre de la categoría"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Imagen (solo archivo)</Typography>
        {previewUrl && (
          <Box sx={{ mb: 1, position: 'relative', display: 'inline-block' }}>
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px', borderRadius: 4 }} />
            <IconButton
              size="small"
              onClick={handleRemoveImage}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              aria-label="Eliminar imagen"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Button variant="contained" component="label">
          Subir imagen
          <input type="file" accept="image/*" hidden onChange={handleFileChange} ref={fileInputRef} />
        </Button>
      </Box>

      <Button type="submit" variant="contained" color="primary">
        Guardar categoría
      </Button>
    </Box>
  );
};

export default CategoryForm;
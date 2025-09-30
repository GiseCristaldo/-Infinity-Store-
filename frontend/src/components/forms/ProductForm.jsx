import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, Avatar } from '@mui/material';
import { getAllCategories } from '../../services/categoryService';

function ProductForm({ onSubmit, initialData = {}, isEdit = false }) {
  const [formData, setFormData] = useState({});
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

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
    const imageUrlFromDb = initialData.imagenURL || initialData.image || null;

    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      price: initialData.price || '',
      stock: initialData.stock || '',
      categoryId: initialData.categoryId || '',
     image: imageUrlFromDb, // Usamos la URL de la DB
    });
    setImagePreview(imageUrlFromDb); 
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar la selección de un archivo de imagen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // El resultado (reader.result) es la imagen en formato Base64
        setFormData(prev => ({ ...prev, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = (e) => {
    e.preventDefault();
    // --- VALIDACIÓN ADICIONAL ---
    if (!formData.image) {
      alert("Por favor, sube una imagen para el producto.");
      return; // Detiene el envío del formulario
    }
    if (!formData.categoryId) {
      alert("Por favor, selecciona una categoría para el producto.");
      return; // Detiene el envío del formulario
    }
    onSubmit(formData);
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
        {/* El input de archivo no tiene 'required', por eso lo validamos manualmente */}
        <Button variant="contained" component="label">
          Subir Imagen
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {imagePreview && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Vista previa:</Typography>
            <Avatar src={imagePreview} alt="Vista previa" variant="square" sx={{ width: 100, height: 100, mt: 1 }} />
          </Box>
        )}
      </Box>

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
      </Button>
    </Box>
  );
}

export default ProductForm;
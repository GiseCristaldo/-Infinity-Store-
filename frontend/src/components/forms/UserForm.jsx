import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

function UserForm({ onSubmit, initialData = {}, isEdit = false }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'cliente',
    ...initialData,
  });

  useEffect(() => {
    // Si estamos editando, no queremos mostrar la contraseña
    if (isEdit) {
      const { password, ...dataToEdit } = initialData;
      setFormData(dataToEdit);
    } else {
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'cliente',
        ...initialData,
      });
    }
  }, [initialData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="nombre"
        label="Nombre Completo"
        name="nombre"
        autoComplete="name"
        autoFocus
        value={formData.nombre || ''}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correo Electrónico"
        name="email"
        autoComplete="email"
        value={formData.email || ''}
        onChange={handleChange}
      />
      {/* Solo mostrar el campo de contraseña si NO estamos editando */}
      {!isEdit && (
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formData.password || ''}
          onChange={handleChange}
        />
      )}
      <FormControl fullWidth margin="normal">
        <InputLabel id="rol-label">Rol</InputLabel>
        <Select
          labelId="rol-label"
          id="rol"
          name="rol"
          value={formData.rol || 'cliente'}
          label="Rol"
          onChange={handleChange}
        >
          <MenuItem value="cliente">Cliente</MenuItem>
          <MenuItem value="admin">Administrador</MenuItem>
        </Select>
      </FormControl>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
      </Button>
    </Box>
  );
}

export default UserForm;
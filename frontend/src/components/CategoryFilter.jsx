// src/components/CategoryFilter.jsx
import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Alert, Typography } from '@mui/material';
import axios from 'axios';

/**
 * Componente para filtrar productos por categoría.
 * Muestra una lista de categorías obtenidas del backend como botones seleccionables.
 *
 * @param {object} props - Propiedades del componente.
 * @param {function} props.onSelectCategory - Función de callback que se llama cuando se selecciona una categoría,
 * pasando el ID de la categoría (o null para "Todas").
 * @param {string|null} props.selectedCategoryId - El ID de la categoría actualmente seleccionada.
 */
function CategoryFilter({ onSelectCategory, selectedCategoryId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Ajusta esta URL a la de tu backend de categorías
        const response = await axios.get('http://localhost:3001/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('No se pudieron cargar las categorías. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
        <Typography sx={{ ml: 1 }}>Cargando categorías...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
      {/* Botón para mostrar todas las categorías */}
      <Button
        variant={selectedCategoryId === null ? 'contained' : 'outlined'}
        color="primary"
        onClick={() => onSelectCategory(null)} // Pasa null para "Todas las categorías"
        sx={{ borderRadius: 8 }}
      >
        Todas
      </Button>
      {/* Mapea las categorías obtenidas del backend */}
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => onSelectCategory(category.id)}
          sx={{ borderRadius: 8 }}
        >
          {category.name}
        </Button>
      ))}
    </Box>
  );
}

export default CategoryFilter;
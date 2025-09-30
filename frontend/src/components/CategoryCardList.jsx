// src/components/CategoryCardList.jsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, CardMedia, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Para la navegación programática
import axios from 'axios';

/**
 * Componente que muestra una lista de categorías como tarjetas con imágenes.
 * Al hacer clic en una tarjeta, navega a la página de productos filtrada por esa categoría.
 */
function CategoryCardList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook para la navegación programática

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error al obtener categorías:', err);
        setError('No se pudieron cargar las categorías. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCardClick = (categoryId) => {
    // Navega a la página de productos, pasando el ID de la categoría como un parámetro de consulta
    navigate(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando categorías...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'text.primary' }}>
        Explora por Categoría
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {categories.map((category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer', // Indica que la tarjeta es clickeable
                transition: 'transform 0.2s ease-in-out', // Animación al pasar el mouse
                '&:hover': {
                  transform: 'scale(1.03)', // Escala la tarjeta al pasar el mouse
                },
                backgroundColor: 'background.paper', // Usa el color de fondo del tema
              }}
              onClick={() => handleCardClick(category.id)}
            >
              <CardMedia
                component="img"
                height= "180"
                sx={{
                  
                  objectFit: 'cover', // Cubre el área de la tarjeta sin distorsionar
                }}
                image={category.imagenURL || "https://placehold.co/400x180/4a4a4a/f0f0f0?text=No+Image"}
                alt={category.name}
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x180/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h6" component="h3" sx={{ color: 'text.primary' }}>
                  {category.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default CategoryCardList;
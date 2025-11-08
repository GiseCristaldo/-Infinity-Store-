// src/components/CategoryRowCarousel.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, CircularProgress, Alert } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * Carrusel manual de categorías (sin auto-play), con flechas para desplazar.
 * Muestra las categorías en una sola fila desplazable.
 */
export default function CategoryRowCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/categories');
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error al obtener categorías:', err);
        setError('No se pudieron cargar las categorías. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Actualiza el estado de scroll disponible
  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    const handler = () => updateScrollState();
    el.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      el.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [categories.length]);

  const scrollByAmount = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8; // desplaza ~80% del viewport del carrusel
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const handleCardClick = (categoryId) => {
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
    <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 }, py: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 2, color: 'text.primary' }}>
        Explora por Categoría
      </Typography>

      {/* Botón Izquierdo */}
      <IconButton
        aria-label="Anterior"
        onClick={() => scrollByAmount('left')}
        disabled={!canScrollLeft}
        sx={{
          position: 'absolute',
          top: '50%',
          left: { xs: 0, sm: 8 },
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          '&:disabled': { opacity: 0.4 },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* Contenedor desplazable */}
      <Box
        ref={containerRef}
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            px: { xs: 5, sm: 6 }, // espacio para que no tapen las flechas
          }}
        >
          {categories.map((category) => (
            <Card
              key={category.id}
              onClick={() => handleCardClick(category.id)}
              sx={{
                scrollSnapAlign: 'start',
                flex: '0 0 auto',
                width: 269, // coincide con 269x180 sugerido
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'scale(1.03)' },
                backgroundColor: 'background.paper',
              }}
            >
              <CardMedia
                component="img"
                height={180}
                sx={{ objectFit: 'cover' }}
                image={category.imagenURL || 'https://placehold.co/400x180/4a4a4a/f0f0f0?text=No+Image'}
                alt={category.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x180/4a4a4a/f0f0f0?text=Imagen+no+disponible';
                }}
              />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  {category.name}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Botón Derecho */}
      <IconButton
        aria-label="Siguiente"
        onClick={() => scrollByAmount('right')}
        disabled={!canScrollRight}
        sx={{
          position: 'absolute',
          top: '50%',
          right: { xs: 0, sm: 8 },
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          '&:disabled': { opacity: 0.4 },
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
}
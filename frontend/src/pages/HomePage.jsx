// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Container, Card, CardContent, CardMedia, Button, Snackbar, Alert, Chip, CircularProgress } from '@mui/material';
// import CategoryCardList from '../components/CategoryCardList.jsx';
import CategoryRowCarousel from '../components/CategoryRowCarousel.jsx';
import HeroSection from '../components/HeroSection.jsx';
import ImageCarousel from '../components/ImageCarousel.jsx';
import SearchBar from '../components/SearchBar.jsx';
import axios from 'axios';
import { useSearch } from '../context/SearchContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom';

// Mantenemos el resto del contenido de la HomePage intacto.

export default function HomePage() {
  const { query, sort } = useSearch();
  const { addToCart, cartItems } = useCart();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      if (!query || query.trim() === '') {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append('name', query.trim());
        params.append('page', '1');
        params.append('limit', '8');
        if (sort) params.append('sort', sort);
        const response = await axios.get(`/api/products?${params.toString()}`);
        if (!active) return;
        setResults(response.data.products || []);
      } catch (err) {
        if (!active) return;
        setError('No se pudieron cargar los resultados.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchResults();
    return () => { active = false; };
  }, [query, sort]);

  const handleAddToCart = (product) => {
    const itemInCart = cartItems.find(item => item.id === product.id);
    const currentQty = itemInCart ? itemInCart.quantity : 0;
    if (product.stock === 0 || currentQty + 1 > product.stock) return;
    addToCart(product, 1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" component="h1" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 4 }}>
      </Typography>
      <ImageCarousel />
      <Box sx={{ mt: 3, mb: 2 }}>
        <SearchBar />
      </Box>

      {/* Resultados de búsqueda en Home */}
      {query && query.trim() !== '' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
            Resultados de búsqueda
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Buscando productos...</Typography>
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : results.length === 0 ? (
            <Typography color="text.secondary">No se encontraron productos.</Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: 'center',
                alignItems: 'stretch',
              }}
            >
              {results.map((product) => (
                <Card
                  key={product.id}
                  sx={{
                    flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 21.333px)' },
                    maxWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 21.333px)' },
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    height: { xs: 'auto', md: 520 },
                    borderRadius: 2,
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  {product.ofert && (
                    <Chip
                      label="¡OFERTA!"
                      color="secondary"
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold', zIndex: 1 }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    image={product.imagenPath || 'https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image'}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/4a4a4a/f0f0f0?text=Imagen+no+disponible'; }}
                    sx={{ height: { xs: 160, md: 200 }, objectFit: 'contain', p: 2, backgroundColor: 'background.default' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', px: 2, pb: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{ color: 'text.primary', fontSize: '1.1rem', fontWeight: 'bold', mb: 1, minHeight: '2.2em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                      {product.description?.length > 150 ? product.description.substring(0, 150) + '...' : product.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      {product.ofert && product.discount > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `$${parseFloat(product.price || 0).toFixed(2)}`}
                        </Typography>
                      )}
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                          {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `$${parseFloat(product.price || 0).toFixed(2)}`}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error.main'}>
                      Stock: {product.stock > 0 ? product.stock : 'Agotado'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, height: '100px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mb: 1, backgroundColor: '#d4a5a5', color: '#ffffff', fontWeight: 600, borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { backgroundColor: '#e8c4c4', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(212, 165, 165, 0.3)' } }}
                      component={Link}
                      to={`/product/${product.id}`}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled={product.stock === 0}
                      onClick={() => handleAddToCart(product)}
                      sx={{ borderColor: '#d4a5a5', color: '#d4a5a5', fontWeight: 600, borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { borderColor: '#e8c4c4', backgroundColor: 'rgba(212, 165, 165, 0.1)', transform: 'translateY(-1px)' }, '&:disabled': { borderColor: '#ccc', color: '#999' } }}
                    >
                      Añadir al Carrito
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ mt: 2 }}>
          <CategoryRowCarousel />
          {/* <CategoryCardList /> */}
        </Box>
      </Box>
      {/* HeroSection removido para este layout */}
    </Container>
  );
}

// Remove duplicate default export
// export default HomePage;
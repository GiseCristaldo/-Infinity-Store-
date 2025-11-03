// src/pages/CategoryDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Container, Grid, Card, CardMedia, CardContent, Button, Snackbar, Chip, Pagination } from '@mui/material';
import axios from 'axios';
import { useSearch } from '../context/SearchContext.jsx';

import { useCart } from '../context/CartContext.jsx'; // importamos el contexto del carrito
import SearchBar from '../components/SearchBar.jsx';
import MobileFilters from '../components/MobileFilters.jsx';

/**
 * Página que muestra los productos de una categoría específica.
 * Obtiene el ID de la categoría de la URL.
 */
function CategoryDetailPage() {
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState('Categoría');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 12;
  const [paginationInfo, setPaginationInfo] = useState(null);
  const { query, sort } = useSearch();

  const { addToCart, cartItems } = useCart(); // <-- traemos las funciones y el estado del carrito del contexto

  // Estados para el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Handler para seleccionar categoría desde filtros móviles
  const handleSelectCategory = (categoryId) => {
    if (!categoryId) {
      navigate('/products');
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryResponse = await axios.get(`http://localhost:3001/api/categories/${id}`);
        setCategoryName(categoryResponse.data.name);

        const params = new URLSearchParams();
        params.append('category', id);
        if (query) params.append('name', query);
        params.append('page', page);
        params.append('limit', limit);
        if (sort) params.append('sort', sort);

        const productsResponse = await axios.get(`http://localhost:3001/api/products?${params.toString()}`);
        const productsArray = productsResponse.data.products || productsResponse.data;
        setProducts(Array.isArray(productsArray) ? productsArray.filter(p => p.active) : []);

        // Guardar información de paginación si viene del backend
        if (productsResponse.data && typeof productsResponse.data === 'object') {
          setPaginationInfo({
            totalItems: productsResponse.data.totalItems,
            totalPages: productsResponse.data.totalPages,
            currentPage: productsResponse.data.currentPage,
          });
        } else {
          setPaginationInfo(null);
        }
      } catch (err) {
        console.error('Error al cargar la categoría o sus productos:', err);
        setError('No se pudo cargar la categoría o sus productos. Inténtalo de nuevo.');
        if (err.response && err.response.status === 404) {
          setCategoryName('Categoría Desconocida');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [id, page, query, sort]);

  // Reiniciar página al cambiar categoría o búsqueda
  useEffect(() => {
    setPage(1);
  }, [id, query, sort]);

  // Función para añadir al carrito (ahora usamos el contexto)
  const handleAddToCart = (productToAdd) => {
    // Validación de stock (HU3.1.2)
    if (productToAdd.stock === 0) {
        setSnackbarMessage(`"${productToAdd.name}" está agotado.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    const itemInCart = cartItems.find(item => item.id === productToAdd.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQuantityInCart + 1 > productToAdd.stock) {
        setSnackbarMessage(`No puedes añadir más de "${productToAdd.name}". Stock disponible: ${productToAdd.stock}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    addToCart(productToAdd, 1); // Llama a la función addToCart del contexto
    setSnackbarMessage(`"${productToAdd.name}" añadido al carrito.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler para cerrar el Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando productos de {categoryName}...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'secondary.main' }}>
        Productos de {categoryName}
      </Typography>
      {/* Filtros en desktop/tablet */}
      <Box sx={{ mt: 2, mb: 3, display: { xs: 'none', sm: 'block' } }}>
        <SearchBar />
      </Box>
      {/* Filtros compactos para móviles */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
        <MobileFilters selectedCategoryId={id} onSelectCategory={handleSelectCategory} />
      </Box>

      {products.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">No hay productos disponibles en esta categoría por el momento.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {products.map((product) => {
            return (
              <Card
                key={product.id}
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: 'calc(50% - 16px)',
                    md: 'calc(33.333% - 21.333px)',
                    lg: 'calc(25% - 24px)',
                  },
                  maxWidth: {
                    xs: '100%',
                    sm: 'calc(50% - 16px)',
                    md: 'calc(33.333% - 21.333px)',
                    lg: 'calc(25% - 24px)',
                  },
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
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                        zIndex: 1,
                      }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    image={product.imagenPath || 'https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image'}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/4a4a4a/f0f0f0?text=Imagen+no+disponible'; }}
                    sx={{
                      height: { xs: 160, md: 200 },
                      objectFit: 'contain',
                      p: 2,
                      backgroundColor: 'background.default'
                    }}
                  />
                  <CardContent sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    px: 2,
                    pb: 1,
                  }}>
                    <Typography gutterBottom variant="h6" component="h2" sx={{
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      mb: 1,
                      minHeight: '2.2em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.description.length > 150
                        ? product.description.substring(0, 150) + '...'
                        : product.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                        {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `$${parseFloat(product.price || 0).toFixed(2)}`}
                      </Typography>
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
                      sx={{
                        mb: 1,
                        backgroundColor: '#d4a5a5',
                        color: '#ffffff',
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#e8c4c4',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(212, 165, 165, 0.3)',
                        },
                      }}
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
                      sx={{
                        borderColor: '#d4a5a5',
                        color: '#d4a5a5',
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#e8c4c4',
                          backgroundColor: 'rgba(212, 165, 165, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          borderColor: '#ccc',
                          color: '#999',
                        },
                      }}
                    >
                      Añadir al Carrito
                    </Button>
                  </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {paginationInfo?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={paginationInfo.totalPages}
            page={paginationInfo.currentPage || page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CategoryDetailPage;
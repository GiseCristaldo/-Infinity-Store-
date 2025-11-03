// src/pages/ProductsPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, Grid, Card, CardContent, CardMedia, Button, CircularProgress, Alert, Snackbar, Chip, Pagination } from '@mui/material';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import MobileFilters from '../components/MobileFilters.jsx';

// Debounce helper to avoid input focus glitches during live fetches
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
};

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart(); // <-- Obtén addToCart y cartItems del contexto
  
  // Use dynamic theme
  const { currentSettings } = useTheme();
  const [paginationInfo, setPaginationInfo] = useState(null);
  const { query, sort } = useSearch();
  const debouncedQuery = useDebounce(query, 300);
  const debouncedSort = useDebounce(sort, 300);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Estados para el Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const initialCategoryId = searchParams.get('category');
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || null);

  const fetchProducts = useCallback(async (categoryId, currentPage, currentQuery, currentSort) => {
    try {
      setLoading(true);
      setError(null);
      // Construimos la URL base
      let url = '/api/products';
      
      // Creamos un objeto para los parámetros de la URL
      const params = new URLSearchParams();
      if (categoryId) {
        params.append('category', categoryId);
      }
      if (currentQuery) {
        params.append('name', currentQuery);
      }
      params.append('page', currentPage || 1);
      params.append('limit', limit);
      if (currentSort) {
        params.append('sort', currentSort);
      }
      
      // Unimos la URL con los parámetros
      const finalUrl = `${url}?${params.toString()}`;

      const response = await axios.get(finalUrl);
      
      // El backend ahora devuelve un objeto: { products: [...], totalPages: X, ... }
      // Por eso, extraemos el array de la propiedad 'products'.
      setProducts(response.data.products);

      // También guardamos la información de paginación que nos envía el backend
      setPaginationInfo({
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
      });

    } catch (err) {
      console.error('Error al obtener productos:', err);
      setError('No se pudieron cargar los productos. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // Reiniciar a la primera página cuando cambie la categoría, la búsqueda o el orden
    setPage((prev) => (prev === 1 ? prev : 1));
  }, [selectedCategoryId, debouncedQuery, debouncedSort]);

  useEffect(() => {
    fetchProducts(selectedCategoryId, page, debouncedQuery, debouncedSort);

    const params = {};
    if (selectedCategoryId) params.category = selectedCategoryId;
    if (debouncedQuery) params.name = debouncedQuery;
    if (debouncedSort) params.sort = debouncedSort;
    params.page = page;
    setSearchParams(params);
  }, [fetchProducts, selectedCategoryId, debouncedQuery, debouncedSort, page, setSearchParams]);

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para añadir al carrito (usando el contexto)
  const handleAddToCart = (productToAdd) => {
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

    addToCart(productToAdd, 1); // Llama a la función del contexto
    setSnackbarMessage(`"${productToAdd.name}" añadido al carrito.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Handler para cerrar el Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };


  // Carga se muestra en zona de resultados; mantenemos buscador y filtros visibles.

  // Eliminamos el retorno temprano por loading para que el buscador no se oculte
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      minHeight: '100vh',
      background: currentSettings?.color_palette ? 
        `linear-gradient(135deg, ${currentSettings.color_palette.accent_color}15 0%, ${currentSettings.color_palette.secondary_color}08 100%)` :
        'transparent'
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        textAlign: 'center', 
        color: currentSettings?.color_palette?.text_color || 'secondary.main',
        fontWeight: 'bold',
        mb: 4
      }}>
        Nuestro Catálogo Geek
      </Typography>

      {/* Filtros en desktop/tablet */}
      <Box sx={{ mt: 2, mb: 3, display: { xs: 'none', sm: 'block' } }}>
        <SearchBar />
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <CategoryFilter
          onSelectCategory={handleSelectCategory}
          selectedCategoryId={selectedCategoryId}
        />
      </Box>

      {/* Filtros compactos para móviles */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
        <MobileFilters selectedCategoryId={selectedCategoryId} onSelectCategory={handleSelectCategory} />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">No hay productos disponibles para esta categoría por el momento.</Typography>
        </Box>
      ) : (
        // Contenedor principal para las tarjetas de producto usando Flexbox
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
                  border: currentSettings?.color_palette ? 
                    `1px solid ${currentSettings.color_palette.accent_color}30` :
                    'none',
                  boxShadow: currentSettings?.color_palette ? 
                    `0 4px 12px ${currentSettings.color_palette.primary_color}15` :
                    2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: currentSettings?.color_palette ? 
                      `0 8px 25px ${currentSettings.color_palette.primary_color}25` :
                      6,
                  }
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
                    image={product.imagenPath || "https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image"}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x200/4a4a4a/f0f0f0?text=Imagen+no+disponible"; }}
                    sx={{
                      height: { xs: 160, md: 200 },
                      objectFit: 'contain',
                      p: 2,
                      backgroundColor: 'background.default'
                    }}
                  />
                  <CardContent sx={{
                    flexGrow: 1, // CardContent toma el espacio vertical restante
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start', // Alinea el contenido de CardContent al inicio
                    px: 2,
                    pb: 1, // Pequeño padding bottom para separar del Box de botones
                  }}>
                    {/* Título: Aseguramos 2 líneas y truncamos si es más largo */}
                    <Typography gutterBottom variant="h6" component="h2" sx={{
                      color: 'text.primary',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      mb: 1,
                      minHeight: '2.2em', // Altura mínima para asegurar 2 líneas (aprox.)
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2, // Limita el título a 2 líneas
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </Typography>
                    {/* Descripción: Limita caracteres y añade "..." con WebkitLineClamp para líneas */}
                    <Typography variant="body2" color="text.secondary" sx={{
                      mb: 1, // Margen inferior para separar del precio
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4, // Limita la descripción a 4 líneas visuales
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {/* Aplica substring y añade "..." si la descripción es más larga */}
                      {product.description.length > 150
                        ? product.description.substring(0, 150) + '...'
                        : product.description}
                    </Typography>
                    {/* Precios: Original tachado y nuevo con descuento */}
                    <Box sx={{ mt: 'auto' }}>
                      {product.ofert && product.discount > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `$${parseFloat(product.price || 0).toFixed(2)}`}
                        </Typography>
                      )}
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 'bold',
                          color: currentSettings?.color_palette?.primary_color || 'secondary.main'
                        }}>
                          {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : `$${parseFloat(product.price || 0).toFixed(2)}`}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error.main'}>
                      Stock: {product.stock > 0 ? product.stock : 'Agotado'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0, height: '100px' }}> {/* Contenedor para los botones con altura fija ajustada */}
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        mb: 1,
                        backgroundColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                        color: '#ffffff',
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: currentSettings?.color_palette?.secondary_color || '#e8c4c4',
                          transform: 'translateY(-2px)',
                          boxShadow: currentSettings?.color_palette ? 
                            `0 4px 12px ${currentSettings.color_palette.primary_color}30` :
                            '0 4px 12px rgba(212, 165, 165, 0.3)',
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
                        borderColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                        color: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                        fontWeight: 600,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: currentSettings?.color_palette?.secondary_color || '#e8c4c4',
                          backgroundColor: currentSettings?.color_palette ? 
                            `${currentSettings.color_palette.accent_color}20` :
                            'rgba(212, 165, 165, 0.1)',
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
    </Box>
  );
}

export default ProductsPage;
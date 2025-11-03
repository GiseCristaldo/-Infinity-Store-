import React from 'react';
import { 
  Card, CardContent, CardMedia, Button, Typography, Box, Chip 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * Componente de card de producto optimizado para responsive
 * @param {Object} product - Datos del producto
 * @param {Function} onAddToCart - Función para agregar al carrito
 * @returns {JSX.Element} Card de producto
 */
function ProductCard({ product, onAddToCart }) {
  const { currentSettings } = useTheme();

  return (
    <Card 
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
        minHeight: { xs: 'auto', md: 520 },
        borderRadius: 2,
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
      {/* Chip de oferta */}
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

      {/* Imagen del producto */}
      <CardMedia
        component="img"
        image={product.imagenPath || "https://placehold.co/400x200/4a4a4a/f0f0f0?text=No+Image"}
        alt={product.name}
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = "https://placehold.co/400x200/4a4a4a/f0f0f0?text=Imagen+no+disponible"; 
        }}
        sx={{
          height: { xs: 160, md: 200 },
          objectFit: 'contain',
          p: 2,
          backgroundColor: 'background.default'
        }}
      />

      {/* Contenido de la card */}
      <CardContent sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.5, sm: 2 },
        pb: { xs: 1, sm: 1 },
      }}>
        {/* Título del producto */}
        <Typography gutterBottom variant="h6" component="h2" sx={{
          color: 'text.primary',
          fontSize: { xs: '1rem', sm: '1.1rem' },
          fontWeight: 'bold',
          mb: { xs: 0.5, sm: 1 },
          minHeight: { xs: '1.5em', sm: '2.2em' },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: { xs: 1, sm: 2 },
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.2,
        }}>
          {product.name}
        </Typography>

        {/* Descripción del producto */}
        <Typography variant="body2" color="text.secondary" sx={{
          mb: { xs: 0.5, sm: 1 },
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: { xs: 2, sm: 3, md: 4 },
          WebkitBoxOrient: 'vertical',
          fontSize: { xs: '0.8rem', sm: '0.875rem' },
          lineHeight: 1.3,
        }}>
          {product.description.length > 150
            ? product.description.substring(0, 150) + '...'
            : product.description}
        </Typography>

        {/* Precios y Stock */}
        <Box sx={{ mt: 'auto', pt: { xs: 0.5, sm: 1 } }}>
          {/* Precio original tachado si hay oferta */}
          {product.ofert && product.discount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ 
              textDecoration: 'line-through',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              ${typeof product.price === 'number' ? 
                product.price.toFixed(2) : 
                parseFloat(product.price || 0).toFixed(2)}
            </Typography>
          )}
          
          {/* Precio actual */}
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold',
            color: currentSettings?.color_palette?.primary_color || 'secondary.main',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            lineHeight: 1.2,
            mb: { xs: 0.5, sm: 0.5 }
          }}>
            ${typeof product.price === 'number' ? 
              product.price.toFixed(2) : 
              parseFloat(product.price || 0).toFixed(2)}
          </Typography>
          
          {/* Stock */}
          <Typography variant="body2" color={product.stock > 0 ? 'text.secondary' : 'error.main'} sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}>
            Stock: {product.stock > 0 ? product.stock : 'Agotado'}
          </Typography>
        </Box>
      </CardContent>

      {/* Botones de acción */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2 }, 
        pt: 0, 
        minHeight: { xs: 'auto', sm: '100px' },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 1 }
      }}>
        <Button
          variant="contained"
          fullWidth
          component={Link}
          to={`/product/${product.id}`}
          sx={{
            backgroundColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
            color: '#ffffff',
            fontWeight: 600,
            borderRadius: 2,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            py: { xs: 1, sm: 1.2 },
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: currentSettings?.color_palette?.secondary_color || '#e8c4c4',
              transform: 'translateY(-2px)',
              boxShadow: currentSettings?.color_palette ? 
                `0 4px 12px ${currentSettings.color_palette.primary_color}30` :
                '0 4px 12px rgba(212, 165, 165, 0.3)',
            },
          }}
        >
          Ver Detalles
        </Button>
        
        <Button
          variant="outlined"
          fullWidth
          disabled={product.stock === 0}
          onClick={() => onAddToCart(product)}
          sx={{
            borderColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
            color: currentSettings?.color_palette?.primary_color || '#d4a5a5',
            fontWeight: 600,
            borderRadius: 2,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            py: { xs: 1, sm: 1.2 },
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
}

export default ProductCard;
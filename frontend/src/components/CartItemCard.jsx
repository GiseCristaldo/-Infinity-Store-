import React from 'react';
import {
  Card, CardMedia, CardContent, Box, Typography, IconButton, TextField
} from '@mui/material';
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/priceUtils';

// Función auxiliar para normalizar precios
const normalizePrice = (price) => {
  if (typeof price === 'number') {
    return price;
  }
  if (typeof price === 'string') {
    const cleanPrice = price.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleanPrice) || 0;
  }
  return 0;
};

/**
 * Componente de card para items del carrito optimizado para responsive
 * @param {Object} item - Datos del item del carrito
 * @param {Function} onQuantityChange - Función para cambiar cantidad
 * @param {Function} onDelete - Función para eliminar item
 * @returns {JSX.Element} Card del item del carrito
 */
function CartItemCard({ item, onQuantityChange, onDelete }) {
  const { currentSettings } = useTheme();

  return (
    <Card sx={{ 
      m: { xs: 2, sm: 3 }, 
      mb: 2,
      border: currentSettings?.color_palette ? 
        `1px solid ${currentSettings.color_palette.accent_color}40` :
        '1px solid #e0e0e0',
      boxShadow: currentSettings?.color_palette ? 
        `0 4px 12px ${currentSettings.color_palette.primary_color}15` :
        2
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }, 
        p: { xs: 1.5, sm: 2 }
      }}>
        {/* Imagen del producto */}
        <CardMedia
          component="img"
          sx={{
            width: { xs: '100%', sm: 100 }, 
            height: { xs: 120, sm: 100 }, 
            objectFit: 'contain', 
            borderRadius: 1, 
            mr: { xs: 0, sm: 2 },
            mb: { xs: 1.5, sm: 0 },
            backgroundColor: '#ffffff',
            p: 1,
            flexShrink: 0
          }}
          image={item.imagenPath || `https://placehold.co/100x100/e0e0e0/f0f0f0?text=No+Image`}
          alt={item.name}
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = `https://placehold.co/100x100/e0e0e0/f0f0f0?text=Imagen+no+disponible`; 
          }}
        />

        {/* Contenido de la card */}
        <CardContent sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 0,
          '&:last-child': { pb: 0 }
        }}>
          {/* Header con título y botón eliminar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: { xs: 1, sm: 0.5 }
          }}>
            <Box sx={{ flexGrow: 1, pr: 1 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  color: currentSettings?.color_palette?.text_color || '#333333',
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, sm: 2 },
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.2
                }}
              >
                {item.name}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                color: currentSettings?.color_palette?.text_color + '80' || '#666666', 
                mb: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}>
                Stock disponible: {item.stock}
              </Typography>
              
              <Typography variant="h6" sx={{ 
                color: currentSettings?.color_palette?.primary_color || '#d4a5a5', 
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                {formatPrice(normalizePrice(item.price))}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={() => onDelete(item.id, item.name)}
              sx={{ 
                color: '#d32f2f',
                p: { xs: 0.5, sm: 1 },
                '&:hover': { 
                  backgroundColor: '#d32f2f20',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
          </Box>
          
          {/* Controles de cantidad */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: { xs: 'center', sm: 'flex-start' },
            mt: { xs: 1.5, sm: 2 },
            gap: 1
          }}>
            <IconButton 
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              sx={{ 
                color: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                '&:hover': { 
                  backgroundColor: currentSettings?.color_palette ? 
                    `${currentSettings.color_palette.accent_color}20` :
                    'rgba(212, 165, 165, 0.1)'
                },
                p: { xs: 0.5, sm: 0.5 },
                minWidth: { xs: 32, sm: 40 },
                minHeight: { xs: 32, sm: 40 }
              }}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>
            
            <TextField
              type="number"
              value={item.quantity}
              onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 1)}
              inputProps={{ 
                min: 1, 
                max: item.stock,
                style: {
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: currentSettings?.color_palette?.text_color || '#333333'
                }
              }}
              sx={{
                width: { xs: 60, sm: 80 },
                '& .MuiOutlinedInput-root': {
                  height: { xs: 32, sm: 40 },
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: currentSettings?.color_palette?.accent_color || '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: { xs: '6px 8px', sm: '8px 12px' },
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
            />
            
            <IconButton 
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              sx={{ 
                color: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                '&:hover': { 
                  backgroundColor: currentSettings?.color_palette ? 
                    `${currentSettings.color_palette.accent_color}20` :
                    'rgba(212, 165, 165, 0.1)'
                },
                p: { xs: 0.5, sm: 0.5 },
                minWidth: { xs: 32, sm: 40 },
                minHeight: { xs: 32, sm: 40 }
              }}
            >
              <KeyboardArrowUpIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            </IconButton>

            {/* Subtotal del item */}
            <Box sx={{ 
              ml: { xs: 1, sm: 2 },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}>
                Subtotal:
              </Typography>
              <Typography variant="h6" sx={{ 
                color: currentSettings?.color_palette?.primary_color || '#d4a5a5', 
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}>
                {formatPrice(normalizePrice(item.price) * item.quantity)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
}

export default CartItemCard;
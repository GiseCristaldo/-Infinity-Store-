import React, { useState } from 'react';
import { Box, Drawer, IconButton, Typography, Divider } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchBar from './SearchBar.jsx';
import CategoryFilter from './CategoryFilter.jsx';

/**
 * Panel compacto de filtros para móviles (xs)
 * - Botón flotante con icono que abre un Drawer inferior
 * - Contiene el buscador, el ordenar por y las categorías
 */
function MobileFilters({ selectedCategoryId = null, onSelectCategory }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = (value) => () => setOpen(value);

  return (
    <>
      {/* Botón de filtro visible solo en móviles */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'flex-end' }}>
        <IconButton
          aria-label="Abrir filtros"
          color="primary"
          onClick={toggleOpen(true)}
          sx={{
            borderRadius: 2,
            px: 1.25,
            py: 1,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          <FilterListIcon />
          <Typography variant="button" sx={{ ml: 1, fontWeight: 600 }}>Filtros</Typography>
        </IconButton>
      </Box>

      {/* Drawer inferior con controles compactos */}
      <Drawer anchor="bottom" open={open} onClose={toggleOpen(false)}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Filtrar y buscar</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Usa el buscador, ordena resultados o elige categorías.
          </Typography>

          {/* Buscador + Ordenar por (contenido responsivo existente) */}
          <Box sx={{ mb: 2 }}>
            <SearchBar compact />
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Categorías */}
          <Box sx={{ mt: 2 }}>
            <CategoryFilter onSelectCategory={onSelectCategory} selectedCategoryId={selectedCategoryId} />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

export default MobileFilters;
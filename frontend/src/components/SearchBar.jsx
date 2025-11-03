import React from 'react';
import { Box, TextField, InputAdornment, Typography, FormControl, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';
import { useSearch } from '../context/SearchContext.jsx';
import { useLocation } from 'react-router-dom';

function SearchBar({ compact = false }) {
  const { query, setQuery, sort, setSort } = useSearch();
  const location = useLocation();
  const isListingPage = location.pathname.startsWith('/products') || location.pathname.startsWith('/category/');

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: compact ? 1 : 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 1 : 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          {/* buscador */}
          <TextField
            fullWidth
            size={compact ? 'medium' : 'small'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={compact ? 'Buscar' : 'Buscar productos geek...'}
            variant="outlined"
            color="primary"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: compact ? 14 : 24 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              borderRadius: 9999,
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                color: 'text.primary',
                '& fieldset': { borderColor: 'primary.light' },
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                minHeight: compact ? 36 : 40,
                '& .MuiInputAdornment-root': { mr: compact ? 0.125 : 1 },
              },
              '& .MuiInputBase-input': {
                fontSize: compact ? '0.95rem' : '0.95rem',
                paddingTop: compact ? '6px' : undefined,
                paddingBottom: compact ? '6px' : undefined,
              },
              '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
            }}
          />
        </Box>

        {isListingPage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {!compact && (
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Ordenar por:
              </Typography>
            )}
            <FormControl size={compact ? 'small' : 'medium'} sx={{ minWidth: { xs: 120, sm: 180 } }}>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  borderRadius: 9999,
                  fontSize: compact ? '0.85rem' : '0.95rem',
                  fontWeight: 500,
                  height: compact ? 36 : 44,
                  '& .MuiSelect-select': { py: compact ? 0.5 : 1, px: 1.5 },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                }}
              >
                <MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem>
                <MenuItem value="name_asc">Nombre: A–Z</MenuItem>
                <MenuItem value="name_desc">Nombre: Z–A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SearchBar;
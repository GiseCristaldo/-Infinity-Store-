import React from 'react';
import { Box, TextField, InputAdornment, Typography, FormControl, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';
import { useSearch } from '../context/SearchContext.jsx';
import { useLocation } from 'react-router-dom';

function SearchBar() {
  const { query, setQuery, sort, setSort } = useSearch();
  const location = useLocation();
  const isListingPage = location.pathname.startsWith('/products') || location.pathname.startsWith('/category/');

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos geek..."
            variant="outlined"
            color="primary"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
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
              },
              '& .MuiInputBase-input::placeholder': { color: 'text.secondary', opacity: 1 },
            }}
          />
        </Box>

        {isListingPage && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Ordenar por:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                displayEmpty
                sx={{
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                  borderRadius: 9999,
                  fontSize: '0.78rem',
                  '& .MuiSelect-select': { py: 0.25 },
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
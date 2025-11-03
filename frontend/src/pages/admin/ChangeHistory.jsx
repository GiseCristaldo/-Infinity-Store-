import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Chip, Alert, Snackbar, TablePagination, TextField,
  InputAdornment, FormControl, InputLabel, Select, MenuItem, Grid, Divider,
  CircularProgress
} from '@mui/material';
import {
  History as HistoryIcon, Visibility as ViewIcon, Restore as RestoreIcon,
  Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

function ChangeHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [detailDialog, setDetailDialog] = useState({ open: false, change: null });
  const [rollbackDialog, setRollbackDialog] = useState({ open: false, change: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rolling, setRolling] = useState(false);

  const changeTypeLabels = {
    color_palette: 'Paleta de Colores',
    typography: 'Tipografía',
    hero_image: 'Imagen Hero',
    carousel: 'Carousel',
    branding: 'Configuración de Marca'
  };

  const changeTypeColors = {
    color_palette: 'primary',
    typography: 'secondary',
    hero_image: 'success',
    carousel: 'info',
    branding: 'warning'
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/super-admin/customization/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mapear los datos del backend al formato esperado por el frontend
      const mappedHistory = (response.data.history || []).map(change => ({
        ...change,
        changed_by_name: change.user?.name || 'Usuario desconocido'
      }));
      
      setHistory(mappedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      showSnackbar('Error al cargar historial de cambios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewDetails = (change) => {
    setDetailDialog({ open: true, change });
  };

  const handleRollback = (change) => {
    setRollbackDialog({ open: true, change });
  };

  const confirmRollback = async () => {
    if (!rollbackDialog.change) return;

    setRolling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/super-admin/customization/revert/${rollbackDialog.change.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRollbackDialog({ open: false, change: null });
      showSnackbar('Cambio revertido exitosamente');
      
      // Recargar historial y página para mostrar los cambios
      loadHistory();
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error reverting change:', error);
      const message = error.response?.data?.message || 'Error al revertir cambio';
      showSnackbar(message, 'error');
    } finally {
      setRolling(false);
    }
  };

  // Filtrar historial
  const filteredHistory = history.filter(change => {
    const matchesSearch = 
      change.change_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (change.changed_by_name && change.changed_by_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || change.change_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Paginación
  const paginatedHistory = filteredHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChangeValue = (value, isOld = false) => {
    if (!value) return <em>Sin valor</em>;
    
    if (typeof value === 'object') {
      return (
        <Box>
          {Object.entries(value).map(([key, val]) => (
            <Typography key={key} variant="body2" component="div">
              <strong>{key}:</strong> {String(val)}
            </Typography>
          ))}
        </Box>
      );
    }
    
    return String(value);
  };

  const DetailDialog = () => {
    const change = detailDialog.change;
    if (!change) return null;

    return (
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, change: null })} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles del Cambio
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Tipo de Cambio</Typography>
              <Chip 
                label={changeTypeLabels[change.change_type] || change.change_type}
                color={changeTypeColors[change.change_type] || 'default'}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
              <Typography>{formatDate(change.changed_at)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Usuario</Typography>
              <Typography>{change.changed_by_name || 'Usuario desconocido'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">ID del Cambio</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{change.id}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="error">
                    Valor Anterior
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {renderChangeValue(change.old_value, true)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Valor Nuevo
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {renderChangeValue(change.new_value)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog({ open: false, change: null })}>
            Cerrar
          </Button>
          <Button 
            onClick={() => {
              setDetailDialog({ open: false, change: null });
              handleRollback(change);
            }}
            variant="contained"
            color="warning"
            startIcon={<RestoreIcon />}
          >
            Revertir Este Cambio
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const RollbackDialog = () => {
    const change = rollbackDialog.change;
    if (!change) return null;

    return (
      <Dialog open={rollbackDialog.open} onClose={() => setRollbackDialog({ open: false, change: null })}>
        <DialogTitle>Confirmar Reversión</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography gutterBottom>
              ¿Estás seguro de que quieres revertir este cambio?
            </Typography>
            <Typography variant="body2">
              Esta acción restaurará la configuración anterior y será visible para todos los usuarios.
            </Typography>
          </Alert>
          
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>Detalles del cambio a revertir:</Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Tipo:</strong> {changeTypeLabels[change.change_type] || change.change_type}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Fecha:</strong> {formatDate(change.changed_at)}
            </Typography>
            <Typography variant="body2">
              <strong>Usuario:</strong> {change.changed_by_name || 'Usuario desconocido'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialog({ open: false, change: null })} disabled={rolling}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmRollback} 
            variant="contained" 
            color="warning"
            disabled={rolling}
            startIcon={rolling ? <CircularProgress size={16} /> : <RestoreIcon />}
          >
            {rolling ? 'Revirtiendo...' : 'Confirmar Reversión'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando historial de cambios...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Historial de Cambios
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por tipo o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filtrar por tipo</InputLabel>
                <Select
                  value={filterType}
                  label="Filtrar por tipo"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">Todos los tipos</MenuItem>
                  <MenuItem value="color_palette">Paleta de Colores</MenuItem>
                  <MenuItem value="typography">Tipografía</MenuItem>
                  <MenuItem value="hero_image">Imagen Hero</MenuItem>
                  <MenuItem value="carousel">Carousel</MenuItem>
                  <MenuItem value="branding">Configuración de Marca</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadHistory}
                >
                  Actualizar
                </Button>
                <Chip 
                  label={`${filteredHistory.length} cambios`} 
                  color="primary" 
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo de Cambio</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedHistory.map((change) => (
                  <TableRow key={change.id} hover>
                    <TableCell>
                      <Chip 
                        label={changeTypeLabels[change.change_type] || change.change_type}
                        color={changeTypeColors[change.change_type] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{change.changed_by_name || 'Usuario desconocido'}</TableCell>
                    <TableCell>{formatDate(change.changed_at)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleViewDetails(change)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleRollback(change)}
                        color="warning"
                      >
                        <RestoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {filteredHistory.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
          <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay cambios en el historial
          </Typography>
          <Typography color="text.secondary">
            Los cambios de personalización aparecerán aquí una vez que se realicen.
          </Typography>
        </Paper>
      )}

      <DetailDialog />
      <RollbackDialog />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ChangeHistory;
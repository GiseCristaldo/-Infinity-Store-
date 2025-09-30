import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  IconButton, Pagination, Snackbar, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getOrders, updateOrderStatus, deleteOrder, getOrderById } from '../../services/orderService';
import ConfirmDialog from '../../components/ConfirmDialog';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados para manejar modales
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrders = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders(currentPage);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las órdenes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  // Manejadores para el diálogo de cambio de estado
  const handleOpenStatusDialog = (order) => {
    setCurrentOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };
  
  const handleCloseStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setCurrentOrder(null);
    setNewStatus('');
  };
  
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };
  
  const handleUpdateStatus = async () => {
    if (!currentOrder || !newStatus) return;
    try {
      await updateOrderStatus(currentOrder.id, newStatus);
      handleCloseStatusDialog();
      setSnackbar({ open: true, message: 'Estado de la orden actualizado exitosamente.', severity: 'success' });
      fetchOrders(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el estado de la orden.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };
  
  // Manejadores para el diálogo de detalles
  const handleOpenDetailsDialog = async (orderId) => {
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrderDetails(data);
      setIsDetailsDialogOpen(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al cargar los detalles de la orden.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setOrderDetails(null);
  };
  
  // Manejadores para el diálogo de eliminación
  const handleOpenConfirm = (order) => {
    setCurrentOrder(order);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentOrder(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!currentOrder) return;
    try {
      await deleteOrder(currentOrder.id);
      handleCloseConfirm();
      setSnackbar({ open: true, message: 'Orden eliminada exitosamente.', severity: 'success' });
      fetchOrders(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la orden.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Función para obtener el color del chip según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'procesando':
        return 'info';
      case 'enviado':
        return 'primary';
      case 'entregado':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && !isDetailsDialogOpen) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Gestión de Órdenes</Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.user?.nombre || 'N/A'}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="info" 
                    onClick={() => handleOpenDetailsDialog(order.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenStatusDialog(order)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error"
                    onClick={() => handleOpenConfirm(order)}
                    disabled={order.status === 'entregado'} // No permitir borrar órdenes entregadas
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      
      {/* Diálogo para cambiar el estado de la orden */}
      <Dialog open={isStatusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              value={newStatus}
              label="Estado"
              onChange={handleStatusChange}
            >
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="procesando">Procesando</MenuItem>
              <MenuItem value="enviado">Enviado</MenuItem>
              <MenuItem value="entregado">Entregado</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancelar</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para ver los detalles de la orden */}
      <Dialog 
        open={isDetailsDialogOpen} 
        onClose={handleCloseDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalles de la Orden</DialogTitle>
        <DialogContent>
          {orderDetails && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography>ID: {orderDetails.id}</Typography>
                <Typography>Cliente: {orderDetails.user?.nombre}</Typography>
                <Typography>Email: {orderDetails.user?.email}</Typography>
                <Typography>Fecha: {new Date(orderDetails.createdAt).toLocaleString()}</Typography>
                <Typography>Estado: 
                  <Chip 
                    label={orderDetails.status} 
                    color={getStatusColor(orderDetails.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>Total: ${orderDetails.total}</Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Productos
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.details?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product?.name || 'Producto no disponible'}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>${(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        ¿Estás seguro de que quieres eliminar la orden #{currentOrder?.id}? Esta acción no se puede deshacer.
      </ConfirmDialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AdminOrders;

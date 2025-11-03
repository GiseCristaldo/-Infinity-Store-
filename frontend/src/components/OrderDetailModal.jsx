import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Grid, Divider, Chip, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, useTheme, useMediaQuery, Avatar
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const statusColors = {
  'pendiente': 'warning',
  'confirmada': 'info',
  'en_preparacion': 'primary',
  'enviada': 'secondary',
  'entregada': 'success',
  'cancelada': 'error'
};

const statusLabels = {
  'pendiente': 'Pendiente',
  'confirmada': 'Confirmada',
  'en_preparacion': 'En Preparación',
  'enviada': 'Enviada',
  'entregada': 'Entregada',
  'cancelada': 'Cancelada'
};

function OrderDetailModal({ open, onClose, order }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const shippingCost = order.shipping_cost || 0;
  const subtotal = calculateSubtotal();
  const total = subtotal + shippingCost;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: theme.shadows[24],
          backgroundColor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          maxHeight: isMobile ? '100vh' : '90vh',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(2px)',
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.default',
          p: isMobile ? 2 : 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <ShoppingBagIcon color="primary" sx={{ fontSize: isMobile ? 24 : 28 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
              Orden #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(order.created_at)}
            </Typography>
          </Box>
          <Chip
            label={statusLabels[order.state] || order.state}
            color={statusColors[order.state] || 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          {/* Estado y Tracking */}
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShippingIcon color="primary" />
                Estado del Pedido
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  label={statusLabels[order.state] || order.state}
                  color={statusColors[order.state] || 'default'}
                  size="large"
                  sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
                {order.tracking_number && (
                  <Typography variant="body2" color="text.secondary">
                    Tracking: <strong>{order.tracking_number}</strong>
                  </Typography>
                )}
              </Box>
              
              {order.estimated_delivery && (
                <Typography variant="body2" color="text.secondary">
                  Entrega estimada: {formatDate(order.estimated_delivery)}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Información del Cliente */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Información del Cliente
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {order.customer_name || 'Cliente'}
                      </Typography>
                    </Box>
                    
                    {order.customer_email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {order.customer_email}
                        </Typography>
                      </Box>
                    )}
                    
                    {order.customer_phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 5 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {order.customer_phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Dirección de Envío */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="primary" />
                    Dirección de Envío
                  </Typography>
                  
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {order.shipping_address ? (
                      <>
                        {order.shipping_address.street}<br />
                        {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                        {order.shipping_address.country}
                      </>
                    ) : (
                      'Dirección no disponible'
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Pago */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon color="primary" />
                    Información de Pago
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Método de Pago
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {order.payment_method || 'No especificado'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Estado del Pago
                      </Typography>
                      <Chip
                        label={order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                        color={order.payment_status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Productos */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            Productos Pedidos
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                  {!isMobile && <TableCell align="center" sx={{ fontWeight: 600 }}>Cantidad</TableCell>}
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {isMobile ? 'Cant. × Precio' : 'Precio Unit.'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {item.image && (
                          <Avatar
                            src={item.image}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          {item.variant && (
                            <Typography variant="caption" color="text.secondary">
                              {item.variant}
                            </Typography>
                          )}
                          {isMobile && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {item.quantity} × {formatCurrency(item.price)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="center">
                        <Chip label={item.quantity} size="small" variant="outlined" />
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell align="right">
                        {formatCurrency(item.price)}
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Resumen de Costos */}
          <Card sx={{ borderRadius: 2, backgroundColor: 'background.default' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen del Pedido
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Envío:</Typography>
                  <Typography variant="body2">
                    {shippingCost > 0 ? formatCurrency(shippingCost) : 'Gratis'}
                  </Typography>
                </Box>
                
                {order.discount && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography variant="body2">Descuento:</Typography>
                    <Typography variant="body2">-{formatCurrency(order.discount)}</Typography>
                  </Box>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Notas adicionales */}
          {order.notes && (
            <Card sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notas del Pedido
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {order.notes}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.default',
          p: isMobile ? 2 : 3,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth={isMobile}
          sx={{ minWidth: 120 }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrderDetailModal;
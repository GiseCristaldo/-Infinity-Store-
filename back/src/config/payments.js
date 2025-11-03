export const paymentsConfig = {
  methods: [
    { key: 'tarjeta', label: 'Tarjeta de crédito/débito', details: 'Visa y Mastercard.' },
    { key: 'efectivo', label: 'Efectivo', details: 'Pago en tienda física.' },
    { key: 'transferencia', label: 'Transferencia bancaria', details: 'Datos enviados al confirmar el pedido.' },
    { key: 'mercadopago', label: 'Mercado Pago', details: 'QR o enlace de pago.' }
  ],
  policies: {
    cuotas: 'Ofrecemos hasta 3 cuotas sin interés en tarjetas seleccionadas.',
    factura: 'Emitimos factura C para compras minoristas.',
    devoluciones: 'Cambios dentro de los 7 días con ticket en buen estado.'
  }
};
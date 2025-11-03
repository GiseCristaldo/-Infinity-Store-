export function validateChatMessage(req, res, next) {
  try {
    if (!req.is('application/json')) {
      return res.status(415).json({ message: 'Content-Type debe ser application/json' });
    }
    const { message } = req.body || {};

    if (typeof message !== 'string') {
      return res.status(400).json({ message: 'El campo "message" debe ser un string' });
    }

    const trimmed = message.trim();
    if (!trimmed || trimmed.length < 1) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío' });
    }
    if (trimmed.length > 500) {
      return res.status(400).json({ message: 'El mensaje supera el máximo de 500 caracteres' });
    }

    // Saneamiento básico: eliminar caracteres de control
    req.body.message = trimmed.replace(/[\x00-\x1F\x7F]/g, ' ').trim();

    next();
  } catch (err) {
    console.error('Error en validación de chat:', err);
    return res.status(400).json({ message: 'Solicitud inválida' });
  }
}
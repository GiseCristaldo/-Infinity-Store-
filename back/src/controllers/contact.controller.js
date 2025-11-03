import { sendEmail, tplContactAdmin, tplContactUser, ADMIN_EMAIL } from '../services/email.service.js';

export async function submitContact(req, res) {
  try {
    console.log('[contact] payload recibido:', req.body);
    const { nombre, email, mensaje } = req.body || {};
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ message: 'Nombre, email y mensaje son obligatorios.' });
    }
    const trimmedEmail = String(email).trim();
    if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
      return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    // Enviar al admin (no bloqueante)
    if (ADMIN_EMAIL) {
      sendEmail({ to: ADMIN_EMAIL, subject: '[Contacto] Nuevo mensaje', html: tplContactAdmin(nombre, trimmedEmail, mensaje) })
        .catch((e) => console.warn('[contact] fallo email admin:', e?.message || e));
    }
    // Confirmación al usuario (no bloqueante)
    sendEmail({ to: trimmedEmail, subject: 'Gracias por contactarnos', html: tplContactUser(nombre) })
      .catch((e) => console.warn('[contact] fallo email usuario:', e?.message || e));

    return res.status(200).json({ message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error('submitContact error:', err?.stack || err);
    const message = process.env.NODE_ENV === 'development' ? (err?.message || 'Error enviando el mensaje') : 'Error enviando el mensaje';
    return res.status(500).json({ message });
  }
}
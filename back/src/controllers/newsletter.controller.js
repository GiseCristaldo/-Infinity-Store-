import { sendEmail, tplNewsletterAdmin, tplNewsletterUser, ADMIN_EMAIL } from '../services/email.service.js';

export async function subscribeNewsletter(req, res) {
  try {
    console.log('[newsletter] payload recibido:', req.body);
    const { email, nombre } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email es obligatorio.' });
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
      return res.status(400).json({ message: 'Formato de email inválido.' });
    }
    // Notificar al admin (no bloqueante)
    if (ADMIN_EMAIL) {
      sendEmail({ to: ADMIN_EMAIL, subject: '[Newsletter] Nuevo suscriptor', html: tplNewsletterAdmin(trimmedEmail) })
        .catch((e) => console.warn('[newsletter] fallo email admin:', e?.message || e));
    }
    // Confirmar al usuario (no bloqueante)
    sendEmail({ to: trimmedEmail, subject: 'Suscripción confirmada', html: tplNewsletterUser() })
      .catch((e) => console.warn('[newsletter] fallo email usuario:', e?.message || e));

    return res.status(200).json({ message: 'Suscripción registrada' });
  } catch (err) {
    console.error('subscribeNewsletter error:', err?.stack || err);
    const message = process.env.NODE_ENV === 'development' ? (err?.message || 'Error registrando suscripción') : 'Error registrando suscripción';
    return res.status(500).json({ message });
  }
}
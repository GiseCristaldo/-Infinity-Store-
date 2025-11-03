import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = smtpPort === 465; // true para 465 (SSL), false para 587
const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || '';
const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS || '';

const fromName = process.env.FROM_NAME || 'Infinity Store';
const fromEmail = process.env.FROM_EMAIL || smtpUser || 'no-reply@infinity-store.local';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || smtpUser;

let transporter = null;

function createTransporter() {
  if (!smtpUser || !smtpPass) {
    console.warn('[email.service] SMTP credentials not set — emails will be logged only.');
    return null;
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
    pool: true,
    connectionTimeout: 5000,
    socketTimeout: 5000,
    greetingTimeout: 5000,
  });
}

function asHtmlWrapper(title, content) {
  return `<!doctype html>
  <html><head><meta charset="utf-8" />
  <style>
    body { font-family: Inter, Arial, sans-serif; color:#333; }
    .card { border:1px solid #e8d4d4; border-radius:12px; padding:16px; }
    .brand { color:#d4a5a5; font-weight:700; }
    .muted { color:#777; }
  </style></head>
  <body>
    <h2 class="brand">${title}</h2>
    <div class="card">${content}</div>
    <p class="muted">© ${new Date().getFullYear()} ${fromName}</p>
  </body></html>`;
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!transporter) transporter = createTransporter();
    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      text: text || html?.replace(/<[^>]+>/g, '') || '',
      html,
    };
    if (!transporter) {
      console.log('[email.service] (DEV LOG) Email:', mailOptions);
      return { mocked: true };
    }
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('[email.service] sendEmail error:', err.message);
    throw err;
  }
}

// Plantillas
export function tplWelcomeUser(nombre) {
  const content = `<p>¡Hola ${nombre}! 👋</p>
  <p>Gracias por registrarte en <strong>${fromName}</strong>. Ya puedes explorar productos y ofertas.</p>`;
  return asHtmlWrapper('Bienvenido a Infinity Store', content);
}

export function tplNewUserAdmin(nombre, email) {
  const content = `<p>Nuevo usuario registrado:</p>
  <ul>
    <li>Nombre: <strong>${nombre}</strong></li>
    <li>Email: <strong>${email}</strong></li>
  </ul>`;
  return asHtmlWrapper('Nuevo registro de usuario', content);
}

export function tplContactAdmin(nombre, email, mensaje) {
  const content = `<p>Nuevo mensaje desde el formulario de contacto:</p>
  <ul>
    <li>Nombre: <strong>${nombre}</strong></li>
    <li>Email: <strong>${email}</strong></li>
  </ul>
  <p><em>Mensaje:</em></p>
  <blockquote>${mensaje}</blockquote>`;
  return asHtmlWrapper('Nuevo contacto', content);
}

export function tplContactUser(nombre) {
  const content = `<p>¡Hola ${nombre}! 👋</p>
  <p>Recibimos tu mensaje. Nuestro equipo te responderá pronto.</p>`;
  return asHtmlWrapper('Gracias por contactarnos', content);
}

export function tplNewsletterAdmin(email) {
  const content = `<p>Nuevo suscriptor del newsletter:</p>
  <ul>
    <li>Email: <strong>${email}</strong></li>
  </ul>`;
  return asHtmlWrapper('Nuevo suscriptor', content);
}

export function tplNewsletterUser() {
  const content = `<p>¡Gracias por suscribirte! 🎉</p>
  <p>Recibirás novedades y ofertas especiales. ¡Bienvenido!</p>`;
  return asHtmlWrapper('Suscripción confirmada', content);
}
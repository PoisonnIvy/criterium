import transporter from '../config/mail.js';

const getBaseMailHtml = ({ title, content, footer }) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;font-family:'Josefin Sans',Arial,sans-serif">
    <div style="max-width:600px;margin:40px auto;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#b56a65 0%,#e9d7a9 100%);padding:24px 32px;border-radius:16px 16px 0 0;">
        <h2 style="color:#4b3132;font-weight:600;margin:0;font-size:1.6em;">${title}</h2>
      </div>
      <div style="padding:32px;border: 1px solid #4b3132;border-radius:0 0 16px 16px;">
        ${content}
      </div>
      <div style=padding:16px 32px;border-radius:0 0 16px 16px;text-align:center;">
        <p style="color:#b56a65;font-size:0.95em;margin:0;border-bottom: 1px solid #eee;">
          ${footer || 'Criterium · Plataforma de colaboración para investigadores'}
        </p>
      </div>
    </div>
  </body>
  </html>
`;

export const sendVerificationCodeMail = async (norm_email, code, name) => {
  try {
    const html = getBaseMailHtml({
      title: 'Verificación de Cuenta',
      content: `
        <h2 style=\"color:#4b3132;\">¡Hola ${name}! 👋</h2>
        <p style=\"color:#666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;\">
          Para completar tu registro, necesitamos verificar tu dirección de email. Ingresa el siguiente código en la aplicación:
        </p>
        <div style=\"text-align: center; margin: 40px 0;\">
          <div style=\"display: inline-block; background: linear-gradient(45deg,  #a22c27, #b56a65); color: white; padding: 20px 30px; border-radius: 15px; box-shadow: 0 8px 25px rgba(135, 141, 169, 0.3);\">
            <div style=\"font-size: 14px; opacity: 0.9; margin-bottom: 5px;\">TU CÓDIGO ES:</div>
            <div style=\"font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;\">${code}</div>
          </div>
        </div>
        <div style=\"background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;\">
          <div style=\"display: flex; align-items: center;\">
            <span style=\"font-size: 20px; margin-right: 10px;\">⏰</span>
            <div>
              <strong style=\"color: #856404;\">Importante:</strong>
              <p style=\"color: #856404; margin: 5px 0 0 0; font-size: 14px;\">Este código expira en <strong>1 hora</strong>. Si no lo usas a tiempo, tendrás que solicitar uno nuevo.</p>
            </div>
          </div>
        </div>
        <p style=\"color: #666; font-size: 14px; line-height: 1.6;\">Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
      `
    });
    const info = await transporter.sendMail({
      from: `'Criterium' <${process.env.GMAIL}>`,
      to: norm_email,
      subject: 'Codigo de verificación Criterium',
      html,
      text: `Hola ${name}! Tu código de verificación es: ${code} y expira dentro de 1 hora`
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendProjectInvitationMail = async ({ to, inviterName, projectName, inviteLink, role }) => {
  try {
    const html = getBaseMailHtml({
      title: `Invitación a colaborar en "${projectName}"`,
      content: `
        <p style=\"color:#4b3132;font-size:1.1em;\"><strong>${inviterName}</strong> te ha invitado a unirte al proyecto <b>${projectName}</b> como <b>${role}</b>.</p>
        <p style=\"margin:24px 0;\">
          <a href=\"${inviteLink}\" style=\"background:#b56a65;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500;\">Unirme al proyecto</a>
        </p>
        <p style=\"color:#4b3132;font-size:0.95em;\">Si no reconoces esta invitación, puedes ignorar este correo.</p>
      `,
      footer: 'Este enlace caduca en 7 días'
    });
    const mailOptions = {
      from: `'Criterium' <${process.env.GMAIL}>`,
      to,
      subject: `Invitación a colaborar en el proyecto "${projectName}"`,
      html,
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error enviando correo de invitación de proyecto:', error);
    return { success: false, error };
  }
};

export const sendGeneralMail = async ({ to, subject, html, title, content, footer }) => {
  try {
    const mailHtml = html || getBaseMailHtml({ title, content, footer });
    const mailOptions = {
      from: `'Criterium' <${process.env.GMAIL}>`,
      to,
      subject,
      html: mailHtml,
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error enviando correo:', error);
    return { success: false, error };
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const html = getBaseMailHtml({
    title: '¡Bienvenido a Criterium!',
    content: `
      <h2 style=\"color:#4b3132;\">¡Hola ${userName}!</h2>
      <p>Bienvenido a nuestra plataforma colaborativa. Esperamos que disfrutes la experiencia y puedas aportar a la comunidad científica.</p>
    `
  });
  const mailOptions = {
    from: `'Criterium' <${process.env.GMAIL}>`,
    to: userEmail,
    subject: '¡Bienvenido a nuestra plataforma!',
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendMemberJoinedNotification = async (ownerEmail, memberName, projectName) => {
  const html = getBaseMailHtml({
    title: `Nuevo miembro en ${projectName}`,
    content: `
      <h2 style=\"color:#4b3132;\">¡Buenas noticias!</h2>
      <p><strong>${memberName}</strong> se unió a tu proyecto <strong>"${projectName}"</strong></p>
    `
  });
  const mailOptions = {
    from: `'Criterium' <${process.env.GMAIL}>`,
    to: ownerEmail,
    subject: `Nuevo miembro en ${projectName}`,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendCommentResolvedMail = async ({ to, userName, commentText, projectName }) => {
  try {
    const html = getBaseMailHtml({
      title: `Comentario resuelto en "${projectName}"`,
      content: `
        <p style=\"color:#4b3132;\">Hola ${userName || to},</p>
        <p style=\"color:#4b3132;\">Tu comentario en el formulario base del proyecto <b>${projectName}</b> ha sido marcado como <b>resuelto</b> por un investigador principal/editor.</p>
        <blockquote style=\"background:#f3f3ee;padding:12px;border-radius:8px;color:#4b3132;margin:24px 0;\">${commentText}</blockquote>
        <p style=\"color:#4b3132;\">Gracias por tu colaboración.</p>
      `
    });
    const mailOptions = {
      from: `'Criterium' <${process.env.GMAIL}>`,
      to,
      subject: `Tu comentario en "${projectName}" ha sido marcado como resuelto`,
      html,
    };
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error enviando correo de comentario resuelto:', error);
    return { success: false, error };
  }
};

export const sendResetPasswordMail = async (norm_email, resetLink, name) => {
  try {
    const html = getBaseMailHtml({
      title: 'Restablecimiento de contraseña',
      content: `
        <h2 style="color:#4b3132;">Hola ${name} 👋</h2>
        <p style="color:#666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Has solicitado restablecer tu contraseña en Criterium.<br>
          Haz clic en el siguiente enlace para continuar con el proceso:
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(45deg, #a22c27, #b56a65); color: white; padding: 18px 32px; border-radius: 15px; font-size: 1.2em; text-decoration: none; font-weight: bold; box-shadow: 0 8px 25px rgba(135, 141, 169, 0.3);">Restablecer contraseña</a>
        </div>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 10px;">⏰</span>
            <div>
              <strong style="color: #856404;">Importante:</strong>
              <p style="color: #856404; margin: 5px 0 0 0; font-size: 14px;">Este enlace y código expiran en <strong>10 minutos</strong>. Si no lo usas a tiempo, tendrás que solicitar uno nuevo.</p>
            </div>
          </div>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
      `
    });
    const info = await transporter.sendMail({
      from: `'Criterium' <${process.env.GMAIL}>`,
      to: norm_email,
      subject: 'Restablecimiento de contraseña Criterium',
      html,
      text: `Hola ${name}! Para restablecer tu contraseña, ingresa al siguiente enlace: ${resetLink} (expira en 10 minutos).`
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
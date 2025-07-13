import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_API_KEY,
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Error en la configuración:', error);
  } else {
    console.log('Servidor listo para enviar emails');
  }
});
export default transporter;
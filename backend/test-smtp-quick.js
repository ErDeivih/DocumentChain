const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: path.join(__dirname, '.env') });

const smtpHost = process.env.SMTP_HOST || 'localhost';
const smtpPort = Number.parseInt(process.env.SMTP_PORT || '1587', 10);
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const fromEmail = process.env.EMAIL_FROM || 'noreply@documentchain.local';
const fromName = process.env.EMAIL_FROM_NAME || 'DocumentChain';

const recipient = process.argv.find((arg) => !arg.startsWith('--') && arg !== process.argv[0] && arg !== process.argv[1]);
const verifyOnly = process.argv.includes('--verify-only');

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? {
    user: smtpUser,
    pass: smtpPass,
  } : undefined,
  tls: {
    rejectUnauthorized: false,
  },
});

async function testEmail() {
  try {
    console.log(`Probando conexión SMTP en ${smtpHost}:${smtpPort}...`);
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa');

    if (verifyOnly) {
      console.log('✅ Verificación completada sin enviar correo');
      return;
    }

    if (!recipient) {
      console.error('❌ Indica un destinatario: node test-smtp-quick.js tu@email.com');
      process.exitCode = 1;
      return;
    }

    console.log('\nEnviando email de prueba...');
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipient,
      subject: 'Test DocumentChain SMTP',
      text: 'Este es un email de prueba desde DocumentChain',
      html: '<h1>Test DocumentChain</h1><p>Email enviado correctamente con Postfix local</p>'
    });

    console.log('✅ Email enviado:', info.messageId);
    console.log('Response:', info.response);
    console.log('\n✅ ¡SMTP funcionando correctamente!');
    console.log('⚠️  El email puede ir a spam (sin DNS/SPF configurado)');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEmail();

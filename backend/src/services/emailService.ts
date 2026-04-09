import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Servicio de correo electrónico
 * Maneja el envío de emails usando SMTP (MailHog/Postfix)
 * Arquitectura MVC: Service Layer
 */
export class EmailService {
  private transporter: Transporter;
  private readonly templatesPath: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;
  private readonly sendTimeoutMs: number;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'localhost';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@documentchain.local';
    this.fromName = process.env.EMAIL_FROM_NAME || 'DocumentChain System';
    this.appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.sendTimeoutMs = parseInt(process.env.EMAIL_SEND_TIMEOUT_MS || '10000', 10);
    this.templatesPath = this.resolveTemplatesPath();

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser && smtpPass ? {
        user: smtpUser,
        pass: smtpPass,
      } : undefined,
      connectionTimeout: this.sendTimeoutMs,
      greetingTimeout: this.sendTimeoutMs,
      socketTimeout: this.sendTimeoutMs,
      tls: {
        rejectUnauthorized: false,
      },
    });

    logger.info(`EmailService inicializado con SMTP: ${smtpHost}:${smtpPort}`);
  }

  private resolveTemplatesPath(): string {
    const candidatePaths = [
      path.join(__dirname, '../templates/emails'),
      path.join(process.cwd(), 'dist/templates/emails'),
      path.join(process.cwd(), 'src/templates/emails'),
    ];

    const existingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

    if (!existingPath) {
      throw new Error('No se encontró el directorio de plantillas de email');
    }

    return existingPath;
  }

  /**
   * Verifica la conexión SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error de conexión SMTP:', error);
      return false;
    }
  }

  /**
   * Carga y compila un template de Handlebars
   */
  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      logger.error(`Error al cargar plantilla ${templateName}:`, error);
      throw new Error(`Plantilla ${templateName} no encontrada`);
    }
  }

  /**
   * Envía un email genérico
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const info = await Promise.race([
        this.transporter.sendMail({
          from: `"${this.fromName}" <${this.fromEmail}>`,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, '') // Fallback: strip HTML tags
        }),
        new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(
            () => reject(new Error(`Email send timeout after ${this.sendTimeoutMs}ms`)),
            this.sendTimeoutMs
          );
        })
      ]);

      logger.info(`Email enviado a ${to}: ${info.messageId}`);
    } catch (error) {
      logger.error(`Error al enviar email a ${to}:`, error);
      throw new Error('Error al enviar email');
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }

  /**
   * Envía email de verificación de cuenta
   */
  async sendVerificationEmail(
    email: string,
    username: string,
    token: string
  ): Promise<void> {
    const template = this.loadTemplate('verification');
    const verificationUrl = `${this.appUrl}/verify-email?token=${token}`;

    const html = template({
      username,
      verificationUrl,
      appUrl: this.appUrl,
      year: new Date().getFullYear()
    });

    await this.sendEmail(
      email,
      'Verifica tu cuenta en DocumentChain',
      html
    );

    logger.info(`Email de verificación enviado a ${email}`);
  }

  /**
   * Envía email para resetear contraseña
   */
  async sendPasswordResetEmail(
    email: string,
    username: string,
    token: string
  ): Promise<void> {
    const template = this.loadTemplate('password-reset');
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    const html = template({
      username,
      resetUrl,
      expiresIn: '1 hora',
      appUrl: this.appUrl,
      year: new Date().getFullYear()
    });

    await this.sendEmail(
      email,
      'Restablecer contraseña - DocumentChain',
      html
    );

    logger.info(`Email de restablecimiento de contraseña enviado a ${email}`);
  }

  /**
   * Envía notificación de cambio de contraseña exitoso
   */
  async sendPasswordChangedNotification(
    email: string,
    username: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const template = this.loadTemplate('password-changed');

    const html = template({
      username,
      timestamp: new Date().toLocaleString('es-ES'),
      settingsUrl: `${this.appUrl}/app/settings`,
      appUrl: this.appUrl,
      year: new Date().getFullYear()
    });

    await this.sendEmail(
      email,
      'Tu contraseña ha sido cambiada - DocumentChain',
      html
    );

    logger.info(`Notificación de cambio de contraseña enviada a ${email}`);
  }

  /**
   * Envía notificación de documento compartido
   */
  async sendDocumentSharedNotification(
    email: string,
    recipientUsername: string,
    documentTitle: string,
    sharedByUsername: string,
    documentId: string,
    permissions: string[]
  ): Promise<void> {
    const template = this.loadTemplate('document-shared');
    const documentUrl = `${this.appUrl}/app/documents/${documentId}`;

    const html = template({
      recipientUsername,
      documentTitle,
      sharedByUsername,
      permissions: permissions.join(', '),
      documentUrl,
      appUrl: this.appUrl,
      year: new Date().getFullYear()
    });

    await this.sendEmail(
      email,
      `${sharedByUsername} compartió un documento contigo - DocumentChain`,
      html
    );

    logger.info(`Notificación de documento compartido enviada a ${email}`);
  }

  /**
   * Envía alerta de seguridad (login desde nuevo dispositivo/IP)
   */
  async sendSecurityAlert(
    email: string,
    username: string,
    alertType: 'new_device' | 'new_ip' | 'password_attempt' | '2fa_disabled',
    details: {
      ipAddress?: string;
      userAgent?: string;
      location?: string;
      timestamp?: Date;
    }
  ): Promise<void> {
    logger.info(`Alerta de seguridad omitida (${alertType}) para ${email}`);
  }

  /**
   * Envía email de bienvenida
   */
  async sendWelcomeEmail(
    email: string,
    username: string
  ): Promise<void> {
    const template = this.loadTemplate('welcome');

    const html = template({
      username,
      loginUrl: `${this.appUrl}/login`,
      homeUrl: this.appUrl,
      settingsUrl: `${this.appUrl}/app/settings`,
      appUrl: this.appUrl,
      year: new Date().getFullYear()
    });

    await this.sendEmail(
      email,
      'Bienvenido a DocumentChain',
      html
    );

    logger.info(`Email de bienvenida enviado a ${email}`);
  }

  /**
   * Envía notificación genérica
   */
  async sendNotification(
    email: string,
    username: string,
    subject: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<void> {
    const template = this.loadTemplate('notification');

    const html = template({
      username,
      subject,
      message,
      actionUrl,
      actionText: actionText || 'Ver detalles',
      appUrl: this.appUrl,
      year: new Date().getFullYear()
    });

    await this.sendEmail(
      email,
      subject,
      html
    );

    logger.info(`Email de notificación enviado a ${email}: ${subject}`);
  }
}

// Exportar instancia única (Singleton)
export const emailService = new EmailService();

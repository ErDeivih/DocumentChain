import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Servicio de correo electrónico.
 * Gestiona el envío de emails transaccionales y notificaciones mediante SMTP.
 * Utiliza plantillas Handlebars para la generación de contenido HTML.
 */
export class EmailService {
  private transporter: Transporter;
  private readonly templatesPath: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;
  private readonly sendTimeoutMs: number;
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpSecure: boolean;
  private readonly smtpUsesAuth: boolean;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'localhost';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';

    this.smtpHost = smtpHost;
    this.smtpPort = smtpPort;
    this.smtpSecure = smtpSecure;
    this.smtpUsesAuth = Boolean(smtpUser && smtpPass);

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
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    });

    logger.info(`EmailService inicializado con SMTP: ${smtpHost}:${smtpPort}`);
    this.logConfigurationWarnings();
  }

  private getSenderDomain(): string {
    return this.fromEmail.split('@')[1]?.trim().toLowerCase() || '';
  }

  private getConfigurationWarnings(): string[] {
    const warnings: string[] = [];
    const senderDomain = this.getSenderDomain();
    const relayConfigured = Boolean(process.env.SMTP_RELAYHOST);
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && (!this.fromEmail || !senderDomain)) {
      warnings.push('EMAIL_FROM no está configurado con un remitente válido.');
    }

    if (isProduction && (senderDomain.endsWith('.local') || senderDomain === 'localhost')) {
      warnings.push('EMAIL_FROM usa un dominio local no enrutable; el correo externo no será entregable.');
    }

    if (isProduction && this.smtpHost === 'postfix' && !relayConfigured) {
      warnings.push('SMTP_RELAYHOST no está configurado; la entrega externa dependerá de DNS, PTR, SPF, DKIM y reputación de IP del servidor.');
    }

    return warnings;
  }

  private logConfigurationWarnings(): void {
    this.getConfigurationWarnings().forEach((warning) => {
      logger.warn(`Configuración de email: ${warning}`, {
        smtpHost: this.smtpHost,
        smtpPort: this.smtpPort,
        fromEmail: this.fromEmail,
      });
    });
  }

  getDiagnostics(): {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUsesAuth: boolean;
    fromEmail: string;
    fromName: string;
    appUrl: string;
    warnings: string[];
  } {
    return {
      smtpHost: this.smtpHost,
      smtpPort: this.smtpPort,
      smtpSecure: this.smtpSecure,
      smtpUsesAuth: this.smtpUsesAuth,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      appUrl: this.appUrl,
      warnings: this.getConfigurationWarnings(),
    };
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
    _ipAddress?: string,
    _userAgent?: string
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
  async sendSecurityAlert(email: string, username: string, alertType: string, details: any): Promise<void> {
    try {
      const template = this.loadTemplate('security-alert');
      const html = template({
        username, alertType,
        timestamp: new Date().toLocaleString('es-ES'),
        ipAddress: details?.ipAddress || 'Desconocida',
        userAgent: details?.userAgent || 'Desconocido',
        appUrl: this.appUrl,
        year: new Date().getFullYear(),
      });
      await this.sendEmail(email, `Alerta de seguridad - DocumentChain`, html);
      logger.info(`Alerta de seguridad (${alertType}) enviada a ${email}`);
    } catch (error) {
      logger.warn(`No se pudo enviar alerta de seguridad a ${email}: ${error instanceof Error ? error.message : String(error)}`);
    }
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

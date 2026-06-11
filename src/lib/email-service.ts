/**
 * Email Service
 *
 * Handles sending emails via SMTP or other providers.
 * Supports multiple email providers through environment configuration.
 */

import { EmailTemplate } from './email-templates';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface EmailServiceConfig {
  provider: 'smtp' | 'sendgrid' | 'ses' | 'resend' | 'console';
  from: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  resend?: {
    apiKey: string;
  };
}

/**
 * Get email service configuration from environment variables
 */
function getEmailConfig(): EmailServiceConfig {
  const provider = (process.env.EMAIL_PROVIDER || 'console') as EmailServiceConfig['provider'];
  const from = process.env.EMAIL_FROM || 'noreply@talkvex.com';

  const config: EmailServiceConfig = {
    provider,
    from,
  };

  if (provider === 'smtp') {
    config.smtp = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };
  } else if (provider === 'sendgrid') {
    config.sendgrid = {
      apiKey: process.env.SENDGRID_API_KEY || '',
    };
  } else if (provider === 'ses') {
    config.ses = {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    };
  } else if (provider === 'resend') {
    config.resend = {
      apiKey: process.env.RESEND_API_KEY || '',
    };
  }

  return config;
}

/**
 * Send email using the configured provider
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getEmailConfig();
  const from = params.from || config.from;

  try {
    if (config.provider === 'console') {
      console.log('\n=== EMAIL (Console Mode) ===');
      console.log('From:', from);
      console.log('To:', params.to);
      console.log('Subject:', params.subject);
      console.log('---');
      console.log(params.text);
      console.log('===========================\n');
      return { success: true, messageId: `console-${Date.now()}` };
    }

    if (config.provider === 'smtp' && config.smtp) {
      return await sendViaSMTP({ ...params, from }, config.smtp);
    }

    if (config.provider === 'sendgrid' && config.sendgrid) {
      return await sendViaSendGrid({ ...params, from }, config.sendgrid.apiKey);
    }

    if (config.provider === 'resend' && config.resend) {
      return await sendViaResend({ ...params, from }, config.resend.apiKey);
    }

    throw new Error(`Unsupported email provider: ${config.provider}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email template
 */
export async function sendEmailTemplate(
  to: string,
  template: EmailTemplate,
  from?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    from,
  });
}

/**
 * Send email via SMTP
 */
async function sendViaSMTP(
  params: Required<SendEmailParams>,
  smtp: NonNullable<EmailServiceConfig['smtp']>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // This is a placeholder for SMTP implementation
  // In production, you would use nodemailer or similar
  console.log('SMTP email would be sent:', { to: params.to, subject: params.subject, smtp });

  // Simulated success
  return {
    success: true,
    messageId: `smtp-${Date.now()}`,
  };
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(
  params: Required<SendEmailParams>,
  apiKey: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!apiKey) {
    throw new Error('SendGrid API key is required');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: params.from },
      subject: params.subject,
      content: [
        { type: 'text/plain', value: params.text },
        { type: 'text/html', value: params.html },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return {
    success: true,
    messageId: response.headers.get('x-message-id') || `sendgrid-${Date.now()}`,
  };
}

/**
 * Send email via Resend
 */
async function sendViaResend(
  params: Required<SendEmailParams>,
  apiKey: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!apiKey) {
    throw new Error('Resend API key is required');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return {
    success: true,
    messageId: data.id,
  };
}

/**
 * Batch send emails with rate limiting
 */
export async function sendEmailBatch(
  emails: Array<{ to: string; template: EmailTemplate }>,
  options: {
    batchSize?: number;
    delayMs?: number;
    from?: string;
  } = {}
): Promise<{
  total: number;
  success: number;
  failed: number;
  results: Array<{ to: string; success: boolean; messageId?: string; error?: string }>;
}> {
  const { batchSize = 10, delayMs = 1000, from } = options;

  const results: Array<{ to: string; success: boolean; messageId?: string; error?: string }> = [];
  let success = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async ({ to, template }) => {
        const result = await sendEmailTemplate(to, template, from);
        return { to, ...result };
      })
    );

    for (const result of batchResults) {
      results.push(result);
      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    if (i + batchSize < emails.length && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    total: emails.length,
    success,
    failed,
    results,
  };
}

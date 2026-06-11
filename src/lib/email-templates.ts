/**
 * Email templates for Talkvex
 *
 * This module provides type-safe email templates for various system communications.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface WaitlistLaunchParams {
  name: string;
  email: string;
  earlyAdopterCode: string;
  launchDate: string;
}

/**
 * Waitlist Launch Email - Early Adopter Bonus
 *
 * Sent to waitlist members announcing the official launch with exclusive Early Adopter benefits.
 */
export function waitlistLaunchEmail(params: WaitlistLaunchParams): EmailTemplate {
  const { name, earlyAdopterCode, launchDate } = params;

  const subject = '🚀 Talkvex está no ar! Seu bônus de Early Adopter te espera';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Talkvex</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🚀 Talkvex</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Transforme seus objetivos em realidade</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 18px; line-height: 1.6;">
                Olá <strong>${name}</strong>! 👋
              </p>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                O dia que você esperava finalmente chegou! O <strong>Talkvex</strong> está oficialmente no ar desde <strong>${launchDate}</strong>, e você está entre os primeiros a ter acesso.
              </p>

              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Como agradecimento por fazer parte da nossa lista de espera, preparamos um presente especial para você:
              </p>

              <!-- Early Adopter Badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h2 style="margin: 0 0 10px; color: #2d3436; font-size: 24px; font-weight: 700;">🌟 Bônus Early Adopter</h2>
                    <p style="margin: 0 0 20px; color: #2d3436; font-size: 16px;">Seu código exclusivo:</p>
                    <div style="background-color: rgba(255,255,255,0.9); padding: 15px 30px; border-radius: 6px; display: inline-block;">
                      <code style="font-size: 24px; font-weight: 700; color: #6c5ce7; letter-spacing: 2px;">${earlyAdopterCode}</code>
                    </div>
                    <p style="margin: 20px 0 0; color: #2d3436; font-size: 14px; opacity: 0.8;">
                      Use este código para desbloquear benefícios exclusivos!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Benefits -->
              <h3 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: 600;">✨ O que você ganha:</h3>
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                <li>Acesso vitalício ao plano Premium</li>
                <li>Badge especial de Early Adopter no seu perfil</li>
                <li>Prioridade no suporte técnico</li>
                <li>Acesso antecipado a novos recursos</li>
                <li>Voz ativa na definição do roadmap do produto</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://talkvex.com/login?code=${earlyAdopterCode}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Começar Agora →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Estamos ansiosos para acompanhar sua jornada rumo aos seus objetivos!
              </p>

              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Com gratidão,<br>
                <strong>Equipe Talkvex</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                Precisa de ajuda? <a href="mailto:suporte@talkvex.com" style="color: #667eea; text-decoration: none;">Entre em contato</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Talkvex. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Olá ${name}!

O Talkvex está oficialmente no ar desde ${launchDate}, e você está entre os primeiros a ter acesso!

🌟 BÔNUS EARLY ADOPTER 🌟

Seu código exclusivo: ${earlyAdopterCode}

Use este código para desbloquear:
- Acesso vitalício ao plano Premium
- Badge especial de Early Adopter no seu perfil
- Prioridade no suporte técnico
- Acesso antecipado a novos recursos
- Voz ativa na definição do roadmap do produto

COMEÇAR AGORA:
https://talkvex.com/login?code=${earlyAdopterCode}

Estamos ansiosos para acompanhar sua jornada rumo aos seus objetivos!

Com gratidão,
Equipe Talkvex

---
Precisa de ajuda? Entre em contato: suporte@talkvex.com
© ${new Date().getFullYear()} Talkvex. Todos os direitos reservados.
  `.trim();

  return { subject, html, text };
}

/**
 * Welcome Email - For new user registration
 */
export function welcomeEmail(params: { name: string; email: string }): EmailTemplate {
  const { name } = params;

  const subject = 'Bem-vindo ao Talkvex! 🎯';

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">Bem-vindo ao Talkvex!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">Olá <strong>${name}</strong>!</p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">Sua conta foi criada com sucesso. Estamos felizes em tê-lo conosco!</p>
              <p style="margin: 0; color: #333333; font-size: 16px;">Comece definindo seus primeiros objetivos e transforme seus sonhos em realidade.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `Olá ${name}!\n\nSua conta foi criada com sucesso. Estamos felizes em tê-lo conosco!\n\nComece definindo seus primeiros objetivos e transforme seus sonhos em realidade.\n\nEquipe Talkvex`;

  return { subject, html, text };
}

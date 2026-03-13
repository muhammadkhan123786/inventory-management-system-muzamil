export interface BaseTemplateConfig {
  appName: string;
  appColor: string;
  accentColor: string;
  fontFamily?: string;
  companyLogo?: string;
  companyAddress?: string;
}

export class BaseEmailTemplate {
  protected config: BaseTemplateConfig;

  constructor(config: BaseTemplateConfig) {
    this.config = {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      ...config
    };
  }

  formatCurrency(amount: number): string {
    return `£${amount.toFixed(2)}`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  wrapContent(content: string, options?: {
    preheader?: string;
    title?: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${options?.title || this.config.appName}</title>
</head>
<body style="margin:0; padding:0; background:#f4f5f7; font-family:${this.config.fontFamily}; -webkit-font-smoothing:antialiased;">
  
  <!-- Preheader -->
  ${options?.preheader ? `
  <div style="display:none; font-size:1px; color:#f4f5f7; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    ${options.preheader}
  </div>
  ` : ''}

  <!-- Main container -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 16px rgba(0,0,0,0.05);">

          ${content}

          <!-- Global Footer -->
          <tr>
            <td style="padding:32px 40px; background:#f8fafc; border-top:1px solid #e5e7eb;">
              <table width="100%">
                <tr>
                  <td style="text-align:center;">
                    ${this.config.companyLogo ? `
                    <img src="${this.config.companyLogo}" alt="${this.config.appName}" style="max-width:120px; margin-bottom:16px;">
                    ` : ''}
                    <p style="margin:0 0 8px; font-size:12px; color:#6b7280;">
                      © ${new Date().getFullYear()} ${this.config.appName}. All rights reserved.
                    </p>
                    ${this.config.companyAddress ? `
                    <p style="margin:0 0 16px; font-size:11px; color:#9ca3af;">
                      ${this.config.companyAddress}
                    </p>
                    ` : ''}
                    <p style="margin:0; font-size:11px; color:#9ca3af;">
                      This is an automated message from ${this.config.appName}. Please do not reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  getSeverityConfig(severity: string) {
    const configs = {
      critical: {
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fecaca',
        label: 'CRITICAL — Below Safety Stock',
        icon: '🚨'
      },
      warning: {
        color: '#ea580c',
        bg: '#fff7ed',
        border: '#fed7aa',
        label: 'Reorder Required',
        icon: '⚠️'
      },
      low: {
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a',
        label: 'Stock Running Low',
        icon: '📉'
      }
    };
    return configs[severity as keyof typeof configs] || configs.low;
  }
}
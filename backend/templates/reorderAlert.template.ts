import { BaseEmailTemplate } from './base.template';
import { ReorderAlertData } from '../src/types/email/email.types';

export class ReorderAlertTemplate extends BaseEmailTemplate {
  generate(data: ReorderAlertData, userEmail: string): { html: string; text: string } {
    const severity = this.getSeverityConfig(data.severity);

    const dashboardUrl = `${process.env.FRONTEND_URL || ''}/dashboard/reorder`;
    const productUrl = `${process.env.FRONTEND_URL || ''}/products/${data.productId}`;

    const daysText = data.daysUntilStockout != null
      ? `<p style="margin:8px 0 0; font-size:14px; color:${severity.color}; font-weight:600;">
           ⏱ Estimated stockout in <strong>${data.daysUntilStockout} day${data.daysUntilStockout !== 1 ? 's' : ''}</strong>
         </p>`
      : '';

    const stockMetrics = [
      { label: 'Current Stock', value: data.currentStock, color: severity.color },
      { label: 'Reorder Point', value: data.reorderPoint, color: '#6366f1' },
      { label: 'Safety Stock', value: data.safetyStock, color: '#dc2626' },
      { label: 'Suggested Order', value: data.suggestedOrderQty, color: '#16a34a' }
    ];

    const metricsHtml = stockMetrics.map(metric => `
      <td width="25%" style="text-align:center; padding:4px;">
        <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:14px 8px;">
          <p style="margin:0; font-size:22px; font-weight:800; color:${metric.color};">${metric.value}</p>
          <p style="margin:4px 0 0; font-size:11px; color:#6b7280; font-weight:500;">${metric.label}</p>
        </div>
      </td>
    `).join('<td width="2%"></td>');

    const html = this.wrapContent(`
      <!-- Alert Header -->
      <tr>
        <td style="background:${severity.color}; padding:32px 40px;">
          <table width="100%">
            <tr>
              <td>
                <p style="margin:0; font-size:28px; font-weight:800; color:#ffffff;">
                  ${severity.icon} Stock Alert
                </p>
                <p style="margin:8px 0 0; font-size:16px; color:rgba(255,255,255,0.9);">
                  ${severity.label}
                </p>
              </td>
              <td align="right">
                <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.7);">Priority Level</p>
                <p style="margin:4px 0 0; font-size:20px; font-weight:700; color:#ffffff; text-transform:uppercase;">
                  ${data.severity}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Product Info -->
      <tr>
        <td style="padding:32px 40px 0;">
          <div style="background:${severity.bg}; border:2px solid ${severity.border}; border-radius:12px; padding:24px;">
            <table width="100%">
              <tr>
                <td>
                  <p style="margin:0 0 4px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${severity.color};">
                    Product Requiring Attention
                  </p>
                  <h2 style="margin:0; font-size:24px; font-weight:800; color:#111827;">
                    <a href="${productUrl}" style="color:#111827; text-decoration:none;">${data.productName}</a>
                  </h2>
                  <p style="margin:4px 0 0; font-size:13px; color:#6b7280; font-family:monospace;">SKU: ${data.sku}</p>
                  ${data.category ? `<p style="margin:4px 0 0; font-size:12px; color:#6b7280;">Category: ${data.category}</p>` : ''}
                  ${daysText}
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>

      <!-- Stock Metrics -->
      <tr>
        <td style="padding:24px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${metricsHtml}
            </tr>
          </table>
        </td>
      </tr>

      <!-- Supplier Info -->
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="display:flex; align-items:center; gap:16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px 20px;">
            <span style="font-size:24px;">🏭</span>
            <div style="flex:1;">
              <p style="margin:0; font-size:12px; color:#15803d; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Linked Supplier</p>
              <p style="margin:2px 0 0; font-size:16px; font-weight:600; color:#111827;">${data.supplierName || 'No supplier linked'}</p>
              ${data.supplierEmail ? `<p style="margin:2px 0 0; font-size:13px; color:#6b7280;">${data.supplierEmail}</p>` : ''}
            </div>
          </div>
        </td>
      </tr>

      <!-- Additional Info -->
      <tr>
        <td style="padding:20px 40px 0;">
          <table width="100%" cellspacing="8">
            <tr>
              ${data.lastOrdered ? `
              <td width="50%">
                <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
                  <p style="margin:0; font-size:11px; color:#6b7280;">Last Ordered</p>
                  <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#111827;">${this.formatDate(data.lastOrdered)}</p>
                </div>
              </td>
              ` : ''}
              ${data.averageDailySales ? `
              <td width="50%">
                <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:12px;">
                  <p style="margin:0; font-size:11px; color:#6b7280;">Avg. Daily Sales</p>
                  <p style="margin:4px 0 0; font-size:14px; font-weight:600; color:#111827;">${data.averageDailySales} units</p>
                </div>
              </td>
              ` : ''}
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA Buttons -->
      <tr>
        <td style="padding:28px 40px;">
          <table width="100%">
            <tr>
              <td align="center">
                <a href="${dashboardUrl}?product=${data.productId}" 
                   style="display:inline-block; background:linear-gradient(135deg, ${this.config.accentColor}, #7c3aed); color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; padding:14px 36px; border-radius:8px; margin-right:8px;">
                  Create Purchase Order →
                </a>
                <a href="${productUrl}" 
                   style="display:inline-block; background:#f3f4f6; color:#374151; font-size:15px; font-weight:600; text-decoration:none; padding:14px 24px; border-radius:8px; border:1px solid #d1d5db;">
                  View Product Details
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Alert Preferences -->
      <tr>
        <td style="padding:20px 40px; background:#f9fafb;">
          <table width="100%">
            <tr>
              <td>
                <p style="margin:0; font-size:12px; color:#6b7280;">
                  ⚙️ You're receiving this alert because stock for ${data.productName} has reached its reorder point.
                  <a href="${process.env.FRONTEND_URL}/settings/notifications" style="color:${this.config.accentColor}; text-decoration:underline;">Manage alert preferences</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `, {
      title: `Stock Alert - ${data.productName}`,
      preheader: `${data.currentStock} units left - Reorder point: ${data.reorderPoint}`
    });

    // Plain text version
    const text = `
${severity.icon} STOCK ALERT - ${data.productName} (${data.sku})
Status: ${severity.label}

Current Stock: ${data.currentStock} units
Reorder Point: ${data.reorderPoint} units
Safety Stock: ${data.safetyStock} units
Suggested Order: ${data.suggestedOrderQty} units
${data.daysUntilStockout ? `Estimated Stockout: ${data.daysUntilStockout} days` : ''}

Supplier: ${data.supplierName || 'No supplier linked'}
${data.supplierEmail ? `Supplier Email: ${data.supplierEmail}` : ''}
${data.category ? `Category: ${data.category}` : ''}
${data.lastOrdered ? `Last Ordered: ${this.formatDate(data.lastOrdered)}` : ''}
${data.averageDailySales ? `Average Daily Sales: ${data.averageDailySales} units` : ''}

Create a purchase order:
${dashboardUrl}?product=${data.productId}

View product details:
${productUrl}

You're receiving this alert because stock has reached its reorder point.
Manage alert preferences: ${process.env.FRONTEND_URL}/settings/notifications
    `.trim();

    return { html, text };
  }
}
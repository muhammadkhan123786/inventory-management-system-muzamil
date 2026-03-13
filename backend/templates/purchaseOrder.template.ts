import { BaseEmailTemplate } from './base.template';
import { POEmailData } from '../src/types/email/email.types';

export class PurchaseOrderTemplate extends BaseEmailTemplate {
  generate(data: POEmailData): { html: string; text: string } {
    const itemRows = data.items.map(item => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px 16px; font-size:14px; font-weight:600; color:#111827;">${item.productName}</td>
        <td style="padding:12px 16px; font-size:13px; color:#6b7280; font-family:monospace;">${item.sku}</td>
        <td style="padding:12px 16px; font-size:14px; color:#111827; text-align:center;">${item.quantity}</td>
        <td style="padding:12px 16px; font-size:14px; color:#111827; text-align:right;">${this.formatCurrency(item.unitPrice)}</td>
        <td style="padding:12px 16px; font-size:14px; font-weight:700; color:#111827; text-align:right;">${this.formatCurrency(item.totalPrice)}</td>
      </tr>
    `).join('');

    const html = this.wrapContent(`
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg, ${this.config.appColor} 0%, #1f2937 100%); padding:32px 40px;">
          <table width="100%">
            <tr>
              <td>
                <p style="margin:0; font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:1px;">Purchase Order</p>
                <h1 style="margin:4px 0 0; font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">${data.poNumber}</h1>
              </td>
              <td align="right">
                <p style="margin:0; font-size:13px; color:#9ca3af;">Issued</p>
                <p style="margin:4px 0 0; font-size:15px; font-weight:600; color:#ffffff;">${data.orderDate}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Supplier & Buyer Info -->
      <tr>
        <td style="padding:32px 40px 0;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td width="48%" style="background:#f9fafb; border-radius:8px; padding:20px; border:1px solid #e5e7eb; vertical-align:top;">
                <p style="margin:0 0 8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${this.config.accentColor};">To (Supplier)</p>
                <p style="margin:0; font-size:15px; font-weight:700; color:#111827;">${data.supplierName}</p>
                <p style="margin:4px 0 0; font-size:13px; color:#6b7280;">${data.supplierEmail}</p>
              </td>
              <td width="4%"></td>
              <td width="48%" style="background:#f9fafb; border-radius:8px; padding:20px; border:1px solid #e5e7eb; vertical-align:top;">
                <p style="margin:0 0 8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${this.config.accentColor};">From (Buyer)</p>
                <p style="margin:0; font-size:15px; font-weight:700; color:#111827;">${data.buyerCompany}</p>
                <p style="margin:4px 0 0; font-size:13px; color:#6b7280;">${data.buyerEmail}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Delivery Info -->
      <tr>
        <td style="padding:20px 40px 0;">
          <table width="100%">
            <tr>
              <td>
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px 20px; display:inline-block;">
                  <span style="font-size:13px; color:#2563eb; font-weight:600;">📅 Expected Delivery: ${data.expectedDelivery}</span>
                </div>
              </td>
              ${data.paymentTerms ? `
              <td align="right">
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px 20px; display:inline-block;">
                  <span style="font-size:13px; color:#16a34a; font-weight:600;">💰 Payment: ${data.paymentTerms}</span>
                </div>
              </td>
              ` : ''}
            </tr>
          </table>
        </td>
      </tr>

      <!-- Items Table -->
      <tr>
        <td style="padding:24px 40px 0;">
          <table width="100%" style="border-collapse:collapse; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:12px 16px; text-align:left; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#4b5563;">Product</th>
                <th style="padding:12px 16px; text-align:left; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#4b5563;">SKU</th>
                <th style="padding:12px 16px; text-align:center; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#4b5563;">Qty</th>
                <th style="padding:12px 16px; text-align:right; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#4b5563;">Unit Price</th>
                <th style="padding:12px 16px; text-align:right; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#4b5563;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </td>
      </tr>

      <!-- Totals -->
      <tr>
        <td style="padding:20px 40px 0;">
          <table width="100%">
            <tr>
              <td align="right">
                <table style="min-width:260px;">
                  <tr>
                    <td style="padding:6px 16px; font-size:13px; color:#6b7280;">Subtotal</td>
                    <td style="padding:6px 16px; font-size:13px; text-align:right; font-weight:600; color:#111827;">${this.formatCurrency(data.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 16px; font-size:13px; color:#6b7280;">VAT (20%)</td>
                    <td style="padding:6px 16px; font-size:13px; text-align:right; font-weight:600; color:#111827;">${this.formatCurrency(data.vatAmount)}</td>
                  </tr>
                  <tr style="border-top:2px solid #e5e7eb;">
                    <td style="padding:12px 16px; font-size:16px; font-weight:800; color:#111827;">Total</td>
                    <td style="padding:12px 16px; font-size:18px; font-weight:800; color:${this.config.accentColor}; text-align:right;">${this.formatCurrency(data.total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Notes -->
      ${data.notes ? `
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:16px;">
            <p style="margin:0 0 4px; font-size:11px; font-weight:700; text-transform:uppercase; color:#92400e;">Notes</p>
            <p style="margin:0; font-size:13px; color:#78350f;">${data.notes}</p>
          </div>
        </td>
      </tr>
      ` : ''}

      <!-- Shipping Method -->
      ${data.shippingMethod ? `
      <tr>
        <td style="padding:20px 40px 0;">
          <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:14px 20px;">
            <span style="font-size:13px; color:#0369a1;">🚚 Shipping: ${data.shippingMethod}</span>
          </div>
        </td>
      </tr>
      ` : ''}
    `, {
      title: `Purchase Order ${data.poNumber}`,
      preheader: `New purchase order from ${data.buyerCompany} - ${data.items.length} item(s) - Total ${this.formatCurrency(data.total)}`
    });

    // Plain text version
    const text = `
PURCHASE ORDER: ${data.poNumber}
Date: ${data.orderDate}
Delivery: ${data.expectedDelivery}

TO: ${data.supplierName}
    ${data.supplierEmail}

FROM: ${data.buyerCompany}
    ${data.buyerEmail}

ITEMS:
${data.items.map(i => `  • ${i.productName} (${i.sku}) - Qty: ${i.quantity} - Unit: ${this.formatCurrency(i.unitPrice)} - Total: ${this.formatCurrency(i.totalPrice)}`).join('\n')}

SUBTOTAL: ${this.formatCurrency(data.subtotal)}
VAT: ${this.formatCurrency(data.vatAmount)}
TOTAL: ${this.formatCurrency(data.total)}

${data.notes ? `NOTES: ${data.notes}` : ''}
${data.paymentTerms ? `PAYMENT TERMS: ${data.paymentTerms}` : ''}
${data.shippingMethod ? `SHIPPING: ${data.shippingMethod}` : ''}

Please confirm receipt of this purchase order.
    `.trim();

    return { html, text };
  }
}
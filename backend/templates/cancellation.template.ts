export class CancellationTemplate {
    constructor(private config: any) {}

    generate(po: any): { html: string; text: string } {
        const supplier = po.supplier;
        const supplierName = supplier?.contactInformation?.primaryContactName ?? "Supplier";
        
        // Build items table for email
        const itemsRows = (po.items ?? [])
            .map(
                (item: any) =>
                    `<tr>
                        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.productName ?? "—"}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.sku ?? "—"}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity ?? 0}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">£${Number(item.unitPrice ?? 0).toFixed(2)}</td>
                    </tr>`,
            )
            .join("");

        const orderDate = new Date(po.orderDate).toLocaleDateString("en-GB");
        const cancelledAt = new Date().toLocaleDateString("en-GB");

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
                    .wrapper { max-width: 620px; margin: 0 auto; padding: 32px 24px; }
                    .header  { background: #ef4444; color: #fff; padding: 24px 28px; border-radius: 8px 8px 0 0; }
                    .body    { background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 8px 8px; }
                    table    { width: 100%; border-collapse: collapse; }
                    th       { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
                    .footer  { margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center; }
                    .badge   { display: inline-block; background: #fee2e2; color: #b91c1c; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="header">
                        <h2 style="margin:0;font-size:20px">Purchase Order Cancellation</h2>
                        <p style="margin:6px 0 0;opacity:0.9;font-size:14px">Order ${po.orderNumber} has been cancelled</p>
                    </div>

                    <div class="body">
                        <p>Dear ${supplierName},</p>
                        <p>
                            We regret to inform you that Purchase Order
                            <strong>${po.orderNumber}</strong>
                            placed on <strong>${orderDate}</strong> has been
                            <span class="badge">Cancelled</span>
                        </p>
                        <p>
                            Please disregard any previous communications regarding this order.
                            If goods have already been dispatched, please contact us immediately.
                        </p>

                        <h3 style="margin:24px 0 12px;color:#111;font-size:15px">Cancelled Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th style="text-align:center">SKU</th>
                                    <th style="text-align:center">Qty</th>
                                    <th style="text-align:right">Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>${itemsRows}</tbody>
                        </table>

                        <table style="margin-top:24px">
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;font-size:13px">Order Number</td>
                                <td style="padding:4px 0;font-weight:600;padding-left:24px">${po.orderNumber}</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;font-size:13px">Original Order Date</td>
                                <td style="padding:4px 0;font-weight:600;padding-left:24px">${orderDate}</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;font-size:13px">Cancelled On</td>
                                <td style="padding:4px 0;font-weight:600;padding-left:24px">${cancelledAt}</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 0;color:#6b7280;font-size:13px">Order Total</td>
                                <td style="padding:4px 0;font-weight:600;padding-left:24px">£${Number(po.total ?? 0).toFixed(2)}</td>
                            </tr>
                        </table>

                        <p style="margin-top:28px">
                            We apologise for any inconvenience caused. We look forward to doing
                            business with you in the future.
                        </p>
                        <p>
                            Best regards,<br />
                            <strong>Inventory Management Team</strong>
                        </p>
                    </div>

                    <div class="footer">
                        This is an automated notification. Please do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
        `;

        // Plain text version
        const text = `
PURCHASE ORDER CANCELLATION - ${po.orderNumber}

Dear ${supplierName},

We regret to inform you that Purchase Order ${po.orderNumber} placed on ${orderDate} has been CANCELLED.

Please disregard any previous communications regarding this order. If goods have already been dispatched, please contact us immediately.

CANCELLED ITEMS:
${(po.items ?? []).map((item: any) => 
    `- ${item.productName} (SKU: ${item.sku}): Qty: ${item.quantity} @ £${Number(item.unitPrice).toFixed(2)}`
).join('\n')}

Order Number: ${po.orderNumber}
Original Order Date: ${orderDate}
Cancelled On: ${cancelledAt}
Order Total: £${Number(po.total ?? 0).toFixed(2)}

We apologise for any inconvenience caused. We look forward to doing business with you in the future.

Best regards,
Inventory Management Team

This is an automated notification. Please do not reply to this email.
        `;

        return { html, text };
    }
}
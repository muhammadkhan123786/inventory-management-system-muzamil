import { transporator } from "../config/node.mailer.config";
import { BaseEmailTemplate } from "../../templates/base.template";
import { PurchaseOrderTemplate } from "../../templates/purchaseOrder.template";
import { ReorderAlertTemplate } from "../../templates/reorderAlert.template";
import { POEmailData, ReorderAlertData, EmailOptions, EmailRecipient } from "../types/email/email.types";
   import { CancellationTemplate } from "../../templates/cancellation.template";
import "dotenv/config";

export class EmailService {
    private static instance: EmailService;
    private baseTemplate: BaseEmailTemplate;
    private poTemplate: PurchaseOrderTemplate;
    private reorderTemplate: ReorderAlertTemplate;
    private cancellationTemplate: CancellationTemplate;


    private constructor() {
        this.baseTemplate = new BaseEmailTemplate({
            appName: process.env.APP_NAME || 'Inventory Pro',
            appColor: process.env.BRAND_COLOR || '#0f172a',
            accentColor: process.env.ACCENT_COLOR || '#6366f1',
            companyLogo: process.env.COMPANY_LOGO,
            companyAddress: process.env.COMPANY_ADDRESS
        });

        this.poTemplate = new PurchaseOrderTemplate(this.baseTemplate['config']);
        this.reorderTemplate = new ReorderAlertTemplate(this.baseTemplate['config']);
        // EmailService constructor mein add karo
this.cancellationTemplate = new CancellationTemplate(this.baseTemplate['config']);
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    private formatRecipients(recipients: string | EmailRecipient[]): string[] {
        if (typeof recipients === 'string') {
            return [recipients];
        }
        return recipients.map(r => r.email);
    }

    private async sendMail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions: any = {
                from: options.from || `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
                to: this.formatRecipients(options.to).join(', '),
                subject: options.subject,
                html: options.html,
                text: options.text
            };

            if (options.cc) {
                mailOptions.cc = this.formatRecipients(options.cc).join(', ');
            }

            if (options.bcc) {
                mailOptions.bcc = this.formatRecipients(options.bcc).join(', ');
            }

            if (options.attachments) {
                mailOptions.attachments = options.attachments;
            }

            const info = await transporator.sendMail(mailOptions);
            console.log(`Email sent successfully: ${info.messageId}`);

            // Log for audit
            await this.logEmailDelivery({
                messageId: info.messageId,
                to: mailOptions.to,
                subject: mailOptions.subject,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Failed to send email:', error);
            throw new Error(`Email delivery failed: ${error.message}`);
        }
    }

    private async logEmailDelivery(log: any): Promise<void> {
        // TODO: Implement email logging to database
    }

    /**
     * Send purchase order email to supplier
     */
    async sendPurchaseOrderToSupplier(
        data: POEmailData,
        options?: {
            cc?: string | EmailRecipient[];
            bcc?: string | EmailRecipient[];
            attachments?: EmailOptions['attachments'];
        }
    ): Promise<void> {
        const { html, text } = this.poTemplate.generate(data);

        const subject = `Purchase Order ${data.poNumber} - ${data.supplierName} - ${this.baseTemplate.formatCurrency(data.total)}`;
if (!data.supplierEmail) {
    console.warn("Supplier email missing. Skipping email.");
    return;
}
        await this.sendMail({
            from: `${data.buyerCompany} <${process.env.SMTP_FROM_EMAIL}>`,
            to: data.supplierEmail,
            cc: options?.cc,
            bcc: options?.bcc || process.env.PO_BCC_EMAIL,
            subject,
            html,
            text,
            attachments: options?.attachments
        });
    }

    /**
     * Send bulk purchase order emails to multiple suppliers
     */
    async sendBulkPurchaseOrders(
        orders: Array<{ data: POEmailData; options?: any }>
    ): Promise<{
        successful: string[];
        failed: Array<{ poNumber: string; error: string }>;
    }> {
        const results = {
            successful: [] as string[],
            failed: [] as Array<{ poNumber: string; error: string }>
        };

        await Promise.allSettled(
            orders.map(async ({ data, options }) => {
                try {
                    await this.sendPurchaseOrderToSupplier(data, options);
                    results.successful.push(data.poNumber);
                } catch (error) {
                    results.failed.push({
                        poNumber: data.poNumber,
                        error: error.message
                    });
                }
            })
        );

        return results;
    }

    /**
     * Send reorder alert email to store owner/manager
     */
    async sendReorderAlertToUser(
        data: ReorderAlertData,
        userEmail: string,
        options?: {
            cc?: string | EmailRecipient[];
            bcc?: string | EmailRecipient[];
        }
    ): Promise<void> {
        const { html, text } = this.reorderTemplate.generate(data, userEmail);

        const severityEmoji = data.severity === 'critical' ? '🚨' :
            data.severity === 'warning' ? '⚠️' : '📉';

        const subject = `${severityEmoji} ${data.severity.toUpperCase()} Stock Alert - ${data.productName} (${data.currentStock} units left)`;

        await this.sendMail({
            from: `${process.env.APP_NAME} Alerts <${process.env.SMTP_FROM_EMAIL}>`,
            to: userEmail,
            cc: options?.cc,
            bcc: options?.bcc || process.env.ALERT_BCC_EMAIL,
            subject,
            html,
            text
        });
    }

    /**
     * Send reorder alerts to multiple users
     */
    async sendBulkReorderAlerts(
        alerts: Array<{ data: ReorderAlertData; userEmail: string }>
    ): Promise<void> {
        // Group by user to avoid duplicate emails
        const groupedByUser = alerts.reduce((acc, alert) => {
            if (!acc[alert.userEmail]) {
                acc[alert.userEmail] = [];
            }
            acc[alert.userEmail].push(alert.data);
            return acc;
        }, {} as Record<string, ReorderAlertData[]>);

        // Send consolidated alert per user
        await Promise.all(
            Object.entries(groupedByUser).map(async ([userEmail, productAlerts]) => {
                if (productAlerts.length === 1) {
                    // Single product alert
                    await this.sendReorderAlertToUser(productAlerts[0], userEmail);
                } else {
                    // Multiple products - send summary
                    await this.sendReorderSummary(userEmail, productAlerts);
                }
            })
        );
    }

    /**
     * Send consolidated reorder summary for multiple products
     */
    private async sendReorderSummary(
        userEmail: string,
        products: ReorderAlertData[]
    ): Promise<void> {
        const criticalCount = products.filter(p => p.severity === 'critical').length;
        const warningCount = products.filter(p => p.severity === 'warning').length;

        const productList = products.map(p =>
            `• ${p.productName} (${p.sku}) - ${p.currentStock} units left - Suggested: ${p.suggestedOrderQty}`
        ).join('\n');

        const html = `
      <h2>📊 Daily Reorder Summary</h2>
      <p>You have ${products.length} products that need attention:</p>
      <ul>
        <li>🔴 Critical: ${criticalCount}</li>
        <li>🟠 Warning: ${warningCount}</li>
      </ul>
      <p>Check your dashboard for details:</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/inventory-dashboard/orders-management">View Reorder Dashboard</a>
    `;

        await this.sendMail({
            from: `${process.env.APP_NAME} Alerts <${process.env.SMTP_FROM_EMAIL}>`,
            to: userEmail,
            subject: `📊 Daily Reorder Summary - ${products.length} products need attention`,
            html,
            text: `Daily Reorder Summary\n\n${productList}`
        });
    }

    /**
     * Test email configuration
     */
    async testConnection(): Promise<boolean> {
        try {
            await transporator.verify();
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }



 



// Add this new method to the EmailService class:
async sendCancellationEmail(
    po: any,
    options?: {
        cc?: string | EmailRecipient[];
        bcc?: string | EmailRecipient[];
    }
): Promise<void> {
    const supplier = po.supplier;
    const supplierEmail = supplier?.contactInformation?.emailAddress;
   
    
    if (!supplierEmail) {
        console.warn(`[EmailService] No supplier email for PO ${po.orderNumber} — skipping cancellation email`);
        return;
    }
console.log("Canneled email")
    const { html, text } = this.cancellationTemplate.generate(po);

    await this.sendMail({
        from: `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: supplierEmail,
        cc: options?.cc,
        bcc: options?.bcc || process.env.PO_BCC_EMAIL,
        subject: `❌ Purchase Order Cancelled — ${po.orderNumber}`,
        html,
        text
    });
}
}

// Export singleton instance
export const emailService = EmailService.getInstance();
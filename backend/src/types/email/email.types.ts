export interface POEmailItem {
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface POEmailData {
    poNumber: string;
    orderDate: any;         // formatted: "27 February 2026"
    expectedDelivery: any;  // formatted: "06 March 2026"
    supplierName: string;
    supplierEmail: string;
    buyerCompany: string;      // your company name
    buyerEmail: string;        // buyer contact email
    items: POEmailItem[];
    subtotal: number;
    vatAmount: number;
    total: number;
    notes?: string;
    paymentTerms?: string;
    shippingMethod?: string;
}

export interface ReorderAlertData {
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    maxStockLevel: number;
    suggestedOrderQty: number;
    daysUntilStockout?: number;
    supplierId?: string;
    supplierName: string;
    supplierEmail?: string;
    category?: string;
    severity: "critical" | "warning" | "low";
    lastOrdered?: Date;
    averageDailySales?: number;
}

export interface EmailRecipient {
    email: string;
    name?: string;
    type: 'to' | 'cc' | 'bcc';
}

export interface EmailOptions {
    from?: string;
    to: string | EmailRecipient[];
    cc?: string | EmailRecipient[];
    bcc?: string | EmailRecipient[];
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}


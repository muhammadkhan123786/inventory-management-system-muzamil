import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { POEmailData, ReorderAlertData } from '../types/email/email.types';

export class EmailTestController {
    /**
     * Test Purchase Order Email
     * POST /api/test/email/po
     */
    static async testPOEmail(req: Request, res: Response) {
        try {
            const {
                supplierEmail,
                buyerEmail,
                poNumber,
                supplierName,
                buyerCompany
            } = req.body;

            // Sample PO Data
            const poData: POEmailData = {
                poNumber: poNumber || `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                orderDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                supplierName: supplierName || 'Tech Distributors Ltd',
                supplierEmail: supplierEmail || 'supplier@example.com',
                buyerCompany: buyerCompany || 'Your Company Name',
                buyerEmail: buyerEmail || 'procurement@yourcompany.com',
                items: [
                    {
                        productName: 'Laptop Pro X1',
                        sku: 'LP-X1-001',
                        quantity: 5,
                        unitPrice: 899.99,
                        totalPrice: 4499.95
                    },
                    {
                        productName: 'Wireless Mouse',
                        sku: 'WM-200-BLK',
                        quantity: 10,
                        unitPrice: 24.99,
                        totalPrice: 249.90
                    },
                    {
                        productName: 'USB-C Hub',
                        sku: 'UC-HUB-4K',
                        quantity: 8,
                        unitPrice: 45.50,
                        totalPrice: 364.00
                    }
                ],
                subtotal: 5113.85,
                vatAmount: 1022.77,
                total: 6136.62,
                notes: req.body.notes || 'Please ensure all items are packed securely. Include packing slip with order.',
                paymentTerms: req.body.paymentTerms || 'Net 30 days',
                shippingMethod: req.body.shippingMethod || 'Express Delivery (2-3 business days)'
            };

            // Send email
            await emailService.sendPurchaseOrderToSupplier(poData, {
                cc: req.body.cc || 'finance@yourcompany.com',
                bcc: req.body.bcc || process.env.PO_BCC_EMAIL
            });

            res.status(200).json({
                success: true,
                message: 'Purchase Order email sent successfully',
                data: {
                    poNumber: poData.poNumber,
                    to: poData.supplierEmail,
                    subject: `Purchase Order ${poData.poNumber}`,
                    total: poData.total
                }
            });

        } catch (error) {
            console.error('Error sending PO email:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send Purchase Order email',
                error: error.message
            });
        }
    }

    /**
     * Test Reorder Alert Email
     * POST /api/test/email/reorder-alert
     */
    static async testReorderAlert(req: Request, res: Response) {
        try {
            const {
                userEmail,
                productName,
                currentStock,
                severity
            } = req.body;
            console.log("Request is Comign in the controller");
            console.log('Received reorder alert test request:', req.body);
            // Sample Reorder Alert Data
            const alertData: ReorderAlertData = {
                productId: `prod_${Math.random().toString(36).substring(2, 10)}`,
                productName: productName || 'Laptop Pro X1',
                sku: 'LP-X1-001',
                currentStock: currentStock || 15,
                reorderPoint: 25,
                safetyStock: 10,
                maxStockLevel: 100,
                suggestedOrderQty: 35,
                daysUntilStockout: Math.ceil((currentStock || 15) / 5), // Assuming 5 units/day sales
                supplierId: 'supplier_123',
                supplierName: 'Tech Distributors Ltd',
                supplierEmail: 'orders@techdist.com',
                category: 'Electronics',
                severity: severity || 'critical',
                lastOrdered: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                averageDailySales: 5
            };

            // Send email
            await emailService.sendReorderAlertToUser(
                alertData,
                userEmail || 'manager@yourcompany.com',
                {
                    cc: req.body.cc || 'purchasing@yourcompany.com'
                }
            );

            res.status(200).json({
                success: true,
                message: 'Reorder Alert email sent successfully',
                data: {
                    productName: alertData.productName,
                    to: userEmail || 'manager@yourcompany.com',
                    severity: alertData.severity,
                    currentStock: alertData.currentStock,
                    suggestedOrder: alertData.suggestedOrderQty
                }
            });

        } catch (error) {
            console.error('Error sending reorder alert:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send Reorder Alert email',
                error: error.message
            });
        }
    }

    /**
     * Test Bulk Purchase Order Emails
     * POST /api/test/email/bulk-po
     */
    static async testBulkPOEmails(req: Request, res: Response) {
        try {
            console.log("🚀 Request received at testBulkPOEmails");
            console.log("Headers:", req.headers);
            console.log("Body type:", typeof req.body);
            console.log("Raw body:", req.body);

            // Check if body exists
            if (!req.body) {
                console.error("req.body is undefined - JSON parser not working");
                return res.status(400).json({
                    success: false,
                    message: 'Request body is missing. Make sure Content-Type: application/json is set'
                });
            }

            const { suppliers } = req.body;
            console.log("Extracted suppliers:", suppliers);

            if (!suppliers) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a suppliers array in the request body',
                    receivedBody: req.body // This will show what you actually sent
                });
            }

            if (!Array.isArray(suppliers)) {
                return res.status(400).json({
                    success: false,
                    message: 'suppliers must be an array',
                    receivedType: typeof suppliers
                });
            }

            if (suppliers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'suppliers array cannot be empty'
                });
            }

            // Rest of your code...
            const orders = suppliers.map((supplier, index) => {
                if (!supplier.name || !supplier.email) {
                    throw new Error(`Supplier at index ${index} missing name or email`);
                }

                const poNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(index + 1).padStart(4, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                return {
                    data: {
                        poNumber,
                        orderDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                        supplierName: supplier.name,
                        supplierEmail: supplier.email,
                        buyerCompany: 'Your Company Name',
                        buyerEmail: 'procurement@yourcompany.com',
                        items: [
                            {
                                productName: 'Product A',
                                sku: `SKU-${index}-A`,
                                quantity: 5,
                                unitPrice: 100,
                                totalPrice: 500
                            },
                            {
                                productName: 'Product B',
                                sku: `SKU-${index}-B`,
                                quantity: 3,
                                unitPrice: 75,
                                totalPrice: 225
                            }
                        ],
                        subtotal: 725,
                        vatAmount: 145,
                        total: 870,
                        notes: 'Bulk order test'
                    } as POEmailData
                };
            });

            const results = await emailService.sendBulkPurchaseOrders(orders);

            res.status(200).json({
                success: true,
                message: 'Bulk PO emails processed',
                data: results
            });

        } catch (error) {
            console.error('❌ Error in testBulkPOEmails:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send bulk PO emails',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Test Bulk Reorder Alerts
     * POST /api/test/email/bulk-alerts
     */
    static async testBulkReorderAlerts(req: Request, res: Response) {
        try {
            const { products, userEmail } = req.body;

            if (!products || !Array.isArray(products)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide an array of products'
                });
            }

            const alerts = products.map((product, index) => ({
                data: {
                    productId: `prod_${Math.random().toString(36).substring(2, 10)}`,
                    productName: product.name || `Product ${index + 1}`,
                    sku: product.sku || `SKU-${index + 1}`,
                    currentStock: product.currentStock || Math.floor(Math.random() * 20) + 5,
                    reorderPoint: 25,
                    safetyStock: 10,
                    maxStockLevel: 100,
                    suggestedOrderQty: 35,
                    daysUntilStockout: 3,
                    supplierName: product.supplier || 'Default Supplier',
                    supplierEmail: 'supplier@example.com',
                    category: product.category || 'General',
                    severity: product.severity || (index === 0 ? 'critical' : 'warning')
                } as ReorderAlertData,
                userEmail: userEmail || 'manager@yourcompany.com'
            }));

            await emailService.sendBulkReorderAlerts(alerts);

            res.status(200).json({
                success: true,
                message: 'Bulk reorder alerts sent',
                data: {
                    totalAlerts: alerts.length,
                    userEmail: userEmail || 'manager@yourcompany.com'
                }
            });

        } catch (error) {
            console.error('Error sending bulk alerts:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send bulk alerts',
                error: error.message
            });
        }
    }

    /**
     * Test Email Configuration
     * GET /api/test/email/status
     */
    static async testEmailStatus(req: Request, res: Response) {
        try {
            const isConnected = await emailService.testConnection();

            res.status(200).json({
                success: true,
                data: {
                    status: isConnected ? 'connected' : 'disconnected',
                    smtp: {
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT,
                        secure: process.env.SMTP_SECURE === 'true',
                        user: process.env.SMTP_USER
                    },
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Email service not configured properly',
                error: error.message
            });
        }
    }
}
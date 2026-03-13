// src/services/ShopifyService.ts

import { BaseMarketplaceService } from '../BaseMarketplaceService'
import axios from 'axios';

export class ShopifyService extends BaseMarketplaceService {

    // ─── Get Base URL ──────────────────────────────────────────
    getShopBaseUrl(): string {
        console.log("his.credentials", this.credentials)
        const shopName = this.credentials.shopUrl;
        console.log("shopName", shopName)
        console.log("shopName", shopName);
        if (!shopName) throw new Error('Shop name is required');
        return `https://${shopName}.myshopify.com/admin/api/2024-01`;
    }

    // ─── Get Auth Headers ──────────────────────────────────────
    protected getAuthHeaders(): Record<string, string> {
        const token = this.credentials.accessToken || this.tokens?.accessToken;
        console.log("token", token)
        if (!token) throw new Error('No access token available');

        return {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json'
        };
    }

    // ─── No OAuth needed for Private Apps ─────────────────────
    getAuthorizationUrl(state: string): string {
        throw new Error('Shopify private apps do not need OAuth');
    }

    async exchangeCodeForTokens(code: string): Promise<any> {
        // Private apps don't need code exchange
        return this.tokens;
    }

    async refreshAccessToken(): Promise<any> {
        // Private app tokens don't expire
        return this.tokens;
    }

    // ─── TEST CONNECTION ───────────────────────────────────────
    async testConnection(): Promise<boolean> {
        try {
            await this.ensureTokensLoaded();
            const url = `${this.getShopBaseUrl()}/shop.json`;

            console.log(`🔗 Attempting Request to: ${url}`);

            const response = await axios.get(url, {
                headers: this.getAuthHeaders()
            });

            return true;
        } catch (error: any) {
            // THIS PART IS KEY: It tells you exactly what Shopify didn't like
            if (error.response) {
                console.error('❌ Shopify API Error Data:', error.response.data);
                console.error('❌ Shopify API Status:', error.response.status);
            } else {
                console.error('❌ Network/Request Error:', error.message);
            }
            return false;
        }
    }

    // ─── ENSURE TOKENS ─────────────────────────────────────────
    private async ensureTokensLoaded(): Promise<void> {
        // For Shopify private apps, token is in credentials
        if (!this.tokens?.accessToken) {
            this.tokens = {
                accessToken: this.credentials.accessToken,
                expiresIn: 999999999
            };
        }
    }

    // ─── LIST PRODUCT ──────────────────────────────────────────
    async listProduct(productData: any): Promise<any> {
        await this.ensureTokensLoaded();

        console.log('\n📦 Shopify - Listing Product');
        console.log('Title:', productData.title);

        const payload = {
            product: {
                title: productData.title,
                body_html: productData.description || productData.title,
                vendor: productData.vendor || 'My Store',
                product_type: productData.productType || '',
                status: 'active',
                images: productData.images?.map((src: string) => ({ src })) || [],
                variants: [
                    {
                        sku: productData.sku || `SKU-${Date.now()}`,
                        price: parseFloat(productData.price).toFixed(2),
                        compare_at_price: productData.comparePrice
                            ? parseFloat(productData.comparePrice).toFixed(2)
                            : null,
                        inventory_quantity: productData.quantity || 1,
                        inventory_management: 'shopify',
                        fulfillment_service: 'manual',
                        requires_shipping: true,
                        taxable: true,
                        weight: productData.weight || 0,
                        weight_unit: productData.weightUnit || 'kg',
                        option1: 'Default Title'
                    }
                ],
                tags: productData.tags || ''
            }
        };

        try {
            const response = await axios.post(
                `${this.getShopBaseUrl()}/products.json`,
                payload,
                { headers: this.getAuthHeaders() }
            );

            const product = response.data.product;

            console.log('✅ Product listed on Shopify!');
            console.log('Product ID:', product.id);

            return {
                success: true,
                productId: product.id,
                title: product.title,
                status: product.status,
                variantId: product.variants?.[0]?.id,
                viewUrl: `https://${this.credentials.shopUrl}.myshopify.com/products/${product.handle}`,
                adminUrl: `https://${this.credentials.shopUrl}.myshopify.com/admin/products/${product.id}`
            };

        } catch (error: any) {
            console.error('❌ Shopify listing failed:', error.response?.data);
            throw new Error(
                `Shopify listing failed: ${JSON.stringify(error.response?.data?.errors || error.message)}`
            );
        }
    }

    // ─── FETCH PRODUCTS ────────────────────────────────────────
    async fetchProducts(params: any = {}): Promise<any> {
        await this.ensureTokensLoaded();

        try {
            const response = await axios.get(
                `${this.getShopBaseUrl()}/products.json`,
                {
                    headers: this.getAuthHeaders(),
                    params: {
                        limit: params.limit || 250,
                        status: 'active'
                    }
                }
            );

            const products = response.data.products || [];
            console.log(`✅ Found ${products.length} Shopify products`);

            return {
                success: true,
                totalListings: products.length,
                listings: products.map((p: any) => ({
                    productId: p.id,
                    title: p.title,
                    status: p.status,
                    price: p.variants?.[0]?.price,
                    quantity: p.variants?.[0]?.inventory_quantity,
                    images: p.images?.map((img: any) => img.src) || [],
                    viewUrl: `https://${this.credentials.shopUrl}.myshopify.com/products/${p.handle}`
                }))
            };

        } catch (error: any) {
            console.error('❌ fetchProducts failed:', error.response?.data);
            return { success: false, totalListings: 0, listings: [] };
        }
    }

    // ─── FETCH ORDERS ──────────────────────────────────────────
    async fetchOrders(params: any = {}): Promise<any> {
        await this.ensureTokensLoaded();

        try {
            const response = await axios.get(
                `${this.getShopBaseUrl()}/orders.json`,
                {
                    headers: this.getAuthHeaders(),
                    params: {
                        limit: params.limit || 250,
                        status: 'any',
                        created_at_min: params.createdAfter ||
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                    }
                }
            );

            return response.data;

        } catch (error: any) {
            console.error('❌ fetchOrders failed:', error.response?.data);
            return { orders: [] };
        }
    }

    // ─── FETCH STATS ───────────────────────────────────────────
    async fetchStats(): Promise<any> {
        await this.ensureTokensLoaded();

        console.log('\n📊 Fetching Shopify stats...');

        try {
            const [ordersData, productsData] = await Promise.all([
                this.fetchOrders({ limit: 250 }),
                this.fetchProducts({ limit: 250 })
            ]);

            const allOrders = ordersData.orders || [];
            const allProducts = productsData.listings || [];

            const stats = {
                totalSales: allOrders.length,
                pendingOrders: allOrders.filter((o: any) =>
                    o.fulfillment_status === null ||
                    o.fulfillment_status === 'partial'
                ).length,
                activeListings: allProducts.filter((p: any) =>
                    p.status === 'active'
                ).length,
                totalRevenue: allOrders.reduce(
                    (sum: number, o: any) => sum + parseFloat(o.total_price || 0), 0
                ),
                revenue24h: this.calculateRevenue24h(allOrders),
                growth: this.calculateGrowth(allOrders)
            };

            this.connection.stats = stats;
            this.connection.lastSync = new Date();
            await this.connection.save();

            console.log('✅ Shopify stats updated:', stats);
            return stats;

        } catch (error: any) {
            console.error('❌ fetchStats failed:', error.message);
            return {
                totalSales: 0,
                pendingOrders: 0,
                activeListings: 0,
                totalRevenue: 0,
                revenue24h: 0,
                growth: 0
            };
        }
    }

    // ─── PRIVATE HELPERS ───────────────────────────────────────
    private calculateRevenue24h(orders: any[]): number {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return orders
            .filter(o => new Date(o.created_at) >= yesterday)
            .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
    }

    private calculateGrowth(orders: any[]): number {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const last14Days = new Date();
        last14Days.setDate(last14Days.getDate() - 14);

        const revenueLastWeek = orders
            .filter(o => new Date(o.created_at) >= last7Days)
            .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

        const revenuePreviousWeek = orders
            .filter(o => {
                const date = new Date(o.created_at);
                return date >= last14Days && date < last7Days;
            })
            .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

        return revenuePreviousWeek > 0
            ? ((revenueLastWeek - revenuePreviousWeek) / revenuePreviousWeek) * 100
            : 0;
    }
}
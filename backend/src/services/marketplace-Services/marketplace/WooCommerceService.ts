import { BaseMarketplaceService } from '../BaseMarketplaceService'

import axios from 'axios';


export class WooCommerceService extends BaseMarketplaceService {

    // ── Base URL ──────────────────────────────────────────────────────────────

    private getBaseUrl(): string {
        const storeUrl = this.credentials.storeUrl?.replace(/\/$/, '');
        if (!storeUrl) throw new Error('storeUrl is required in WooCommerce credentials');
        return `${storeUrl}/wp-json/wc/v3`;
    }

    // ── Auth — WooCommerce uses HTTP Basic with ck_ / cs_ ─────────────────────

    private getAuthParams(): Record<string, string> {
        return {
            consumer_key:    this.credentials.consumerKey,
            consumer_secret: this.credentials.consumerSecret,
        };
    }

    // WooCommerce does not use Bearer tokens — override getAuthHeaders to be empty
    protected getAuthHeaders(): Record<string, string> {
        return { 'Content-Type': 'application/json' };
    }

    // ── Not needed (no OAuth) ─────────────────────────────────────────────────

    getAuthorizationUrl(_state: string): string {
        throw new Error('WooCommerce does not use OAuth');
    }

    async exchangeCodeForTokens(_code: string): Promise<any> {
        return null;
    }

    async refreshAccessToken(): Promise<any> {
        return null; // API keys never expire
    }

    // ── Test Connection ───────────────────────────────────────────────────────

    async testConnection(): Promise<boolean> {
        try {
            const url = `${this.getBaseUrl()}/system_status`;
            console.log(`🔗 WooCommerce test URL: ${url}`);

            await axios.get(url, { params: this.getAuthParams() });
            console.log('✅ WooCommerce connection successful');
            return true;
        } catch (error: any) {
            console.error('❌ WooCommerce test failed:', error.response?.data ?? error.message);
            return false;
        }
    }

    // ── Fetch Products (normalised) ───────────────────────────────────────────

    async fetchProducts(params: any = {}): Promise<any> {
        try {
            const perPage = params.limit ?? 100;
            let page = 1;
            const allListings: any[] = [];

            // WooCommerce paginates — loop until all fetched
            while (true) {
                const response = await axios.get(`${this.getBaseUrl()}/products`, {
                    params: {
                        ...this.getAuthParams(),
                        per_page: perPage,
                        page,
                        status: 'publish',
                    },
                });

                const raw: any[] = response.data ?? [];
                if (!raw.length) break;

                for (const p of raw) {
                    // Simple product
                    if (p.type === 'simple') {
                        allListings.push({
                            externalId: String(p.id),
                            sku:        p.sku ?? '',
                            title:      p.name,
                            price:      parseFloat(p.price ?? '0'),
                            quantity:   p.stock_quantity ?? 0,
                            status:     p.status === 'publish' ? 'active' : 'inactive',
                            imageUrl:   p.images?.[0]?.src,
                            viewUrl:    p.permalink,
                            raw:        p,
                        });
                    }

                    // Variable product — each variation is a separate listing
                    if (p.type === 'variable' && p.variations?.length) {
                        const variationResponses = await Promise.all(
                            p.variations.map((varId: number) =>
                                axios.get(`${this.getBaseUrl()}/products/${p.id}/variations/${varId}`, {
                                    params: this.getAuthParams(),
                                })
                            )
                        );

                        for (const vRes of variationResponses) {
                            const v = vRes.data;
                            allListings.push({
                                externalId: `${p.id}-${v.id}`,
                                sku:        v.sku ?? p.sku ?? '',
                                title:      `${p.name} — ${v.attributes?.map((a: any) => a.option).join(', ')}`,
                                price:      parseFloat(v.price ?? '0'),
                                quantity:   v.stock_quantity ?? 0,
                                status:     v.status === 'publish' ? 'active' : 'inactive',
                                imageUrl:   v.image?.src ?? p.images?.[0]?.src,
                                viewUrl:    p.permalink,
                                raw:        v,
                            });
                        }
                    }
                }

                // If fewer results than perPage, we're on the last page
                if (raw.length < perPage) break;
                page++;
            }

            console.log(`✅ WooCommerce: fetched ${allListings.length} listings`);
            return { success: true, totalListings: allListings.length, listings: allListings };

        } catch (error: any) {
            console.error('❌ WooCommerce fetchProducts failed:', error.response?.data ?? error.message);
            return { success: false, totalListings: 0, listings: [] };
        }
    }

    // ── List (create) a product ───────────────────────────────────────────────

    async listProduct(productData: any): Promise<any> {
        console.log("request is coming inside of the list")
        const payload = {
            name:               productData.title,
            type:               'simple',
            status:             'publish',
            description:        productData.description ?? '',
            short_description:  productData.description ?? '',
            sku:                productData.sku,
            regular_price:      String(productData.price),
            sale_price:         productData.comparePrice ? String(productData.comparePrice) : '',
            manage_stock:       true,
            stock_quantity:     productData.quantity,
            weight:             productData.weight ? String(productData.weight) : '',
            images:             productData.images?.map((src) => ({ src })) ?? [],
            tags:               productData.tags
                                    ? productData.tags.split(',').map((t: string) => ({ name: t.trim() }))
                                    : [],
        };

        try {
            const response = await axios.post(
                `${this.getBaseUrl()}/products`,
                payload,
                { params: this.getAuthParams() }
            );

            const product = response.data;
            console.log(`✅ WooCommerce: product listed — ID ${product.id}`);

            return {
                success:    true,
                externalId: String(product.id),
                viewUrl:    product.permalink,
                adminUrl:   `${this.credentials.storeUrl}/wp-admin/post.php?post=${product.id}&action=edit`,
            };

        } catch (error: any) {
            console.error('❌ WooCommerce listProduct failed:', error.response?.data);
            throw new Error(
                `WooCommerce listing failed: ${JSON.stringify(error.response?.data ?? error.message)}`
            );
        }
    }

    // ── Update stock quantity ─────────────────────────────────────────────────

    async updateStock(externalId: string, quantity: number): Promise<boolean> {
        try {
            await axios.put(
                `${this.getBaseUrl()}/products/${externalId}`,
                { stock_quantity: quantity, manage_stock: true },
                { params: this.getAuthParams() }
            );
            console.log(`✅ WooCommerce stock updated — ID ${externalId} → ${quantity}`);
            return true;
        } catch (error: any) {
            console.error('❌ updateStock failed:', error.response?.data);
            return false;
        }
    }

    // ── Fetch Orders ──────────────────────────────────────────────────────────

    async fetchOrders(params: any = {}): Promise<any> {
        try {
            const response = await axios.get(`${this.getBaseUrl()}/orders`, {
                params: {
                    ...this.getAuthParams(),
                    per_page: params.limit ?? 100,
                    after: params.createdAfter
                        ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
            });
            return { orders: response.data };
        } catch (error: any) {
            console.error('❌ WooCommerce fetchOrders failed:', error.response?.data);
            return { orders: [] };
        }
    }

    // ── Fetch Stats ───────────────────────────────────────────────────────────

    async fetchStats(): Promise<any> {
        try {
            const [ordersData, productsData] = await Promise.all([
                this.fetchOrders({ limit: 100 }),
                this.fetchProducts({ limit: 100 }),
            ]);

            const orders   = ordersData.orders ?? [];
            const listings = productsData.listings ?? [];

            const stats = {
                totalSales:     orders.length,
                pendingOrders:  orders.filter((o: any) => o.status === 'processing').length,
                activeListings: listings.filter((p: any) => p.status === 'active').length,
                totalRevenue:   orders.reduce((s: number, o: any) => s + parseFloat(o.total ?? 0), 0),
                revenue24h:     this.calcRevenue24h(orders),
                growth:         this.calcGrowth(orders),
            };

            this.connection.stats    = stats;
            this.connection.lastSync = new Date();
            await this.connection.save();

            return stats;
        } catch (error: any) {
            console.error('❌ fetchStats failed:', error.message);
            return { totalSales: 0, pendingOrders: 0, activeListings: 0, totalRevenue: 0 };
        }
    }

    private calcRevenue24h(orders: any[]): number {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return orders
            .filter((o) => new Date(o.date_created) >= cutoff)
            .reduce((s, o) => s + parseFloat(o.total ?? 0), 0);
    }

    private calcGrowth(orders: any[]): number {
        const now  = Date.now();
        const week = 7 * 24 * 60 * 60 * 1000;
        const thisWeek = orders
            .filter((o) => new Date(o.date_created).getTime() >= now - week)
            .reduce((s, o) => s + parseFloat(o.total ?? 0), 0);
        const prevWeek = orders
            .filter((o) => {
                const t = new Date(o.date_created).getTime();
                return t >= now - 2 * week && t < now - week;
            })
            .reduce((s, o) => s + parseFloat(o.total ?? 0), 0);
        return prevWeek > 0 ? ((thisWeek - prevWeek) / prevWeek) * 100 : 0;
    }
}
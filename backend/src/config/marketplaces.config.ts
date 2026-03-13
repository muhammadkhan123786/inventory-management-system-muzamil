export interface MarketplaceConfig {
    name?: string;
    type: string;
    _id?: string;
    authType: 'oauth2' | 'oauth2_user' | 'api_key';
    requiresOAuth: boolean;
    credentialFields: Array<{
        key: string;
        label: string;
        type: 'text' | 'password';
        required: boolean;
        placeholder: string;
    }>;
    environments: {
        sandbox?: {
            baseUrl: string;
            tokenUrl?: string;
            authorizeUrl?: string;
            scopes?: string[];
        };
        production: {
            baseUrl: string;
            tokenUrl?: string;
            authorizeUrl?: string;
            scopes?: string[];
        };
    };
    endpoints: Record<string, string>;
}

export const MARKETPLACE_CONFIGS: Record<string, MarketplaceConfig> = {
    ebay: {
        name: 'eBay',
        type: 'ebay',
        authType: 'oauth2_user',
        requiresOAuth: true,
        credentialFields: [
            {
                key: 'clientId',
                label: 'App ID (Client ID)',
                type: 'text',
                required: true,
                placeholder: 'YourApp-YourName-PRD-...'
            },
            {
                key: 'clientSecret',
                label: 'Cert ID (Client Secret)',
                type: 'password',
                required: true,
                placeholder: 'PRD-...'
            },
            {
                key: 'devId',
                label: 'Dev ID (Optional)',
                type: 'text',
                required: false,
                placeholder: 'Optional for Trading API'
            },
            {
                key: 'ruName',
                label: 'RuName (OAuth Redirect URL Name)',
                type: 'text',
                required: true,
                placeholder: 'YourName-YourApp-SBX-...'
            }
        ],
        environments: {
            sandbox: {
                baseUrl: 'https://api.sandbox.ebay.com',
                tokenUrl: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
                authorizeUrl: 'https://auth.sandbox.ebay.com/oauth2/authorize',
                scopes: [
                    'https://api.ebay.com/oauth/api_scope/sell.inventory',
                    'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
                    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.finances',
                    'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.account',           // ← ADD THIS
                    'https://api.ebay.com/oauth/api_scope/sell.account.readonly'
                ]
            },
            production: {
                baseUrl: 'https://api.ebay.com',
                tokenUrl: 'https://api.ebay.com/identity/v1/oauth2/token',
                authorizeUrl: 'https://auth.ebay.com/oauth2/authorize',
                scopes: [
                    'https://api.ebay.com/oauth/api_scope/sell.inventory',
                    'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
                    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.finances',
                    'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
                    'https://api.ebay.com/oauth/api_scope/sell.account.readonly'
                ]
            }
        },
        endpoints: {
            orders: '/sell/fulfillment/v1/order',
            inventory: '/sell/inventory/v1/inventory_item',
            analytics: '/sell/analytics/v1/traffic_report',
            transactions: '/sell/finances/v1/transaction'
        }
    },

    tiktok: {
        name: 'TikTok Shop',
        type: 'tiktok',
        authType: 'oauth2',
        requiresOAuth: true,
        credentialFields: [
            {
                key: 'clientKey',
                label: 'Client Key',
                type: 'text',
                required: true,
                placeholder: 'Your TikTok Client Key'
            },
            {
                key: 'clientSecret',
                label: 'Client Secret',
                type: 'password',
                required: true,
                placeholder: 'Your TikTok Client Secret'
            }
        ],
        environments: {
            sandbox: {
                baseUrl: 'https://open-api.tiktokglobalshop.com',
                tokenUrl: 'https://auth.tiktok-shops.com/api/v2/token/get',
                authorizeUrl: 'https://auth.tiktok-shops.com/oauth/authorize',
                scopes: [
                    'product.list',
                    'product.create',
                    'product.update',
                    'order.list',
                    'shop.info',
                    'inventory.read',
                    'inventory.write'
                ]
            },
            production: {
                baseUrl: 'https://open-api.tiktokglobalshop.com',
                tokenUrl: 'https://auth.tiktok-shops.com/api/v2/token/get',
                authorizeUrl: 'https://auth.tiktok-shops.com/oauth/authorize',
                scopes: [
                    'product.list',
                    'product.create',
                    'product.update',
                    'order.list',
                    'shop.info',
                    'inventory.read',
                    'inventory.write'
                ]
            }
        },
        endpoints: {
            products: '/api/products/search',
            orders: '/api/orders/search',
            shop: '/api/shop/get'
        }
    },

    amazon: {
        name: 'Amazon',
        type: 'amazon',
        authType: 'oauth2_user',
        requiresOAuth: true,
        credentialFields: [
            {
                key: 'clientId',
                label: 'LWA Client ID',
                type: 'text',
                required: true,
                placeholder: 'amzn1.application-oa2-client...'
            },
            {
                key: 'clientSecret',
                label: 'LWA Client Secret',
                type: 'password',
                required: true,
                placeholder: 'Your client secret'
            },
            {
                key: 'sellerId',
                label: 'Seller ID',
                type: 'text',
                required: true,
                placeholder: 'A1XXXXXXXXXXXX'
            }
        ],
        environments: {
            production: {
                baseUrl: 'https://sellingpartnerapi-na.amazon.com',
                tokenUrl: 'https://api.amazon.com/auth/o2/token',
                authorizeUrl: 'https://sellercentral.amazon.com/apps/authorize/consent',
                scopes: ['sellingpartnerapi::notifications', 'sellingpartnerapi::migration']
            }
        },
        endpoints: {
            orders: '/orders/v0/orders',
            inventory: '/fba/inventory/v1/summaries',
            finances: '/finances/v0/financialEvents'
        }
    },

    // src/config/marketplaces.config.ts

    shopify: {
        type: 'shopify',
        // name: 'Shopify',
        authType: 'api_key',
        requiresOAuth: false,  // ← Direct token, no OAuth!
        credentialFields: [
            {
                key: 'shopUrl',
                label: 'Shop Url',
                type: 'text',
                required: true,
                placeholder: 'your-store-name (without .myshopify.com)'
            },
            {
                key: 'accessToken',
                label: 'Access Token',
                type: 'password',
                required: true,
                placeholder: 'shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            },
            {
                key: 'apiKey',
                label: 'API Key',
                type: 'text',
                required: false,
                placeholder: 'Your API Key (optional)'
            },
            {
                key: 'apiSecret',
                label: 'API Secret',
                type: 'password',
                required: false,
                placeholder: 'Your API Secret (optional)'
            }
        ],
        environments: {
            production: {
                baseUrl: 'https://{shop}.myshopify.com/admin/api/2024-01',
                scopes: [
                    'read_products',
                    'write_products',
                    'read_orders',
                    'write_orders',
                    'read_inventory',
                    'write_inventory'
                ]
            }
        },
        endpoints: {
            products: '/products.json',
            orders: '/orders.json',
            inventory: '/inventory_items.json'
        }
    },

    etsy: {
        name: 'Etsy',
        type: 'etsy',
        authType: 'oauth2',
        requiresOAuth: true,
        credentialFields: [
            {
                key: 'clientId',
                label: 'Keystring',
                type: 'text',
                required: true,
                placeholder: 'Your Etsy Keystring'
            },
            {
                key: 'clientSecret',
                label: 'Shared Secret',
                type: 'password',
                required: true,
                placeholder: 'Your Etsy Shared Secret'
            }
        ],
        environments: {
            production: {
                baseUrl: 'https://openapi.etsy.com/v3',
                tokenUrl: 'https://api.etsy.com/v3/public/oauth/token',
                authorizeUrl: 'https://www.etsy.com/oauth/connect',
                scopes: ['listings_r', 'transactions_r', 'shops_r']
            }
        },
        endpoints: {
            receipts: '/application/shops/{shop_id}/receipts',
            listings: '/application/shops/{shop_id}/listings/active'
        }
    },

    woocommerce: {
        name: 'WooCommerce',
        type: 'woocommerce',
        authType: 'api_key',
        requiresOAuth: false,
        credentialFields: [
            {
                key: 'storeUrl',
                label: 'Store URL',
                type: 'text',
                required: true,
                placeholder: 'https://yourstore.com'
            },
            {
                key: 'consumerKey',
                label: 'Consumer Key',
                type: 'text',
                required: true,
                placeholder: 'ck_...'
            },
            {
                key: 'consumerSecret',
                label: 'Consumer Secret',
                type: 'password',
                required: true,
                placeholder: 'cs_...'
            }
        ],
        environments: {
            production: {
                baseUrl: '{storeUrl}/wp-json/wc/v3'
            }
        },
        endpoints: {
            orders: '/orders',
            products: '/products'
        }
    }
};
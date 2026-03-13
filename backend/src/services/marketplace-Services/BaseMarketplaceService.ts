// services/BaseMarketplaceService.ts

import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { decryptCredentials, encryptCredentials } from '../../utils/encryption';

export abstract class BaseMarketplaceService {
    protected connection: any;
    protected credentials: any;
    protected tokens: any;
    protected axiosInstance: AxiosInstance;
    protected baseUrl: string;

    constructor(connection: any) {
        this.connection = connection;
        this.credentials = decryptCredentials(connection.credentials);
        this.tokens = connection.tokens ? decryptCredentials(connection.tokens) : null;

        const config = connection.apiConfiguration;
        this.baseUrl = config.baseUrl;

        // Create axios instance
        this.axiosInstance = axios.create({
            timeout: 30000,
            httpsAgent: new https.Agent({
                rejectUnauthorized: true,
                keepAlive: true
            })
        });
    }

    /**
     * Abstract methods - must be implemented by each marketplace
     */
    abstract getAuthorizationUrl(state: string): string;
    abstract exchangeCodeForTokens(code: string): Promise<any>;
    abstract refreshAccessToken(): Promise<any>;
    abstract testConnection(): Promise<boolean>;
    abstract fetchOrders(params?: any): Promise<any>;
    abstract fetchProducts(params?: any): Promise<any>;
    abstract fetchStats(): Promise<any>;

    /**
     * Common method to get authenticated headers
     */
    protected getAuthHeaders(): Record<string, string> {
        if (!this.tokens?.accessToken) {
            throw new Error('No access token available');
        }

        return {
            'Authorization': `Bearer ${this.tokens.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Save tokens to database
     */
    protected async saveTokens(tokens: any): Promise<void> {
        const encryptedTokens = encryptCredentials(tokens);

        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + (tokens.expiresIn || 7200));

        this.connection.tokens = encryptedTokens;
        this.connection.tokenExpiry = tokenExpiry;
        this.connection.status = 'connected';
        await this.connection.save();

        console.log(`✅ Tokens saved for ${this.connection.type} connection ${this.connection._id}`);
    }

    /**
     * Check if token needs refresh
     */
    needsTokenRefresh(): boolean {
        return this.connection.needsTokenRefresh();
    }

    /**
     * Auto-refresh token if needed
     */
    async ensureValidToken(): Promise<void> {
        if (this.needsTokenRefresh()) {
            console.log(`🔄 Token needs refresh for ${this.connection.type}`);
            await this.refreshAccessToken();
        }
    }
}
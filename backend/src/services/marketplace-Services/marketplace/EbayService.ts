// src/services/marketplace-Services/marketplace/EbayService.ts

import { BaseMarketplaceService } from "../BaseMarketplaceService";
import axios from "axios";
import { MARKETPLACE_CONFIGS } from "../../../config/marketplaces.config";

export class EbayService extends BaseMarketplaceService {

  // ============================================================
  // AUTH METHODS
  // ============================================================

  getAuthorizationUrl(state: string): string {
    const config = MARKETPLACE_CONFIGS.ebay;
    const env = this.connection.apiConfiguration.environment || "sandbox";
    const envConfig = config.environments[env];

    if (!envConfig) throw new Error(`No config for environment: ${env}`);

    const clientId = this.credentials.clientId;
    const ruName = this.credentials.ruName;

    if (!clientId) throw new Error('Client ID is required');
    if (!ruName) throw new Error('RuName is required');

    // ✅ FIX: Use actual callback URL, not RuName!
    const redirectUri = `${process.env.BACKEND_URL}/api/marketplace/callback/ebay`;

    console.log('\n🔗 eBay OAuth URL Generation');
    console.log('Client ID:', clientId);
    console.log('RuName:', ruName);
    console.log('Redirect URI:', redirectUri);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,  // ✅ Actual callback URL
      response_type: "code",
      scope: (envConfig.scopes || []).join(" "),
      state,
    });

    const authUrl = `${envConfig.authorizeUrl}?${params.toString()}`;
    console.log('Auth URL:', authUrl);

    return authUrl;
  }

  async exchangeCodeForTokens(code: string): Promise<any> {
    const env = this.connection.apiConfiguration.environment || "sandbox";
    const envConfig = MARKETPLACE_CONFIGS.ebay.environments[env];

    console.log('\n🔐 eBay Token Exchange');
    console.log('Code:', code?.substring(0, 20) + '...');

    const authString = Buffer.from(
      `${this.credentials.clientId}:${this.credentials.clientSecret}`
    ).toString("base64");

    // ✅ FIX: Use actual callback URL here too
    const redirectUri = `${process.env.BACKEND_URL}/api/marketplace/callback/ebay`;

    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,  // ✅ Must match authorization URL
    }).toString();

    try {
      const response = await axios.post(envConfig.tokenUrl!, requestBody, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authString}`,
        },
      });

      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };

      await this.saveTokens(tokens);
      this.tokens = tokens;

      console.log("✅ eBay tokens saved successfully");
      return tokens;

    } catch (error: any) {
      console.error("❌ Token exchange failed:", error.response?.data);
      throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async refreshAccessToken(): Promise<any> {
    if (!this.tokens?.refreshToken) {
      console.error('❌ No refresh token available');
      throw new Error('No refresh token available. Please re-authorize the connection.');
    }

    console.log('🔄 Refreshing eBay access token...');

    const tokenUrl = this.connection.apiConfiguration?.tokenUrl;
    if (!tokenUrl) {
      throw new Error('Token URL not configured');
    }

    try {
      const credentials = Buffer.from(
        `${this.credentials.clientId}:${this.credentials.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.tokens.refreshToken,
          scope: this.connection.apiConfiguration?.scopes?.join(' ') || ''
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`
          }
        }
      );

      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || this.tokens.refreshToken,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };

      await this.saveTokens(tokens);
      this.tokens = tokens;

      console.log('✅ eBay token refreshed successfully');
      return tokens;

    } catch (error: any) {
      console.error('❌ eBay token refresh failed:', error.response?.data || error.message);
      throw new Error('Token refresh failed. Please re-authorize the connection.');
    }
  }

  // ============================================================
  // HELPER: AUTH HEADERS
  // ============================================================

  protected getAuthHeaders(): Record<string, string> {
    if (!this.tokens?.accessToken) throw new Error("No access token available");
    return {
      Authorization: `Bearer ${this.tokens.accessToken}`,
      "Content-Type": "application/json",
      "Content-Language": "en-US",
    };
  }

  // ============================================================
  // CONNECTION TEST
  // ============================================================

  async testConnection(): Promise<boolean> {
    await this.ensureValidToken();

    console.log('🧪 Testing eBay connection...');

    try {
      await this.axiosInstance.get(`${this.baseUrl}/sell/fulfillment/v1/order`, {
        headers: this.getAuthHeaders(),
        params: { limit: 1 },
      });

      console.log('✅ eBay connection test passed');
      return true;

    } catch (error: any) {
      console.error("❌ eBay connection test failed:", error.response?.data || error.message);
      return false;
    }
  }


  // ============================================================
  // INVENTORY LOCATION SETUP (one-time setup)
  // ============================================================

  async createOrGetLocation(locationData?: any): Promise<string> {
    await this.ensureValidToken();

    const locationKey = locationData?.locationKey || `warehouse-${Date.now()}`;

    const body = {
      location: {
        address: {
          addressLine1: locationData?.address?.line1 || "2025 Hamilton Ave",
          city: locationData?.address?.city || "San Jose",
          stateOrProvince: locationData?.address?.state || "CA",
          postalCode: locationData?.address?.zipCode || "95125",
          country: locationData?.address?.country || "US",
        },
      },
      locationInstructions: "Items ship from this warehouse.",
      name: locationData?.name || "Main Warehouse",
      merchantLocationStatus: "ENABLED",
      locationTypes: ["WAREHOUSE"],
    };

    try {
      await this.axiosInstance.post(
        `${this.baseUrl}/sell/inventory/v1/location/${locationKey}`,
        body,
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ Location created: ${locationKey}`);
    } catch (error: any) {
      // 409 = already exists - that's fine!
      if (error.response?.status === 409 ||
        error.response?.data?.errors?.[0]?.errorId === 25002) {
        console.log(`✅ Location already exists: ${locationKey}`);
      } else {
        console.error("❌ Location creation failed:", error.response?.data);
        throw new Error(
          `Location failed: ${error.response?.data?.errors?.[0]?.message || error.message}`
        );
      }
    }

    return locationKey;
  }

  // ============================================================
  // PRODUCT LISTING (Inventory API)
  // ============================================================

  async listProduct(productData: any): Promise<any> {
    await this.ensureValidToken();

    console.log("\n📦 eBay Inventory API - Listing Product");
    console.log("Title:", productData.title);
    console.log("Price:", productData.price);

    // ─── Validate required fields ───────────────────────────
    if (!productData.title) throw new Error("Product title is required");
    if (!productData.price) throw new Error("Product price is required");
    if (!productData.fulfillmentPolicyId && !productData.listingPolicies?.fulfillmentPolicyId) {
      throw new Error("fulfillmentPolicyId is required");
    }
    if (!productData.paymentPolicyId && !productData.listingPolicies?.paymentPolicyId) {
      throw new Error("paymentPolicyId is required");
    }
    if (!productData.returnPolicyId && !productData.listingPolicies?.returnPolicyId) {
      throw new Error("returnPolicyId is required");
    }

    // ─── Normalize policy IDs (support both formats) ─────────
    const fulfillmentPolicyId =
      productData.fulfillmentPolicyId ||
      productData.listingPolicies?.fulfillmentPolicyId;
    const paymentPolicyId =
      productData.paymentPolicyId ||
      productData.listingPolicies?.paymentPolicyId;
    const returnPolicyId =
      productData.returnPolicyId ||
      productData.listingPolicies?.returnPolicyId;

    // ─── Generate SKU ─────────────────────────────────────────
    const sku = productData.sku || `SKU-${Date.now()}`;

    // ─── Setup Location ───────────────────────────────────────
    let locationKey = productData.locationKey || productData.merchantLocationKey;

    if (!locationKey) {
      console.log("📍 No locationKey provided - creating one...");
      locationKey = await this.createOrGetLocation(productData.location);
    }

    // ─── STEP 1: Create Inventory Item ───────────────────────
    console.log(`\n1️⃣ Creating inventory item (SKU: ${sku})...`);

    // Handle images - eBay requires at least one valid image
    // If no images, use a placeholder (or omit imageUrls)
    const imageUrls = productData.images?.filter((url: string) => url && url.startsWith("http")) || [];

    const inventoryItem: any = {
      availability: {
        shipToLocationAvailability: {
          quantity: productData.quantity || 1,
        },
      },
      condition: productData.condition || "NEW",
      product: {
        title: productData.title,
        description: productData.description || productData.title,
        aspects: productData.aspects || productData.itemSpecifics || {},
      },
    };

    // Only add imageUrls if we have valid URLs
    if (imageUrls.length > 0) {
      inventoryItem.product.imageUrls = imageUrls;
    }

    // Add optional fields
    if (productData.ean) inventoryItem.product.ean = [productData.ean];
    if (productData.upc) inventoryItem.product.upc = [productData.upc];
    if (productData.isbn) inventoryItem.product.isbn = [productData.isbn];
    if (productData.mpn) inventoryItem.product.mpn = productData.mpn;
    if (productData.brand) inventoryItem.product.brand = productData.brand;

    try {
      await this.axiosInstance.put(
        `${this.baseUrl}/sell/inventory/v1/inventory_item/${sku}`,
        inventoryItem,
        { headers: this.getAuthHeaders() }
      );
      console.log("✅ Inventory item created/updated");
    } catch (error: any) {
      console.error("❌ Inventory item failed:", JSON.stringify(error.response?.data, null, 2));
      throw new Error(
        `Inventory item failed: ${error.response?.data?.errors?.[0]?.longMessage ||
        error.response?.data?.errors?.[0]?.message || error.message}`
      );
    }

    // ─── STEP 2: Create Offer ─────────────────────────────────
    console.log("\n2️⃣ Creating offer...");

    const offer: any = {
      sku: sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      listingDescription: productData.description || productData.title,
      availableQuantity: productData.quantity || 1,
      categoryId: productData.categoryId || "20349",
      listingPolicies: {
        fulfillmentPolicyId,
        paymentPolicyId,
        returnPolicyId,
      },
      pricingSummary: {
        price: {
          value: parseFloat(productData.price).toFixed(2),
          currency: productData.currency || "USD",
        },
      },
      merchantLocationKey: locationKey,
    };

    // Optional offer fields
    if (productData.listingStartDate) offer.listingStartDate = productData.listingStartDate;
    if (productData.storeCategoryNames) offer.storeCategoryNames = productData.storeCategoryNames;

    let offerId: string;

    try {
      const offerResponse = await this.axiosInstance.post(
        `${this.baseUrl}/sell/inventory/v1/offer`,
        offer,
        { headers: this.getAuthHeaders() }
      );
      offerId = offerResponse.data.offerId;
      console.log(`✅ Offer created: ${offerId}`);
    } catch (error: any) {
      console.error("❌ Offer failed:", JSON.stringify(error.response?.data, null, 2));
      throw new Error(
        `Offer failed: ${error.response?.data?.errors?.[0]?.longMessage ||
        error.response?.data?.errors?.[0]?.message || error.message}`
      );
    }

    // ─── STEP 3: Publish Offer ────────────────────────────────
    console.log("\n3️⃣ Publishing offer...");

    try {
      const publishResponse = await this.axiosInstance.post(
        `${this.baseUrl}/sell/inventory/v1/offer/${offerId}/publish`,
        {},
        { headers: this.getAuthHeaders() }
      );

      const listingId = publishResponse.data.listingId;
      const env = this.connection.apiConfiguration.environment || "sandbox";

      console.log(`✅ Product published! Listing ID: ${listingId}`);

      return {
        success: true,
        sku,
        offerId,
        listingId,
        locationKey,
        status: "PUBLISHED",
        viewUrl:
          env === "sandbox"
            ? `https://www.sandbox.ebay.com/itm/${listingId}`
            : `https://www.ebay.com/itm/${listingId}`,
      };

    } catch (error: any) {
      console.error("❌ Publish failed:", JSON.stringify(error.response?.data, null, 2));
      throw new Error(
        `Publish failed: ${error.response?.data?.errors?.[0]?.longMessage ||
        error.response?.data?.errors?.[0]?.message || error.message}`
      );
    }
  }

  // ============================================================
  // FETCH PRODUCTS (for sync)
  // ============================================================

  async fetchProducts(params: any = {}): Promise<any> {
    await this.ensureValidToken();

    console.log("\n📦 Fetching inventory items...");

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/sell/inventory/v1/inventory_item`,
        {
          headers: this.getAuthHeaders(),
          params: {
            limit: params.limit || 100,
            offset: params.offset || 0,
          },
        }
      );

      const items = response.data.inventoryItems || [];
      console.log(`✅ Found ${items.length} inventory items`);

      return {
        success: true,
        totalListings: items.length,
        listings: items.map((item: any) => ({
          sku: item.sku,
          title: item.product?.title || "No title",
          quantity: item.availability?.shipToLocationAvailability?.quantity || 0,
          condition: item.condition,
          images: item.product?.imageUrls || [],
        })),
        rawData: items,
      };

    } catch (error: any) {
      console.error("❌ fetchProducts failed:", error.response?.data);
      return { success: false, totalListings: 0, listings: [] };
    }
  }

  // ============================================================
  // FETCH ORDERS
  // ============================================================

  async fetchOrders(params: any = {}): Promise<any> {
    await this.ensureValidToken();

    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/sell/fulfillment/v1/order`,
        {
          headers: this.getAuthHeaders(),
          params: {
            limit: params.limit || 100,
            offset: params.offset || 0,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ fetchOrders failed:", error.response?.data);
      return { orders: [] };
    }
  }

  // ============================================================
  // FETCH STATS (for sync)
  // ============================================================

  async fetchStats(): Promise<any> {
    await this.ensureValidToken();

    console.log("\n📊 Fetching eBay stats...");

    try {
      const [ordersData, productsData, transactionsData] = await Promise.all([
        this.fetchOrders({ limit: 200 }),
        this.fetchProducts({ limit: 200 }),
        this.fetchTransactions(),
      ]);

      const allOrders = ordersData.orders || [];
      const allProducts = productsData.listings || [];
      const allTransactions = transactionsData.transactions || [];

      const stats = {
        totalSales: allOrders.length,
        pendingOrders: allOrders.filter(
          (o: any) =>
            o.orderFulfillmentStatus === "NOT_STARTED" ||
            o.orderFulfillmentStatus === "IN_PROGRESS"
        ).length,
        activeListings: allProducts.filter(
          (p: any) => (p.quantity || 0) > 0
        ).length,
        totalRevenue: allTransactions.reduce(
          (sum: number, t: any) => sum + parseFloat(t.amount?.value || 0),
          0
        ),
        revenue24h: this.calculateRevenue24h(allTransactions),
        growth: this.calculateGrowth(allTransactions),
      };

      // Save stats to connection
      this.connection.stats = stats;
      this.connection.lastSync = new Date();
      await this.connection.save();

      console.log("✅ Stats updated:", stats);
      return stats;

    } catch (error: any) {
      console.error("❌ fetchStats failed:", error.message);

      // Return zero stats instead of throwing
      const zeroStats = {
        totalSales: 0,
        pendingOrders: 0,
        activeListings: 0,
        totalRevenue: 0,
        revenue24h: 0,
        growth: 0,
      };

      this.connection.stats = zeroStats;
      this.connection.lastSync = new Date();
      await this.connection.save();

      return zeroStats;
    }
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async fetchTransactions(): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        `${this.baseUrl}/sell/finances/v1/transaction`,
        {
          headers: this.getAuthHeaders(),
          params: { limit: 200 },
        }
      );
      return response.data;
    } catch (error) {
      return { transactions: [] };
    }
  }

  private calculateRevenue24h(transactions: any[]): number {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return transactions
      .filter((t) => new Date(t.transactionDate) >= yesterday)
      .reduce((sum, t) => sum + parseFloat(t.amount?.value || 0), 0);
  }

  private calculateGrowth(transactions: any[]): number {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const last14Days = new Date();
    last14Days.setDate(last14Days.getDate() - 14);

    const revenueLastWeek = transactions
      .filter((t) => new Date(t.transactionDate) >= last7Days)
      .reduce((sum, t) => sum + parseFloat(t.amount?.value || 0), 0);

    const revenuePreviousWeek = transactions
      .filter((t) => {
        const date = new Date(t.transactionDate);
        return date >= last14Days && date < last7Days;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount?.value || 0), 0);

    return revenuePreviousWeek > 0
      ? ((revenueLastWeek - revenuePreviousWeek) / revenuePreviousWeek) * 100
      : 0;
  }
}
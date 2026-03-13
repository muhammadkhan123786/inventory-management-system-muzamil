// services/MarketplaceServiceFactory.ts

import { BaseMarketplaceService } from "./BaseMarketplaceService";
import { EbayService } from "../marketplace-Services/marketplace/EbayService";
// import { AmazonService } from './AmazonService';
import { ShopifyService } from "../marketplace-Services/marketplace/ShopifyService";
import { WooCommerceService } from "./marketplace/WooCommerceService";
// import { TikTokService } from './TikTokService';
// Import other services...

export class MarketplaceServiceFactory {
  static createService(connection: any): BaseMarketplaceService {
    switch (connection.type) {
      case "ebay":
        return new EbayService(connection);

      // case 'amazon':
      //     return new AmazonService(connection);

      case "shopify":
        return new ShopifyService(connection);
      case "woocommerce":
        return new WooCommerceService(connection);
      // case 'tiktok': return new TikTokService(connection);

      // Add other marketplaces...

      default:
        throw new Error(`Unsupported marketplace type: ${connection.type}`);
    }
  }
}


/* =========================
   BACKEND TEMPLATE TYPE
========================= */
export interface MarketplaceTemplate {
  _id: string;
  name: string;
  code: string;
  description: string;

  icon: {
    _id: string;
    icon: string[];
  };

  color: {
    _id: string;
    colorName: string;
    colorCode: string;
  };

  fields: string[];
  isActive: boolean;
  isDefault: boolean;
  id: string;
  status: any;
  type: any;
}

/* =========================
   CONNECTED MARKETPLACE
========================= */
export interface Marketplace {
  _id: string;
  id: string;
  type: string;
  name: {
    _id: string;
    icon?: {
      _id: string;
      icon: string;
    };
    color?: {
      _id: string;
      colorCode: string;
    };
  };
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  stats?: {
    totalSales?: number;
    activeListings?: number;
    pendingOrders?: number;
    revenue24h?: number;
    growth?: number;
  },
  icon: any;
  color: any;
  description: string;
  apiKey?: string;
  shopUrl?: string;
}

/* =========================
   FORM DATA
========================= */
export interface FormData {
  name: string;
  type: string;
  description: string;

  credentials: any;
  marketplaceId: string;

  // 🔥 REQUIRED for dynamic fields
  [key: string]: string;
   environment: 'sandbox' | 'production';
}

/* =========================
   INITIAL FORM DATA
========================= */
export const initialFormData: any = {
  name: '',
  type: '',
  description: '',
  marketplaceId: '',
  credentials: {},
   environment: 'sandbox',
};
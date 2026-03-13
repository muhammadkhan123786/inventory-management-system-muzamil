// services/marketplace-distribution.api.ts
// ─────────────────────────────────────────────────────────────────────────────
// Thin API layer — all backend calls go through here.
// Import and use from your hook or component.
// ─────────────────────────────────────────────────────────────────────────────

import { Product } from '../app/dashboard/(inventory-dashboard)/product/types/product'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DistributionEntry {
  connectionId: string;   // MarketplaceConnection._id from backend
  quantity: number;
}

export interface DistributePayload {
  productId: string;
  userId: string;
  distributions: DistributionEntry[];
  productData: Product;
}

export interface DistributionResult {
  connectionId: string;
  marketplaceName: string;
  quantity: number;
  success: boolean;
  listingId?: string;
  viewUrl?: string;
  error?: string;
}

export interface DistributeResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    results: DistributionResult[];
    summary: {
      total: number;
      succeeded: number;
      failed: number;
    };
  };
}

// ── API Base ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const token = localStorage.getItem("token"); // get token

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "", // add token
      ...options.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok && res.status !== 207) {
    throw new Error(json.message ?? `HTTP ${res.status}`);
  }

  return json;
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * Send distribution request to backend.
 * Backend will call service.listProduct() for each marketplace.
 */
export async function distributeProduct(
  payload: DistributePayload
): Promise<DistributeResponse> {
  // Filter out zero-quantity entries before sending
  const cleanPayload: DistributePayload = {
    ...payload,
    distributions: payload.distributions.filter((d) => d.quantity > 0),
  };

  return apiFetch<DistributeResponse>('/marketplace/distribute', {
    method: 'POST',
    body: JSON.stringify(cleanPayload),
  });
}

/**
 * Get all connected marketplace connections for the current user.
 * Used to map availableMarketplaces → their connectionId.
 */
export async function getMarketplaceConnections(userId: string) {
  return apiFetch<{
    success: boolean;
    data: Array<{
      _id: string;
      type: string;
      name: string;
      status: string;
    }>;
  }>(`/marketplace?userId=${userId}`);
}
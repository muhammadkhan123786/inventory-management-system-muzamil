import { nanoid } from "nanoid";

/**
 * IMPORTANT RULES:
 * 1. Never use numbers for _id
 * 2. Never use nanoid() inline in navigation.ts
 * 3. Always add new IDs here first
 */
export const NAV_IDS = {
    // Dashboard
    DASHBOARD: nanoid(),

    // Service Tickets
    SERVICE_TICKET_ROOT: nanoid(),
    SERVICE_TICKET_CREATE: nanoid(),
    SERVICE_TICKET_ALL: nanoid(),
    SERVICE_TICKET_STATUS: nanoid(),
    SERVICE_TICKET_DEPARTMENT: nanoid(),
    SERVICE_TICKET_ACTIONS: nanoid(),
    SERVICE_TICKET_TYPE: nanoid(),
    SERVICE_TICKET_TRANSITION: nanoid(),
    SERVICE_TICKET_REFERENCE: nanoid(),

    // Inventory
    INVENTORY_ROOT: nanoid(),
    INVENTORY_PRODUCT_CATALOG: nanoid(),
    INVENTORY_PRODUCT_REGISTER: nanoid(),
    INVENTORY_PRODUCT_LIST: nanoid(),

    // Inventory Master Data
    INVENTORY_MASTER_ROOT: nanoid(),
    INVENTORY_CURRENCY: nanoid(),
    INVENTORY_PAYMENT_TERMS: nanoid(),

    // Common
    CUSTOMERS: nanoid(),
    BOOKINGS: nanoid(),
    STAFF_MANAGEMENT: nanoid(),
    TECHNICIANS: nanoid(),
    VEHICLES: nanoid(),

    // System
    SYSTEM_SETUP_ROOT: nanoid(),
    MARKETPLACE_SETUP: nanoid(),
} as const;

import { Part } from '../types/parts';

export const mockParts: Part[] = [
  { 
    id: '1', 
    name: '12V 36Ah Battery', 
    partNumber: 'BATT-12V36AH', 
    quantity: 15, 
    unitPrice: 149.99, 
    available: true,
    category: 'Batteries',
    location: 'Shelf A1'
  },
  { 
    id: '2', 
    name: '24V Fast Charger', 
    partNumber: 'CHRG-24V-FAST', 
    quantity: 8, 
    unitPrice: 89.99, 
    available: true,
    category: 'Chargers',
    location: 'Shelf B2'
  },
  { 
    id: '3', 
    name: 'Pneumatic Tire Set', 
    partNumber: 'TIRE-PNEU-SET', 
    quantity: 2, 
    unitPrice: 129.99, 
    available: true,
    category: 'Tires',
    location: 'Shelf C3',
    minimumStock: 5
  },
  { 
    id: '4', 
    name: 'Mobility Scooter Seat', 
    partNumber: 'SEAT-PRO-COMFORT', 
    quantity: 0, 
    unitPrice: 199.99, 
    available: false,
    category: 'Accessories',
    location: 'Shelf D4'
  },
  { 
    id: '5', 
    name: 'Wheelchair Cushion', 
    partNumber: 'CUSH-MEM-FOAM', 
    quantity: 12, 
    unitPrice: 79.99, 
    available: true,
    category: 'Accessories',
    location: 'Shelf E5'
  },
  { 
    id: '6', 
    name: 'Battery Charger Adapter', 
    partNumber: 'ADPT-BATT-UNIV', 
    quantity: 3, 
    unitPrice: 34.99, 
    available: true,
    category: 'Accessories',
    location: 'Shelf F6',
    minimumStock: 5
  },
  { 
    id: '7', 
    name: 'Heavy Duty Wheel Set', 
    partNumber: 'WHEEL-HD-SET4', 
    quantity: 6, 
    unitPrice: 249.99, 
    available: true,
    category: 'Wheels',
    location: 'Shelf G7'
  },
  { 
    id: '8', 
    name: 'Scooter Controller Board', 
    partNumber: 'CTRL-MAIN-UNIT', 
    quantity: 0, 
    unitPrice: 179.99, 
    available: false,
    category: 'Electronics',
    location: 'Shelf H8'
  }
];
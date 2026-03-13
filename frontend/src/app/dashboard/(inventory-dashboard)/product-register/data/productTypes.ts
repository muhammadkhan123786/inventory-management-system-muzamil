export interface ProductType {
  id: string;
  name: string;
  category: string;
}

export const productCategories = [
  { id: 'mobility-scooters', name: 'Mobility Scooters' },
  { id: 'wheelchairs', name: 'Wheelchairs' },
  { id: 'parts-accessories', name: 'Parts & Accessories' },
  { id: 'batteries', name: 'Batteries' },
  { id: 'chargers', name: 'Chargers' },
  { id: 'tires-wheels', name: 'Tires & Wheels' }
];

export const productMakes = [
  'Pride Mobility',
  'TGA Mobility',
  'Rascal',
  'Invacare',
  'Days Healthcare',
  'Universal Mobility Parts',
  'Premium Mobility Parts',
  'Other'
];

export const colors = [
  'Red',
  'Blue',
  'Black',
  'White',
  'Silver',
  'Gray',
  'Green',
  'Yellow',
  'Purple',
  'Other'
];
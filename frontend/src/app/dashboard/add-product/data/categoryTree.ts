export interface CategoryNode {
  id: string;
  name: string;
  description?: string;
  children?: CategoryNode[];
  fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
    options?: string[];
    required?: boolean;
    placeholder?: string;
  }>;
}

export const categoryTree: CategoryNode[] = [
  {
    id: 'cat1',
    name: 'Mobility Scooters',
    description: 'Electric mobility scooters and power chairs',
    children: [
      {
        id: 'cat1-1',
        name: 'Travel Scooters',
        description: 'Lightweight and portable scooters',
        children: [
          {
            id: 'cat1-1-1',
            name: 'Folding Travel Scooters',
            fields: [
              { name: 'weight', label: 'Weight (kg)', type: 'number', required: true },
              { name: 'foldedDimensions', label: 'Folded Dimensions (cm)', type: 'text' },
              { name: 'batteryType', label: 'Battery Type', type: 'select', options: ['Lithium', 'AGM', 'Gel'] },
              { name: 'maxSpeed', label: 'Maximum Speed (mph)', type: 'number' }
            ]
          },
          {
            id: 'cat1-1-2',
            name: 'Compact Travel Scooters',
            fields: [
              { name: 'turningRadius', label: 'Turning Radius (cm)', type: 'number' },
              { name: 'groundClearance', label: 'Ground Clearance (cm)', type: 'number' },
              { name: 'seatType', label: 'Seat Type', type: 'select', options: ['Padded', 'Swivel', 'Captain'] }
            ]
          }
        ]
      },
      {
        id: 'cat1-2',
        name: 'Heavy Duty Scooters',
        description: 'Large capacity scooters for higher weight limits',
        children: [
          {
            id: 'cat1-2-1',
            name: '4-Wheel Scooters',
            fields: [
              { name: 'weightCapacity', label: 'Weight Capacity (kg)', type: 'number', required: true },
              { name: 'wheelSize', label: 'Wheel Size (inches)', type: 'number' },
              { name: 'suspensionType', label: 'Suspension Type', type: 'select', options: ['None', 'Front', 'Full', 'Pneumatic'] }
            ]
          },
          {
            id: 'cat1-2-2',
            name: '3-Wheel Scooters',
            fields: [
              { name: 'maneuverabilityRating', label: 'Maneuverability Rating', type: 'select', options: ['Basic', 'Standard', 'Premium'] },
              { name: 'hillGrade', label: 'Maximum Hill Grade (%)', type: 'number' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cat2',
    name: 'Stairlifts & Home Lifts',
    description: 'Home accessibility equipment',
    children: [
      {
        id: 'cat2-1',
        name: 'Straight Stairlifts',
        children: [
          {
            id: 'cat2-1-1',
            name: 'Indoor Straight Stairlifts',
            fields: [
              { name: 'railLength', label: 'Rail Length (m)', type: 'number', required: true },
              { name: 'seatType', label: 'Seat Type', type: 'select', options: ['Standard', 'Perch', 'Swivel'] },
              { name: 'weightCapacity', label: 'Weight Capacity (kg)', type: 'number' }
            ]
          }
        ]
      },
      {
        id: 'cat2-2',
        name: 'Curved Stairlifts',
        children: [
          {
            id: 'cat2-2-1',
            name: 'Custom Curved Stairlifts',
            fields: [
              { name: 'curveAngle', label: 'Curve Angle (degrees)', type: 'number' },
              { name: 'customizationOptions', label: 'Customization Options', type: 'textarea' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cat3',
    name: 'Rising Chairs & Recliners',
    description: 'Electric rise and recline chairs',
    children: [
      {
        id: 'cat3-1',
        name: 'Riser Recliner Chairs',
        children: [
          {
            id: 'cat3-1-1',
            name: 'Two Motor Riser Recliners',
            fields: [
              { name: 'motorCount', label: 'Motor Count', type: 'number', required: true },
              { name: 'positions', label: 'Number of Positions', type: 'select', options: ['2', '3', 'Infinite'] },
              { name: 'fabricType', label: 'Fabric Type', type: 'select', options: ['Leather', 'Fabric', 'Vinyl'] }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cat4',
    name: 'Wheelchairs',
    description: 'Manual and electric wheelchairs',
    children: [
      {
        id: 'cat4-1',
        name: 'Manual Wheelchairs',
        children: [
          {
            id: 'cat4-1-1',
            name: 'Lightweight Manual Wheelchairs',
            fields: [
              { name: 'frameMaterial', label: 'Frame Material', type: 'select', options: ['Aluminum', 'Steel', 'Titanium'] },
              { name: 'selfPropelled', label: 'Self-Propelled', type: 'checkbox' }
            ]
          }
        ]
      },
      {
        id: 'cat4-2',
        name: 'Power Wheelchairs',
        children: [
          {
            id: 'cat4-2-1',
            name: 'Mid-Wheel Drive Power Chairs',
            fields: [
              { name: 'driveType', label: 'Drive Type', type: 'select', options: ['Mid-Wheel', 'Front-Wheel', 'Rear-Wheel'] },
              { name: 'range', label: 'Battery Range (miles)', type: 'number' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cat5',
    name: 'Walking Aids',
    description: 'Walking sticks, frames, and rollators',
    children: [
      {
        id: 'cat5-1',
        name: 'Rollators',
        children: [
          {
            id: 'cat5-1-1',
            name: '3-Wheel Rollators',
            fields: [
              { name: 'wheelSize', label: 'Wheel Size (inches)', type: 'number' },
              { name: 'brakeType', label: 'Brake Type', type: 'select', options: ['Loop', 'Push Down', 'Lever'] }
            ]
          },
          {
            id: 'cat5-1-2',
            name: '4-Wheel Rollators',
            fields: [
              { name: 'seatIncluded', label: 'Includes Seat', type: 'checkbox' },
              { name: 'basketIncluded', label: 'Includes Basket', type: 'checkbox' }
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to find a category by ID
export function findCategoryById(categories: CategoryNode[], id: string): CategoryNode | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to get category path
export function getCategoryPath(categories: CategoryNode[], id: string): CategoryNode[] {
  const path: CategoryNode[] = [];
  
  function findPath(currentCategories: CategoryNode[], currentId: string): boolean {
    for (const category of currentCategories) {
      if (category.id === currentId) {
        path.unshift(category);
        return true;
      }
      if (category.children) {
        if (findPath(category.children, currentId)) {
          path.unshift(category);
          return true;
        }
      }
    }
    return false;
  }
  
  findPath(categories, id);
  return path;
}
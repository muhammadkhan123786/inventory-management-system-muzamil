export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+44 7911 123456',
    address: '123 Main St, London, UK'
  },
  {
    id: 'cust-2',
    name: 'Emma Johnson',
    email: 'emma.j@example.com',
    phone: '+44 7922 234567',
    address: '45 Park Avenue, Manchester, UK'
  },
  {
    id: 'cust-3',
    name: 'Robert Williams',
    email: 'r.williams@example.com',
    phone: '+44 7933 345678',
    address: '78 High Street, Birmingham, UK'
  },
  {
    id: 'cust-4',
    name: 'Sarah Davis',
    email: 'sarah.d@example.com',
    phone: '+44 7944 456789',
    address: '22 Queens Road, Leeds, UK'
  },
  {
    id: 'cust-5',
    name: 'Michael Brown',
    email: 'm.brown@example.com',
    phone: '+44 7955 567890',
    address: '9 Castle Street, Edinburgh, UK'
  }
];
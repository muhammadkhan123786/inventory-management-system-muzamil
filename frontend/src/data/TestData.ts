import { ISignInSharedInterface } from '../../../common/ISignInSharedInterface';
import { StaticImageData } from 'next/image';
import top1 from '../assets/Top1.png';
import top2 from '../assets/Top2.png';
import top3 from '../assets/Top3.png';
import top4 from '../assets/Top4.png';


/* =======================
    SIGN IN DATA
======================= */
export const SignInData: ISignInSharedInterface[] = [
  { _id: 1, emailId: 'admin@gmail.com', password: '123', roleId: 1 },
  { _id: 2, emailId: 'mcims@gmail.com', password: '123', roleId: 2 }
];

/* =======================
    ROLES
======================= */
export const Roles: Record<number, string> = {
  1: 'Admin',
  2: 'Technicians',
  3: 'Customer'
};

/* =======================
    CUSTOMER MOCK DATA (Updated: No Vehicles/Preferences)
======================= */
export const AddNewCustomerData: any[] = [
  // {
  //   id: 'CUST001',
  //   firstName: 'John',
  //   lastName: 'Doe',
  //   email: 'john.doe@example.com',
  //   mobileNumber: '+1234567890',
  //   address: '123 Main Street, New York',
  //   city: 'New York',
  //   postCode: '10001',
  //   contactMethod: 'email',
  //   ownerName: 'John Doe',
  //   ownerEmail: 'john.doe@example.com',
  //   ownerPhone: '+1234567890',
  //   createdAt: new Date('2024-01-15'),
  //   updatedAt: new Date('2024-01-15'),
  //   status: 'active',
  // },
  // {
  //   id: 'CUST002',
  //   firstName: 'Sarah',
  //   lastName: 'Smith',
  //   email: 'sarah.smith@example.com',
  //   mobileNumber: '+1987654321',
  //   address: '456 Oak Avenue, Los Angeles',
  //   city: 'Los Angeles',
  //   postCode: '90001',
  //   contactMethod: 'phone',
  //   ownerName: 'Sarah Smith',
  //   ownerEmail: 'sarah.smith@example.com',
  //   ownerPhone: '+1987654321',
  //   createdAt: new Date('2024-02-10'),
  //   updatedAt: new Date('2024-02-10'),
  //   status: 'active',
  // },
  // {
  //   id: 'CUST003',
  //   firstName: 'Michael',
  //   lastName: 'Johnson',
  //   email: 'michael.j@example.com',
  //   mobileNumber: '+1122334455',
  //   address: '789 Pine Road, Chicago',
  //   city: 'Chicago',
  //   postCode: '60601',
  //   contactMethod: 'sms',
  //   ownerName: 'Michael Johnson',
  //   ownerEmail: 'michael.j@example.com',
  //   ownerPhone: '+1122334455',
  //   createdAt: new Date('2024-03-05'),
  //   updatedAt: new Date('2024-03-05'),
  //   status: 'inactive',
  // },
];

let lastCustomerId = 3;

export const generateCustomerId = (): string => {
  lastCustomerId++;
  return `CUST${lastCustomerId.toString().padStart(3, '0')}`;
};

export const addNewCustomer = (
  customerData: Omit<any, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): any => {
  const now = new Date();

  const newCustomer: any = {
    ...customerData,
    id: generateCustomerId(),
    createdAt: now,
    updatedAt: now,
    status: 'active'
  };

  AddNewCustomerData.push(newCustomer);
  return newCustomer;
};

export const updateCustomer = (
  updatedCustomer: any
): boolean => {
  const index = AddNewCustomerData.findIndex(customer => customer.id === updatedCustomer.id);

  if (index !== -1) {
    AddNewCustomerData[index] = {
      ...updatedCustomer,
      updatedAt: new Date()
    };
    return true;
  }
  return false;
};

export const deleteCustomer = (
  customerId: string
): boolean => {
  const initialLength = AddNewCustomerData.length;
  const filteredCustomers = AddNewCustomerData.filter(customer => customer.id !== customerId);
  
  AddNewCustomerData.length = 0;
  AddNewCustomerData.push(...filteredCustomers);

  return filteredCustomers.length < initialLength;
};

export const getCustomerById = (
  customerId: string
): any | undefined => {
  return AddNewCustomerData.find(customer => customer.id === customerId);
};

export const getAllCustomers = (): any[] => {
  return [...AddNewCustomerData];
};

export const searchCustomers = (
  query: string,
  filters?: {
    status?: string;
    city?: string;
  }
): any[] => {
  let results = AddNewCustomerData;

  if (query.trim()) {
    const searchLower = query.toLowerCase();
    results = results.filter(customer =>
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.ownerPhone.toLowerCase().includes(searchLower) ||
      customer.city.toLowerCase().includes(searchLower)
    );
  }

  if (filters) {
    if (filters.status && filters.status !== 'all') {
      results = results.filter(customer => customer.status === filters.status);
    }
    if (filters.city && filters.city !== 'all') {
      results = results.filter(customer => customer.city === filters.city);
    }
  }

  return results;
};

export const getCustomerStats = () => {
  const total = AddNewCustomerData.length;
  const active = AddNewCustomerData.filter(c => c.status === 'active').length;
  const inactive = AddNewCustomerData.filter(c => c.status === 'inactive').length;
  const pending = AddNewCustomerData.filter(c => c.status === 'pending').length;

  return {
    total,
    active,
    inactive,
    pending,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    inactivePercentage: total > 0 ? Math.round((inactive / total) * 100) : 0,
    pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0
  };
};

export const getUniqueCities = (): string[] => {
  const cities = AddNewCustomerData.map(customer => customer.city);
  return Array.from(new Set(cities)).sort();
};

export type Customer = any;
// export type {  CustomerInterface };

/* =======================
    ORDERS & NOTIFICATIONS
======================= */
export const OrderStatuses = [
  { _id: 1, status: "Received", bgcolor: '#D4E1FF', textColor: '#487FFF' },
  { _id: 2, status: "Serviced", bgcolor: '#E2FFF5', textColor: '#2FCA11' },
  { _id: 3, status: "Returned", bgcolor: '#F9FEE8', textColor: '#E6E622' },
  { _id: 4, status: "Canceled", bgcolor: '#FEE8E8', textColor: '#FF0B0B' },
]

export interface OrderInterface {
  _id: number,
  storeId: string,
  customer: string,
  repairDate: string,
  amount: string,
  statusId: number
}

export const orders: OrderInterface[] = [
  { _id: 1, storeId: "#657946", customer: "Kathryn Murphy", repairDate: "27 Mar 2025", amount: "£ 873", statusId: 1, },
  { _id: 2, storeId: "#657946", customer: "Kathryn Murphy", repairDate: "27 Mar 2025", amount: "£ 873", statusId: 2, },
  { _id: 3, storeId: "#657946", customer: "Kathryn Murphy", repairDate: "27 Mar 2025", amount: "£ 873", statusId: 2, },
  { _id: 4, storeId: "#657946", customer: "Kathryn Murphy", repairDate: "27 Mar 2025", amount: "£ 873", statusId: 3, },
  { _id: 5, storeId: "#657946", customer: "Kathryn Murphy", repairDate: "27 Mar 2025", amount: "£ 873", statusId: 4, },
]

export interface NotificationInterface {
  _id: number,
  notification: string,
  timePast: string,
  image: StaticImageData
  notificationStatus: "Accept" | "Accepted"
}

export const NotificationData: NotificationInterface[] = [
  { _id: 1, notification: "Lorem ipsum...", timePast: "10 mins", notificationStatus: "Accept", image: top1 },
  { _id: 2, notification: "Lorem ipsum...", timePast: "10 mins", notificationStatus: "Accepted", image: top2 },
  { _id: 3, notification: "Lorem ipsum...", timePast: "10 mins", notificationStatus: "Accept", image: top3 },
  { _id: 4, notification: "Lorem ipsum...", timePast: "10 mins", notificationStatus: "Accepted", image: top4 },
]
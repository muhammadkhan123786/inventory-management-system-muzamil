// import { Customer } from '@/app/dashboard/customers/components/types';
// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

// export const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.error("Unauthorized! Redirecting to login...");
//     }
//     return Promise.reject(error);
//   }
// );

// const flattenCustomer = (customer: any): Customer => {
//   return {
//     id: customer._id || customer.id,
//     customerType: customer.customerType || 'domestic',
//     country: customer.addressId?.countryId?.countryName || customer.address?.country || customer.country || '',
//     firstName: customer.firstName || customer.personId?.firstName || customer.person?.firstName || '',
//     lastName: customer.lastName || customer.personId?.lastName || customer.person?.lastName || '',
//     // ✅ Mapping backend fields to frontend names
//     email: customer.emailId || customer.contactId?.emailId || customer.contact?.emailId || '',
//     mobileNumber: customer.mobileNumber || customer.contactId?.mobileNumber || customer.contact?.mobileNumber || '',
//     address: customer.address || customer.addressId?.address || '',
//     city: customer.city || customer.addressId?.cityId?.cityName || '',
//     // ✅ Mapping backend zipCode to frontend postCode & zipCode
//     postCode: customer.zipCode || customer.addressId?.zipCode || customer.address?.zipCode || '',
//     zipCode: customer.zipCode || customer.addressId?.zipCode || customer.address?.zipCode || '',
//     companyName: customer.companyName || '',
//     registrationNo: customer.registrationNo || '',
//     vatNo: customer.vatNo || '',
//     website: customer.website || '',
//     contactMethod: customer.contactMethod || 'email',
//     status: customer.isActive ? 'active' : 'inactive',
//     createdAt: new Date(customer.createdAt || Date.now()),
//     updatedAt: new Date(customer.updatedAt || Date.now()),
//     preferredLanguage: customer.preferredLanguage || customer.contactId?.preferredLanguage || 'en',
//     receiveUpdates: customer.receiveUpdates || customer.contactId?.receiveUpdates || false,
//     termsAccepted: customer.termsAccepted || customer.contactId?.termsAccepted || false,
//     ownerName: customer.ownerName || customer.personId?.firstName || '',
//     ownerEmail: customer.ownerEmail || customer.contactId?.emailId || '',
//     ownerPhone: customer.ownerPhone || customer.contactId?.mobileNumber || '',
//     issues: customer.issues || [],
//     description: customer.description || ''
//   };
// };

// const getUserId = () => {
//   if (typeof window !== 'undefined') {
//     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
//     return savedUser.id || savedUser._id || '694b8d4d98b65d4ab738b987';
//   }
//   return '694b8d4d98b65d4ab738b987';
// };

// export const customerApi = {
//   getAll: async (): Promise<Customer[]> => {
//     const response = await api.get('/customers');
//     const data = response.data.data || response.data;
//     return Array.isArray(data) ? data.map(flattenCustomer) : [];
//   },

//   getById: async (id: string): Promise<Customer> => {
//     const response = await api.get(`/customers/${id}`);
//     return flattenCustomer(response.data.data || response.data);
//   },

//   create: async (customer: any): Promise<Customer> => {
//     const currentUserId = getUserId();
//     const emailToUse = customer.emailId || customer.email; // ✅ Component sends emailId
//     const zipToUse = customer.zipCode || customer.postCode; // ✅ Component sends zipCode

//     const backendData = {
//       userId: currentUserId,
//       email: emailToUse, 
//       customerType: customer.customerType || 'domestic',
//       sourceId: customer.sourceId,
//       person: {
//         firstName: customer.firstName,
//         middleName: "", 
//         lastName: customer.lastName
//       },
//       contact: {
//         mobileNumber: customer.mobileNumber,
//         phoneNumber: customer.mobileNumber, 
//         emailId: emailToUse
//       },
//       address: {
//         userId: currentUserId,
//         address: customer.address,
//         zipCode: zipToUse, 
//         city: customer.city,
//         country: customer.country,
//         latitude: "0.0",
//         longitude: "0.0"
//       },
//       companyName: customer.companyName || "", 
//       registrationNo: customer.registrationNo || "",
//       vatNo: customer.vatNo || "",
//       website: customer.website || "",
//       isActive: true
//     };

//     const response = await api.post('/customers', backendData);
//     return flattenCustomer(response.data.data || response.data);
//   },

//   update: async (id: string, customer: any): Promise<Customer> => {
//     const currentUserId = getUserId();
//     const emailToUse = customer.emailId || customer.email; // ✅ Fix: Get from emailId
//     const zipToUse = customer.zipCode || customer.postCode; // ✅ Fix: Get from zipCode

//     const backendData = {
//       userId: currentUserId,
//       customerType: customer.customerType || 'domestic',
//       sourceId: customer.sourceId,
//       person: {
//         firstName: customer.firstName,
//         lastName: customer.lastName,
//         middleName: ""
//       },
//       contact: {
//         emailId: emailToUse,
//         mobileNumber: customer.mobileNumber
//       },
//       address: {
//         userId: currentUserId,
//         address: customer.address,
//         zipCode: zipToUse, 
//         city: customer.city,
//         country: customer.country,
//         latitude: "0.0",
//         longitude: "0.0"
//       },
//       companyName: customer.companyName || "", 
//       registrationNo: customer.registrationNo || "",
//       vatNo: customer.vatNo || "",
//       website: customer.website || "",
//       isActive: customer.status === 'active'
//     };

//     const response = await api.post(`/customers/${id}`, backendData);
//     return flattenCustomer(response.data.data || response.data);
//   },

//   delete: async (id: string): Promise<void> => {
//     const userId = getUserId();
//     await api.delete(`/customers/${id}`, { data: { userId } });
//   },
// };
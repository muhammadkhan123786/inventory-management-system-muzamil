export interface AddNewCustomerInterface {
  id: string;
  firstName: string;
  lastName: string;
  customerType?: string; // 'domestic' ya 'corporate'
  
  // ✅ Optional Fields (Inke aage '?' laga diya hai)
  companyName?: string;
  registrationNo?: string;
  vatNo?: string;
  website?: string;
  
  email: string;
  mobileNumber: string;
  address: string;
  city: string;
  zipCode:string;
  postCode: string;
  country?: string; // Backend se kabhi aata hai kabhi nahi, isliye optional
  
  contactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
  
  // ✅ Preferences & Flags (Optional)
  preferredLanguage?: string;
  receiveUpdates?: boolean;
  termsAccepted?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'pending';

  // Owner Details
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;

  // Additional fields
  issues?: Array<{ category: string; subIssues: string[] }>;
  description?: string;
}
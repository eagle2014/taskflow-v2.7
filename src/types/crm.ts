// CRM Entity Types

export interface Customer {
  customerId: string;
  siteId: string;
  customerCode: string;
  customerName: string;
  customerType: 'Company' | 'Individual';
  industry?: string;
  website?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  annualRevenue?: number;
  employeeCount?: number;
  status: 'Active' | 'Inactive';
  source?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  contactId: string;
  siteId: string;
  customerId?: string;
  customerName?: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  status: 'Active' | 'Inactive';
  linkedIn?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  dealId: string;
  siteId: string;
  customerId: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  dealCode: string;
  dealName: string;
  description?: string;
  dealValue?: number;
  currency: string;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status: 'Open' | 'Won' | 'Lost';
  lostReason?: string;
  ownerId?: string;
  ownerName?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  quoteItemId: string;
  quoteId: string;
  itemOrder: number;
  itemName: string;
  itemDescription?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountPercent: number;
  amount: number;
}

export interface Quote {
  quoteId: string;
  siteId: string;
  dealId: string;
  dealName?: string;
  customerId: string;
  customerName?: string;
  contactId?: string;
  contactName?: string;
  quoteNumber: string;
  quoteName?: string;
  version: number;
  quoteDate: string;
  validUntil?: string;
  subTotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
}

// Create DTOs
export interface CreateCustomerDTO {
  customerCode: string;
  customerName: string;
  customerType: 'Company' | 'Individual';
  industry?: string;
  website?: string;
  taxCode?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  annualRevenue?: number;
  employeeCount?: number;
  status?: string;
  source?: string;
  notes?: string;
}

export interface CreateContactDTO {
  customerId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  status?: string;
  linkedIn?: string;
  notes?: string;
}

export interface CreateDealDTO {
  customerId: string;
  contactId?: string;
  dealCode: string;
  dealName: string;
  description?: string;
  dealValue?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status?: string;
  lostReason?: string;
  ownerId?: string;
  source?: string;
}

// Search DTOs
export interface CustomerSearchDTO {
  searchTerm?: string;
  customerType?: string;
  status?: string;
  industry?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ContactSearchDTO {
  searchTerm?: string;
  customerId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface DealSearchDTO {
  searchTerm?: string;
  customerId?: string;
  stage?: string;
  status?: string;
  ownerId?: string;
  pageNumber?: number;
  pageSize?: number;
}
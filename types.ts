
export enum VoucherType {
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT'
}

export enum QuotationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum UserRole {
  ADMIN = 'مدير نظام',
  ACCOUNTANT = 'محاسب'
}

export type Currency = 'IQD' | 'USD';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  price: number;
  quantity: number;
  currency?: Currency;
}

export interface Quotation {
  id: string;
  clientName: string;
  clientPhone?: string;
  date: string;
  items: ServiceItem[];
  total: number;
  currency: Currency;
  status: QuotationStatus;
  note?: string;
}

export interface Voucher {
  id: string;
  type: VoucherType;
  amount: number;
  currency: Currency;
  date: string;
  description: string;
  partyName: string; 
  partyPhone?: string;
  category?: 'SALARY' | 'DAILY' | 'GENERAL' | 'VOUCHER' | 'OWNER_WITHDRAWAL';
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  senderName: string;
  isEnabled: boolean;
}

export interface AgencySettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  services: { name: string; description: string }[];
  quotationTerms: string[];
  twilio: TwilioConfig;
  exchangeRate: number; // سعر الصرف: 1 دولار = كم دينار
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
}

export interface Contract {
  id: string;
  date: string;
  partyAName: string;
  partyATitle: string;
  partyBName: string;
  partyBTitle: string;
  subject: string;
  totalValue: number;
  currency: Currency;
  clauses: ContractClause[];
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface SMSLog {
  id: string;
  to: string;
  body: string;
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
  error?: string;
}

export interface AppData {
  quotations: Quotation[];
  vouchers: Voucher[];
  contracts: Contract[];
  settings: AgencySettings;
  users: User[];
  smsLogs: SMSLog[];
}

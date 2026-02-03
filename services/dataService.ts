/**
 * Data service: CRUD for quotations, vouchers, contracts, users, settings, sms-logs (v4).
 * All paths and payloads match Django REST API (camelCase).
 */
import { UserRole } from "../types.ts";
import type {
  AppData,
  Quotation,
  Voucher,
  Contract,
  User,
  AgencySettings,
  QuotationStatus,
  VoucherType,
  SMSLog,
  Currency,
} from "../types.ts";
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "./api.ts";

const PREFIX = "/api";

async function getList<T>(path: string): Promise<T[]> {
  const { data, ok } = await apiGet<{ results?: T[] } | T[]>(path);
  if (!ok) return [];
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in data) return (data.results as T[]) || [];
  return [];
}

async function getOne<T>(path: string): Promise<T | null> {
  const { data, ok } = await apiGet<T>(path);
  return ok && data ? data : null;
}

// ----- Quotations -----
export async function fetchQuotations(): Promise<Quotation[]> {
  const list = await getList<QuotationApi>(`${PREFIX}/quotations/`);
  return list.map(quotationFromApi);
}

export async function createQuotation(payload: QuotationPayload): Promise<Quotation | null> {
  const { data, ok } = await apiPost<QuotationApi>(`${PREFIX}/quotations/`, payload);
  return ok && data ? quotationFromApi(data) : null;
}

export async function updateQuotation(id: string, payload: Partial<QuotationPayload>): Promise<Quotation | null> {
  const { data, ok } = await apiPut<QuotationApi>(`${PREFIX}/quotations/${id}/`, payload);
  return ok && data ? quotationFromApi(data) : null;
}

export async function setQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation | null> {
  const { data, ok } = await apiPost<QuotationApi>(`${PREFIX}/quotations/${id}/set_status/`, { status });
  return ok && data ? quotationFromApi(data) : null;
}

export async function deleteQuotation(id: string): Promise<boolean> {
  const { ok } = await apiDelete(`${PREFIX}/quotations/${id}/`);
  return ok;
}

// ----- Vouchers -----
export async function fetchVouchers(): Promise<Voucher[]> {
  const list = await getList<VoucherApi>(`${PREFIX}/vouchers/`);
  return list.map(voucherFromApi);
}

export async function createVoucher(payload: VoucherPayload): Promise<Voucher | null> {
  const { data, ok } = await apiPost<VoucherApi>(`${PREFIX}/vouchers/`, payload);
  return ok && data ? voucherFromApi(data) : null;
}

export async function updateVoucher(id: string, payload: Partial<VoucherPayload>): Promise<Voucher | null> {
  const { data, ok } = await apiPut<VoucherApi>(`${PREFIX}/vouchers/${id}/`, payload);
  return ok && data ? voucherFromApi(data) : null;
}

export async function deleteVoucher(id: string): Promise<boolean> {
  const { ok } = await apiDelete(`${PREFIX}/vouchers/${id}/`);
  return ok;
}

// ----- Contracts -----
export async function fetchContracts(): Promise<Contract[]> {
  const list = await getList<ContractApi>(`${PREFIX}/contracts/`);
  return list.map(contractFromApi);
}

export async function createContract(payload: ContractPayload): Promise<Contract | null> {
  const { data, ok } = await apiPost<ContractApi>(`${PREFIX}/contracts/`, payload);
  return ok && data ? contractFromApi(data) : null;
}

export async function deleteContract(id: string): Promise<boolean> {
  const { ok } = await apiDelete(`${PREFIX}/contracts/${id}/`);
  return ok;
}

// ----- Users -----
export async function fetchUsers(): Promise<User[]> {
  const list = await getList<UserApi>(`${PREFIX}/users/`);
  return list.map(userFromApi);
}

export async function createUser(payload: UserPayload): Promise<User | null> {
  const { data, ok } = await apiPost<UserApi>(`${PREFIX}/users/`, payload);
  return ok && data ? userFromApi(data) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { ok } = await apiDelete(`${PREFIX}/users/${id}/`);
  return ok;
}

// ----- Settings -----
export async function fetchSettings(): Promise<AgencySettings | null> {
  const list = await getList<AgencySettingsApi>(`${PREFIX}/settings/`);
  const first = list[0];
  return first ? settingsFromApi(first) : null;
}

export async function updateSettings(payload: AgencySettings): Promise<AgencySettings | null> {
  const list = await getList<{ id: number }>(`${PREFIX}/settings/`);
  const id = list[0]?.id;
  if (id == null) return null;
  const { data, ok } = await apiPut<AgencySettingsApi>(`${PREFIX}/settings/${id}/`, payload);
  return ok && data ? settingsFromApi(data) : null;
}

export async function createSettings(payload: AgencySettings): Promise<AgencySettings | null> {
  const { data, ok } = await apiPost<AgencySettingsApi>(`${PREFIX}/settings/`, payload);
  return ok && data ? settingsFromApi(data) : null;
}

// ----- SMS Logs -----
export async function fetchSmsLogs(): Promise<SMSLog[]> {
  const list = await getList<SMSLogApi>(`${PREFIX}/sms-logs/`);
  return list.map(smsLogFromApi);
}

export async function createSmsLog(payload: { to: string; body: string; status: "SUCCESS" | "FAILED"; error?: string }): Promise<SMSLog | null> {
  const { data, ok } = await apiPost<SMSLogApi>(`${PREFIX}/sms-logs/`, payload);
  return ok && data ? smsLogFromApi(data) : null;
}

export async function clearSmsLogs(): Promise<void> {
  const list = await getList<{ id: string }>(`${PREFIX}/sms-logs/`);
  for (const item of list) {
    await apiDelete(`${PREFIX}/sms-logs/${item.id}/`);
  }
}

// ----- Full app data -----
const DEFAULT_SETTINGS: AgencySettings = {
  name: "وكالة نقطة للتسويق الرقمي",
  logo: "",
  address: "",
  phone: "",
  email: "",
  services: [],
  quotationTerms: [],
  twilio: { accountSid: "", authToken: "", fromNumber: "", senderName: "NOQTA", isEnabled: false },
  exchangeRate: 1500,
};

export async function fetchAppData(): Promise<AppData | null> {
  const [quotations, vouchers, contracts, users, settingsList, smsLogs] = await Promise.all([
    fetchQuotations(),
    fetchVouchers(),
    fetchContracts(),
    fetchUsers(),
    getList<AgencySettingsApi>(`${PREFIX}/settings/`),
    fetchSmsLogs(),
  ]);
  const settings = settingsList[0] ? settingsFromApi(settingsList[0]) : DEFAULT_SETTINGS;
  return {
    quotations,
    vouchers,
    contracts,
    users,
    settings,
    smsLogs,
  };
}

// ----- API shapes (camelCase from Django) -----
interface QuotationApi {
  id: string;
  clientName: string;
  clientPhone?: string;
  date: string;
  items: { id: string; description: string; price: string; quantity: number; currency?: string }[];
  total: string;
  currency: Currency;
  status: QuotationStatus;
  note?: string;
}

interface VoucherApi {
  id: string;
  type: VoucherType;
  amount: string;
  currency: Currency;
  date: string;
  description: string;
  partyName: string;
  partyPhone?: string;
  category?: "SALARY" | "DAILY" | "GENERAL" | "VOUCHER" | "OWNER_WITHDRAWAL";
}

interface ContractApi {
  id: string;
  date: string;
  partyAName: string;
  partyATitle: string;
  partyBName: string;
  partyBTitle: string;
  subject: string;
  totalValue: string;
  currency: Currency;
  clauses: { id: string; title: string; content: string }[];
  status: "ACTIVE" | "ARCHIVED";
}

interface UserApi {
  id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
}

interface AgencySettingsApi {
  id: number;
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  services: { name: string; description: string }[];
  quotationTerms: string[];
  twilio?: { accountSid: string; authToken: string; fromNumber: string; senderName: string; isEnabled: boolean };
  exchangeRate?: number;
}

interface SMSLogApi {
  id: string;
  to: string;
  body: string;
  status: "SUCCESS" | "FAILED";
  timestamp: string;
  error?: string;
}

export type QuotationPayload = {
  clientName: string;
  clientPhone?: string;
  date: string;
  items: { description: string; price: number; quantity: number; currency?: Currency }[];
  status?: QuotationStatus;
  note?: string;
  currency?: Currency;
};

export type VoucherPayload = {
  type: VoucherType;
  amount: number;
  currency: Currency;
  date: string;
  description: string;
  partyName: string;
  partyPhone?: string;
  category?: "SALARY" | "DAILY" | "GENERAL" | "VOUCHER" | "OWNER_WITHDRAWAL";
};

export type ContractPayload = {
  date: string;
  partyAName: string;
  partyATitle: string;
  partyBName: string;
  partyBTitle: string;
  subject: string;
  totalValue: number;
  currency?: Currency;
  clauses: { title: string; content: string }[];
  status?: "ACTIVE" | "ARCHIVED";
};

export type UserPayload = {
  name: string;
  username: string;
  password: string;
  role: string;
};

// ----- Mappers API -> frontend types -----
function quotationFromApi(a: QuotationApi): Quotation {
  return {
    id: a.id,
    clientName: a.clientName,
    clientPhone: a.clientPhone,
    date: a.date,
    items: a.items.map((i) => ({
      id: i.id,
      description: i.description,
      price: parseFloat(i.price),
      quantity: i.quantity,
      currency: (i.currency as Currency) || "IQD",
    })),
    total: parseFloat(a.total),
    currency: a.currency || "IQD",
    status: a.status,
    note: a.note,
  };
}

function voucherFromApi(a: VoucherApi): Voucher {
  return {
    id: a.id,
    type: a.type,
    amount: parseFloat(a.amount),
    currency: a.currency || "IQD",
    date: a.date,
    description: a.description,
    partyName: a.partyName,
    partyPhone: a.partyPhone,
    category: a.category,
  };
}

function contractFromApi(a: ContractApi): Contract {
  return {
    id: a.id,
    date: a.date,
    partyAName: a.partyAName,
    partyATitle: a.partyATitle,
    partyBName: a.partyBName,
    partyBTitle: a.partyBTitle,
    subject: a.subject,
    totalValue: parseFloat(a.totalValue),
    currency: a.currency || "IQD",
    clauses: a.clauses.map((c) => ({ id: c.id, title: c.title, content: c.content })),
    status: a.status,
  };
}

function userFromApi(a: UserApi): User {
  return {
    id: String(a.id),
    name: a.name,
    username: a.username,
    role: a.role === "ADMIN" ? UserRole.ADMIN : UserRole.ACCOUNTANT,
    createdAt: a.createdAt,
  };
}

function settingsFromApi(a: AgencySettingsApi): AgencySettings {
  return {
    name: a.name,
    logo: a.logo,
    address: a.address,
    phone: a.phone,
    email: a.email,
    services: a.services || [],
    quotationTerms: a.quotationTerms || [],
    twilio: a.twilio || { accountSid: "", authToken: "", fromNumber: "", senderName: "NOQTA", isEnabled: false },
    exchangeRate: a.exchangeRate ?? 1500,
  };
}

function smsLogFromApi(a: SMSLogApi): SMSLog {
  return {
    id: a.id,
    to: a.to,
    body: a.body,
    status: a.status,
    timestamp: a.timestamp,
    error: a.error,
  };
}

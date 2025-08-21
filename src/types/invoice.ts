export interface Invoice {
  id?: string;
  company_name: string;
  invoice_date: string;
  invoice_number: string;
  customer_name: string;
  items: InvoiceItem[];
  total_amount: number;
  additional_notes?: string;
  terms_conditions?: string;
  invoice_type: InvoiceType;
  template_id?: string;
  created_at?: string;
  updated_at?: string;

  // Optional customer details
  customer_email?: string;
  customer_phone?: string;

  // Optional financial fields
  tax_amount?: number;
  discount_amount?: number;
  po_number?: string;

  // Optional bank details
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  account_holder?: string;

  // Optional company details
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_website?: string;
  payment_methods?: string[];
}

export interface InvoiceItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export enum InvoiceType {
  PRODUCT_SELLING = "product_selling",
  PRODUCT_PURCHASE = "product_purchase",
  EMPLOYEE_SALARY = "employee_salary",
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  file_path: string;
  preview_url?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_type: string;
}

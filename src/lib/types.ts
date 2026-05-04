export interface Income {
  id: string;
  amount: number;
  note: string;
  timestamp: string; // ISO string
}

export interface Expense {
  id: string;
  amount: number;
  note: string;
  timestamp: string; // ISO string
}

export interface Merchant {
  id: string;
  name: string;
  // balance can be calculated on the fly or stored, we'll calculate on the fly for simplicity
}

export interface MerchantTransaction {
  id: string;
  merchantId: string;
  type: "Bill Added" | "Payment Made";
  amount: number;
  note: string;
  timestamp: string; // ISO string
}

export interface Customer {
  id: string;
  name: string;
}

export interface UdhaarTransaction {
  id: string;
  customerId: string;
  type: "Udhaar Given" | "Payment Received";
  amount: number;
  timestamp: string; // ISO string
}

export type TransactionType =
  | "Income"
  | "Expense"
  | "Merchant Bill Added"
  | "Merchant Payment Made"
  | "Udhaar Given"
  | "Udhaar Payment Received";

export interface UnifiedTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  note?: string;
  timestamp: string;
  referenceId?: string; // MerchantId or CustomerId
  referenceName?: string; // MerchantName or CustomerName
}

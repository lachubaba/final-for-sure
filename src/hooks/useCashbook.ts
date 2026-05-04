import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, type Query } from "firebase/firestore";
import { getDb } from "../lib/firebase";
import type { Income, Expense, Merchant, MerchantTransaction, Customer, UdhaarTransaction, UnifiedTransaction } from "../lib/types";

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

// --------------------------------------------------
// Generic Hook
// --------------------------------------------------
function useCollection<T>(collectionName: string, mapDoc: (id: string, data: any) => T) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    let q: Query;
    if (collectionName === "merchants" || collectionName === "customers") {
      q = collection(db, collectionName); // no timestamp to order by
    } else {
      q = query(collection(db, collectionName), orderBy("timestamp", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => mapDoc(doc.id, doc.data()));
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, mapDoc]);

  return { data, loading };
}

// --------------------------------------------------
// Specific Hooks
// --------------------------------------------------

export function useIncome() {
  return useCollection<Income>("income", (id, data) => ({
    id,
    amount: Number(data.amount || 0),
    note: String(data.note || ""),
    timestamp: tsToIso(data.timestamp),
  }));
}

export function useExpenses() {
  return useCollection<Expense>("expenses", (id, data) => ({
    id,
    amount: Number(data.amount || 0),
    note: String(data.note || ""),
    timestamp: tsToIso(data.timestamp),
  }));
}

export function useMerchants() {
  return useCollection<Merchant>("merchants", (id, data) => ({
    id,
    name: String(data.name || ""),
  }));
}

export function useMerchantTransactions() {
  return useCollection<MerchantTransaction>("merchant_transactions", (id, data) => ({
    id,
    merchantId: String(data.merchantId || ""),
    type: data.type as "Bill Added" | "Payment Made",
    amount: Number(data.amount || 0),
    note: String(data.note || ""),
    timestamp: tsToIso(data.timestamp),
  }));
}

export function useCustomers() {
  return useCollection<Customer>("customers", (id, data) => ({
    id,
    name: String(data.name || ""),
  }));
}

export function useUdhaarTransactions() {
  return useCollection<UdhaarTransaction>("udhaar_transactions", (id, data) => ({
    id,
    customerId: String(data.customerId || ""),
    type: data.type as "Udhaar Given" | "Payment Received",
    amount: Number(data.amount || 0),
    timestamp: tsToIso(data.timestamp),
  }));
}

// --------------------------------------------------
// Unified History Hook
// --------------------------------------------------
export function useHistory() {
  const { data: income, loading: l1 } = useIncome();
  const { data: expenses, loading: l2 } = useExpenses();
  const { data: mTransactions, loading: l3 } = useMerchantTransactions();
  const { data: uTransactions, loading: l4 } = useUdhaarTransactions();
  const { data: merchants, loading: l5 } = useMerchants();
  const { data: customers, loading: l6 } = useCustomers();

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);

  useEffect(() => {
    if (l1 || l2 || l3 || l4 || l5 || l6) return;

    const unified: UnifiedTransaction[] = [];

    income.forEach(i => unified.push({
      id: i.id,
      type: "Income",
      amount: i.amount,
      note: i.note,
      timestamp: i.timestamp
    }));

    expenses.forEach(e => unified.push({
      id: e.id,
      type: "Expense",
      amount: e.amount,
      note: e.note,
      timestamp: e.timestamp
    }));

    mTransactions.forEach(m => {
      const merchant = merchants.find(x => x.id === m.merchantId);
      unified.push({
        id: m.id,
        type: m.type === "Bill Added" ? "Merchant Bill Added" : "Merchant Payment Made",
        amount: m.amount,
        note: m.note,
        timestamp: m.timestamp,
        referenceId: m.merchantId,
        referenceName: merchant?.name || "Unknown Merchant"
      });
    });

    uTransactions.forEach(u => {
      const customer = customers.find(x => x.id === u.customerId);
      unified.push({
        id: u.id,
        type: u.type === "Udhaar Given" ? "Udhaar Given" : "Udhaar Payment Received",
        amount: u.amount,
        timestamp: u.timestamp,
        referenceId: u.customerId,
        referenceName: customer?.name || "Unknown Customer"
      });
    });

    unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setTransactions(unified);
  }, [income, expenses, mTransactions, uTransactions, merchants, customers, l1, l2, l3, l4, l5, l6]);

  return { transactions, loading: l1 || l2 || l3 || l4 || l5 || l6 };
}

// --------------------------------------------------
// Mutation Functions
// --------------------------------------------------

export async function addIncome(amount: number, note: string) {
  const db = getDb();
  await addDoc(collection(db, "income"), {
    amount,
    note,
    timestamp: serverTimestamp()
  });
}

export async function addExpense(amount: number, note: string) {
  const db = getDb();
  await addDoc(collection(db, "expenses"), {
    amount,
    note,
    timestamp: serverTimestamp()
  });
}

export async function addMerchant(name: string) {
  const db = getDb();
  await addDoc(collection(db, "merchants"), { name });
}

export async function addMerchantTransaction(merchantId: string, type: "Bill Added" | "Payment Made", amount: number, note: string) {
  const db = getDb();
  await addDoc(collection(db, "merchant_transactions"), {
    merchantId,
    type,
    amount,
    note,
    timestamp: serverTimestamp()
  });
}

export async function addCustomer(name: string) {
  const db = getDb();
  await addDoc(collection(db, "customers"), { name });
}

export async function addUdhaarTransaction(customerId: string, type: "Udhaar Given" | "Payment Received", amount: number) {
  const db = getDb();
  await addDoc(collection(db, "udhaar_transactions"), {
    customerId,
    type,
    amount,
    timestamp: serverTimestamp()
  });
}

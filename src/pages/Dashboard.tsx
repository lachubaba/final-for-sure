import { useHistory } from "../hooks/useCashbook";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { transactions, loading } = useHistory();

  if (loading) return <div className="p-4 text-center">Loading Dashboard...</div>;

  const now = new Date();
  
  let todayIn = 0;
  let todayOut = 0;
  let monthIn = 0;
  let monthOut = 0;

  transactions.forEach(tx => {
    const d = new Date(tx.timestamp);
    const isToday = d.getDate() === now.getDate() && 
                    d.getMonth() === now.getMonth() && 
                    d.getFullYear() === now.getFullYear();
    const isMonth = d.getMonth() === now.getMonth() && 
                    d.getFullYear() === now.getFullYear();

    // Incomes: Income, Udhaar Payment Received, Merchant Bill Added (Wait, Merchant Bill Added is Udhaar from Merchant, so it's money coming IN to our pocket? 
    // Yes, if we take udhaar from merchant, we haven't paid them yet, or we got goods. If we are tracking cash, getting a bill added means we OWE them, it's not cash in.
    // Wait, the prompt says: "Total incoming today, Total outgoing today". 
    // Let's only count actual Cash In / Cash Out for Dashboard totals.
    // Cash In: "Income", "Udhaar Payment Received". 
    // Cash Out: "Expense", "Merchant Payment Made", "Udhaar Given".
    // "Merchant Bill Added" is just an invoice added to the merchant account, it doesn't affect our cash register immediately unless we paid it. But if we paid it, that's "Merchant Payment Made".
    
    const isCashIn = ["Income", "Udhaar Payment Received"].includes(tx.type);
    const isCashOut = ["Expense", "Merchant Payment Made", "Udhaar Given"].includes(tx.type);

    if (isCashIn) {
      if (isToday) todayIn += tx.amount;
      if (isMonth) monthIn += tx.amount;
    }
    if (isCashOut) {
      if (isToday) todayOut += tx.amount;
      if (isMonth) monthOut += tx.amount;
    }
  });

  const todayNet = todayIn - todayOut;
  const monthNet = monthIn - monthOut;

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Cashbook</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-16 text-lg bg-green-600 hover:bg-green-700">
          <Link to="/income"><ArrowDownCircle className="mr-2" /> Add Income</Link>
        </Button>
        <Button asChild className="h-16 text-lg bg-red-600 hover:bg-red-700">
          <Link to="/expense"><ArrowUpCircle className="mr-2" /> Add Expense</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider text-sm mt-4">Today's Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="text-sm font-medium text-green-700 dark:text-green-400">Incoming</div>
            <div className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">₹{todayIn}</div>
          </Card>
          <Card className="p-4 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="text-sm font-medium text-red-700 dark:text-red-400">Outgoing</div>
            <div className="text-2xl font-bold text-red-800 dark:text-red-300 mt-1">₹{todayOut}</div>
          </Card>
        </div>
        <Card className="p-5 bg-primary text-primary-foreground flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 opacity-80" />
            <span className="font-semibold text-lg">Net Balance (Today)</span>
          </div>
          <span className="text-3xl font-bold">₹{todayNet}</span>
        </Card>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider text-sm">Monthly Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card">
            <div className="text-sm font-medium text-muted-foreground">Incoming</div>
            <div className="text-xl font-bold text-green-600 mt-1">₹{monthIn}</div>
          </Card>
          <Card className="p-4 bg-card">
            <div className="text-sm font-medium text-muted-foreground">Outgoing</div>
            <div className="text-xl font-bold text-red-600 mt-1">₹{monthOut}</div>
          </Card>
        </div>
        <Card className="p-4 bg-muted/50 flex justify-between items-center border">
          <span className="font-semibold text-muted-foreground">Net Balance (Month)</span>
          <span className={`text-xl font-bold ${monthNet >= 0 ? "text-green-600" : "text-red-600"}`}>
            {monthNet >= 0 ? "+" : ""}₹{monthNet}
          </span>
        </Card>
      </div>
    </div>
  );
}

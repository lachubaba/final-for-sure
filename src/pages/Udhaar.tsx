import { useState } from "react";
import { useCustomers, useUdhaarTransactions, addCustomer, addUdhaarTransaction } from "../hooks/useCashbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Plus, ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Udhaar() {
  const { data: customers, loading: l1 } = useCustomers();
  const { data: transactions, loading: l2 } = useUdhaarTransactions();
  
  const [newCustomerName, setNewCustomerName] = useState("");
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Transaction state
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"Udhaar Given" | "Payment Received">("Udhaar Given");
  const [addingTx, setAddingTx] = useState(false);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;
    setAdding(true);
    try {
      await addCustomer(newCustomerName);
      toast.success("Customer added");
      setNewCustomerName("");
      setOpen(false);
    } catch {
      toast.error("Failed to add customer");
    } finally {
      setAdding(false);
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isNaN(Number(txAmount)) || !selectedCustomer) return;
    setAddingTx(true);
    try {
      await addUdhaarTransaction(selectedCustomer, txType, Number(txAmount));
      toast.success("Transaction added");
      setTxAmount("");
    } catch {
      toast.error("Failed to add transaction");
    } finally {
      setAddingTx(false);
    }
  };

  const getCustomerBalance = (customerId: string) => {
    const txs = transactions.filter(t => t.customerId === customerId);
    let balance = 0; // balance = total udhaar given - total payment received
    txs.forEach(t => {
      if (t.type === "Udhaar Given") balance += t.amount;
      if (t.type === "Payment Received") balance -= t.amount;
    });
    return balance;
  };

  if (l1 || l2) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold">Udhaar Khata</h1>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4 mt-4">
              <Input 
                placeholder="Customer Name" 
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={adding}>
                {adding ? "Adding..." : "Add Customer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {selectedCustomer ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedCustomer(null)} className="mb-2 -ml-2 text-muted-foreground">
            ← Back to Customers
          </Button>
          
          <h2 className="text-xl font-semibold mb-4">
            {customers.find(c => c.id === selectedCustomer)?.name}
          </h2>

          <Card className="p-4 bg-muted/30">
            <h3 className="font-medium mb-3">Add Entry</h3>
            <form onSubmit={handleAddTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  variant={txType === "Udhaar Given" ? "default" : "outline"}
                  onClick={() => setTxType("Udhaar Given")}
                  className={txType === "Udhaar Given" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  Gave Udhaar
                </Button>
                <Button 
                  type="button" 
                  variant={txType === "Payment Received" ? "default" : "outline"}
                  onClick={() => setTxType("Payment Received")}
                  className={txType === "Payment Received" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Got Payment
                </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  placeholder="Amount (₹)" 
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={addingTx}>Save</Button>
              </div>
            </form>
          </Card>

          <div className="space-y-2 mt-6">
            <h3 className="font-medium">Transaction History</h3>
            {transactions
              .filter(t => t.customerId === selectedCustomer)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(tx => (
                <Card key={tx.id} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === "Udhaar Given" ? "text-red-600" : "text-green-600"}`}>
                    {tx.type === "Udhaar Given" ? "-" : "+"}₹{tx.amount}
                  </div>
                </Card>
              ))}
            {transactions.filter(t => t.customerId === selectedCustomer).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No transactions yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(c => {
            const balance = getCustomerBalance(c.id);
            const isOwe = balance > 0;
            const isAdvance = balance < 0;
            return (
              <Card 
                key={c.id} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedCustomer(c.id)}
              >
                <div>
                  <div className="font-semibold text-lg">{c.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {balance === 0 ? "Settled" : isOwe ? (
                      <span className="flex items-center text-red-500 font-medium">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> Customer owes
                      </span>
                    ) : (
                      <span className="flex items-center text-green-500 font-medium">
                        <ArrowDownLeft className="w-4 h-4 mr-1" /> Advance given
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${balance === 0 ? "text-gray-500" : isOwe ? "text-red-600" : "text-green-600"}`}>
                    ₹{Math.abs(balance)}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            );
          })}
          {customers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              No customers found.<br/>Click + to add your first customer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

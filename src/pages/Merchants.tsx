import { useState } from "react";
import { useMerchants, useMerchantTransactions, addMerchant } from "../hooks/useCashbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Plus, ChevronRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Merchants() {
  const { data: merchants, loading: l1 } = useMerchants();
  const { data: transactions, loading: l2 } = useMerchantTransactions();
  
  const [newMerchantName, setNewMerchantName] = useState("");
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantName.trim()) return;
    setAdding(true);
    try {
      await addMerchant(newMerchantName);
      toast.success("Merchant added");
      setNewMerchantName("");
      setOpen(false);
    } catch {
      toast.error("Failed to add merchant");
    } finally {
      setAdding(false);
    }
  };

  const getMerchantBalance = (merchantId: string) => {
    const txs = transactions.filter(t => t.merchantId === merchantId);
    let balance = 0; // balance = total bills - total payments
    txs.forEach(t => {
      if (t.type === "Bill Added") balance += t.amount;
      if (t.type === "Payment Made") balance -= t.amount;
    });
    return balance;
  };

  if (l1 || l2) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Merchants</h1>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline" className="rounded-full">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Merchant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMerchant} className="space-y-4 mt-4">
              <Input 
                placeholder="Merchant Name" 
                value={newMerchantName}
                onChange={e => setNewMerchantName(e.target.value)}
                autoFocus
              />
              <Button type="submit" className="w-full" disabled={adding}>
                {adding ? "Adding..." : "Add Merchant"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {selectedMerchant ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedMerchant(null)} className="mb-2 -ml-2 text-muted-foreground">
            ← Back to Merchants
          </Button>
          <h2 className="text-xl font-semibold">
            {merchants.find(m => m.id === selectedMerchant)?.name} Transactions
          </h2>
          <div className="space-y-2">
            {transactions
              .filter(t => t.merchantId === selectedMerchant)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map(tx => (
                <Card key={tx.id} className="p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()} • {tx.note}
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === "Bill Added" ? "text-red-600" : "text-green-600"}`}>
                    {tx.type === "Bill Added" ? "+" : "-"}₹{tx.amount}
                  </div>
                </Card>
              ))}
            {transactions.filter(t => t.merchantId === selectedMerchant).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No transactions yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {merchants.map(m => {
            const balance = getMerchantBalance(m.id);
            const isOwe = balance > 0;
            const isAdvance = balance < 0;
            return (
              <Card 
                key={m.id} 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedMerchant(m.id)}
              >
                <div>
                  <div className="font-semibold text-lg">{m.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {balance === 0 ? "Settled" : isOwe ? (
                      <span className="flex items-center text-red-500 font-medium">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> You owe
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
          {merchants.length === 0 && (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
              No merchants found.<br/>Click + to add your first merchant.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

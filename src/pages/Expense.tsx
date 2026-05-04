import { useState } from "react";
import { addExpense, addMerchantTransaction, useMerchants } from "../hooks/useCashbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowUpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Expense() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [merchantType, setMerchantType] = useState<"Bill Added" | "Payment Made">("Bill Added");
  const [loading, setLoading] = useState(false);

  const { data: merchants } = useMerchants();

  const handleOtherExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    try {
      await addExpense(Number(amount), note);
      toast.success("Expense added successfully");
      setAmount("");
      setNote("");
    } catch (error) {
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!merchantId) {
      toast.error("Please select a merchant");
      return;
    }
    
    setLoading(true);
    try {
      await addMerchantTransaction(merchantId, merchantType, Number(amount), note);
      toast.success("Transaction added successfully");
      setAmount("");
      setNote("");
    } catch (error) {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowUpCircle className="text-red-500 w-6 h-6" />
        <h1 className="text-2xl font-bold">Outgoing Money</h1>
      </div>

      <Tabs defaultValue="merchant" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="merchant">Merchant Payment</TabsTrigger>
          <TabsTrigger value="other">Other Expense</TabsTrigger>
        </TabsList>

        <TabsContent value="merchant">
          <form onSubmit={handleMerchantTx} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Merchant</label>
              <Select value={merchantId} onValueChange={setMerchantId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                  {merchants.length === 0 && (
                    <SelectItem value="none" disabled>No merchants found. Add one first.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Select value={merchantType} onValueChange={(val: "Bill Added" | "Payment Made") => setMerchantType(val)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bill Added">Bill Added (Udhaar from Merchant)</SelectItem>
                  <SelectItem value="Payment Made">Payment Made</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="text-2xl h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note (Optional)</label>
              <Input 
                type="text" 
                placeholder="Invoice number or details" 
                value={note} 
                onChange={e => setNote(e.target.value)}
                className="h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg mt-6 bg-red-600 hover:bg-red-700" 
              disabled={loading || merchants.length === 0}
            >
              {loading ? "Saving..." : "Save Transaction"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="other">
          <form onSubmit={handleOtherExpense} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="text-2xl h-14"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Input 
                type="text" 
                placeholder="Rent, Electricity, Tea..." 
                value={note} 
                onChange={e => setNote(e.target.value)}
                className="h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg mt-6 bg-red-600 hover:bg-red-700" 
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Expense"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

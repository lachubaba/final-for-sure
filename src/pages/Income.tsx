import { useState } from "react";
import { addIncome } from "../hooks/useCashbook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowDownCircle } from "lucide-react";

export default function Income() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setLoading(true);
    try {
      await addIncome(Number(amount), note);
      toast.success("Income added successfully");
      setAmount("");
      setNote("");
    } catch (error) {
      toast.error("Failed to add income");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowDownCircle className="text-green-500 w-6 h-6" />
        <h1 className="text-2xl font-bold">Add Income</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (₹)</label>
          <Input 
            type="number" 
            placeholder="0" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="text-2xl h-14"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Note (Optional)</label>
          <Input 
            type="text" 
            placeholder="What is this for?" 
            value={note} 
            onChange={e => setNote(e.target.value)}
            className="h-12"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg mt-6 bg-green-600 hover:bg-green-700" 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Income"}
        </Button>
      </form>
    </div>
  );
}

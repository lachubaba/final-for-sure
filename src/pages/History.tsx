import { useState } from "react";
import { useHistory } from "../hooks/useCashbook";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

type FilterType = "all" | "today" | "month" | "custom";

export default function History() {
  const { transactions, loading } = useHistory();
  const [filter, setFilter] = useState<FilterType>("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  let filtered = transactions;
  const now = new Date();

  if (filter === "today") {
    filtered = transactions.filter(t => {
      const d = new Date(t.timestamp);
      return d.getDate() === now.getDate() && 
             d.getMonth() === now.getMonth() && 
             d.getFullYear() === now.getFullYear();
    });
  } else if (filter === "month") {
    filtered = transactions.filter(t => {
      const d = new Date(t.timestamp);
      return d.getMonth() === now.getMonth() && 
             d.getFullYear() === now.getFullYear();
    });
  } else if (filter === "custom" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = transactions.filter(t => {
      const d = new Date(t.timestamp);
      return d >= start && d <= end;
    });
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-gray-700" />
        <h1 className="text-2xl font-bold">History</h1>
      </div>

      <div className="space-y-3">
        <Select value={filter} onValueChange={(val: FilterType) => setFilter(val)}>
          <SelectTrigger className="h-12 bg-card">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {filter === "custom" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 mt-6">
        {filtered.map(tx => {
          // Determine sign and color based on type
          const isIncome = ["Income", "Udhaar Payment Received", "Merchant Bill Added"].includes(tx.type);
          const sign = isIncome ? "+" : "-";
          const colorClass = isIncome ? "text-green-600" : "text-red-600";

          return (
            <Card key={tx.id} className="p-3 flex justify-between items-center bg-card/80">
              <div className="flex-1">
                <div className="font-semibold text-sm">{tx.type}</div>
                {tx.referenceName && (
                  <div className="text-xs font-medium text-gray-700">For: {tx.referenceName}</div>
                )}
                {tx.note && <div className="text-xs text-gray-600 mt-0.5">Note: {tx.note}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(tx.timestamp).toLocaleString()}
                </div>
              </div>
              <div className={`font-bold text-lg whitespace-nowrap ml-2 ${colorClass}`}>
                {sign}₹{tx.amount}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No transactions found for this period.
          </div>
        )}
      </div>
    </div>
  );
}

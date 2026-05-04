import { ShoppingBag, Trash2 } from "lucide-react";
import type { Sale } from "@/lib/types";

interface Props {
  sale: Sale;
  onDelete?: (sale: Sale) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SaleRow({ sale, onDelete }: Props) {
  const qty = sale.quantity || 1;
  const total = sale.sellingPrice * qty;
  const profit = sale.profit;
  const isLoss = profit < 0;

  return (
    <div className="flex items-center gap-3 bg-card border rounded-xl px-3.5 py-3 mb-2">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isLoss ? "bg-destructive-soft" : "bg-secondary"
        }`}
      >
        <ShoppingBag size={16} className={isLoss ? "text-destructive" : "text-primary"} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{sale.productName}</p>
        <p className="text-[11px] text-muted-foreground">
          {sale.staff} · qty {qty} · {formatDate(sale.timestamp)}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold">₦{total.toLocaleString()}</span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isLoss ? "bg-destructive-soft text-destructive" : "bg-success/10 text-success"
            }`}
          >
            {isLoss ? "−" : "+"}₦{Math.abs(profit).toLocaleString()}
          </span>
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          aria-label="Delete sale"
          onClick={() => onDelete(sale)}
          className="p-1.5 text-destructive hover:bg-destructive-soft rounded-lg transition"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

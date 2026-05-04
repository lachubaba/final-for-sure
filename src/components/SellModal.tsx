import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Lock, Minus, Plus } from "lucide-react";
import { STAFF_OPTIONS, type Product } from "@/lib/types";

export interface SaleData {
  sellingPrice: number;
  quantity: number;
  staff: string;
}

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product, data: SaleData) => Promise<void>;
}

export function SellModal({ open, product, onClose, onConfirm }: Props) {
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [staff, setStaff] = useState<string>("Owner");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && product) {
      setSellingPrice("");
      setQuantity("1");
      setStaff("Owner");
      setError("");
    }
  }, [product, open]);

  const sp = parseFloat(sellingPrice) || 0;
  const qty = parseInt(quantity) || 1;
  const cp = product?.costPrice || 0;
  const profit = (sp - cp) * qty;
  const totalRevenue = sp * qty;
  const isLoss = sp > 0 && sp < cp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const spNum = parseFloat(sellingPrice);
    if (isNaN(spNum) || spNum <= 0) return setError("Enter a valid selling price");
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return setError("Enter a valid quantity");
    if (!product) return;
    setError("");
    setLoading(true);
    try {
      await onConfirm(product, { sellingPrice: spNum, quantity: qtyNum, staff });
      onClose();
    } catch {
      setError("Failed to record sale. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription className="line-clamp-2">{product?.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cost price (read-only) */}
          <div className="flex items-center gap-2 bg-muted border rounded-lg px-3.5 py-2.5">
            <Lock size={14} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">Cost Price</span>
            <span className="text-sm font-bold">₦{cp.toLocaleString()}</span>
          </div>

          {isLoss && (
            <div className="flex items-center gap-2 bg-destructive-soft border border-destructive rounded-lg p-3">
              <AlertTriangle size={16} className="text-destructive shrink-0" />
              <p className="text-xs font-medium text-destructive">
                Selling below cost price — this is a loss!
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="sp">Selling Price (₦)</Label>
            <Input
              id="sp"
              inputMode="decimal"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0"
              className={`text-center text-2xl font-bold h-14 ${
                isLoss ? "border-destructive" : ""
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setQuantity(String(Math.max(1, qty - 1)))}
                className="h-11 w-11"
              >
                <Minus size={18} />
              </Button>
              <Input
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-center text-xl font-bold h-11"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setQuantity(String(qty + 1))}
                className="h-11 w-11"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Staff</Label>
            <div className="flex gap-2">
              {STAFF_OPTIONS.map((s) => {
                const active = staff === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStaff(s)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {sp > 0 && (
            <div
              className={`rounded-xl border p-3.5 space-y-2 ${
                isLoss
                  ? "bg-destructive-soft border-destructive"
                  : "bg-success/10 border-success"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-bold">₦{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profit / Loss</span>
                <span
                  className={`font-bold ${isLoss ? "text-destructive" : "text-success"}`}
                >
                  {isLoss ? "−" : "+"}₦{Math.abs(profit).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className={`w-full h-12 gap-2 text-base ${
              isLoss ? "bg-destructive hover:bg-destructive/90" : ""
            }`}
          >
            <CheckCircle2 size={18} />
            {isLoss ? "Record Sale (Loss)" : "Confirm Sale"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

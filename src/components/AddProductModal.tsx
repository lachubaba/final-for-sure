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
import { CATEGORIES, type Product } from "@/lib/types";
import { Check } from "lucide-react";

interface Props {
  open: boolean;
  editProduct: Product | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    costPrice: number;
    category: string;
    imageUrl: string;
  }) => Promise<void>;
}

export function AddProductModal({ open, editProduct, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [category, setCategory] = useState<string>("Shoes");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editProduct) {
        setName(editProduct.name);
        setCostPrice(String(editProduct.costPrice));
        setCategory(editProduct.category || "Shoes");
        setImageUrl(editProduct.imageUrl || "");
      } else {
        setName("");
        setCostPrice("");
        setCategory("Shoes");
        setImageUrl("");
      }
      setError("");
    }
  }, [editProduct, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cp = parseFloat(costPrice);
    if (!name.trim()) return setError("Product name is required");
    if (isNaN(cp) || cp < 0) return setError("Enter a valid cost price");
    setError("");
    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        costPrice: cp,
        category,
        imageUrl: imageUrl.trim(),
      });
      onClose();
    } catch {
      setError("Failed to save product. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {editProduct ? "Update product details" : "Add a new shoe to your inventory"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nike Air Max 90"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp">Cost Price (₦) *</Label>
            <Input
              id="cp"
              inputMode="decimal"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="e.g. 8500"
            />
            <p className="text-xs text-muted-foreground">
              Cost price is shown read-only during sales
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Category *</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-2 rounded-full border text-sm font-medium transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="img">Image URL (optional)</Label>
            <Input
              id="img"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              autoCapitalize="off"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 gap-2 text-base"
          >
            <Check size={18} />
            {editProduct ? "Save Changes" : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

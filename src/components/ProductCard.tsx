import { ShoppingBag, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";

interface Props {
  product: Product;
  onSell?: (p: Product) => void;
  onEdit?: (p: Product) => void;
  onDelete?: (p: Product) => void;
  catalogMode?: boolean;
}

export function ProductCard({ product, onSell, onEdit, onDelete, catalogMode }: Props) {
  const catColor = CATEGORY_COLORS[product.category] || "#6B7280";

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
      <div className="relative w-full h-40 bg-muted flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon size={36} className="text-muted-foreground" />
        )}
        <span
          className="absolute top-2 left-2 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
          style={{ backgroundColor: catColor }}
        >
          {product.category}
        </span>
      </div>

      <div className="p-2.5 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold line-clamp-2 leading-tight">{product.name}</h3>
        {!catalogMode && (
          <p className="text-xs text-muted-foreground font-medium">
            CP: ₦{product.costPrice.toLocaleString()}
          </p>
        )}

        {!catalogMode && (
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onSell?.(product)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition"
            >
              <ShoppingBag size={13} />
              Sell
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Edit"
                onClick={() => onEdit?.(product)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary hover:bg-secondary/80 transition"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                aria-label="Delete"
                onClick={() => onDelete?.(product)}
                className="w-8 h-8 rounded-lg bg-destructive-soft flex items-center justify-center text-destructive hover:bg-destructive-soft/80 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

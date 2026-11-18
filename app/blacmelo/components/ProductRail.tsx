
import { useMemo, useState } from "react";
import ClothingRailHero, { type RailGarment } from "~/blacmelo/components/ui/product-rail-gallery";
import { useStore } from "./providers/Store";
import { formatPrice, products, type Product } from "~/blacmelo/data/products";
import { railHoodies, type Hoodie } from "~/blacmelo/data/hoodies";

type Entry = { kind: "tee"; product: Product } | { kind: "hoodie"; hoodie: Hoodie };

/** tees and hoodies taking turns along the rail */
function lineUp(withHoodies: boolean): Entry[] {
  const tees: Entry[] = products.map((product) => ({ kind: "tee", product }));
  if (!withHoodies) return tees;
  const hs: Entry[] = railHoodies.map((hoodie) => ({ kind: "hoodie", hoodie }));
  const out: Entry[] = [];
  for (let i = 0; i < Math.max(tees.length, hs.length); i++) {
    if (tees[i]) out.push(tees[i]);
    if (hs[i]) out.push(hs[i]);
  }
  return out;
}

/**
 * The BLACMELO clothing rail: every piece hangs side-on; hover (or tap) turns one to the front,
 * click lifts it off the rail to see the back, choose a size and add it to the bag.
 */
export default function ProductRail({
  className,
  maxHeight,
  autoplay = true,
  withHoodies = false,
}: {
  className?: string;
  maxHeight?: number;
  autoplay?: boolean;
  withHoodies?: boolean;
}) {
  const entries = useMemo(() => lineUp(withHoodies), [withHoodies]);
  const items = useMemo<RailGarment[]>(
    () =>
      entries.map((e) =>
        e.kind === "tee"
          ? {
              id: e.product.id,
              name: `${e.product.name}, ${e.product.colour.toLowerCase()}`,
              description: e.product.description,
              kind: "tee",
              color: e.product.hex,
              image: e.product.image,
              backImage: e.product.imageBack,
              tag: formatPrice(e.product.price),
              details: e.product.details,
            }
          : {
              id: `hoodie-${e.hoodie.key}`,
              name: `${e.hoodie.name}, ${e.hoodie.colour.toLowerCase()}`,
              description: e.hoodie.description,
              kind: "hoodie",
              color: e.hoodie.hex,
              image: `/products/hoodie-${e.hoodie.key}.webp`,
              tag: "New",
              details: [e.hoodie.print, "Oversized fleece hoodie"],
            }
      ),
    [entries]
  );

  return (
    <ClothingRailHero
      items={items}
      hanger="matte"
      autoplay={autoplay}
      interval={2400}
      imageBottom={withHoodies ? 0.71 : 0.66}
      maxHeight={maxHeight}
      detailAction={(_, i) => {
        const e = entries[i];
        return e.kind === "tee" ? (
          <DetailBuy key={e.product.id} product={e.product} />
        ) : (
          <p key={e.hoodie.key} className="mt-4 text-left text-[13px] text-muted-foreground">
            From the hoodies collection.
          </p>
        );
      }}
      className={className}
    />
  );
}

/** Size and add to bag inside the rail's detail view */
export function DetailBuy({ product }: { product: Product }) {
  const { add } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  return (
    <div className="mt-4 flex flex-col gap-3 text-left">
      <div className="flex items-baseline justify-between text-sm">
        <span>{formatPrice(product.price)}</span>
        <span className="text-[13px] text-muted-foreground">Size</span>
      </div>
      <div className="grid border-l border-t border-ink/20" style={{ gridTemplateColumns: `repeat(${product.sizes.length}, minmax(0, 1fr))` }} role="group" aria-label="Size">
        {product.sizes.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={size === s}
            onClick={() => {
              setSize(s);
              setError(false);
            }}
            className={`border-b border-r border-ink/20 py-3 text-[13px] transition-colors duration-300 ${
              size === s ? "bg-ink text-bone" : "hover:bg-ink/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => (size ? add(product, size) : setError(true))}
        className="group relative flex items-center justify-between overflow-hidden bg-ink px-5 py-4 text-[14px] text-bone"
      >
        <span className="absolute inset-0 origin-left scale-x-0 bg-wine transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:scale-x-100" />
        <span className="relative">Add to bag</span>
        <span className="relative tabular-nums">{formatPrice(product.price)}</span>
      </button>
      <p role="alert" className={`text-[13px] ${error ? "" : "invisible"}`}>
        Choose a size to add this to your bag.
      </p>
    </div>
  );
}

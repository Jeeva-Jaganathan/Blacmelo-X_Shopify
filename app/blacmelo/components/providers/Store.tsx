import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";
import { CartForm } from "@shopify/hydrogen";
import type { Product } from "~/blacmelo/data/products";
import { catalogue } from "~/blacmelo/data/catalogue";
import { pieceIdForHandle, variantFor, type ShopData } from "~/blacmelo/shopify";

/**
 * The bag, backed by the real Shopify cart. Components keep the designer's interface
 * (items, count, add, remove, ...); only this file knows about Shopify.
 */
export type BagItem = {
  key: string;
  id: string;
  name: string;
  colour: string;
  image: string;
  size: string;
  price: number;
  qty: number;
};

type Store = {
  items: BagItem[];
  count: number;
  subtotal: number;
  add: (p: Product, size: string) => void;
  remove: (key: string) => void;
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  toast: string | null;
  checkoutUrl: string | null;
  busy: boolean;
};

const StoreCtx = createContext<Store | null>(null);

export const useStore = () => {
  const s = useContext(StoreCtx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
};

function toItems(cart: any): BagItem[] {
  return (cart?.lines?.nodes ?? []).map((l: any) => {
    const m = l.merchandise ?? {};
    const handle = m.product?.handle ?? "";
    const piece = catalogue.find((p) => p.id === pieceIdForHandle(handle));
    const size = m.selectedOptions?.find((o: any) => o.name.toLowerCase() === "size")?.value ?? m.title ?? "";
    return {
      key: l.id,
      id: piece?.id ?? handle,
      name: piece?.name ?? m.product?.title ?? "",
      colour: piece?.colour ?? "",
      image: piece?.tight ?? m.image?.url ?? "",
      size,
      price: Number(l.cost?.amountPerQuantity?.amount ?? m.price?.amount ?? 0),
      qty: l.quantity,
    };
  });
}

const cartInput = (action: string, inputs: Record<string, unknown>) => ({
  [CartForm.INPUT_NAME]: JSON.stringify({ action, inputs }),
});

export default function StoreProvider({ shop, children }: { shop: ShopData; children: React.ReactNode }) {
  const root = useRouteLoaderData("root") as { cart?: Promise<any> } | undefined;
  const [cart, setCart] = useState<any>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetcher = useFetcher<{ cart?: any; errors?: any[] }>();

  // the cart arrives deferred from the root loader
  useEffect(() => {
    let live = true;
    Promise.resolve(root?.cart).then((c) => live && c !== undefined && setCart(c));
    return () => {
      live = false;
    };
  }, [root?.cart]);

  // every cart mutation returns the updated cart
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.cart) setCart(fetcher.data.cart);
  }, [fetcher.state, fetcher.data]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const add = useCallback(
    (p: Product, size: string) => {
      const v = variantFor(shop, p.id, size);
      if (!v) return say(`${p.name} isn't available to order yet`);
      if (!v.available) return say(`${p.name}, size ${size} is sold out`);
      fetcher.submit(cartInput(CartForm.ACTIONS.LinesAdd, { lines: [{ merchandiseId: v.variantId, quantity: 1 }] }), {
        method: "POST",
        action: "/cart",
      });
      say(`${p.name}, size ${size} added to your bag`);
    },
    [shop, fetcher, say]
  );

  const remove = useCallback(
    (key: string) => {
      setCart((c: any) =>
        c ? { ...c, lines: { ...c.lines, nodes: c.lines.nodes.filter((l: any) => l.id !== key) } } : c
      );
      fetcher.submit(cartInput(CartForm.ACTIONS.LinesRemove, { lineIds: [key] }), { method: "POST", action: "/cart" });
    },
    [fetcher]
  );

  const items = useMemo(() => toItems(cart), [cart]);

  const value = useMemo<Store>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      add,
      remove,
      bagOpen,
      setBagOpen,
      toast,
      checkoutUrl: cart?.checkoutUrl ?? null,
      busy: fetcher.state !== "idle",
    }),
    [items, add, remove, bagOpen, toast, cart, fetcher.state]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/**
 * Bridges the designer's catalogue (copy, photography, layout) to real Shopify products.
 * The catalogue keeps the editorial content; Shopify supplies price, sizes, variant ids and stock.
 */
import { catalogue } from "./data/catalogue";
import { products } from "./data/products";

/** catalogue piece id -> Shopify product handle */
export const HANDLES: Record<string, string> = {
  afterlife: "afterlife-1",
  "wild-and-free": "green-flower",
  "fury-wings": "black-dragon",
  vision: "vision-1",
  "born-to-rule": "born-to-rule",
  "rose-rush": "afterlife-copy-1",
  "dark-romance": "dark-romance",
  "floral-aesthetics": "floral-aesthetics-copy",
  "hoodie-black": "black-optic-wash-hoodie",
  "hoodie-red": "maroon-hoodie",
  "hoodie-blue": "blue-wash-hoodie",
  "hoodie-green": "green-hoodie",
  "hoodie-brown": "brown-wash-hoodie",
  "hoodie-navy": "blue-hoodie",
  signature: "the-signature-jacket",
};
/** ids used by the homepage rail (data/products.ts) that share a Shopify product with a catalogue piece */
const ALIASES: Record<string, string> = { "serpent-crown": "born-to-rule", garden: "floral-aesthetics" };

export const handleFor = (id: string) => HANDLES[id] ?? HANDLES[ALIASES[id] ?? ""];
export const pieceIdForHandle = (handle: string) =>
  Object.keys(HANDLES).find((k) => HANDLES[k] === handle);

export type ShopSize = { size: string; variantId: string; available: boolean };
export type ShopProduct = {
  handle: string;
  title: string;
  price: number;
  currency: string;
  available: boolean;
  sizes: ShopSize[];
  image?: string;
};
export type ShopData = Record<string, ShopProduct>; // keyed by handle

export const SHOP_PRODUCTS_QUERY = `#graphql
  query BlacmeloShopProducts($query: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 50, query: $query) {
      nodes {
        handle
        title
        availableForSale
        featuredImage { url }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 50) {
          nodes { id availableForSale selectedOptions { name value } }
        }
      }
    }
  }
` as const;

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];

export function toShopData(nodes: any[]): ShopData {
  const out: ShopData = {};
  for (const n of nodes ?? []) {
    const seen = new Map<string, ShopSize>();
    for (const v of n.variants?.nodes ?? []) {
      const size = v.selectedOptions?.find((o: any) => o.name.toLowerCase() === "size")?.value;
      if (!size) continue;
      const prev = seen.get(size);
      // several variants per size (e.g. gender): keep the first one in stock
      if (!prev || (!prev.available && v.availableForSale)) {
        seen.set(size, { size, variantId: v.id, available: !!v.availableForSale });
      }
    }
    const sizes = [...seen.values()].sort(
      (a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)
    );
    out[n.handle] = {
      handle: n.handle,
      title: n.title,
      price: Number(n.priceRange?.minVariantPrice?.amount ?? 0),
      currency: n.priceRange?.minVariantPrice?.currencyCode ?? "AED",
      available: !!n.availableForSale,
      sizes,
      image: n.featuredImage?.url,
    };
  }
  return out;
}

export const shopQueryString = () =>
  [...new Set(Object.values(HANDLES))].map((h) => `handle:${h}`).join(" OR ");

let currency = "AED";
export const storeCurrency = () => currency;

/**
 * Write Shopify prices and sizes onto the designer's catalogue objects, so every component
 * that reads piece.price / piece.sizes shows real data without being rewritten.
 */
export function applyShopData(shop: ShopData) {
  for (const p of [...catalogue, ...products]) {
    const s = shop[handleFor(p.id) ?? ""];
    if (!s) continue;
    p.price = s.price;
    currency = s.currency;
    if (s.sizes.length) p.sizes = s.sizes.map((x) => x.size);
  }
}

export function variantFor(shop: ShopData, pieceId: string, size: string) {
  return shop[handleFor(pieceId) ?? ""]?.sizes.find((s) => s.size === size);
}

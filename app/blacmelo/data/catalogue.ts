/**
 * Everything on the collection page, by category.
 * The jacket is not here on purpose: it has its own page (#signature).
 * Prices are the founders' prices in ₹ — replace with the store's catalogue when it goes live.
 */
import { type Product } from "./products";
import { hoodies } from "./hoodies";

export type Category = "tees" | "hoodies" | "pants";

export type Piece = Product & {
  category: Category;
  /** shown on hover: another cut-out (back) or a full photograph */
  hover?: { src: string; kind: "cutout" | "photo" | "zoom" };
  /** small line under the name */
  note: string;
  /** the main image is a photograph (fills the frame), not a cut-out */
  cover?: boolean;
  /** every picture of the piece, for the detail view */
  gallery?: Shot[];
};

export const CATEGORIES: { key: Category; label: string; plural: string }[] = [
  { key: "tees", label: "T-shirts", plural: "T-shirts" },
  { key: "hoodies", label: "Hoodies", plural: "Hoodies" },
  { key: "pants", label: "Pants", plural: "Pants" },
];

/** one picture in a piece's gallery: a photograph (fills the frame) or a cut-out (sits on ash) */
export type Shot = { src: string; srcSet?: string; cutout?: boolean };

const look = (name: string): Shot => ({ src: `/look/${name}-800.webp`, srcSet: `/look/${name}-800.webp 800w, /look/${name}-1500.webp 1500w` });
const shots = (slug: string, from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => look(`${slug}-${from + i}`));
const drop = (key: string): Shot => ({ src: `/campaign/drop-${key}-700.webp`, srcSet: `/campaign/drop-${key}-700.webp 700w, /campaign/drop-${key}-1200.webp 1200w` });
const cut = (name: string): Shot => ({ src: `/products/${name}-tight.webp`, cutout: true });
const TEE_SIZES = ["S", "M", "L", "XL", "XXL"];

/**
 * The tees. The card shows product pictures only ("T-shirts (HERO IMAGES)" on Drive): the first product shot,
 * and on hover a second one, or a closer look at the same picture. The lookbook (model) pictures appear only
 * once the piece is opened, ahead of the product shots.
 */
function tee(
  id: string,
  name: string,
  colour: string,
  hex: string,
  description: string,
  details: string[],
  product: Shot[],
  models: Shot[]
): Piece {
  const [card, second] = product;
  return {
    id,
    name,
    colour,
    hex,
    price: 1600,
    currency: "INR",
    description,
    details,
    image: card.src,
    tight: card.src,
    sizes: TEE_SIZES,
    category: "tees",
    note: colour,
    cover: !card.cutout,
    hover: second ? { src: second.src, kind: second.cutout ? "cutout" : "photo" } : { src: card.src, kind: "zoom" },
    gallery: [...models, ...product],
  };
}

const tees: Piece[] = [
  tee("afterlife", "Afterlife", "Burnt orange", "#e0621a",
    "A knight carved out of a hidden world: forest, fire and roots, printed large across the back. The wordmark sits quietly on the chest.",
    ["Heavyweight cotton", "Oversized fit", "Back print"],
    [drop("afterlife"), cut("afterlife-back")], [look("afterlife-1")]),
  tee("wild-and-free", "Wild & Free", "Washed forest green", "#1f4a33",
    "Acid-washed forest green with the BLACMELO wordmark up front and a field of grey roses across the back.",
    ["Acid wash", "Oversized fit", "Back print"],
    [drop("roses"), cut("green-front")], shots("wild-and-free", 1, 6)),
  tee("fury-wings", "Fury Wings", "Black", "#0d0d0d",
    "A white dragon embroidered through the BLACMELO wordmark, its coils and wings spilling across the chest.",
    ["Embroidered", "Oversized fit", "Front embroidery"],
    [drop("dragon")], shots("fury-wings", 1, 5)),
  tee("vision", "Vision", "Burgundy", "#6a1f2a",
    "Garment-dyed burgundy. The wordmark on the chest; on the back, an embroidered butterfly over a tonal BM monogram.",
    ["Embroidered", "Oversized fit", "Back embroidery"],
    [drop("butterfly")], shots("vision", 1, 4)),
  tee("born-to-rule", "Born to Rule", "Black", "#0d0d0d",
    "Serpent-scale wordmark on the chest; on the back, a gold crown with a serpent coiled through it.",
    ["Heavyweight cotton", "Oversized fit", "Front and back print"],
    [cut("crown-back"), cut("crown-front")], shots("born-to-rule", 1, 5)),
  tee("rose-rush", "Rose Rush", "Black", "#0d0d0d",
    "A band of red roses across the chest, roses on both sleeves and the BLACMELO script on the arm.",
    ["Embroidered", "Oversized fit", "Limited edition"],
    [look("rose-rush-hero"), look("rose-rush-9"), look("rose-rush-8")], shots("rose-rush", 1, 7)),
  tee("dark-romance", "Dark Romance", "Black", "#0d0d0d",
    "A leopard bound in thorns with roses rising from it, embossed black on black. You see it when the light hits it.",
    ["Tonal emboss", "Oversized fit", "Limited edition"],
    [look("dark-romance-hero"), look("dark-romance-7"), look("dark-romance-6")], shots("dark-romance", 1, 5)),
  tee("floral-aesthetics", "Floral Aesthetics", "White", "#f1f1ef",
    "Roses and leaves climbing over both shoulders, the BLACMELO wordmark at the centre of the chest.",
    ["Heavyweight cotton", "Oversized fit", "Shoulder print"],
    [look("floral-aesthetics-3")], shots("floral-aesthetics", 1, 2)),
];

const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const hoodiePieces: Piece[] = hoodies.map((h) => ({
  id: `hoodie-${h.key}`,
  name: `${title(h.colour)} Hoodie`,
  colour: h.colour,
  hex: h.hex,
  price: 2500,
  currency: "INR",
  description: h.description,
  details: ["Heavy fleece", "Oversized fit", h.print],
  image: `/products/hoodie-${h.key}.webp`,
  tight: `/products/hoodie-${h.key}-tight.webp`,
  sizes: ["S", "M", "L", "XL"],
  category: "hoodies",
  note: h.print,
  hover: h.key === "navy" ? undefined : { src: `/hoodies/${h.key}-640.webp`, kind: "photo" },
}));

/** Pants: photographs to come. Shown as a "coming next" panel until they are added here. */
const pants: Piece[] = [];

export const catalogue: Piece[] = [...tees, ...hoodiePieces, ...pants];

export const pieceById = (id: string) => catalogue.find((p) => p.id === id)!;

export const byCategory = (c: Category) => catalogue.filter((p) => p.category === c);

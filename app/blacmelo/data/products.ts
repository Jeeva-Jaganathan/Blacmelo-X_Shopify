import { storeCurrency } from "../shopify";
/**
 * BLACMELO products shown on the homepage.
 *
 * Photos live in /public/products:
 *   <name>.webp        transparent cut-out on a 200 × 310 portrait canvas (used by the clothing rail;
 *                      front and back share the same canvas and scale so pieces don't jump as they turn)
 *   <name>-tight.webp  the same cut-out cropped tight (used in the signature section, bag and menu)
 *
 * Names other than those printed on the neck labels, and all prices, are placeholders: replace them
 * with the real catalogue data, or map your store's products (Shopify, Medusa, etc.) to this shape.
 */

export type Product = {
  id: string;
  name: string;
  /** Colour as shown to customers */
  colour: string;
  /** Colour of the fabric, used for the rail illustration fallback */
  hex: string;
  price: number;
  currency: string;
  description: string;
  details: string[];
  /** Rail images (portrait canvas) */
  image: string;
  imageBack?: string;
  /** Tight crops */
  tight: string;
  tightBack?: string;
  sizes: string[];
};

const SIZES = ["S", "M", "L", "XL", "XXL"];
const img = (name: string) => `/products/${name}.webp`;
const tight = (name: string) => `/products/${name}-tight.webp`;

export const products: Product[] = [
  {
    id: "wild-and-free",
    name: "Wild & Free",
    colour: "Washed forest green",
    hex: "#1f4a33",
    price: 1600,
    currency: "INR",
    description: "Acid-washed forest green with the BLACMELO wordmark up front and a field of grey roses across the back.",
    details: ["Acid wash", "Oversized fit", "Back print"],
    image: img("green-front"),
    imageBack: img("green-back"),
    tight: tight("green-front"),
    tightBack: tight("green-back"),
    sizes: SIZES,
  },
  {
    id: "afterlife",
    name: "Afterlife",
    colour: "Burnt orange",
    hex: "#e0621a",
    price: 1600,
    currency: "INR",
    description: "A knight carved out of a hidden world: forest, fire and roots, printed large across the back.",
    details: ["Heavyweight cotton", "Oversized fit", "Back print"],
    image: img("afterlife-back"),
    tight: tight("afterlife-back"),
    sizes: SIZES,
  },
  {
    id: "serpent-crown",
    name: "Born to Rule",
    colour: "Black",
    hex: "#0d0d0d",
    price: 1600,
    currency: "INR",
    description: "Serpent-scale wordmark on the chest; on the back, a jewelled crown with a serpent coiled through it.",
    details: ["Heavyweight cotton", "Oversized fit", "Front and back print"],
    image: img("crown-front"),
    imageBack: img("crown-back"),
    tight: tight("crown-front"),
    tightBack: tight("crown-back"),
    sizes: SIZES,
  },
  {
    id: "rose-rush",
    name: "Rose Rush",
    colour: "Black",
    hex: "#0d0d0d",
    price: 1600,
    currency: "INR",
    description: "A band of red roses across the chest, roses on both sleeves and the BLACMELO script on the arm.",
    details: ["Heavyweight cotton", "Oversized fit", "Limited edition"],
    image: img("rose-front"),
    imageBack: img("rose-back"),
    tight: tight("rose-front"),
    tightBack: tight("rose-back"),
    sizes: SIZES,
  },
  {
    id: "dark-romance",
    name: "Dark Romance",
    colour: "Black",
    hex: "#0d0d0d",
    price: 1600,
    currency: "INR",
    description: "A leopard bound in thorns with roses rising from it, printed black on black. You see it when the light hits it.",
    details: ["Tonal print", "Oversized fit", "Limited edition"],
    image: img("romance-front"),
    tight: tight("romance-front"),
    sizes: SIZES,
  },
  {
    id: "garden",
    name: "Floral Aesthetics",
    colour: "White",
    hex: "#f1f1ef",
    price: 1600,
    currency: "INR",
    description: "Roses and leaves climbing over both shoulders, the wordmark at the centre and a clean back.",
    details: ["Heavyweight cotton", "Oversized fit", "Shoulder print"],
    image: img("white-front"),
    imageBack: img("white-back"),
    tight: tight("white-front"),
    tightBack: tight("white-back"),
    sizes: SIZES,
  },
];

export const signature = products.find((p) => p.id === "rose-rush")!;

export const formatPrice = (p: number) =>
  `${storeCurrency()} ${p.toLocaleString("en-AE", { maximumFractionDigits: 2 })}`;

/**
 * The hoodies, from the hanger photographs. Names are by colour and print until the pieces have
 * their own names and prices.
 *   hoodies/<key>-640|1100.webp     portrait crop of the photograph (tiles)
 *   products/hoodie-<key>.webp      cut-out on the 600 × 930 rail canvas
 */
export type Hoodie = {
  key: string;
  name: string;
  colour: string;
  hex: string;
  print: string;
  description: string;
  alt: string;
};

export const hoodies: Hoodie[] = [
  {
    key: "black",
    name: "Hoodie",
    colour: "Washed black",
    hex: "#2b2a2e",
    print: "Front print",
    description: "Heavy fleece in a marbled acid wash, the BLACMELO wordmark printed white across the chest.",
    alt: "Washed black hoodie on a hanger, a white BLACMELO print across the chest.",
  },
  {
    key: "red",
    name: "Hoodie",
    colour: "Burgundy",
    hex: "#8f2a2c",
    print: "Arched back print",
    description: "Garment-dyed burgundy fleece, BLACMELO arched in cream across the back.",
    alt: "Burgundy hoodie seen from the back, an arched cream BLACMELO print across the shoulders.",
  },
  {
    key: "blue",
    name: "Hoodie",
    colour: "Washed indigo",
    hex: "#4b6283",
    print: "Embossed",
    description: "Sun-faded indigo fleece, the wordmark embossed tone on tone across the chest.",
    alt: "Washed indigo hoodie on a hanger, BLACMELO embossed tone on tone across the chest.",
  },
  {
    key: "green",
    name: "Hoodie",
    colour: "Forest",
    hex: "#2f5a45",
    print: "Arched back print",
    description: "Deep forest fleece, BLACMELO arched in cream across the back.",
    alt: "Forest green hoodie seen from the back, an arched cream BLACMELO print across the shoulders.",
  },
  {
    key: "brown",
    name: "Hoodie",
    colour: "Washed mocha",
    hex: "#7a5a4b",
    print: "Embossed",
    description: "Washed mocha fleece, the wordmark embossed tone on tone across the chest.",
    alt: "Washed mocha hoodie, BLACMELO embossed tone on tone across the chest.",
  },
  {
    key: "navy",
    name: "Hoodie",
    colour: "Navy",
    hex: "#27345a",
    print: "Arched back print",
    description: "Navy fleece, BLACMELO arched in cream across the back.",
    alt: "Close-up of a navy hoodie's back, an arched cream BLACMELO print.",
  },
];

/** all six hang on the rail */
export const railHoodies = hoodies;


import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { pieceById } from "~/blacmelo/data/catalogue";
import { formatPrice } from "~/blacmelo/data/products";
import { useStore } from "../providers/Store";
import { openCollection, type CollectionFilter } from "../collection/route";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

export type DropTile = { key: string; /** the piece in the catalogue that "Buy now" adds */ id: string; label: string; alt: string; src: string; srcSet: string };

const tee = (key: string) => ({ src: `/campaign/drop-${key}-700.webp`, srcSet: `/campaign/drop-${key}-700.webp 700w, /campaign/drop-${key}-1200.webp 1200w` });

/** The four tee close-ups, as tall tiles */
export const TEE_TILES: DropTile[] = [
  { ...tee("afterlife"), key: "afterlife", id: "afterlife", label: "Afterlife", alt: "Close-up of the back of the burnt-orange Afterlife tee: the AFTERLIFE lettering above a horse-head print in blue, black and red." },
  { ...tee("roses"), key: "roses", id: "wild-and-free", label: "Wild & Free", alt: "Close-up of a washed green tee with grey roses embossed across the back." },
  { ...tee("dragon"), key: "dragon", id: "fury-wings", label: "Fury Wings", alt: "Close-up of a black tee with a white embroidered dragon coiling through the BLACMELO wordmark." },
  { ...tee("butterfly"), key: "butterfly", id: "vision", label: "Vision", alt: "Close-up of a burgundy tee with an embroidered butterfly over a tonal BM monogram." },
];


/**
 * Page two: the latest drop as four tall close-ups. Motion is a single soft rise as they come into view.
 */
export default function Drop({
  id = "drop",
  eyebrow = "Drop 01",
  title = "Latest drop",
  tiles = TEE_TILES,
  target = "collection",
  filter = "tees",
}: {
  /** which part of the collection the tiles and "Discover more" open */
  filter?: CollectionFilter;
  /** where the tiles lead: the 3D collection page, or down to the rail */
  target?: "collection" | "rail";
  id?: string;
  eyebrow?: string;
  title?: string;
  tiles?: DropTile[];
}) {
  const root = useRef<HTMLElement>(null);
  const href = target === "rail" ? "#rail" : "#collection";
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    if (target === "rail") document.getElementById("rail")?.scrollIntoView({ behavior: "smooth" });
    else openCollection(filter);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-rise]", { autoAlpha: 0, y: 28 });
        ScrollTrigger.batch(gsap.utils.toArray<HTMLElement>("[data-rise]", root.current), {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out" }),
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id={id} className="bg-bone text-ink" aria-labelledby={`${id}-title`}>
      {/* Section head */}
      <div className="flex items-end justify-between gap-4 px-[5vw] pb-6 pt-[12svh] md:px-[4vw] md:pb-8 md:pt-[14vh]">
        <div data-rise>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">{eyebrow}</p>
          <h2 id={`${id}-title`} className="wordmark mt-3 text-[10vw] md:text-[clamp(3rem,6vw,6.5rem)]">
            {title}
          </h2>
        </div>
        <a
          data-rise
          href={href}
          onClick={open}
          className="mb-1 whitespace-nowrap border-b border-wine-dark/50 pb-1 text-[11px] uppercase tracking-[0.18em] text-wine-dark transition-colors hover:border-wine-dark md:text-[12px]"
        >
          Discover more
        </a>
      </div>

      {/* The close-ups: the photograph, the name, the price, and Buy now */}
      <ul className="grid grid-cols-2 gap-[2px] pb-[2px] md:grid-cols-4">
        {tiles.map((t) => {
          const piece = pieceById(t.id);
          return (
            <li key={t.key} data-rise className="flex flex-col bg-bone">
              <a href={href} onClick={open} className="group relative block aspect-[3/4] overflow-hidden bg-ink" aria-label={`${t.label}, see it in the collection`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.src}
                  srcSet={t.srcSet}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  alt={t.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-luxe)] group-hover:scale-[1.05]"
                />
              </a>
              <div className="flex flex-1 flex-col gap-3 px-3 pb-4 pt-3 md:px-4 md:pb-5 md:pt-4">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="piece-name text-[4.4vw] text-wine-dark md:text-[clamp(1.25rem,1.7vw,1.9rem)]">{t.label}</span>
                  <span className="text-[12px] tabular-nums text-wine-dark md:text-[13px]">{formatPrice(piece.price)}</span>
                </p>
                <BuyNow id={t.id} />
              </div>
            </li>
          );
        })}
      </ul>

    </section>
  );
}

/** Buy now: pick a size right on the tile, and the piece goes straight into the bag */
function BuyNow({ id }: { id: string }) {
  const piece = pieceById(id);
  const { add, setBagOpen } = useStore();
  const [picking, setPicking] = useState(false);
  if (!picking)
    return (
      <button
        onClick={() => setPicking(true)}
        className="mt-auto w-full bg-wine-dark py-3 text-[11px] uppercase tracking-[0.18em] text-bone transition-colors duration-500 hover:bg-wine md:py-3.5 md:text-[12px]"
      >
        Buy now
      </button>
    );
  return (
    <div className="mt-auto flex border border-wine-dark/40 text-wine-dark" role="group" aria-label={`Choose a size for ${piece.name}`}>
      {piece.sizes.map((s) => (
        <button
          key={s}
          onClick={() => {
            add(piece, s);
            setPicking(false);
            setBagOpen(true);
          }}
          className="flex-1 py-3 text-[11px] transition-colors duration-300 hover:bg-wine-dark hover:text-bone md:py-3.5 md:text-[12px]"
          aria-label={`Buy ${piece.name} in ${s}`}
        >
          {s}
        </button>
      ))}
      <button onClick={() => setPicking(false)} className="border-l border-wine-dark/40 px-3 text-[12px]" aria-label="Cancel">
        ×
      </button>
    </div>
  );
}

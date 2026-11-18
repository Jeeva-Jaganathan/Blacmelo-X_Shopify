
import { useEffect, useState } from "react";
import ClothingRailHero, { type RailGarment } from "~/blacmelo/components/ui/product-rail-gallery";
import { openSignature, type Box } from "../collection/route";

const JACKET: RailGarment[] = [
  {
    id: "signature-jacket",
    name: "The Signature Jacket",
    description: "Blue suede, a tan suede collar and cream contrast stitching. BLACMƎLO across the back.",
    kind: "jacket",
    color: "#2c5574",
    image: "/jacket/rail-front.webp",
    backImage: "/jacket/rail-back.webp",
    tag: "No. 01",
  },
];

// where the jacket sits on its 600 × 930 rail canvas
const ON_CANVAS = { x: 20 / 600, y: 30 / 930, w: 560 / 600, h: 608 / 930 };

/** the jacket's own outline on the page, worked out from the rail photo's box (drawn contain, top) */
export function railJacketBox(): Box | null {
  const img = document.querySelector<HTMLImageElement>('#rail [data-garment="0"] [data-face="front"] img');
  if (!img) return null;
  const r = img.getBoundingClientRect();
  if (!r.width) return null;
  const s = Math.min(r.width / 600, r.height / 930);
  const dw = 600 * s, dh = 930 * s, dx = (r.width - dw) / 2;
  return { x: r.left + dx + ON_CANVAS.x * dw, y: r.top + ON_CANVAS.y * dh, w: ON_CANVAS.w * dw, h: ON_CANVAS.h * dh };
}

/**
 * Page five: the rail, holding one piece. The signature jacket hangs alone in the middle of a long
 * rail on a white wall; it turns to face you, sways when brushed, and opens its own page when
 * touched.
 */
export default function Rail() {
  const [railMax, setRailMax] = useState(480);
  useEffect(() => {
    const fit = () => setRailMax(Math.round(Math.max(300, Math.min(580, window.innerHeight * 0.62))));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section id="rail" className="relative min-h-[100svh] overflow-hidden bg-[#fbfaf8] text-ink" aria-label="The signature jacket">
      <div className="relative z-10 flex items-baseline justify-between px-[5vw] pt-[13svh] md:px-[4vw] md:pt-[15vh]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">The rail</p>
        <p className="serif text-[4.6vw] italic text-ink/80 md:text-[clamp(1.1rem,1.5vw,1.7rem)]">One piece, on its own.</p>
      </div>
      <div className="relative z-0 pb-[6svh] pt-[3svh]">
        <ClothingRailHero
          items={JACKET}
          hanger="matte"
          holdFront={0}
          imageBottom={0.72}
          maxHeight={railMax}
          onPick={() => {
            const box = railJacketBox();
            openSignature(box ?? undefined);
          }}
          className="!bg-transparent pt-0 [&>.-z-10]:hidden [&_[aria-live]_p:first-child]:font-serif [&_[aria-live]_p:first-child]:font-normal [&_[aria-live]_p:first-child]:text-[clamp(1.2rem,1.8vw,1.9rem)] [&_[aria-live]_p:first-child]:italic [&_[aria-live]_p:first-child]:text-ink [&_[aria-live]_p+p]:text-ink/60"
        />
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.24em] text-ink/45 md:text-[11px]">Touch to open</p>
      </div>
    </section>
  );
}

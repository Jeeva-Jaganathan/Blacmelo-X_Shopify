
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { closeSignature, SIGNATURE_HASH, signatureOrigin, type Box } from "../collection/route";
import { useSmooth } from "../providers/SmoothScroll";
import { railJacketBox } from "../sections/Rail";

// the jacket's own colours: the blue of the suede, the tan of the collar
const SUEDE = "#21405a";
const SUEDE_DEEP = "#132838";
const TAN = "#d8b47c";
const CREAM = "#efe3cf";

const WORD = "BLACMELO".split("");

// where the jacket sits inside the front studio photograph (fractions of the photo)
const IN_PHOTO = { x: 0.0753, y: 0.1746, w: 0.87, h: 0.7117 };

const SPECS = [
  ["Body", "Suede"],
  ["Collar", "Tan suede"],
  ["Stitch", "Cream contrast"],
  ["Closure", "Full zip"],
  ["Pockets", "Flap and patch"],
];

const DETAILS = [
  { key: "collar", title: "The collar", text: "Tan suede, cut wide and lying flat.", cls: "col-span-2 md:col-span-7 md:row-span-2", ratio: "aspect-[4/5] md:aspect-auto md:h-full" },
  { key: "pocket", title: "The pockets", text: "Flapped at the chest, patched below.", cls: "md:col-span-5", ratio: "aspect-[4/5] md:aspect-[5/4]" },
  { key: "cuff", title: "The stitch", text: "Cream topstitching, doubled at every edge.", cls: "md:col-span-5", ratio: "aspect-[4/5] md:aspect-[5/4]" },
  { key: "letters", title: "The back", text: "BLACMƎLO in tan suede, stitched across the yoke.", cls: "col-span-2 md:col-span-12", ratio: "aspect-[21/9]" },
];

/** a copy of the jacket cut-out, laid over a box on the page */
function ghost(box: Box) {
  const g = document.createElement("img");
  g.src = "/jacket/front-1300.webp";
  g.alt = "";
  g.setAttribute("aria-hidden", "true");
  Object.assign(g.style, {
    position: "fixed",
    left: `${box.x}px`,
    top: `${box.y}px`,
    width: `${box.w}px`,
    height: `${box.h}px`,
    zIndex: "80",
    pointerEvents: "none",
    transformOrigin: "0 0",
    willChange: "transform, opacity",
  });
  document.body.appendChild(g);
  return g;
}

/** the jacket's outline inside the front photograph on this page */
function photoBox(el: HTMLElement): Box | null {
  const img = el.querySelector<HTMLElement>("[data-sj-front]");
  if (!img) return null;
  const r = img.getBoundingClientRect();
  if (!r.width || r.bottom < 0 || r.top > innerHeight) return null;
  return { x: r.left + IN_PHOTO.x * r.width, y: r.top + IN_PHOTO.y * r.height, w: IN_PHOTO.w * r.width, h: IN_PHOTO.h * r.height };
}

const glide = (from: Box, to: Box) => ({ x: to.x - from.x, y: to.y - from.y, scale: to.w / from.w });
const railSlot = () => document.querySelector<HTMLElement>('#rail [data-garment="0"]');

/**
 * The signature jacket's own page, in its colours. Opening it is quiet: the white wall gives way to
 * suede blue while the jacket lifts off the rail and glides into its photograph, which fills in
 * around it. Then the story, the details up close, and the way back. Closing returns the jacket to
 * its hanger as the blue fades.
 */
export default function SignatureJacket() {
  const [route, setRoute] = useState(false);
  const [mounted, setMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmooth();

  useEffect(() => {
    const sync = () => {
      const on = location.hash === SIGNATURE_HASH;
      setRoute(on);
      if (on) setMounted(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // the details come up as they scroll into view
  useEffect(() => {
    if (!mounted || !root.current) return;
    const items = root.current.querySelectorAll<HTMLElement>("[data-sj-reveal]");
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }),
      { root: root.current, threshold: 0.15 }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [mounted]);

  // arrive
  useEffect(() => {
    if (!mounted || !route || !root.current) return;
    stop();
    const el = root.current;
    el.scrollTop = 0;
    const q = gsap.utils.selector(el);
    if (reduced()) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }
    gsap.set(el, { autoAlpha: 0 });
    gsap.set(q("[data-sj-fade]"), { autoAlpha: 0, y: 14 });
    gsap.set(q("[data-sj-letter]"), { yPercent: 60, autoAlpha: 0 });
    const from = signatureOrigin();
    const to = photoBox(el);
    const g = from && to ? ghost(from) : null;
    const slot = railSlot();
    if (g && slot) slot.style.visibility = "hidden";
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" }, onComplete: () => g?.remove() });
    tl.to(el, { autoAlpha: 1, duration: 1.15, ease: "power2.inOut" }, 0);
    if (g && from && to) {
      gsap.set(q("[data-sj-front]"), { autoAlpha: 0 });
      tl.to(g, { ...glide(from, to), duration: 1.3 }, 0)
        // the photograph fills in around the jacket as it arrives
        .to(q("[data-sj-front]"), { autoAlpha: 1, duration: 0.55, ease: "power1.out" }, 1.1)
        .to(g, { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" }, 1.35);
    }
    tl.to(q("[data-sj-letter]"), { yPercent: 0, autoAlpha: 1, duration: 1.4, stagger: 0.045, ease: "expo.out" }, 0.75).to(
      q("[data-sj-fade]"),
      { autoAlpha: 1, y: 0, duration: 1, stagger: 0.07, ease: "expo.out" },
      0.95
    );
    return () => {
      tl.kill();
      g?.remove();
    };
  }, [mounted, route, stop]);

  // leave: the jacket lifts out of its photograph and goes back to its hanger as the blue fades
  useEffect(() => {
    if (route || !mounted || !root.current) return;
    const el = root.current;
    const done = () => {
      const slot = railSlot();
      if (slot) slot.style.visibility = "";
      setMounted(false);
      start();
    };
    if (reduced()) return done();
    const q = gsap.utils.selector(el);
    const from = photoBox(el);
    const to = railJacketBox() ?? signatureOrigin();
    let g: HTMLImageElement | null = null;
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        g?.remove();
        done();
      },
    });
    if (from && to) {
      g = ghost(from);
      const slot = railSlot();
      if (slot) slot.style.visibility = "hidden";
      tl.to(q("[data-sj-fade], [data-sj-letter], [data-sj-back], [data-sj-reveal]"), { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0)
        .to(q("[data-sj-front]"), { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, 0.05)
        .to(g, { ...glide(from, to), duration: 1.25 }, 0.25)
        .to(el, { autoAlpha: 0, duration: 1.05, ease: "power2.inOut" }, 0.3);
    } else {
      tl.to(el, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut" }, 0);
    }
    return () => {
      tl.kill();
      g?.remove();
    };
  }, [route, mounted, start]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (route && e.key === "Escape") closeSignature();
    },
    [route]
  );
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  if (!mounted) return null;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sj-title"
      data-lenis-prevent
      className="fixed inset-0 z-[79] overflow-y-auto overflow-x-hidden"
      style={{ opacity: 0, visibility: "hidden", background: SUEDE_DEEP, color: TAN }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: `radial-gradient(ellipse 80% 70% at 62% 42%, #2d5677 0%, ${SUEDE} 40%, ${SUEDE_DEEP} 100%)` }}
      />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 opacity-60 mix-blend-overlay" />

      {/* header */}
      <div className="sticky top-0 z-20 flex items-start justify-between px-[5vw] pb-8 pt-6 md:px-[4vw] md:pt-7" style={{ background: `linear-gradient(to bottom, ${SUEDE_DEEP} 0%, ${SUEDE_DEEP}e6 45%, transparent 100%)` }}>
        <p data-sj-fade className="text-[10px] uppercase tracking-[0.24em] text-[#d8b47c]/70 md:text-[11px]">
          BLACMELO · No. 01
        </p>
        <button
          data-sj-fade
          type="button"
          onClick={closeSignature}
          className="flex items-center gap-3 border-b border-[#d8b47c]/50 pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-[#d8b47c]"
        >
          Close <span aria-hidden className="text-base leading-none">×</span>
        </button>
      </div>

      {/* 1 — the jacket, front and back, and its story */}
      <section className="relative -mt-[84px] grid min-h-[100svh] grid-cols-1 items-center gap-10 px-[5vw] pb-[10svh] pt-[13svh] md:grid-cols-12 md:gap-[3vw] md:px-[4vw] md:pt-[14vh]">
        {/* the wordmark, outlined in tan like the letters on its back */}
        <p
          aria-hidden
          className="wordmark pointer-events-none absolute inset-x-0 bottom-[4svh] flex justify-center overflow-hidden text-[19vw] leading-none md:text-[15vw]"
          style={{ color: "transparent", WebkitTextStroke: `1px ${TAN}`, opacity: 0.4 }}
        >
          {WORD.map((c, i) => (
            <span key={i} data-sj-letter className="inline-block">
              {i === 5 ? <span className="inline-block -scale-x-100">{c}</span> : c}
            </span>
          ))}
        </p>

        <div className="relative order-2 md:order-1 md:col-span-4">
          <p data-sj-fade className="text-[10px] uppercase tracking-[0.24em] text-[#d8b47c]/70 md:text-[11px]">
            The signature
          </p>
          <h2 id="sj-title" data-sj-fade className="serif mt-3 text-[13vw] italic leading-[0.95] md:text-[clamp(2.6rem,4.4vw,4.8rem)]" style={{ color: CREAM }}>
            The Signature Jacket
          </h2>
          <p data-sj-fade className="mt-6 max-w-[38ch] text-[14px] leading-relaxed md:text-[15px]" style={{ color: `${CREAM}cc` }}>
            Cut from blue suede and finished with care: a tan suede collar, cream topstitching along every seam, and BLACMƎLO
            set across the back in tan.
          </p>
          <dl data-sj-fade className="mt-8 max-w-[34ch] border-t border-[#d8b47c]/25">
            {SPECS.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#d8b47c]/25 py-2.5 text-[12px] md:text-[13px]">
                <dt className="uppercase tracking-[0.16em] text-[#d8b47c]/70">{k}</dt>
                <dd style={{ color: CREAM }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* front and back, framed like two prints */}
        <div className="relative order-1 grid grid-cols-5 items-start gap-3 md:order-2 md:col-span-8 md:gap-[1.6vw]">
          <figure className="col-span-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-sj-front
              src="/jacket/photo-front-900.webp"
              srcSet="/jacket/photo-front-900.webp 900w, /jacket/photo-front-1600.webp 1600w"
              sizes="(min-width: 768px) 38vw, 56vw"
              alt="The signature jacket from the front: blue suede, a tan suede collar, a full zip, flapped and patched pockets, cream contrast stitching."
              className="block aspect-[1792/2400] w-full object-cover shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6)]"
            />
            <figcaption data-sj-fade className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#d8b47c]/70 md:text-[11px]">
              Front
            </figcaption>
          </figure>
          <figure data-sj-back className="col-span-2 mt-[22%]">
            <div data-sj-fade>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jacket/photo-back-900.webp"
                srcSet="/jacket/photo-back-900.webp 900w, /jacket/photo-back-1600.webp 1600w"
                sizes="(min-width: 768px) 25vw, 37vw"
                alt="The signature jacket from the back: BLACMƎLO in tan suede letters across the yoke."
                className="block aspect-[1792/2400] w-full object-cover shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6)]"
              />
              <figcaption className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#d8b47c]/70 md:text-[11px]">Back</figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* 2 — up close */}
      <section className="relative px-[5vw] pb-[12svh] md:px-[4vw]" aria-label="The details">
        <div data-sj-reveal className="sj-reveal mb-8 flex items-end justify-between border-b border-[#d8b47c]/25 pb-4 md:mb-10">
          <h3 className="serif text-[8vw] italic leading-none md:text-[clamp(1.8rem,2.8vw,3rem)]" style={{ color: CREAM }}>
            Up close
          </h3>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#d8b47c]/70 md:text-[11px]">04 details</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
          {DETAILS.map((d) => (
            <li key={d.key} data-sj-reveal className={`sj-reveal ${d.cls}`}>
              <figure className="flex h-full flex-col">
                <div className={`relative overflow-hidden bg-[#0e1f2c] ${d.ratio} md:flex-1`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/jacket/detail-${d.key}-600.webp`}
                    srcSet={`/jacket/detail-${d.key}-600.webp 600w, /jacket/detail-${d.key}-1000.webp 1000w`}
                    sizes="(min-width: 768px) 50vw, 92vw"
                    alt={`${d.title}: ${d.text}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-luxe)] hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="mt-3 flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                  <span className="text-[13px]" style={{ color: CREAM }}>
                    {d.title}
                  </span>
                  <span className="text-[12px] text-[#d8b47c]/75">{d.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {/* 3 — the way back */}
      <section data-sj-reveal className="sj-reveal relative flex flex-col items-center px-[5vw] pb-[14svh] text-center">
        <span aria-hidden className="mb-8 block h-14 w-px bg-[#d8b47c]/40" />
        <p className="serif text-[7vw] italic md:text-[clamp(1.6rem,2.4vw,2.6rem)]" style={{ color: CREAM }}>
          Made once. Worn for years.
        </p>
        <button
          type="button"
          onClick={closeSignature}
          className="mt-9 border border-[#d8b47c]/50 px-7 py-4 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-[#d8b47c] hover:bg-[#d8b47c] hover:text-[#132838]"
        >
          Back to the rail
        </button>
      </section>
    </div>
  );
}

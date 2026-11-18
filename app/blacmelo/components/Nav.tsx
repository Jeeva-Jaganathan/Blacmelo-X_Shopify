
import { useEffect, useRef, useState } from "react";
import { useSmooth } from "./providers/SmoothScroll";
import { openCollection, openSignature, type CollectionFilter } from "./collection/route";
import { useStore } from "./providers/Store";
import { formatPrice } from "~/blacmelo/data/products";
import { catalogue } from "~/blacmelo/data/catalogue";
import Logo from "./art/Logo";

type Item = { label: string; note: string; go: CollectionFilter | "jacket" };
const ITEMS: Item[] = [
  { label: "T-shirts", note: pad(catalogue.filter((p) => p.category === "tees").length), go: "tees" },
  { label: "Hoodies", note: pad(catalogue.filter((p) => p.category === "hoodies").length), go: "hoodies" },
  { label: "Pants", note: "Soon", go: "pants" },
  { label: "Jackets", note: "Signature", go: "jacket" },
];
const TILES: { label: string; src: string; go: CollectionFilter | "jacket" }[] = [
  { label: "Shop t-shirts", src: "/campaign/drop-afterlife-700.webp", go: "tees" },
  { label: "Shop hoodies", src: "/hoodies/green-640.webp", go: "hoodies" },
  { label: "The Signature Jacket", src: "/jacket/photo-front-900.webp", go: "jacket" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const RUN = [
  "The first drop is here",
  "Crafted to stand apart",
  "Made in limited numbers",
  "Founders’ pricing, for a limited time",
  "The missing piece of luxury",
];

/** The strip above the header: one line that keeps moving */
function Runner() {
  const line = (
    <span className="flex shrink-0 items-center">
      {RUN.map((t) => (
        <span key={t} className="flex items-center">
          <span className="px-6 md:px-9">{t}</span>
          <span aria-hidden className="text-bone/45">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="bm-runner fixed inset-x-0 top-0 z-[73] h-8 overflow-hidden bg-wine-dark text-[10.5px] uppercase tracking-[0.2em] text-bone md:text-[11px]">
      <p className="sr-only">{RUN.join(". ")}</p>
      <div aria-hidden className="bm-run flex h-full w-max items-center">
        {line}
        {line}
        {line}
        {line}
      </div>
    </div>
  );
}

/** A small bag, drawn to sit with the logo; the count sits inside it */
export function BagIcon({ count, className = "" }: { count: number; className?: string }) {
  return (
    <span className={`relative inline-grid place-items-center ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="size-[22px]" aria-hidden>
        <path d="M4.5 8.5h15l-1 12h-13l-1-12Z" strokeLinejoin="round" />
        <path d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5" />
      </svg>
      <span className="absolute left-1/2 top-[57%] -translate-x-1/2 -translate-y-1/2 text-[9px] font-medium tabular-nums leading-none">{count > 0 ? count : ""}</span>
    </span>
  );
}

export default function Nav() {
  const { stop, start, scrollTo } = useSmooth();
  const { count, setBagOpen } = useStore();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // lock the page while the shop panel is down
  const was = useRef(false);
  useEffect(() => {
    if (open) {
      was.current = true;
      stop();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      requestAnimationFrame(() => (panel.current?.querySelector("button[data-shop-item]") as HTMLElement | null)?.focus({ preventScroll: true }));
      return () => window.removeEventListener("keydown", onKey);
    }
    if (was.current) {
      was.current = false;
      start();
      btn.current?.focus({ preventScroll: true });
    }
  }, [open, stop, start]);

  // close it if the page goes elsewhere (collection, jacket)
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  // no background on the header: it reads what is behind the logo and behind Shop/bag (a colour, or the
  // photograph's own pixels) and turns light or dark to match
  const [tone, setTone] = useState<{ l: "light" | "dark"; r: "light" | "dark" }>({ l: "light", r: "light" });
  useEffect(() => {
    let raf = 0;
    const cache = new WeakMap<HTMLImageElement, { data: Uint8ClampedArray; w: number; h: number } | null>();
    const pixels = (img: HTMLImageElement) => {
      if (cache.has(img)) return cache.get(img)!;
      if (!img.complete || !img.naturalWidth) return null;
      try {
        const w = 96;
        const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, w, h);
        const out = { data: ctx.getImageData(0, 0, w, h).data, w, h };
        cache.set(img, out);
        return out;
      } catch {
        cache.set(img, null);
        return null;
      }
    };
    // brightness (0–255) of an image at a point on screen, allowing for object-fit: cover
    const imgLum = (img: HTMLImageElement, x: number, y: number) => {
      const px = pixels(img);
      if (!px) return null;
      const r = img.getBoundingClientRect();
      const fit = getComputedStyle(img).objectFit;
      const s = fit === "cover" ? Math.max(r.width / px.w, r.height / px.h) : fit === "contain" ? Math.min(r.width / px.w, r.height / px.h) : r.width / px.w;
      const ox = (r.width - px.w * s) / 2;
      const oy = (r.height - px.h * s) / 2;
      let sum = 0;
      let n = 0;
      for (let dx = -12; dx <= 12; dx += 6)
        for (let dy = -8; dy <= 8; dy += 8) {
          const ix = Math.floor((x + dx - r.left - ox) / s);
          const iy = Math.floor((y + dy - r.top - oy) / s);
          if (ix < 0 || iy < 0 || ix >= px.w || iy >= px.h) continue;
          const i = (iy * px.w + ix) * 4;
          if (px.data[i + 3] < 128) continue;
          sum += 0.2126 * px.data[i] + 0.7152 * px.data[i + 1] + 0.0722 * px.data[i + 2];
          n++;
        }
      return n ? sum / n : null;
    };
    const lumAt = (x: number, y: number) => {
      const under = document.elementsFromPoint(x, y).filter((el) => !el.closest("[data-nav], .bm-runner"));
      for (const el of under) {
        if (el instanceof HTMLImageElement) {
          const l = imgLum(el, x, y);
          if (l !== null) return l;
          continue;
        }
        const bg = getComputedStyle(el).backgroundColor;
        const m = bg.match(/[\d.]+/g);
        if (!m || (m.length === 4 && Number(m[3]) < 0.5)) continue;
        const [r, g, b] = m.map(Number);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      return 0;
    };
    const read = () => {
      raf = 0;
      const w = window.innerWidth;
      const y = w < 768 ? 60 : 64;
      const pad = w < 768 ? w * 0.05 : w * 0.04;
      const t = (v: number): "light" | "dark" => (v > 150 ? "dark" : "light");
      const next = { l: t(lumAt(pad + 18, y)), r: t(Math.max(lumAt(w - pad - 20, y), lumAt(w - pad - 80, y))) };
      setTone((p) => (p.l === next.l && p.r === next.r ? p : next));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    const t = window.setInterval(on, 1200); // pictures that load or animate in later
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      window.clearInterval(t);
      cancelAnimationFrame(raf);
    };
  }, []);

  const ink = (t: "light" | "dark") => (t === "dark" || open ? "text-ink" : "text-bone [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.35))]");

  const go = (to: CollectionFilter | "jacket") => {
    setOpen(false);
    setTimeout(() => (to === "jacket" ? openSignature() : openCollection(to)), 350);
  };

  const top = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollTo(0), open ? 400 : 0);
  };

  return (
    <>
      <Runner />
      <header
        data-nav
        className="pointer-events-none fixed inset-x-0 top-8 z-[72] flex h-14 items-center justify-between px-[5vw] md:h-16 md:px-[4vw] [&>*]:pointer-events-auto"
      >
        <a href="#top" onClick={top} className={`block w-fit transition-colors duration-500 ${ink(tone.l)}`} aria-label="BLACMELO home">
          <span data-nav-mark className="block w-9 md:w-10">
            <Logo className="block w-full" />
          </span>
        </a>

        <div className={`flex items-center justify-end gap-6 transition-colors duration-500 md:gap-8 ${ink(tone.r)}`}>
          <button
            ref={btn}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="shop-panel"
            className="relative text-[12px] uppercase tracking-[0.16em] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100"
          >
            {open ? "Close" : "Shop"}
          </button>
          <button onClick={() => setBagOpen(true)} className="-m-2 p-2" aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}>
            <BagIcon count={count} />
          </button>
        </div>
      </header>

      {/* the shop panel: drops from the top, the page stays behind it */}
      <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/50 backdrop-blur-md transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          id="shop-panel"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Shop"
          className="absolute inset-x-0 top-0 bg-bone text-ink transition-[clip-path] duration-700 ease-[var(--ease-luxe)]"
          style={{ clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" }}
        >
          <div className="grid gap-10 px-[5vw] pb-8 pt-32 md:grid-cols-[minmax(220px,1fr)_2.4fr] md:gap-[4vw] md:px-[4vw] md:pb-10 md:pt-36">
            <div>
              <p className={`text-[11px] uppercase tracking-[0.2em] text-ink/45 transition-opacity duration-500 ${open ? "opacity-100 delay-200" : "opacity-0"}`}>
                Shop
              </p>
              <ul className="mt-5 flex flex-col">
                {ITEMS.map((it, i) => (
                  <li key={it.label} className="line-mask">
                    <button
                      data-shop-item
                      onClick={() => go(it.go)}
                      tabIndex={open ? 0 : -1}
                      className={`group flex w-full items-baseline gap-3 py-1.5 text-left transition-[transform,opacity] duration-700 ease-[var(--ease-luxe)] ${
                        open ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                      }`}
                      style={{ transitionDelay: open ? `${180 + i * 60}ms` : "0ms" }}
                    >
                      <span className="piece-name text-[clamp(1.9rem,3vw,3rem)] leading-[1.15] text-wine-dark transition-colors duration-300 group-hover:text-wine">
                        {it.label}
                      </span>
                      <sup className="text-[10px] uppercase tracking-[0.12em] text-wine-dark/60">{it.note}</sup>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => go("all")}
                tabIndex={open ? 0 : -1}
                className={`mt-8 border-b border-wine-dark/50 pb-1 text-[11px] uppercase tracking-[0.18em] text-wine-dark transition-[opacity,border-color] duration-500 hover:border-wine-dark ${
                  open ? "opacity-100 delay-500" : "opacity-0"
                }`}
              >
                View everything
              </button>
            </div>

            <div className="no-scrollbar -mx-[5vw] flex gap-2 overflow-x-auto px-[5vw] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {TILES.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => go(t.go)}
                  tabIndex={open ? 0 : -1}
                  className={`group w-[62vw] shrink-0 text-left transition-[transform,opacity] duration-700 ease-[var(--ease-luxe)] md:w-auto ${
                    open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: open ? `${260 + i * 80}ms` : "0ms" }}
                >
                  <span className="relative block aspect-[4/5] overflow-hidden bg-ash md:aspect-[4/4.6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.src}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-wine-dark">
                    {t.label}
                    <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Bag />
      <Toast />
    </>
  );
}

function Bag() {
  const { items, subtotal, remove, bagOpen, setBagOpen, checkoutUrl, busy } = useStore();
  const { scrollTo, stop, start } = useSmooth();
  const panel = useRef<HTMLDivElement>(null);

  // lock the page while the bag is open; release only when it closes (and no other layer holds it)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (bagOpen) {
      wasOpen.current = true;
      stop();
      panel.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setBagOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      if (location.hash !== "#collection") start();
    }
  }, [bagOpen, setBagOpen, stop, start]);

  return (
    <div className={`fixed inset-0 z-[80] ${bagOpen ? "" : "pointer-events-none"}`} aria-hidden={!bagOpen}>
      <div
        onClick={() => setBagOpen(false)}
        className={`absolute inset-0 bg-ink/70 transition-opacity duration-500 ${bagOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-charcoal p-6 outline-none transition-transform duration-700 ease-[var(--ease-luxe)] md:w-[440px] md:p-8 ${
          bagOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="wordmark text-2xl">Bag</h2>
          <button onClick={() => setBagOpen(false)} className="text-[13px] text-bone/70 hover:text-bone">
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center gap-6">
            <p className="serif text-3xl italic leading-tight">Your bag is empty.</p>
            <button
              onClick={() => {
                setBagOpen(false);
                setTimeout(() => openCollection(), 400);
              }}
              className="group inline-flex w-fit items-center gap-3 text-sm"
            >
              Start with the collection
            </button>
          </div>
        ) : (
          <>
            <ul className="no-scrollbar mt-10 flex-1 divide-y divide-bone/10 overflow-y-auto">
              {items.map((i) => (
                <li key={i.key} className="flex gap-4 py-5">
                  <div className="flex size-20 shrink-0 items-center justify-center bg-ash">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt="" className="w-[86%]" />
                  </div>
                  <div className="flex flex-1 flex-col text-sm">
                    <div className="flex justify-between">
                      <span>{i.name}</span>
                      <span className="tabular-nums">{formatPrice(i.price * i.qty)}</span>
                    </div>
                    <span className="text-bone/55">
                      {i.colour}, {i.size}
                      {i.qty > 1 ? `, ×${i.qty}` : ""}
                    </span>
                    <button onClick={() => remove(i.key)} className="mt-auto w-fit text-[12px] text-bone/55 underline-offset-4 hover:text-bone hover:underline">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-bone/10 pt-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-[12px] text-bone/50">Shipping and duties calculated at checkout.</p>
              <a
                href={checkoutUrl ?? "/cart"}
                aria-disabled={busy || undefined}
                className={`mt-6 block w-full bg-bone py-4 text-center text-sm text-ink transition-colors duration-500 hover:bg-wine hover:text-bone ${busy ? "pointer-events-none opacity-60" : ""}`}
              >
                Checkout
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Toast() {
  const { toast } = useStore();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-[5vw] z-[85] flex items-center gap-3 bg-bone px-4 py-3 text-[13px] text-ink transition-all duration-500 ease-[var(--ease-luxe)] md:left-[4vw] ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {toast}
    </div>
  );
}


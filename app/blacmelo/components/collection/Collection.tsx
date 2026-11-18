
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "~/blacmelo/data/products";
import { CATEGORIES, catalogue, type Category, type Piece } from "~/blacmelo/data/catalogue";
import { useSmooth } from "../providers/SmoothScroll";
import { useStore } from "../providers/Store";
import Logo from "../art/Logo";
import { BagIcon } from "../Nav";
import { COLLECTION_HASH, closeCollection, collectionFilter, openSignature, type CollectionFilter } from "./route";

type Sort = "featured" | "low" | "high";
const SORT_LABEL: Record<Sort, string> = { featured: "Featured", low: "Price, low to high", high: "Price, high to low" };
const NEXT_SORT: Record<Sort, Sort> = { featured: "low", low: "high", high: "featured" };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The collection: every piece on one page, by category.
 * A curtain of black rises over the homepage; inside, a quiet grid on ash.
 * Hover a piece to see its back (or the photograph) and add a size straight from the grid.
 */
export default function Collection() {
  const [route, setRoute] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<CollectionFilter>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [large, setLarge] = useState(false);
  const [panel, setPanel] = useState<Piece | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmooth();
  const { count, setBagOpen } = useStore();

  // follow the address, and the category asked for
  useEffect(() => {
    const sync = () => {
      const on = location.hash === COLLECTION_HASH;
      setRoute(on);
      if (on) {
        setMounted(true);
        setFilter(collectionFilter());
      }
    };
    const onFilter = (e: Event) => setFilter((e as CustomEvent<CollectionFilter>).detail);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("bm:collection-filter", onFilter);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("bm:collection-filter", onFilter);
    };
  }, []);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // arrive: the curtain rises, then the type and the first row come up
  useEffect(() => {
    if (!mounted || !route || !root.current) return;
    stop();
    const el = root.current;
    el.scrollTop = 0;
    if (reduced()) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline();
    tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" })
      .fromTo(q("[data-c-word]"), { yPercent: 105 }, { yPercent: 0, duration: 1.2, stagger: 0.06, ease: "expo.out" }, 0.55)
      .fromTo(q("[data-c-fade]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.05, ease: "expo.out" }, 0.75);
    return () => {
      tl.kill();
    };
  }, [mounted, route, stop]);

  // leave: the curtain drops away
  useEffect(() => {
    if (route || !mounted || !root.current) return;
    setPanel(null);
    const done = () => {
      setMounted(false);
      if (location.hash !== "#signature") start();
    };
    if (reduced()) return done();
    const tl = gsap.to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut", onComplete: done });
    return () => {
      tl.kill();
    };
  }, [route, mounted, start]);

  // the cards rise in whenever the selection changes
  useEffect(() => {
    if (!mounted || !grid.current || reduced()) return;
    const cards = grid.current.querySelectorAll("[data-card]");
    const t = gsap.fromTo(cards, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.035, ease: "expo.out", delay: route ? 0.05 : 0 });
    return () => {
      t.kill();
    };
  }, [filter, sort, large, mounted, route]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!route || e.key !== "Escape") return;
      if (panel) setPanel(null);
      else closeCollection();
    },
    [route, panel]
  );
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const sorted = useCallback(
    (list: Piece[]) => (sort === "featured" ? list : [...list].sort((a, b) => (sort === "low" ? a.price - b.price : b.price - a.price))),
    [sort]
  );

  const groups = useMemo(
    () =>
      CATEGORIES.filter((c) => filter === "all" || filter === c.key).map((c, i) => ({
        ...c,
        index: CATEGORIES.indexOf(c) + 1,
        first: i === 0,
        pieces: sorted(catalogue.filter((p) => p.category === c.key)),
      })),
    [filter, sorted]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: catalogue.length };
    for (const c of CATEGORIES) m[c.key] = catalogue.filter((p) => p.category === c.key).length;
    return m;
  }, []);

  const pick = (f: CollectionFilter) => {
    setFilter(f);
    // back to the top of the grid, not the top of the page
    const el = root.current;
    const g = grid.current;
    if (el && g) {
      const y = g.offsetTop - 120;
      if (el.scrollTop > y) el.scrollTo({ top: y, behavior: reduced() ? "auto" : "smooth" });
    }
  };

  if (!mounted) return null;

  const total = filter === "all" ? counts.all : counts[filter];

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="The collection"
      data-lenis-prevent
      className="fixed inset-0 z-[76] overflow-y-auto overflow-x-hidden bg-ink text-bone"
      style={{ clipPath: "inset(100% 0% 0% 0%)" }}
    >
      {/* top bar */}
      <header className="sticky top-0 z-20 grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-bone/10 bg-ink/85 px-[5vw] backdrop-blur-md md:h-[72px] md:px-[4vw]">
        <button data-c-fade onClick={closeCollection} className="group flex w-fit items-center gap-3 text-[13px]" aria-label="Back to the homepage">
          <span className="block w-8 md:w-9">
            <Logo className="block w-full" />
          </span>
        </button>
        <p data-c-fade className="wordmark text-[13px] tracking-[-0.02em] md:text-[15px]">
          Blacm<span className="inline-block -scale-x-100">e</span>lo
        </p>
        <div data-c-fade className="flex items-center justify-end gap-6 text-[13px] md:gap-8">
          <button onClick={() => setBagOpen(true)} className="-m-2 p-2" aria-label={`Open bag, ${count} items`}>
            <BagIcon count={count} />
          </button>
          <button onClick={closeCollection} className="text-bone/60 transition-colors hover:text-bone">
            Close
          </button>
        </div>
      </header>

      {/* title */}
      <section className="px-[5vw] pb-10 pt-[11vh] md:px-[4vw] md:pb-14 md:pt-[13vh]">
        <p data-c-fade className="text-[12px] uppercase tracking-[0.2em] text-bone/50">
          Drop 001 · Founders&apos; prices
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <h1 className="flex items-start">
            <span className="line-mask">
              <span data-c-word className="wordmark block text-[clamp(2.4rem,10.4vw,11.5rem)]">
                Collection
              </span>
            </span>
            <span data-c-fade className="serif ml-2 mt-1 text-[clamp(1.1rem,2.2vw,2.2rem)] italic text-bone/70 md:ml-4">
              ({pad(catalogue.length)})
            </span>
          </h1>
          <p data-c-fade className="max-w-[34ch] pb-1 text-[14px] leading-relaxed text-bone/60">
            Oversized, heavyweight, made in small numbers. Every piece is cut to sit loose and wear in, not out.
          </p>
        </div>
      </section>

      {/* filters */}
      <div className="sticky top-16 z-10 border-y border-bone/10 bg-ink/85 backdrop-blur-md md:top-[72px]">
        <div className="flex items-center justify-between gap-6 px-[5vw] md:px-[4vw]">
          <nav aria-label="Categories" className="no-scrollbar -mx-1 flex overflow-x-auto">
            {(["all", ...CATEGORIES.map((c) => c.key)] as CollectionFilter[]).map((f) => {
              const label = f === "all" ? "All" : CATEGORIES.find((c) => c.key === f)!.label;
              const n = counts[f];
              const on = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => pick(f)}
                  aria-pressed={on}
                  className={`group flex shrink-0 items-center gap-2 px-1 py-4 pr-3.5 text-[13px] transition-colors duration-300 md:pr-8 md:text-[14px] ${
                    on ? "text-bone" : "text-bone/45 hover:text-bone/80"
                  }`}
                >
                  {label}
                  <sup className="hidden text-[10px] tabular-nums text-bone/45 sm:inline">{n ? pad(n) : "Soon"}</sup>
                </button>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-3 text-[13px] md:gap-8">
            <button onClick={() => setSort(NEXT_SORT[sort])} className="hidden text-bone/60 transition-colors hover:text-bone sm:block">
              Sort: <span className="text-bone">{SORT_LABEL[sort]}</span>
            </button>
            <div className="flex items-center gap-1" role="group" aria-label="Grid size">
              <GridIcon on={!large} cells={4} onClick={() => setLarge(false)} label="Small pieces" />
              <GridIcon on={large} cells={1} onClick={() => setLarge(true)} label="Large pieces" />
            </div>
          </div>
        </div>
      </div>

      {/* the grid */}
      <div ref={grid} className="pb-[12vh]">
        {groups.map((g) => (
          <section key={g.key} aria-label={g.plural}>
            {(filter === "all" || g.pieces.length === 0) && (
              <div className={`flex items-baseline justify-between px-[5vw] pb-5 md:px-[4vw] ${g.first ? "pt-10" : "pt-20 md:pt-28"}`}>
                <h2 className="flex items-baseline gap-4">
                  <span className="text-[12px] tabular-nums text-bone/40">{pad(g.index)}</span>
                  <span className="serif text-[clamp(1.8rem,3.2vw,3.2rem)] italic leading-none">{g.plural}</span>
                </h2>
                <span className="text-[12px] text-bone/45">{g.pieces.length ? `${g.pieces.length} pieces` : "Coming next"}</span>
              </div>
            )}
            {g.pieces.length > 0 ? (
              <ul
                className={`grid border-t border-bone/10 ${
                  large ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {g.pieces.map((p, i) => (
                  <Card key={p.id} piece={p} n={i + 1} large={large} onOpen={() => setPanel(p)} />
                ))}
              </ul>
            ) : (
              <ComingSoon />
            )}
          </section>
        ))}

        {/* the jacket keeps its own room */}
        {filter === "all" && <JacketBand />}

        <p className="mt-16 px-[5vw] text-center text-[12px] text-bone/45 md:px-[4vw]">
          Showing {total} {total === 1 ? "piece" : "pieces"} · Free shipping above ₹2,000 · Free size swaps
        </p>
      </div>

      {/* the product page: full screen, over the collection */}
      {panel && <ProductPage key={panel.id} piece={panel} onClose={() => setPanel(null)} />}
    </div>
  );
}

function GridIcon({ on, cells, onClick, label }: { on: boolean; cells: 1 | 4; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} aria-label={label} className={`grid size-8 place-items-center transition-opacity ${on ? "opacity-100" : "opacity-40 hover:opacity-80"}`}>
      <span className={`grid size-3.5 gap-[2px] ${cells === 4 ? "grid-cols-2" : "grid-cols-1"}`}>
        {Array.from({ length: cells }).map((_, i) => (
          <span key={i} className="bg-bone" />
        ))}
      </span>
    </button>
  );
}

/** One piece: ash ground, the cut-out centred; hover shows the back (or the photograph) and the sizes */
function Card({ piece, n, large, onOpen }: { piece: Piece; n: number; large: boolean; onOpen: () => void }) {
  const { add } = useStore();
  const photo = piece.hover?.kind === "photo";
  return (
    <li data-card className="group relative border-b border-r border-bone/10 bg-ink">
      <div className="relative aspect-[3/4] overflow-hidden bg-ash">
        <button onClick={onOpen} className="absolute inset-0 block h-full w-full" aria-label={`${piece.name}, ${formatPrice(piece.price)}. View details`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={piece.tight}
            alt=""
            loading="lazy"
            className={`absolute transition-[opacity,transform] duration-700 ease-[var(--ease-luxe)] ${
              piece.cover
                ? "inset-0 h-full w-full object-cover"
                : `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain ${large ? "w-[66%]" : "w-[78%]"} ${piece.category === "hoodies" ? "max-h-[78%]" : "max-h-[80%]"}`
            } ${piece.hover?.kind === "zoom" ? "duration-[1200ms] md:group-hover:scale-[1.45]" : piece.hover ? "md:group-hover:opacity-0" : "md:group-hover:scale-[1.04]"}`}
          />
          {piece.hover && piece.hover.kind !== "zoom" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={piece.hover.src}
              alt=""
              loading="lazy"
              className={`pointer-events-none absolute opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-luxe)] md:group-hover:opacity-100 ${
                photo
                  ? "inset-0 h-full w-full scale-[1.06] object-cover md:group-hover:scale-100"
                  : `left-1/2 top-1/2 max-h-[80%] -translate-x-1/2 -translate-y-1/2 object-contain ${large ? "w-[66%]" : "w-[78%]"}`
              }`}
            />
          )}
        </button>

        <span className={`pointer-events-none absolute left-3 top-3 text-[11px] tabular-nums transition-colors duration-500 md:left-4 md:top-4 md:group-hover:text-bone/0 ${piece.cover ? "text-bone/70" : "text-ink/60"}`}>
          {pad(n)}
        </span>

        {/* quick add */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full transition-transform duration-500 ease-[var(--ease-luxe)] md:block md:group-hover:translate-y-0 md:group-focus-within:translate-y-0">
          <div className="flex items-stretch bg-ink/90 text-[12px] text-bone backdrop-blur-sm">
            <span className="flex items-center px-4 text-bone/55">Add</span>
            {piece.sizes.map((s) => (
              <button
                key={s}
                onClick={() => add(piece, s)}
                className="flex-1 py-3.5 transition-colors duration-300 hover:bg-wine"
                aria-label={`Add ${piece.name} in ${s} to bag`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 pb-6 pt-3.5 md:px-4 md:pb-7 md:pt-4">
        <button onClick={onOpen} className="flex w-full items-start justify-between gap-3 text-left">
          <span className="min-w-0">
            <span className="block truncate text-[13px] md:text-[14px]">{piece.name}</span>
            <span className="mt-1 block truncate text-[12px] text-bone/50">{piece.note}</span>
          </span>
          <span className="shrink-0 text-[13px] tabular-nums md:text-[14px]">{formatPrice(piece.price)}</span>
        </button>
        <button
          onClick={onOpen}
          className="mt-3 border-b border-bone/40 pb-0.5 text-[11px] uppercase tracking-[0.18em] text-bone/85 transition-colors duration-300 hover:border-bone hover:text-bone"
        >
          Buy now
        </button>
      </div>
    </li>
  );
}

function ComingSoon() {
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const [email, setEmail] = useState("");
  return (
    <div className="mx-[5vw] grid overflow-hidden border border-bone/10 md:mx-[4vw] md:grid-cols-2">
      <div className="relative flex min-h-[38svh] items-center justify-center bg-charcoal md:min-h-[46vh]">
        <span aria-hidden className="wordmark select-none text-[clamp(4rem,14vw,11rem)] text-transparent [-webkit-text-stroke:1px_rgb(234_231_226/0.22)]">
          Pants
        </span>
        <span className="absolute left-4 top-4 text-[11px] uppercase tracking-[0.2em] text-bone/45">In the works</span>
      </div>
      <div className="flex flex-col justify-center gap-5 p-6 md:p-12">
        <h3 className="serif text-[clamp(1.8rem,3vw,2.8rem)] italic leading-[1.05]">The pants are coming.</h3>
        <p className="max-w-[40ch] text-[14px] leading-relaxed text-bone/60">
          Cut wide to sit under the oversized tees and hoodies. Leave your email and you&apos;ll see them before anyone else.
        </p>
        {state === "done" ? (
          <p role="status" className="flex items-center gap-3 text-[14px]">
            You&apos;re on the list.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setState("error");
              setState("done");
            }}
            className="flex max-w-md border-b border-bone/30 focus-within:border-bone"
          >
            <label htmlFor="pants-email" className="sr-only">
              Email
            </label>
            <input
              id="pants-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setState("idle");
              }}
              placeholder="Your email"
              className="flex-1 bg-transparent py-3 text-[14px] outline-none placeholder:text-bone/35"
            />
            <button type="submit" className="py-3 pl-4 text-[13px] text-bone/80 hover:text-bone">
              Notify me
            </button>
          </form>
        )}
        <p role="alert" className={`text-[12px] text-bone/60 ${state === "error" ? "" : "invisible"}`}>
          Enter a valid email address.
        </p>
      </div>
    </div>
  );
}

function JacketBand() {
  return (
    <section aria-label="The Signature Jacket" className="mt-20 md:mt-28">
      <button
        onClick={() => openSignature()}
        className="group relative grid w-full overflow-hidden border-y border-bone/10 text-left md:grid-cols-[1.1fr_1fr]"
      >
        <div className="flex flex-col justify-between gap-10 px-[5vw] py-10 md:px-[4vw] md:py-14">
          <p className="text-[12px] uppercase tracking-[0.2em] text-bone/50">No. 03 · Its own room</p>
          <div>
            <h2 className="serif text-[clamp(2.2rem,5vw,5rem)] italic leading-[0.95]">The Signature Jacket</h2>
            <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed text-bone/60">Goat suede, finished by hand. Made to order, 50 pieces.</p>
          </div>
          <span className="flex items-center gap-3 text-[13px]">
            <span className="h-px w-8 bg-bone transition-all duration-700 ease-[var(--ease-luxe)] group-hover:w-16" />
            Step inside
          </span>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden bg-[#21405a] md:aspect-auto md:min-h-[52vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jacket/photo-front-900.webp"
            alt="The Signature Jacket"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-[1.04]"
          />
        </div>
      </button>
    </section>
  );
}

/**
 * The product page: opens over the collection, full screen. Pictures on the left (the lookbook first),
 * the piece on the right: name, price, size, then Add to bag and Buy now.
 */
function ProductPage({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  const { add, setBagOpen, count } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const views: { src: string; srcSet?: string; photo: boolean }[] = piece.gallery
    ? piece.gallery.map((g) => ({ src: g.src, srcSet: g.srcSet, photo: !g.cutout }))
    : [
        { src: piece.tight, photo: !!piece.cover },
        ...(piece.hover && piece.hover.kind !== "zoom" ? [{ src: piece.hover.src, photo: piece.hover.kind === "photo" }] : []),
      ];

  const buy = (then?: () => void) => {
    if (!size) return setError(true);
    add(piece, size);
    then?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={piece.name}
      data-lenis-prevent
      className="animate-in fade-in slide-in-from-bottom-3 fixed inset-0 z-30 overflow-y-auto bg-ink text-bone duration-500"
    >
      {/* top */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-bone/10 bg-ink/85 px-[5vw] backdrop-blur-md md:h-[72px] md:px-[4vw]">
        <button onClick={onClose} className="group flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-bone/70 hover:text-bone">
          <span aria-hidden className="transition-transform duration-500 group-hover:-translate-x-1">←</span>
          Back
        </button>
        <button onClick={() => { onClose(); closeCollection(); }} className="block w-8 md:w-9" aria-label="BLACMELO home">
          <Logo className="block w-full" />
        </button>
        <button onClick={() => setBagOpen(true)} className="-m-2 p-2" aria-label={`Open bag, ${count} items`}>
          <BagIcon count={count} />
        </button>
      </header>

      <div className="md:grid md:grid-cols-[1.35fr_1fr]">
        {/* pictures: a swipeable row on phones, a column of large pictures on desktop */}
        <div>
          <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:grid md:grid-cols-2 md:gap-px md:overflow-visible md:bg-bone/10">
            {views.map((x, i) => (
              <div
                key={x.src}
                className={`relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden bg-ash ${i === 0 && views.length % 2 === 1 ? "md:col-span-2 md:aspect-[4/5]" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={x.src}
                  srcSet={x.srcSet}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  alt={`${piece.name}, picture ${i + 1} of ${views.length}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  className={x.photo ? "absolute inset-0 h-full w-full object-cover" : "absolute inset-0 m-auto max-h-[80%] w-[78%] object-contain"}
                />
              </div>
            ))}
          </div>
          {views.length > 1 && (
            <p className="px-[5vw] pt-3 text-[11px] tabular-nums text-bone/45 md:hidden">
              Swipe for more · {views.length} pictures
            </p>
          )}
        </div>

        {/* the piece */}
        <div className="px-[5vw] pb-16 pt-8 md:px-[3.5vw] md:pt-12">
          <div className="md:sticky md:top-[calc(72px+3rem)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-bone/45">
              {piece.category === "tees" ? "T-shirt" : piece.category === "hoodies" ? "Hoodie" : "Pants"} · Drop 001
            </p>
            <h1 className="serif mt-3 text-[clamp(2.4rem,4vw,3.8rem)] italic leading-[0.95]">{piece.name}</h1>
            <p className="mt-4 text-[18px] tabular-nums">{formatPrice(piece.price)}</p>
            <p className="mt-1 text-[12px] text-bone/45">Founders&apos; price</p>

            <p className="mt-8 max-w-[44ch] text-[14px] leading-relaxed text-bone/70">{piece.description}</p>
            <p className="mt-3 text-[12px] text-bone/50">
              {piece.colour} · {piece.details.join(" · ")}
            </p>

            <div className="mt-8 flex items-baseline justify-between text-[12px] uppercase tracking-[0.16em]">
              <span className="text-bone/60">Size</span>
              <span className="normal-case tracking-normal text-bone/45">Oversized fit — take your usual size</span>
            </div>
            <div
              className="mt-3 grid border-l border-t border-bone/20"
              style={{ gridTemplateColumns: `repeat(${piece.sizes.length}, minmax(0, 1fr))` }}
              role="group"
              aria-label="Size"
            >
              {piece.sizes.map((s) => (
                <button
                  key={s}
                  aria-pressed={size === s}
                  onClick={() => {
                    setSize(s);
                    setError(false);
                  }}
                  className={`border-b border-r border-bone/20 py-3.5 text-[13px] transition-colors duration-300 ${
                    size === s ? "bg-bone text-ink" : "hover:bg-bone/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p role="alert" className={`mt-2 text-[12px] text-bone/70 ${error ? "" : "invisible"}`}>
              Choose a size first.
            </p>

            <div className="mt-3 grid gap-2">
              <button
                onClick={() => buy()}
                className="border border-bone/50 py-4 text-[12px] uppercase tracking-[0.18em] transition-colors duration-500 hover:border-bone hover:bg-bone hover:text-ink"
              >
                Add to bag
              </button>
              <button
                onClick={() => buy(() => setBagOpen(true))}
                className="bg-wine-dark py-4 text-[12px] uppercase tracking-[0.18em] text-bone transition-colors duration-500 hover:bg-wine"
              >
                Buy now
              </button>
            </div>

            <ul className="mt-8 divide-y divide-bone/10 border-y border-bone/10 text-[13px] text-bone/60">
              <li className="flex justify-between py-3"><span>Shipping</span><span>Free above ₹2,000</span></li>
              <li className="flex justify-between py-3"><span>Size swaps</span><span>Free</span></li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

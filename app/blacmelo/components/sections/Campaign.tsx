
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Scene, { type SceneKind } from "../art/Scene";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

type Chapter = {
  n: string;
  title: string;
  line: string;
  scene: SceneKind;
  /** clip-path the image opens from */
  from: string;
  frame: string;
  caption: string;
};

const CHAPTERS: Chapter[] = [
  {
    n: "I",
    title: "Arrival",
    line: "Everyone starts somewhere quiet.",
    scene: "dune",
    from: "inset(0% 100% 0% 0%)",
    frame: "col-span-12 md:col-span-8 aspect-[4/5] md:aspect-[16/10]",
    caption: "col-span-12 md:col-span-3 md:col-start-10 md:self-end",
  },
  {
    n: "II",
    title: "After hours",
    line: "The city keeps your secrets. What you wear doesn't have to.",
    scene: "city",
    from: "inset(100% 0% 0% 0%)",
    frame: "col-span-10 col-start-3 md:col-span-5 md:col-start-7 aspect-[3/4] md:row-start-1",
    caption: "col-span-12 md:col-span-4 md:col-start-2 md:row-start-1 md:self-center",
  },
  {
    n: "III",
    title: "Horizon",
    line: "Wear it until it becomes yours.",
    scene: "sea",
    from: "inset(0% 50% 0% 50%)",
    frame: "col-span-12 aspect-[4/5] md:aspect-[21/9] md:-mx-[4vw]",
    caption: "col-span-12 md:col-span-4 md:col-start-2",
  },
];

export default function Campaign() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((ch) => {
          const frame = ch.querySelector("[data-ch-frame]")!;
          const inner = ch.querySelector("[data-ch-inner]")!;
          gsap.fromTo(
            frame,
            { clipPath: frame.getAttribute("data-from")! },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.6,
              ease: "expo.inOut",
              scrollTrigger: { trigger: frame, start: "top 78%" },
            }
          );
          gsap.fromTo(
            inner,
            { scale: 1.3, yPercent: -6 },
            {
              scale: 1.05,
              yPercent: 6,
              ease: "none",
              scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsap.fromTo(
            ch.querySelectorAll("[data-ch-text] > *"),
            { autoAlpha: 0, y: 30 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.2,
              stagger: 0.1,
              ease: "expo.out",
              scrollTrigger: { trigger: ch, start: "top 60%" },
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="campaign" className="relative bg-ink px-[5vw] py-[18vh] md:px-[4vw] md:py-[22vh]" aria-labelledby="camp-title">
      <header className="grid grid-cols-12 gap-x-[2vw]">
        <h2 id="camp-title" className="serif col-span-12 text-[16vw] italic leading-[0.88] tracking-[-0.02em] md:col-span-9 md:text-[9vw]">
          Wear your story
        </h2>
        <p className="col-span-12 mt-6 max-w-[30ch] text-[14px] leading-relaxed text-bone/60 md:col-span-3 md:mt-0 md:self-end">
          Autumn/Winter 2026. Three chapters, one wardrobe, between the desert and the sea.
        </p>
      </header>

      <div className="mt-[16vh] flex flex-col gap-[20vh]">
        {CHAPTERS.map((c) => (
          <article key={c.n} data-chapter className="grid grid-cols-12 gap-x-[2vw] gap-y-8" aria-label={`Chapter ${c.n}, ${c.title}`}>
            <div data-ch-frame data-from={c.from} className={`relative overflow-hidden bg-charcoal ${c.frame}`}>
              <div data-ch-inner className="absolute inset-0 will-change-transform">
                <Scene kind={c.scene} />
              </div>
            </div>
            <div data-ch-text className={c.caption}>
              <p className="text-[13px] text-bone/50">Chapter</p>
              <p className="serif mt-2 text-[clamp(3rem,6vw,6rem)] leading-none text-wine">{c.n}</p>
              <h3 className="wordmark mt-5 text-[clamp(1.6rem,2.6vw,2.6rem)]">{c.title}</h3>
              <p className="serif mt-4 max-w-[26ch] text-[clamp(1.15rem,1.5vw,1.5rem)] italic leading-snug text-bone/75">
                {c.line}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

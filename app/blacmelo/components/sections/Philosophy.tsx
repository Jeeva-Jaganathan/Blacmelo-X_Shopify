
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Scene from "../art/Scene";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const MISSING = 5; // middle-right tile

export default function Philosophy() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-ph-line] > span",
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.4,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: { trigger: "[data-ph-title]", start: "top 80%" },
          }
        );
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-puzzle]", start: "top 85%", end: "center 45%", scrub: 1 },
        });
        tl.fromTo("[data-puzzle]", { gap: "14px" }, { gap: "2px", ease: "none" }, 0)
          .fromTo("[data-tile]", { opacity: 0.35 }, { opacity: 1, stagger: 0.04, ease: "none" }, 0)
          .fromTo(
            "[data-the-piece]",
            { xPercent: 150, yPercent: -230, rotate: 24 },
            { xPercent: 0, yPercent: 0, rotate: 0, ease: "power2.inOut" },
            0
          )
          .fromTo("[data-ph-quote]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, ">-0.1");
        gsap.fromTo(
          "[data-ph-p]",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.15,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: "[data-ph-copy]", start: "top 80%" },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-charcoal px-[5vw] py-[18vh] md:px-[4vw] md:py-[24vh]" aria-labelledby="ph-title">
      <h2 id="ph-title" data-ph-title className="wordmark text-[11vw] md:text-[9.6vw]">
        <span data-ph-line className="line-mask">
          <span className="block">The missing</span>
        </span>
        <span data-ph-line className="line-mask pl-[14vw] md:pl-[22vw]">
          <span className="block">piece of</span>
        </span>
        <span data-ph-line className="line-mask pl-[4vw] md:pl-[9vw]">
          <span className="block">luxury</span>
        </span>
      </h2>

      <div className="mt-[14vh] grid grid-cols-12 gap-x-[2vw] gap-y-20">
        <div data-ph-copy className="col-span-12 flex flex-col gap-8 md:col-span-4 md:col-start-2 md:self-center">
          <p data-ph-p className="serif max-w-[24ch] text-[clamp(1.4rem,2.1vw,2rem)] leading-[1.25]">
            Luxury used to be a door with someone standing in front of it.
          </p>
          <p data-ph-p className="serif max-w-[26ch] text-[clamp(1.4rem,2.1vw,2rem)] leading-[1.25] text-bone/70">
            We think it should be about how something is made, and who it is made for.
          </p>
          <p data-ph-p className="max-w-[34ch] text-[14px] leading-relaxed text-bone/55">
            So we make fewer things, make them properly, and price them for people who will actually wear them.
          </p>
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-7">
          <div data-puzzle className="relative grid grid-cols-3" style={{ gap: "2px" }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const col = i % 3;
              const row = Math.floor(i / 3);
              if (i === MISSING) return <div key={i} className="aspect-square" aria-hidden />;
              return (
                <div key={i} data-tile className="relative aspect-square overflow-hidden bg-ink" aria-hidden>
                  <div className="absolute" style={{ width: "300%", height: "300%", left: `-${col * 100}%`, top: `-${row * 100}%` }}>
                    <Scene kind="sea" />
                  </div>
                </div>
              );
            })}
            <div
              data-the-piece
              className="absolute aspect-square bg-wine"
              style={{
                width: "calc((100% - 4px) / 3)",
                left: `calc(${(MISSING % 3) * 100}% / 3 + ${(MISSING % 3) * 2}px / 3)`,
                top: `calc(${Math.floor(MISSING / 3)} * (100% - 4px) / 3 + ${Math.floor(MISSING / 3) * 2}px)`,
              }}
              aria-hidden
            />
          </div>
          <p data-ph-quote className="serif mt-10 text-[clamp(1.6rem,2.6vw,2.6rem)] italic leading-tight">
            Access is the new exclusivity.
          </p>
        </div>
      </div>
    </section>
  );
}

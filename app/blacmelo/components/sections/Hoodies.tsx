
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { openCollection } from "../collection/route";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Page three: the hoodie campaign, one photograph across the screen with a single small line
 * beside it. The picture settles from a slight push-in; the line rises once it is in view.
 */
export default function Hoodies() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-h-img]",
          { scale: 1.08 },
          { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true } }
        );
        gsap.fromTo(
          "[data-h-fade]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 35%" } }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="hoodies" className="relative h-[100svh] min-h-[560px] overflow-hidden bg-[#efefed]" aria-labelledby="hoodies-title">
      <picture>
        <source media="(max-width: 767px)" srcSet="/campaign/hoodies-portrait-900.webp" />
        <img
          data-h-img
          src="/campaign/hoodies-1800.webp"
          srcSet="/campaign/hoodies-1000.webp 1000w, /campaign/hoodies-1800.webp 1800w, /campaign/hoodies-2560.webp 2560w"
          sizes="100vw"
          alt="The BLACMELO hoodies in a white studio: a model three times over, in a washed blue hoodie, seated on a burgundy leather sofa in a washed black hoodie, and leaning on the wall in a washed brown hoodie."
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
        />
      </picture>

      <div className="absolute left-[5vw] top-[13svh] text-ink md:left-[28.5vw] md:top-[21vh]">
        <p data-h-fade className="text-[10px] uppercase tracking-[0.2em] text-ink/55 md:text-[11px]">
          Collection 02
        </p>
        <h2 id="hoodies-title" data-h-fade className="serif mt-2 text-[6vw] italic leading-none md:text-[clamp(1.2rem,1.7vw,1.9rem)]">
          Hoodies collection
        </h2>
        <a
          data-h-fade
          href="#collection"
          onClick={(e) => {
            e.preventDefault();
            openCollection("hoodies");
          }}
          className="mt-4 inline-block border-b border-wine-dark/50 pb-1 text-[10px] uppercase tracking-[0.2em] text-wine-dark transition-colors hover:border-wine-dark md:text-[11px]"
        >
          Discover
        </a>
      </div>
    </section>
  );
}

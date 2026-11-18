
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef } from "react";
import { createIntro3D } from "../intro/intro3d";
import { LETTER_PATHS, WORD_VIEWBOX } from "../art/wordmark-paths";
import { useSmooth } from "../providers/SmoothScroll";
import { openCollection } from "../collection/route";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const WORD = "BLACMELO".split("");

/**
 * Opening: the BLACMELO mark turns into view on white as a solid, glossy black 3D object.
 * It turns like a coin; at edge-on its other face is the wordmark, which turns to face us
 * and presses flat into the graphic word. Then, in one motion, the white lifts away to reveal
 * the black page while the word sinks and grows into the giant BLACMELO across the bottom.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { stop, start } = useSmooth();
  // the opening always lands on the first screen, even after a refresh further down the page
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const loader = q("[data-loader]")[0];
      const lightWrap = q("[data-intro-light]")[0];
      const canvas = q("[data-intro-canvas]")[0] as HTMLCanvasElement;
      const lightWord = q("[data-intro-word-light]")[0];
      const heroWord = q("[data-word] p")[0];
      const nav = document.querySelector("[data-nav]");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([loader, lightWrap], { autoAlpha: 0, display: "none" });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        stop();
        gsap.set(q("[data-letter]"), { yPercent: 102 });
        gsap.set(q("[data-fade]"), { autoAlpha: 0, y: 14 });
        gsap.set(nav, { autoAlpha: 0 });

        // threads alternate direction, like warp and weft
        // the 3D scene, sized so its flattened word lands exactly on the 2D wordmark
        const three = createIntro3D(canvas, parseFloat(getComputedStyle(lightWord).fontSize));
        const tick = () => three.render();
        gsap.ticker.add(tick);
        let disposed = false;
        const cleanup = () => {
          if (disposed) return;
          disposed = true;
          gsap.ticker.remove(tick);
          three.dispose();
        };
        const { logo, word, wordDepth } = three;

        // the white wordmark grows into the giant hero wordmark
        const fx = () => {
          const a = lightWord.getBoundingClientRect(), b = heroWord.getBoundingClientRect();
          return b.left + b.width / 2 - (a.left + a.width / 2);
        };
        const fy = () => {
          const a = lightWord.getBoundingClientRect(), b = heroWord.getBoundingClientRect();
          return b.top + b.height / 2 - (a.top + a.height / 2);
        };
        const fs = () => heroWord.getBoundingClientRect().width / lightWord.getBoundingClientRect().width;

        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => {
            gsap.set(lightWrap, { display: "none" });
            start();
          },
        });

        // 1. The mark turns into view on white: a solid, glossy black object with real depth
        tl.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }, 0.05)
          .fromTo(logo.rotation, { x: 0.35, y: -1.15 }, { x: 0, y: 0, duration: 1.3 }, 0.05)
          .fromTo(logo.scale, { x: 0.86, y: 0.86, z: 0.86 }, { x: 1, y: 1, z: 1, duration: 1.3 }, 0.05)
          // 2. It turns like a coin; at edge-on its other face is the wordmark, which turns to face us
          .addLabel("turn", 1.3)
          .to(logo.rotation, { y: Math.PI / 2, duration: 0.42, ease: "power2.in" }, "turn")
          .set(logo, { visible: false }, "turn+=0.42")
          .set(word, { visible: true }, "turn+=0.42")
          .fromTo(word.rotation, { y: -Math.PI / 2 }, { y: 0, duration: 0.85, ease: "expo.out" }, "turn+=0.42")
          // 3. ...and presses flat into the graphic wordmark
          .fromTo(wordDepth.scale, { z: 1 }, { z: 0.02, duration: 0.55, ease: "power3.inOut" }, "turn+=0.85")
          .set(lightWord, { autoAlpha: 1 }, "turn+=1.4")
          .set(canvas, { autoAlpha: 0 }, "turn+=1.42")
          .add(cleanup, "turn+=1.45")
          // 3. One motion into the homepage: the white lifts away upward on a feathered edge,
          //    revealing the black page beneath, while the wordmark sinks into place as the giant
          //    BLACMELO. Where the word and the edge cross, the word turns from black to bone
          //    (difference blend), so colour and movement happen together.
          .addLabel("enter", "turn+=1.4")
          .to(loader, { yPercent: -100, duration: 1.3, ease: "power3.inOut" }, "enter")
          .fromTo(q("[data-hero-img]"), { scale: 1.12 }, { scale: 1, duration: 2.2, ease: "expo.out" }, "enter")
          .to(lightWord, { x: fx, y: fy, scale: fs, duration: 1.3, ease: "expo.inOut" }, "enter")
          .set(q("[data-letter]"), { yPercent: 0 }, "enter+=1.3")
          .set([lightWord, loader], { autoAlpha: 0 }, "enter+=1.3")
          .set(lightWrap, { mixBlendMode: "normal" }, "enter+=1.3")
          // the page builds in behind the lifting white
          .to([...q("[data-fade]"), nav], { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.05 }, "enter+=1.05");
        return cleanup;
      });

      // Scroll: the photograph drifts and the wordmark sinks as the page moves on.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to(q("[data-hero-img]"), { yPercent: 10, ease: "none", scrollTrigger: st });
        gsap.to(q("[data-word]"), { y: 60, ease: "none", scrollTrigger: st });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink" aria-label="BLACMELO">
      {/* Opening: the 3D mark turns into the wordmark on white, then the white lifts away as the word sinks into the page */}
      {/* the white room: taller than the screen, its lower edge feathered, so it can lift away softly */}
      <div
        data-loader
        className="fixed inset-x-0 top-0 z-[86] h-[125vh]"
        style={{ background: "linear-gradient(to bottom, #fff 80%, rgba(255,255,255,0.6) 88%, rgba(255,255,255,0) 100%)" }}
        aria-hidden
      >
        <canvas data-intro-canvas className="absolute left-0 top-0 h-[100vh] w-full" style={{ opacity: 0 }} />
      </div>
      <div
        data-intro-light
        className="pointer-events-none fixed inset-0 z-[87] flex items-center justify-center text-bone"
        style={{ mixBlendMode: "difference" }}
        aria-hidden
      >
        <IntroWeave />
      </div>

      {/* The campaign, full bleed: the whole first screen is one photograph */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-hero-img
          src="/campaign/lookbook-1400.webp"
          srcSet="/campaign/lookbook-900.webp 900w, /campaign/lookbook-1400.webp 1400w, /campaign/lookbook-2400.webp 2400w"
          sizes="100vw"
          alt="Two people in BLACMELO in a quiet living room: one seated on the floor in a black BLACMELO hoodie, the other in a green leather armchair wearing the white Garden tee and a BLACMELO cap."
          className="absolute inset-0 h-full w-full object-cover object-[50%_40%] will-change-transform max-md:object-[62%_40%]"
          fetchPriority="high"
          decoding="async"
        />
        {/* a low veil so the wordmark and line read without darkening the picture */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,8,8,0.78) 0%, rgba(8,8,8,0.35) 26%, rgba(8,8,8,0) 50%), linear-gradient(to bottom, rgba(8,8,8,0.45) 0%, rgba(8,8,8,0) 18%)",
          }}
        />
      </div>

      {/* Wordmark, and the way into the shop right beneath it */}
      <div data-word className="absolute right-[5vw] top-[58%] z-10 flex flex-col items-end md:right-[4vw]">
        <p className="wordmark pointer-events-none flex overflow-hidden text-[9.5vw] text-bone md:text-[clamp(2.4rem,4.2vw,4.6rem)]" aria-hidden>
          {WORD.map((c, i) => (
            <span key={i} data-letter className="inline-block">
              {/* the E is reversed, as in the logotype */}
              {i === 5 ? <span className="inline-block -scale-x-100">{c}</span> : c}
            </span>
          ))}
        </p>
        <a
          data-fade
          href="#collection"
          onClick={(e) => {
            e.preventDefault();
            openCollection("all");
          }}
          className="mt-4 bg-wine-dark px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-bone transition-colors duration-500 hover:bg-wine md:mt-5 md:px-6 md:text-[12px]"
        >
          Shop now
        </a>
      </div>
    </section>
  );
}


// The wordmark outline, defined once
function WeaveSymbols() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <symbol id="bm-intro-word" viewBox={WORD_VIEWBOX} overflow="visible">
          {LETTER_PATHS.map((d, i) => (
            <path key={i} d={d} fill="currentColor" />
          ))}
        </symbol>
      </defs>
    </svg>
  );
}

function WordSvg() {
  return (
    <svg className="block h-[0.76em] w-[6.76em] overflow-visible">
      <use href="#bm-intro-word" />
    </svg>
  );
}


/** The flat wordmark the 3D word hands over to; sized like the hero wordmark so it can grow into it. */
function IntroWeave() {
  return (
    <div className="relative h-[1.9em] w-[6.76em] text-[clamp(32px,5.8vw,86px)]">
      <WeaveSymbols />
      <div data-intro-word-light className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ opacity: 0 }}>
        <WordSvg />
      </div>
    </div>
  );
}

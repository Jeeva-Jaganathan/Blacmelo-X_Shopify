
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type Smooth = {
  scrollTo: (target: string | number) => void;
  stop: () => void;
  start: () => void;
};

const SmoothCtx = createContext<Smooth>({ scrollTo: () => {}, stop: () => {}, start: () => {} });
export const useSmooth = () => useContext(SmoothCtx);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.current = l;
    if (stopped.current) l.stop();
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    // GSAP's default lag smoothing stays on: after a long frame the timeline resumes instead of jumping ahead
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  const api = useMemo<Smooth>(
    () => ({
      scrollTo(target) {
        const l = lenis.current;
        if (l) {
          l.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
          return;
        }
        if (typeof target === "number") window.scrollTo({ top: target });
        else document.querySelector(target)?.scrollIntoView();
      },
      stop() {
        stopped.current = true;
        lenis.current?.stop();
        document.documentElement.style.overflow = "hidden";
      },
      start() {
        stopped.current = false;
        lenis.current?.start();
        document.documentElement.style.overflow = "";
      },
    }),
    []
  );

  return <SmoothCtx.Provider value={api}>{children}</SmoothCtx.Provider>;
}

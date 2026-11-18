
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { useSmooth } from "../providers/SmoothScroll";
import { openCollection } from "../collection/route";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "The collection", href: "#collection" },
      { label: "Hoodies", href: "#hoodie-drop" },
      { label: "Signature jacket", href: "#rail" },
      { label: "Gift cards", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "#" },
      { label: "Returns", href: "#" },
      { label: "Size guide", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "Instagram", href: "https://www.instagram.com/blacmelo" },
      { label: "TikTok", href: "#" },
    ],
  },
];

export default function Footer() {
  const { scrollTo } = useSmooth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-f-letter]",
          { yPercent: 100 },
          {
            yPercent: 0,
            ease: "none",
            stagger: 0.04,
            scrollTrigger: { trigger: "[data-f-word]", start: "top bottom", end: "bottom bottom", scrub: 1 },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setState("error");
    // TODO: connect to your email platform (Klaviyo, Mailchimp, Shopify customers)
    setState("done");
  };

  const link = (href: string) => (e: React.MouseEvent) => {
    if (href === "#collection") {
      e.preventDefault();
      openCollection();
    } else if (href.startsWith("#") && href.length > 1) {
      e.preventDefault();
      scrollTo(href);
    }
  };

  return (
    <footer ref={root} id="club" className="relative overflow-hidden bg-ink pt-[18vh]">
      <div className="grid grid-cols-12 gap-x-[2vw] gap-y-16 px-[5vw] md:px-[4vw]">
        <div className="col-span-12 md:col-span-5">
          <h2 className="serif text-[clamp(2.4rem,4.4vw,4.4rem)] italic leading-[1]">Join the BLACMELO Club</h2>
          <p className="mt-6 max-w-[36ch] text-[14px] leading-relaxed text-bone/60">
            Early access to new pieces and private sales. We only write when there is something worth reading.
          </p>
          {state === "done" ? (
            <p role="status" className="mt-10 flex items-center gap-3 text-[15px]">
              You&apos;re in. Look out for our first letter.
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-10 max-w-md">
              <label htmlFor="club-email" className="text-[13px] text-bone/55">
                Email address
              </label>
              <div className="mt-2 flex border-b border-bone/30 transition-colors focus-within:border-bone">
                <input
                  id="club-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  aria-invalid={state === "error"}
                  aria-describedby="club-error"
                  className="flex-1 bg-transparent py-3 text-[16px] outline-none placeholder:text-bone/30"
                  placeholder="you@example.com"
                />
                <button type="submit" className="group flex items-center gap-3 pl-4 text-[14px]">
                  Join
                </button>
              </div>
              <p id="club-error" role="alert" className={`mt-3 text-[13px] ${state === "error" ? "" : "invisible"}`}>
                Enter a valid email address, like name@example.com.
              </p>
            </form>
          )}
        </div>

        <nav className="col-span-12 grid grid-cols-3 gap-6 md:col-span-6 md:col-start-7" aria-label="Footer">
          {COLS.map((c) => (
            <div key={c.title}>
              <h3 className="text-[13px] text-bone/45">{c.title}</h3>
              <ul className="mt-5 space-y-3 text-[14px]">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={link(l.href)}
                      {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-bone/85 transition-colors hover:text-bone"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="col-span-12 flex flex-col justify-between gap-3 border-t border-bone/10 pt-6 text-[12px] text-bone/45 md:flex-row">
          <p>© 2026 BLACMELO. Dubai, United Arab Emirates.</p>
          <p className="serif text-[14px] italic text-bone/70">Wear your story through BLACMELO.</p>
          <a href="#top" onClick={link("#top")} className="hover:text-bone">
            Back to top
          </a>
        </div>
      </div>

      <div data-f-word className="mt-[8vh] px-[3vw]" aria-hidden>
        <p className="wordmark flex translate-y-[14%] items-end justify-between overflow-hidden text-[13.4vw] text-bone">
          {"BLACMELO".split("").map((c, i) => (
            <span key={i} data-f-letter className="inline-block">
              {c}
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}

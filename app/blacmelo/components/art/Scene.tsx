import { useId } from "react";

/**
 * Art-directed placeholder campaign frames: a lone figure in a wide landscape.
 * Swap any of these for real campaign photography or video via <Media src>.
 */
export type SceneKind = "dune" | "city" | "sea";

function Figure({ x, y, s = 1, fill = "#060606" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <circle cx="0" cy="-93" r="7" />
      <path d="M-14 -83 L14 -83 L21 -61 L14 -58 L13 -40 L-13 -40 L-14 -58 L-21 -61 Z" />
      <path d="M-11 -41 L-2 -41 L-3 0 L-10 0 Z" />
      <path d="M2 -41 L11 -41 L10 0 L3 0 Z" />
    </g>
  );
}

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function Scene({ kind, className }: { kind: SceneKind; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className={className ?? "absolute inset-0 h-full w-full"}
      aria-hidden
    >
      <defs>
        <filter id={`blur${id}`}>
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id={`soft${id}`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {kind === "dune" && <Dune id={id} />}
      {kind === "city" && <City id={id} />}
      {kind === "sea" && <Sea id={id} />}
    </svg>
  );
}

function Dune({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0f0f0f" />
          <stop offset="0.38" stopColor="#3a3634" />
          <stop offset="0.6" stopColor="#9a928b" />
        </linearGradient>
        <linearGradient id={`mid${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5b5450" />
          <stop offset="0.25" stopColor="#2c2826" />
          <stop offset="1" stopColor="#151413" />
        </linearGradient>
        <radialGradient id={`sun${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#efe9e2" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#d9cfc6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#721f3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#sky${id})`} />
      <circle cx="1120" cy="580" r="260" fill={`url(#sun${id})`} />
      <path d="M0 600 C300 560 520 612 800 586 C1050 566 1300 604 1600 576 V1000 H0Z" fill="#4c4643" />
      <path d="M0 600 C300 560 520 612 800 586 C1050 566 1300 604 1600 576 V640 H0Z" fill="#fff" opacity="0.05" filter={`url(#blur${id})`} />
      <path d="M0 712 C240 660 480 640 740 690 C980 734 1240 650 1600 694 V1000 H0Z" fill={`url(#mid${id})`} />
      <path d="M0 712 C240 660 480 640 740 690 C980 734 1240 650 1600 694" stroke="#efe9e2" strokeOpacity="0.22" strokeWidth="2" fill="none" />
      {/* long shadow */}
      <ellipse cx="640" cy="690" rx="110" ry="5" fill="#000" opacity="0.5" transform="rotate(-6 640 690)" />
      <Figure x={724} y={690} s={0.95} />
      <path d="M0 840 C300 772 640 806 900 776 C1160 746 1400 828 1600 796 V1000 H0Z" fill="#0d0c0c" />
    </>
  );
}

function City({ id }: { id: string }) {
  const r = rand(17);
  const blocks: { x: number; w: number; h: number }[] = [];
  let x = -20;
  while (x < 1640) {
    const w = 40 + r() * 90;
    const h = 120 + r() * 260;
    blocks.push({ x, w, h });
    x += w + 4 + r() * 10;
  }
  const windows: { x: number; y: number; o: number }[] = [];
  blocks.forEach((b) => {
    for (let wy = 700 - b.h + 18; wy < 690; wy += 16) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 12) {
        if (r() > 0.86) windows.push({ x: wx, y: wy, o: 0.25 + r() * 0.6 });
      }
    }
  });
  return (
    <>
      <defs>
        <linearGradient id={`night${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#09090a" />
          <stop offset="0.55" stopColor="#1b1a1c" />
          <stop offset="0.72" stopColor="#3a2a30" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#night${id})`} />
      <ellipse cx="800" cy="700" rx="900" ry="140" fill="#721f3a" opacity="0.35" filter={`url(#blur${id})`} />
      {/* tower */}
      <path d="M1010 700 L1010 430 L1022 360 L1030 220 L1034 120 L1038 220 L1046 360 L1058 430 L1058 700 Z" fill="#141315" />
      <rect x="1032" y="140" width="4" height="4" fill="#721f3a" opacity="0.9" />
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={700 - b.h} width={b.w} height={b.h} fill={i % 3 ? "#121113" : "#18171a"} />
      ))}
      {windows.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width="4" height="6" fill="#eae7e2" opacity={w.o} />
      ))}
      <rect y="660" width="1600" height="120" fill="#2b2426" opacity="0.5" filter={`url(#blur${id})`} />
      {/* rooftop */}
      <path d="M0 830 L1600 800 L1600 1000 L0 1000Z" fill="#060606" />
      <path d="M0 830 L1600 800" stroke="#eae7e2" strokeOpacity="0.12" strokeWidth="2" />
      <Figure x={1180} y={808} s={1.5} />
    </>
  );
}

function Sea({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`hz${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#262626" />
          <stop offset="0.52" stopColor="#a8a29b" />
          <stop offset="0.53" stopColor="#5d5a57" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient id={`streak${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#efe9e2" stopOpacity="0.6" />
          <stop offset="1" stopColor="#efe9e2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#hz${id})`} />
      <circle cx="400" cy="400" r="46" fill="#efe9e2" opacity="0.5" filter={`url(#soft${id})`} />
      <rect x="370" y="530" width="60" height="230" fill={`url(#streak${id})`} filter={`url(#blur${id})`} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M0 ${560 + i * i * 9} Q800 ${552 + i * i * 9} 1600 ${560 + i * i * 9}`}
          stroke="#efe9e2"
          strokeOpacity={0.05 + i * 0.012}
          strokeWidth="1.5"
          fill="none"
        />
      ))}
      <path d="M0 772 C400 748 900 760 1600 738 V1000 H0Z" fill="#0b0b0b" />
      <path d="M0 772 C400 748 900 760 1600 738" stroke="#efe9e2" strokeOpacity="0.2" strokeWidth="2" fill="none" />
      <Figure x={1060} y={760} s={1.1} />
    </>
  );
}

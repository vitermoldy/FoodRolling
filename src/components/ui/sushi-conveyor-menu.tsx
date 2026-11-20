"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export type DishTier = 1 | 2 | 3 | 4 | 5;

export interface ConveyorDish {
  id: string;
  /** Accessible name, chip text and dialog title. */
  name: string;
  /** One or two sentences for the caption and the dialog. */
  description?: string;
  /** Price text such as "$4.20", shown on the chip, the caption and the dialog. */
  price: string;
  /** Price tier 1–5. Kaiten plates are colour-coded by price, so the tier is drawn as the plate ring in chart colour 1–5. */
  tier?: DishTier;
  /** Top-down photo of the plate, centred on a transparent square canvas. */
  image: string;
  /** Short facts such as the piece count or allergens, listed as chips in the dialog. */
  details?: string[];
  /** Not on the menu yet: the plate is drawn faded and grey. */
  locked?: boolean;
}

export interface SushiConveyorMenuLabels {
  add: string;
  close: string;
  previous: string;
  next: string;
  /** Accessible name of the pause toggle. */
  pause?: string;
}

export interface SushiConveyorMenuProps extends React.ComponentProps<"section"> {
  items: ConveyorDish[];
  eyebrow?: string;
  heading?: string;
  /** Shown under the belt while no plate is picked out. */
  caption?: string;
  /** Call to action rendered under the caption. */
  action?: React.ReactNode;
  /** Cruise speed of the belt in px/s, measured on the front lane. */
  speed?: number;
  /** Stops the belt (controlled). */
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  /** Brings one plate after another to the front and lifts it, until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds between autoplay plates. */
  interval?: number;
  /** Index of the lifted plate (controlled). */
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  onOpenChange?: (index: number | null) => void;
  /** Called by the dialog's add button. */
  onAdd?: (item: ConveyorDish) => void;
  /** Price label per tier for the legend. Derived from the items when omitted. */
  legend?: { [tier: number]: string };
  labels?: SushiConveyorMenuLabels;
  /** Replaces the dialog's add button; `close` runs the dialog's closing animation. */
  dialogAction?: (item: ConveyorDish, close: () => void) => React.ReactNode;
}

const SPACING = 1.35;
const CURVE = 0.95;
const BAND = 1.22;
const TILT = 0.8;
const SLAT = 0.34;
const LIFT_Y = -6;
const LIFT_SCALE = 0.08;
const BACK_SHADE = 0.15;
const CHIP_ROOM = 34;
const WIDE = 1024;
const HOLD = 1400;
const RUN = 0;
const SEEK = 1;
const DRAG = 2;
const DEFAULT_LABELS: SushiConveyorMenuLabels = { add: "Add to order", close: "Close", previous: "Previous plate", next: "Next plate", pause: "Pause belt" };
const TIERS = [
  { ring: "border-chart-1", dot: "bg-chart-1" },
  { ring: "border-chart-2", dot: "bg-chart-2" },
  { ring: "border-chart-3", dot: "bg-chart-3" },
  { ring: "border-chart-4", dot: "bg-chart-4" },
  { ring: "border-chart-5", dot: "bg-chart-5" },
] as const;
const THEME =
  "[--belt:color-mix(in_oklab,var(--color-foreground)_78%,var(--color-background))] dark:[--belt:color-mix(in_oklab,var(--color-foreground)_16%,var(--color-background))] " +
  "[--belt-side:color-mix(in_oklab,var(--color-foreground)_92%,var(--color-background))] dark:[--belt-side:color-mix(in_oklab,var(--color-foreground)_7%,var(--color-background))] " +
  "[--rail:color-mix(in_oklab,var(--color-muted-foreground)_45%,white)] dark:[--rail:color-mix(in_oklab,var(--color-muted-foreground)_72%,var(--color-background))] " +
  "[--island:color-mix(in_oklab,var(--color-muted-foreground)_16%,var(--color-background))] dark:[--island:color-mix(in_oklab,var(--color-foreground)_13%,var(--color-background))] " +
  "[--island-low:color-mix(in_oklab,var(--color-muted-foreground)_27%,var(--color-background))] dark:[--island-low:color-mix(in_oklab,var(--color-foreground)_8%,var(--color-background))] " +
  "[--island-wall:color-mix(in_oklab,var(--color-muted-foreground)_42%,var(--color-background))] dark:[--island-wall:color-mix(in_oklab,var(--color-foreground)_5%,var(--color-background))]";

type Geo = {
  width: number; height: number; d: number; r: number; s: number; l: number; pitch: number; n: number;
  kb: number; cx: number; ym: number; a: number; b: number; band: number; slats: number; side: number; edgeTop: number;
};
type Point = { x: number; z: number; nx: number; nz: number; tx: number; tz: number };
type Sim = {
  offset: number; v: number; mode: number; target: number;
  lift: number[]; vlift: number[]; z: number[]; lane: string[];
  raf: number; last: number; visible: boolean; init: boolean; touched: boolean; l: number; center: number; published: string;
  px: number; py: number; inside: boolean; lock: boolean; lockX: number; lockY: number;
};

function makeSim(): Sim {
  return { offset: 0, v: 0, mode: RUN, target: 0, lift: [], vlift: [], z: [], lane: [], raf: 0, last: 0, visible: true, init: false, touched: false, l: 0, center: -1, published: "", px: 0, py: 0, inside: false, lock: false, lockX: 0, lockY: 0 };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function tierStyle(tier: number | undefined) {
  return TIERS[clamp(Math.round(tier ?? 1), 1, 5) - 1] ?? TIERS[0];
}

/** Position on the stadium loop. u is arc length on the belt, the front lane runs right to left and the back lane left to right. */
function along(g: Geo, u: number): Point {
  const { s, r } = g;
  let t = ((u % g.l) + g.l) % g.l;
  if (t < s) return { x: s / 2 - t, z: r, nx: 0, nz: 1, tx: -1, tz: 0 };
  t -= s;
  const arc = Math.PI * r;
  if (t < arc) {
    const f = t / r;
    const sin = Math.sin(f);
    const cos = Math.cos(f);
    return { x: -s / 2 - r * sin, z: r * cos, nx: -sin, nz: cos, tx: -cos, tz: -sin };
  }
  t -= arc;
  if (t < s) return { x: -s / 2 + t, z: -r, nx: 0, nz: -1, tx: 1, tz: 0 };
  t -= s;
  const f = Math.min(Math.PI, t / r);
  const sin = Math.sin(f);
  const cos = Math.cos(f);
  return { x: s / 2 + r * sin, z: -r * cos, nx: sin, nz: -cos, tx: cos, tz: sin };
}

/** Perspective-ish projection: the back lane shrinks to kb and the depth axis is foreshortened by TILT. */
function project(g: Geo, x: number, z: number) {
  const k = g.a + g.b * z;
  return { x: g.cx + x * k, y: g.ym + TILT * (g.a * z + (g.b * z * z) / 2), k };
}

function makeGeo(width: number, n: number, d: number, kb: number): Geo {
  const l = Math.max(1, n) * SPACING * d;
  const r = Math.min(CURVE * d, l / (2 * Math.PI));
  const s = Math.max(0, (l - 2 * Math.PI * r) / 2);
  const g: Geo = { width, height: 0, d, r, s, l, pitch: l / Math.max(1, n), n: Math.max(1, n), kb, cx: width / 2, ym: 0, a: (1 + kb) / 2, b: (1 - kb) / (2 * r), band: BAND * d, slats: Math.max(10, Math.round(l / (SLAT * d))), side: Math.max(3, d * 0.07), edgeTop: 0 };
  let top = Infinity;
  let bottom = -Infinity;
  let edge = Infinity;
  for (let j = 0; j < 120; j++) {
    const p = along(g, (j / 120) * l);
    const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2);
    const plate = project(g, p.x, p.z);
    const half = (plate.k * d * TILT) / 2;
    edge = Math.min(edge, rim.y);
    top = Math.min(top, rim.y, plate.y + (LIFT_Y / 100) * half * 2 - half * (1 + LIFT_SCALE) - CHIP_ROOM);
    bottom = Math.max(bottom, rim.y + g.side + d * 0.06, plate.y + half + d * 0.08);
  }
  g.ym = Math.ceil(-top) + 2;
  g.height = Math.ceil(bottom - top) + 4;
  g.edgeTop = edge + g.ym;
  return g;
}

function halfSpan(g: Geo) {
  let span = 0;
  for (let j = 0; j < 120; j++) {
    const p = along(g, (j / 120) * g.l);
    const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2);
    const plate = project(g, p.x, p.z);
    span = Math.max(span, Math.abs(rim.x - g.cx) + 3, Math.abs(plate.x - g.cx) + (plate.k * g.d * (1 + LIFT_SCALE)) / 2);
  }
  return span;
}

function edgePath(g: Geo, offset: number) {
  let d = "";
  const steps = 168;
  for (let j = 0; j < steps; j++) {
    const p = along(g, (j / steps) * g.l);
    const q = project(g, p.x + p.nx * offset, p.z + p.nz * offset);
    d += `${j ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  return `${d}Z`;
}

/** Crescent slat seams across the belt, redrawn every frame so they travel with the plates (and round the curves). */
function slatPath(g: Geo, offset: number, shift: number) {
  const half = g.band * 0.46;
  const pitch = g.l / g.slats;
  const bulge = pitch * 0.2;
  let d = "";
  for (let j = 0; j < g.slats; j++) {
    const p = along(g, offset + shift + j * pitch);
    const inner = project(g, p.x - p.nx * half, p.z - p.nz * half);
    const outer = project(g, p.x + p.nx * half, p.z + p.nz * half);
    const mid = project(g, p.x + p.tx * bulge, p.z + p.tz * bulge);
    d += `M${inner.x.toFixed(1)} ${inner.y.toFixed(1)}Q${(2 * mid.x - (inner.x + outer.x) / 2).toFixed(1)} ${(2 * mid.y - (inner.y + outer.y) / 2).toFixed(1)} ${outer.x.toFixed(1)} ${outer.y.toFixed(1)}`;
  }
  return d;
}

function pose(g: Geo, offset: number, i: number) {
  const p = along(g, offset - i * g.pitch);
  const q = project(g, p.x, p.z);
  return { x: q.x, y: q.y, k: q.k, depth: (p.z + g.r) / (2 * g.r) };
}

function centerOf(g: Geo, offset: number) {
  return ((Math.round((offset - g.s / 2) / g.pitch) % g.n) + g.n) % g.n;
}

function legendEntries(items: ConveyorDish[], legend: { [tier: number]: string } | undefined) {
  const out = [] as { tier: number; label: string }[];
  for (let tier = 1; tier <= 5; tier++) {
    const label = legend ? legend[tier] : items.find((item) => (item.tier ?? 1) === tier)?.price;
    if (label) out.push({ tier, label });
  }
  return out;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function SushiConveyorMenu({
  items,
  eyebrow,
  heading,
  caption,
  action,
  speed = 26,
  paused: pausedProp,
  onPausedChange,
  autoplay = false,
  interval = 3000,
  active: activeProp,
  onActiveChange,
  onOpenChange,
  onAdd,
  legend,
  labels = DEFAULT_LABELS,
  dialogAction,
  className,
  ref,
  ...rest
}: SushiConveyorMenuProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const sectionRef = React.useRef(null as HTMLElement | null);
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const beltRef = React.useRef(null as HTMLDivElement | null);
  const seamRef = React.useRef(null as SVGPathElement | null);
  const glintRef = React.useRef(null as SVGPathElement | null);
  const plates = React.useRef([] as (HTMLButtonElement | null)[]);
  const lifts = React.useRef([] as (HTMLSpanElement | null)[]);
  const shades = React.useRef([] as (HTMLSpanElement | null)[]);
  const shadows = React.useRef([] as (HTMLSpanElement | null)[]);
  const anchors = React.useRef([] as (HTMLSpanElement | null)[]);
  const sim = React.useRef(makeSim());
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, moved: false, start: 0, lane: 1, lastX: 0, lastT: 0, v: 0 });
  const pendingOpen = React.useRef(-1);
  const returnFocus = React.useRef(null as number | null);
  const autoActive = React.useRef(null as number | null);
  const autoLast = React.useRef(null as number | null);
  const [size, setSize] = React.useState({ section: 0, stage: 0 });
  const [innerActive, setInnerActive] = React.useState(null as number | null);
  const [innerPaused, setInnerPaused] = React.useState(false);
  const [openIndex, setOpenIndex] = React.useState(null as number | null);
  const [lifted, setLifted] = React.useState(null as number | null);
  const [reduced, setReduced] = React.useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [playing, setPlaying] = React.useState(autoplay);
  const [center, setCenter] = React.useState(0);
  const [failed, setFailed] = React.useState({} as { [id: string]: boolean });

  const requested = activeProp !== undefined ? activeProp : innerActive;
  const active = requested !== null && requested >= 0 && requested < count ? requested : null;
  const paused = pausedProp ?? innerPaused;
  const wide = size.section >= WIDE;
  const narrow = size.section > 0 && size.section < 480;
  const kb = narrow ? 0.6 : 0.68;

  const geo = React.useMemo(() => {
    if (!size.stage || count === 0) return null;
    const span = halfSpan(makeGeo(1000, count, 100, kb)) / 100;
    const cap = wide ? 150 : clamp(size.section * 0.143, 96, 150);
    const fit = (size.stage - 8) / (2 * span);
    return makeGeo(size.stage, count, Math.round(clamp(fit, Math.min(96, cap), cap)), kb);
  }, [size.stage, size.section, count, kb, wide]);

  const live = React.useRef({
    geo: null as Geo | null, active: null as number | null, paused: false, reduced: false, open: false, count: 0, speed: 26,
    activeControlled: false, pausedControlled: false,
    onActiveChange: undefined as ((index: number | null) => void) | undefined,
    onPausedChange: undefined as ((value: boolean) => void) | undefined,
    onOpenChange: undefined as ((index: number | null) => void) | undefined,
    onAdd: undefined as ((item: ConveyorDish) => void) | undefined,
  });
  live.current = {
    geo, active, paused, reduced, open: openIndex !== null, count, speed: Math.max(0, speed),
    activeControlled: activeProp !== undefined, pausedControlled: pausedProp !== undefined,
    onActiveChange, onPausedChange, onOpenChange, onAdd,
  };

  const setSectionRef = React.useCallback((node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const paintPlate = React.useCallback((i: number) => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    const button = plates.current[i];
    if (!g || !button) return;
    const q = pose(g, s.offset, i);
    const e = s.lift[i] ?? 0;
    button.style.transform = `translate3d(${(q.x - g.d / 2).toFixed(2)}px,${(q.y - (g.d * TILT) / 2).toFixed(2)}px,0) scale(${q.k.toFixed(4)})`;
    const z = i === L.active ? 2000 : 100 + Math.round(q.y);
    if (s.z[i] !== z) { s.z[i] = z; button.style.zIndex = String(z); }
    const lane = q.depth >= 0.5 ? "front" : "back";
    if (s.lane[i] !== lane) { s.lane[i] = lane; button.dataset.lane = lane; }
    const lift = lifts.current[i];
    if (lift) lift.style.transform = `translateY(${(LIFT_Y * e).toFixed(3)}%) scale(${(1 + LIFT_SCALE * e).toFixed(4)})`;
    const shade = shades.current[i];
    if (shade) shade.style.opacity = (BACK_SHADE * clamp(1 - q.depth, 0, 1) * (1 - 0.7 * clamp(e, 0, 1))).toFixed(3);
    const shadow = shadows.current[i];
    if (shadow) {
      shadow.style.transform = `translate3d(0,${(g.d * TILT * 0.05 * e).toFixed(2)}px,0) scale(${(1 + 0.14 * e).toFixed(3)})`;
      shadow.style.opacity = (1 - 0.5 * clamp(e, 0, 1)).toFixed(3);
    }
    const anchor = anchors.current[i];
    if (anchor) anchor.style.transform = `scale(${(1 / (q.k * (1 + LIFT_SCALE * e))).toFixed(4)})`;
  }, []);

  const paintBelt = React.useCallback(() => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    if (!g) return;
    seamRef.current?.setAttribute("d", slatPath(g, s.offset, 0));
    glintRef.current?.setAttribute("d", slatPath(g, s.offset, -Math.max(1.4, g.d * 0.024)));
    const v = (Math.abs(s.v) < 0.005 ? 0 : s.v).toFixed(2);
    if (v !== s.published) { s.published = v; beltRef.current?.style.setProperty("--belt-v", v); }
    const c = centerOf(g, s.offset);
    if (c !== s.center) { s.center = c; setCenter(c); }
  }, []);

  const paintAll = React.useCallback(() => {
    for (let i = 0; i < live.current.count; i++) paintPlate(i);
    paintBelt();
  }, [paintPlate, paintBelt]);

  const hitTest = React.useCallback((px: number, py: number) => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    if (!g) return null;
    let best = null as number | null;
    let bestY = -Infinity;
    for (let i = 0; i < L.count; i++) {
      const q = pose(g, s.offset, i);
      const e = clamp(s.lift[i] ?? 0, 0, 1.2);

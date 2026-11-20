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

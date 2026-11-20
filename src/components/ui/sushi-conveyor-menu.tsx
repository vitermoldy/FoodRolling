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

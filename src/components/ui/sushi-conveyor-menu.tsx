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

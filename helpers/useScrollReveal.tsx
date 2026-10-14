import { useEffect, useRef } from "react";
import { useCallbackRef } from "./useCallbackRef";

export interface ScrollRevealOptions {
  threshold?: number | number[];
  rootMargin?: string;
}
/**
 * useScrollReveal — Scroll-triggered reveal hook
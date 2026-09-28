"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";
import { ScrambleText } from "@/registry/ui/scramble-text";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function useDocumentHidden() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
}

function wrap(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

interface RotatingTextProps extends Omit<
  React.ComponentProps<"span">,
  "children" | "ref"
> {
  /** Words to cycle through. Screen readers get the first word shown. */
  words: string[];
  /** Controlled index of the word on screen. */
  index?: number;
  /** Starting index when uncontrolled. */
  defaultIndex?: number;
  /** Called with the new index on every auto-advance and every controlled change. */
  onIndexChange?: (index: number) => void;
  /** Stops auto-advance while true. */
  paused?: boolean;
  /** Milliseconds each word stays on screen. */
  interval?: number;
  /** How a new word comes in. */
  transition?: "scramble" | "fade";
  /** Scramble speed in milliseconds per character. */
  speed?: number;
  /** Scramble glyphs. */
  charset?: string;
}

function RotatingText({
  words,
  index,
  defaultIndex = 0,
  onIndexChange,
  paused = false,
  interval = 3200,
  transition = "scramble",
  speed,
  charset,
  className,
  ...props
}: RotatingTextProps) {
  const count = words.length;
  const controlled = index !== undefined;
  const reducedMotion = useReducedMotion();
  const hidden = useDocumentHidden();
  const [uncontrolled, setUncontrolled] = useState(() =>
    wrap(defaultIndex, count)
  );
  const current = controlled ? wrap(index, count) : wrap(uncontrolled, count);
  const [initial] = useState(current);
  // Re-arms the timer when a controlled parent keeps the index where it was.
  const [attempt, setAttempt] = useState(0);
  // The last index reported through onIndexChange, so a controlled parent
  // echoing an auto-advance back as `index` is not reported twice.
  const reported = useRef(current);
  const callback = useRef(onIndexChange);

  useEffect(() => {
    callback.current = onIndexChange;
  });

  useEffect(() => {
    if (!controlled || current === reported.current) return;
    reported.current = current;
    callback.current?.(current);
  }, [controlled, current]);

  // One timeout per word: every change, auto or controlled, gets a full
  // interval. Paused, hidden tabs and reduced motion never auto-advance.
  const advance = !reducedMotion && !paused && !hidden && count > 1;
  useEffect(() => {
    if (!advance) return;
    const timer = setTimeout(() => {
      const next = (current + 1) % count;
      if (!controlled) setUncontrolled(next);
      setAttempt((value) => value + 1);
      reported.current = next;
      callback.current?.(next);
    }, interval);
    return () => clearTimeout(timer);
  }, [advance, current, count, controlled, interval, attempt]);

  const word = words[current] ?? "";
  // Screen readers get one stable word: the first one shown, or the current
  // one if `words` has since shrunk past it.
  const spoken = words[initial] ?? word;

  return (
    <span
      data-slot="rotating-text"
      data-index={current}
      className={cn("relative inline-grid", className)}
      {...props}
    >
      {/* The word on screen covers the reserved cell from outside the grid.
          It comes first so a copy reads it inline, with no line break. */}
      {transition === "scramble" ? (
        <span aria-hidden className="absolute inset-0">
          <ScrambleText text={word} speed={speed} charset={charset} />
        </span>
      ) : (
        <span
          key={current}
          aria-hidden
          className="absolute inset-0 motion-safe:animate-[rotating-text-fade_400ms_ease-out]"
        >
          {word}
        </span>
      )}
      {/* Every word sits invisible in the same cell, so the box is always as
          wide and tall as the largest one and swapping words never shifts
          the layout. */}
      {words.map((item, position) => (
        <span
          key={`reserve-${position}`}
          aria-hidden
          className="invisible [grid-area:1/1]"
        >
          {item}
        </span>
      ))}
      {/* Read by screen readers, left out of copies, which get the word on
          screen instead. */}
      <span className="sr-only select-none">{spoken}</span>
    </span>
  );
}

export { RotatingText };

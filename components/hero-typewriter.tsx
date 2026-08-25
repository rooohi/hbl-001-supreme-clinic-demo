"use client";

import { useEffect, useState } from "react";

const sentence = "AI that works for your business.";

export function HeroTypewriter() {
  const [length, setLength] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    let cancelled = false;

    if (reduceMotion) {
      timer = window.setTimeout(() => setLength(sentence.length), 0);
      return () => window.clearTimeout(timer);
    }

    const type = (next: number) => {
      if (cancelled) return;
      setLength(next);
      if (next < sentence.length) {
        timer = window.setTimeout(() => type(next + 1), 48);
        return;
      }
      timer = window.setTimeout(() => erase(sentence.length - 1), 1650);
    };

    const erase = (next: number) => {
      if (cancelled) return;
      setLength(next);
      if (next > 0) {
        timer = window.setTimeout(() => erase(next - 1), 28);
        return;
      }
      timer = window.setTimeout(() => type(1), 520);
    };

    timer = window.setTimeout(() => type(1), 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return <span className="v2-typewriter" aria-label={sentence}>
    <span className="v2-typewriter-reserve" aria-hidden="true">{sentence}</span>
    <span className="v2-typewriter-live" aria-hidden="true">{sentence.slice(0, length)}</span>
  </span>;
}

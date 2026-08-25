"use client";

import { useEffect, useState } from "react";

const sentence = "AI that works for your business.";
const visitKey = "torvent.hero-headline-seen";

export function HeroTypewriter() {
  const [length, setLength] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasPlayed = window.sessionStorage.getItem(visitKey) === "true";
    let timer = 0;

    const reveal = (next: number) => {
      setLength(next);
      if (next < sentence.length) {
        timer = window.setTimeout(() => reveal(next + 1), 48);
      } else {
        window.sessionStorage.setItem(visitKey, "true");
      }
    };

    timer = window.setTimeout(() => reveal(reduceMotion || hasPlayed ? sentence.length : 1), reduceMotion || hasPlayed ? 0 : 260);
    return () => window.clearTimeout(timer);
  }, []);

  return <span className="v2-typewriter" aria-label={sentence}>
    <span className="v2-typewriter-reserve" aria-hidden="true">{sentence}</span>
    <span className="v2-typewriter-live" aria-hidden="true">{sentence.slice(0, length)}</span>
  </span>;
}

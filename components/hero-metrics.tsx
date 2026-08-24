"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
  { symbol: "#", value: 4, label: "Defined AI roles" },
  { symbol: "+", value: 5, label: "Industry workflows" },
  { symbol: "*", value: 3, label: "Languages ready" },
  { symbol: "<", value: 1, label: "Named human owner" },
] as const;

export function HeroMetrics() {
  const root = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<number[]>(metrics.map(() => 0));

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const reducedMotionFrame = requestAnimationFrame(() => setValues(metrics.map((metric) => metric.value)));
      return () => cancelAnimationFrame(reducedMotionFrame);
    }

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const startedAt = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startedAt) / 1250, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValues(metrics.map((metric) => Math.round(metric.value * eased)));
        if (progress < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: 0.25 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="cinematic-stats" ref={root} aria-label="Company capability summary">
    {metrics.map((metric, index) => <div className="cinematic-stat hero-anim" style={{ "--hero-delay": `${0.5 + index * 0.08}s` } as React.CSSProperties} key={metric.label}>
      <span aria-hidden="true">{metric.symbol}</span>
      <b>{values[index]}</b>
      <small>{metric.label}</small>
    </div>)}
  </div>;
}

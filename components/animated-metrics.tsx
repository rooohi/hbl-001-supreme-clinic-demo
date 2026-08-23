"use client";

import { useEffect, useRef, useState } from "react";

const metrics = [
  { label: "ENQUIRIES", value: 1284, suffix: "", note: "Sample monthly volume" },
  { label: "RESOLVED BY AI", value: 72, suffix: "%", note: "Illustrative rate" },
  { label: "QUALIFIED", value: 318, suffix: "", note: "Sample opportunities" },
  { label: "HOURS RETURNED", value: 146, suffix: "", note: "Illustrative capacity" },
];

const activity = [38, 54, 47, 68, 61, 79, 73, 88, 81, 96, 91, 108];

export function AnimatedMetrics() {
  const root = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      setProgress(1 - Math.pow(1 - elapsed, 3));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started]);

  return <div className={started ? "dashboard-card metrics-live" : "dashboard-card"} ref={root}>
    <header><span>Workflow performance</span><em><i/> Live illustration</em></header>
    <div className="metric-grid">{metrics.map((metric) => <div key={metric.label}>
      <small>{metric.label}</small>
      <b>{Math.round(metric.value * progress).toLocaleString("en-IN")}{metric.suffix}</b>
      <i>{metric.note}</i>
    </div>)}</div>
    <div className="chart-shell"><div className="chart-axis"><span>120</span><span>60</span><span>0</span></div><div className="chart-bars" aria-label="Illustrative rising weekly workflow activity">
      {activity.map((height, index) => <span className="chart-candle" style={{ "--bar-height": `${height}px`, "--bar-delay": `${index * 70}ms` } as React.CSSProperties} key={index}><i/><b/></span>)}
    </div></div>
    <footer><span>Week 1</span><span>Week 4</span><span>Week 8</span><span>Week 12</span></footer>
  </div>;
}

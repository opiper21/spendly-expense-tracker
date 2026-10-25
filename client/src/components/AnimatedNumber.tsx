import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  format: (value: number) => string;
}

export default function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    const controls = animate(displayRef.current, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        displayRef.current = latest;
        setDisplay(latest);
      },
    });

    return () => controls.stop();
  }, [reduceMotion, value]);

  return <span className="tabular-nums">{format(reduceMotion ? value : display)}</span>;
}
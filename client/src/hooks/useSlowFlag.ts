import { useEffect, useState } from "react";

export function useSlowFlag(active: boolean, delayMs = 4000): boolean {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!active) return;

    const timer = window.setTimeout(() => setSlow(true), delayMs);

    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [active, delayMs]);

  return slow;
}
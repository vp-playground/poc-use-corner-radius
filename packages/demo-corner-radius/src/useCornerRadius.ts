import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * useCornerRadius
 * Computes a responsive corner radius = min(width, height, inputRadius)
 * Returns a ref to attach to the target element and an `sx` snippet you can spread.
 */
export function useCornerRadius<T extends HTMLElement = HTMLDivElement>(
  inputRadius: number,
) {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  // Initial + observe resize
  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // Re-measure when inputRadius changes (in case element size depends on it indirectly)
  useLayoutEffect(() => {
    measure();
  }, [inputRadius, measure]);

  const resolved = Math.min(
    inputRadius,
    size.w || inputRadius,
    size.h || inputRadius,
  );

  const sx = { borderRadius: `${resolved}px` } as const;

  return { ref, sx, radius: resolved };
}

export type UseCornerRadiusReturn = ReturnType<typeof useCornerRadius>;

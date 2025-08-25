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
    const rect = el.getBoundingClientRect();
    // Use rect (includes fractional pixels, border, padding) and always round up
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  // Initial + observe resize
  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || !("ResizeObserver" in window)) return;
    let frame: number | null = null;
    const ro = new ResizeObserver(() => {
      if (frame != null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    });
    ro.observe(el);
    return () => {
      if (frame != null) cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [measure]);
  // Re-measure when inputRadius changes (only affects resolved value, but in case layout ties to radius via styles)
  useLayoutEffect(() => {
    measure();
  }, [inputRadius, measure]);

  const resolved = Math.min(
    inputRadius,
    size.w || inputRadius,
    size.h || inputRadius,
  );

  const sx = { borderRadius: `${resolved}px` } as const;

  return { ref, sx, radius: resolved, size, reCalc: measure };
}

export type UseCornerRadiusReturn = ReturnType<typeof useCornerRadius>;

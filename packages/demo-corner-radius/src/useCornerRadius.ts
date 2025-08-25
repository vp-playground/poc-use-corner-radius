import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * useCornerRadius
 * Computes a responsive corner radius = min(width, height, inputRadius)
 * Returns a ref to attach to the target element and an `sx` snippet you can spread.
 */
export function useCornerRadius<T extends HTMLElement = HTMLDivElement>(
  inputRadius: number,
  deps: ReadonlyArray<unknown> = [],
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

  // Stable key for dependency list without spreading arbitrary array (satisfies lint rules)
  const depsKey = JSON.stringify(deps);

  // Initial + observe resize
  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || !("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  // Re-measure when inputRadius or any external layout-affecting deps change
  useLayoutEffect(() => {
    measure();
  }, [inputRadius, measure, depsKey]);

  const resolved = Math.min(
    inputRadius,
    size.w || inputRadius,
    size.h || inputRadius,
  );

  const sx = { borderRadius: `${resolved}px` } as const;

  return { ref, sx, radius: resolved, size };
}

export type UseCornerRadiusReturn = ReturnType<typeof useCornerRadius>;

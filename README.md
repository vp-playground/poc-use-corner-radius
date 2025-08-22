# Corner Radius PoC & Demo

This repository is a proof-of-concept exploring how to reconcile differences between **Figma corner radius behavior** and **CSS `border-radius`** in real components.

## Motivation

Figma lets designers specify a corner radius that visually clamps itself to the shortest side, keeping pill / circle shapes consistent when resizing. Raw CSS requires you to derive and update that radius manually (or risk distorted shapes). This demo shows a lightweight runtime approach that mirrors Figma's feel without bespoke per-component logic.

## Core Idea

Dynamic radius = `min(width, height, userInput)`

So a large configured radius gracefully degrades to a circle (or pill) even as the element shrinks.

## Implementation Highlights

- `useCornerRadius` custom hook encapsulates the logic (ResizeObserver + state)
- Returns `ref` and an `sx` snippet with the computed `borderRadius`
- No direct `style.setProperty` side effects; pure React state flow
- Joy UI (MUI Joy) for styling & dark theme surface
- Inline editable content region to visualize live reflow
- Hug sizing toggles (auto width/height) + explicit min / max / padding controls for layout stress tests

## Packages

- `packages/demo-corner-radius` – the runnable demo (Vite + React + Joy UI)
- Utility / shared configs (tsconfig, css-reset, dts) kept as separate workspaces for clarity

## Running the Demo

```bash
pnpm install
pnpm --filter @repo/demo-corner-radius dev
```

Then open the shown local URL (usually `http://localhost:5173`).

## Using the Hook Elsewhere

```tsx
const { ref, sx, radius } = useCornerRadius(desiredRadius);
return (
  <Box ref={ref} sx={{ ...sx /* other styles */ }}>
    Content
  </Box>
);
```

Where `desiredRadius` is the designer's intended radius value.

## Limitations / Future Ideas

- Multi-corner asymmetric radii (Figma supports per-corner) could be added by returning four radii (currently uniform)
- Layout thrash is minimal, but could batch with `requestAnimationFrame` for many instances
- Option to compute radii purely on resize events from ancestors (skip element observation)
- Provide CSS fallback for non-JS environments (static clamp / max)

## License

MIT © 2025 VdustR

See `LICENSE` for full text.

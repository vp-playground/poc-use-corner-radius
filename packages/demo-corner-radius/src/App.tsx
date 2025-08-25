import type { SxProps } from "@mui/joy/styles/types";
import { Box, Checkbox, Input, Typography } from "@mui/joy";
import Big from "big.js";
import { useEffect, useRef, useState } from "react";
import { useCornerRadius } from "./useCornerRadius";

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100dvh",
    p: 16,
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    alignItems: "stretch",
    width: "100%",
    maxWidth: 880,
  },
  controlRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
  },
  circleWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 240,
    height: 240,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "primary.softBg",
    color: "primary.softColor",
    fontSize: 24,
    fontWeight: 600,
    userSelect: "none",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "primary.outlinedBorder",
    borderRadius: "var(--corner-radius)",
    position: "relative",
    overflow: "hidden",
    cursor: "text",
    transition: "border-radius .2s ease",
    textAlign: "center",
  },
  editable: { outline: 0 },
  hint: { fontSize: 12, opacity: 0.6 },
} satisfies Record<string, SxProps>;

// Shared text styling between the invisible placeholder div and the textarea overlay
const editableTextBaseSx: SxProps = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  font: "inherit",
  fontWeight: "inherit",
  textAlign: "inherit",
  color: "inherit",
};

// OverlayEditable: visible text via underlying div, input captured by transparent textarea.
interface OverlayEditableProps {
  boxRef: React.RefObject<HTMLDivElement | null>;
  text: string;
  setText: (v: string) => void;
  radiusSx: any; // from hook
  layout: Record<string, any>;
}

// Helpers for arrow key value adjustment
const computeStep = (e: React.KeyboardEvent) => {
  const base = 1;
  const hasShift = e.shiftKey;
  const hasAlt = e.altKey; // use Alt like Chrome DevTools
  if (hasShift && hasAlt) return 100;
  if (hasShift) return 10;
  if (hasAlt) return 0.1;
  return base;
};

// Adjust a CSS length string by caret position (single value or multi value like padding)
function adjustCssValueAtCaret(
  value: string,
  caret: number,
  delta: number,
): string {
  const regex = /-?\d*\.?\d+[a-z%]*/gi;
  for (const match of value.matchAll(regex)) {
    const start = match.index ?? 0;
    const full = match[0];
    const end = start + full.length;
    if (caret >= start && caret <= end) {
      const numMatch = full.match(/-?\d*\.?\d+/);
      if (!numMatch) return value;
      const numStr = numMatch[0];
      const unit = full.slice(numStr.length);
      const num = Number.parseFloat(numStr);
      if (Number.isNaN(num)) return value;
      const updated = Number(new Big(num).plus(delta));
      const decimals = numStr.includes(".")
        ? numStr.split(".")[1]?.length || 0
        : 0;
      const fixed =
        decimals > 0
          ? updated.toFixed(Math.min(decimals, 4))
          : updated.toString();
      return value.slice(0, start) + fixed + unit + value.slice(end);
    }
  }
  return value;
}

type NumericSetter = (n: number) => void;
type StringSetter = (s: string) => void;

function handleNumberKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  current: number,
  setter: NumericSetter,
) {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  const step = computeStep(e);
  const dir = e.key === "ArrowUp" ? 1 : -1;
  e.preventDefault();
  const updated = Number(new Big(current).plus(step * dir));
  setter(updated);
}

function handleCssKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  current: string,
  setter: StringSetter,
) {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  const target = e.target as HTMLInputElement;
  const caret = target.selectionStart ?? current.length;
  const step = computeStep(e);
  const dir = e.key === "ArrowUp" ? 1 : -1;
  const newVal = adjustCssValueAtCaret(current, caret, step * dir);
  if (newVal !== current) {
    e.preventDefault();
    setter(newVal);
    // Attempt to keep caret on same numeric token (best effort)
    requestAnimationFrame(() => {
      try {
        const pos = Math.min(caret, newVal.length);
        target.setSelectionRange(pos, pos);
      } catch {}
    });
  }
}

const OverlayEditable: React.FC<OverlayEditableProps> = ({
  boxRef,
  text,
  setText,
  radiusSx,
  layout,
}) => {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <Box
      ref={boxRef}
      sx={{
        ...styles.circle,
        ...radiusSx,
        ...layout,
        position: "relative", // ensure positioning context
      }}
      onClick={() => taRef.current?.focus()}
      role="group"
      aria-label="Editable circle text"
    >
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Visible text (for layout & display) */}
        <Box
          aria-hidden
          sx={{
            ...editableTextBaseSx,
            pointerEvents: "none",
            minHeight: "1.2em",
            opacity: 0, // hidden placeholder just for sizing
          }}
        >
          {text}
        </Box>
        {/* Invisible textarea overlay (captures input) */}
        <Box
          component="textarea"
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            m: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            ...editableTextBaseSx,
            resize: "none",
            p: 0,
            cursor: "text",
            overflow: "hidden",
          }}
          aria-label="Editable text input overlay"
        />
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  const [radiusInput, setRadiusInput] = useState(9999); // large default => circle
  // Keep an internal label but don't re-render on every keystroke inside the contentEditable element
  // to avoid caret jumping to the start. We'll only commit text on blur.
  const [text, setText] = useState("Corner Radius");
  // sizing states
  const [heightValue, setHeightValue] = useState("28px");
  const [minHeightValue, setMinHeightValue] = useState("");
  const [maxHeightValue, setMaxHeightValue] = useState("");
  const [hugHeight, setHugHeight] = useState(true);
  const [widthValue, setWidthValue] = useState("28px");
  const [minWidthValue, setMinWidthValue] = useState("");
  const [maxWidthValue, setMaxWidthValue] = useState("");
  const [hugWidth, setHugWidth] = useState(true);
  const [paddingValue, setPaddingValue] = useState("16px 24px");
  const [borderWidth, setBorderWidth] = useState(2);
  const {
    ref: boxRef,
    sx: radiusSx,
    size,
  } = useCornerRadius(radiusInput, [
    text,
    paddingValue,
    borderWidth,
    hugHeight,
    hugWidth,
  ]);
  // Refs to track latest measured size while in hug mode without triggering lint on state updates inside effect
  const hugHeightMeasuredRef = useRef("");
  const hugWidthMeasuredRef = useRef("");
  useEffect(() => {
    if (hugHeight && size.h) hugHeightMeasuredRef.current = `${size.h}px`;
  }, [hugHeight, size.h]);
  useEffect(() => {
    if (hugWidth && size.w) hugWidthMeasuredRef.current = `${size.w}px`;
  }, [hugWidth, size.w]);

  // (No longer need manual observer logic; handled inside hook)

  const onRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value || 0);
    setRadiusInput(Number.isFinite(v) ? v : 0);
  };

  // Recalculate when sizing related state changes (layout may change)
  // Hook already observes size; no extra effect required here.

  return (
    <Box sx={styles.page}>
      <Box sx={styles.controls}>
        <Box sx={styles.controlRow}>
          <Typography level="title-sm">Corner Radius (px)</Typography>
          <Input
            type="number"
            slotProps={{
              input: {
                min: 0,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleNumberKey(e, radiusInput, (v) => setRadiusInput(v)),
              },
            }}
            value={radiusInput}
            onChange={onRadiusChange}
            sx={{ width: 140 }}
          />
          <Typography level="body-sm" sx={styles.hint}>
            Applied: min(width, height, input)
          </Typography>
        </Box>
        <Box sx={styles.controlRow}>
          <Typography level="title-sm" sx={{ minWidth: 64 }}>
            Height
          </Typography>
          <Input
            placeholder="28px"
            value={hugHeight ? (size.h ? `${size.h}px` : "") : heightValue}
            disabled={hugHeight}
            onChange={(e) => setHeightValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  !hugHeight && handleCssKey(e, heightValue, setHeightValue),
              },
            }}
            sx={{ width: 140 }}
          />
          <Input
            placeholder="min-height"
            value={minHeightValue}
            onChange={(e) => setMinHeightValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleCssKey(e, minHeightValue, setMinHeightValue),
              },
            }}
            sx={{ width: 140 }}
          />
          <Input
            placeholder="max-height"
            value={maxHeightValue}
            onChange={(e) => setMaxHeightValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleCssKey(e, maxHeightValue, setMaxHeightValue),
              },
            }}
            sx={{ width: 140 }}
          />
          <Checkbox
            label="Hug"
            checked={hugHeight}
            onChange={(e) => {
              const checked = e.target.checked;
              if (!checked) {
                // leaving hug mode: lock the latest measured size from ref
                const latest =
                  hugHeightMeasuredRef.current ||
                  (size.h ? `${size.h}px` : heightValue);
                setHeightValue(latest);
              }
              setHugHeight(checked);
            }}
          />
        </Box>
        <Box sx={styles.controlRow}>
          <Typography level="title-sm" sx={{ minWidth: 64 }}>
            Width
          </Typography>
          <Input
            placeholder="240px"
            value={hugWidth ? (size.w ? `${size.w}px` : "") : widthValue}
            disabled={hugWidth}
            onChange={(e) => setWidthValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  !hugWidth && handleCssKey(e, widthValue, setWidthValue),
              },
            }}
            sx={{ width: 140 }}
          />
          <Input
            placeholder="min-width"
            value={minWidthValue}
            onChange={(e) => setMinWidthValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleCssKey(e, minWidthValue, setMinWidthValue),
              },
            }}
            sx={{ width: 140 }}
          />
          <Input
            placeholder="max-width"
            value={maxWidthValue}
            onChange={(e) => setMaxWidthValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleCssKey(e, maxWidthValue, setMaxWidthValue),
              },
            }}
            sx={{ width: 140 }}
          />
          <Checkbox
            label="Hug"
            checked={hugWidth}
            onChange={(e) => {
              const checked = e.target.checked;
              if (!checked) {
                const latest =
                  hugWidthMeasuredRef.current ||
                  (size.w ? `${size.w}px` : widthValue);
                setWidthValue(latest);
              }
              setHugWidth(checked);
            }}
          />
        </Box>
        <Box sx={styles.controlRow}>
          <Typography level="title-sm" sx={{ minWidth: 64 }}>
            Padding
          </Typography>
          <Input
            placeholder="16px 24px"
            value={paddingValue}
            onChange={(e) => setPaddingValue(e.target.value)}
            slotProps={{
              input: {
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleCssKey(e, paddingValue, setPaddingValue),
              },
            }}
            sx={{ width: 180 }}
          />
          <Typography level="title-sm" sx={{ minWidth: 64 }}>
            Border
          </Typography>
          <Input
            type="number"
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value) || 0)}
            slotProps={{
              input: {
                min: 0,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) =>
                  handleNumberKey(e, borderWidth, setBorderWidth),
              },
            }}
            sx={{ width: 100 }}
          />
        </Box>
      </Box>
      <Box sx={styles.circleWrapper}>
        <OverlayEditable
          boxRef={boxRef}
          text={text}
          setText={setText}
          radiusSx={radiusSx}
          layout={{
            height: hugHeight ? "auto" : heightValue || undefined,
            width: hugWidth ? "auto" : widthValue || undefined,
            minHeight: minHeightValue || undefined,
            maxHeight: maxHeightValue || undefined,
            minWidth: minWidthValue || undefined,
            maxWidth: maxWidthValue || undefined,
            padding: paddingValue || undefined,
            borderWidth,
          }}
        />
      </Box>
    </Box>
  );
};

export { App };

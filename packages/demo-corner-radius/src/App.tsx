import type { SxProps } from "@mui/joy/styles/types";
import { Box, Checkbox, Input, Typography } from "@mui/joy";
import { useRef, useState } from "react";
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

// OverlayEditable: visible text via underlying div, input captured by transparent textarea.
interface OverlayEditableProps {
  boxRef: React.RefObject<HTMLDivElement | null>;
  text: string;
  setText: (v: string) => void;
  radiusSx: any; // from hook
  layout: Record<string, any>;
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
            pointerEvents: "none",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            minHeight: "1.2em",
            opacity: 0, // now hidden placeholder just for sizing
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
            font: "inherit",
            fontWeight: "inherit",
            textAlign: "inherit",
            resize: "none",
            color: "inherit",
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
  const { ref: boxRef, sx: radiusSx, size } = useCornerRadius(radiusInput);
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
            slotProps={{ input: { min: 0 } }}
            defaultValue={radiusInput}
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
            sx={{ width: 140 }}
          />
          <Input
            placeholder="min-height"
            value={minHeightValue}
            onChange={(e) => setMinHeightValue(e.target.value)}
            sx={{ width: 140 }}
          />
          <Input
            placeholder="max-height"
            value={maxHeightValue}
            onChange={(e) => setMaxHeightValue(e.target.value)}
            sx={{ width: 140 }}
          />
          <Checkbox
            label="Hug"
            checked={hugHeight}
            onChange={(e) => {
              const checked = e.target.checked;
              if (!checked) {
                // leaving hug mode: lock the current measured size
                if (size.h) setHeightValue(`${size.h}px`);
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
            sx={{ width: 140 }}
          />
          <Input
            placeholder="min-width"
            value={minWidthValue}
            onChange={(e) => setMinWidthValue(e.target.value)}
            sx={{ width: 140 }}
          />
          <Input
            placeholder="max-width"
            value={maxWidthValue}
            onChange={(e) => setMaxWidthValue(e.target.value)}
            sx={{ width: 140 }}
          />
          <Checkbox
            label="Hug"
            checked={hugWidth}
            onChange={(e) => {
              const checked = e.target.checked;
              if (!checked) {
                if (size.w) setWidthValue(`${size.w}px`);
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
            sx={{ width: 180 }}
          />
          <Typography level="title-sm" sx={{ minWidth: 64 }}>
            Border
          </Typography>
          <Input
            type="number"
            value={borderWidth}
            onChange={(e) => setBorderWidth(Number(e.target.value) || 0)}
            slotProps={{ input: { min: 0 } }}
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

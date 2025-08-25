import type { SxProps } from "@mui/joy/styles/types";
import { Box, Checkbox, Input, Typography } from "@mui/joy";
import { useState } from "react";
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
    // dynamic size for demo
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
    border: "2px solid",
    borderColor: "primary.outlinedBorder",
    // The magic: use the CSS variable
    borderRadius: "var(--corner-radius)",
    position: "relative",
    overflow: "hidden",
    cursor: "text",
    transition: "border-radius .2s ease",
    textAlign: "center",
  },
  editable: {
    outline: 0,
  },
  hint: { fontSize: 12, opacity: 0.6 },
} satisfies Record<string, SxProps>;

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
        </Box>
      </Box>
      <Box sx={styles.circleWrapper}>
        <Box
          ref={boxRef}
          sx={{
            ...styles.circle,
            ...radiusSx,
            height: hugHeight ? "auto" : heightValue || undefined,
            width: hugWidth ? "auto" : widthValue || undefined,
            minHeight: minHeightValue || undefined,
            maxHeight: maxHeightValue || undefined,
            minWidth: minWidthValue || undefined,
            maxWidth: maxWidthValue || undefined,
            padding: paddingValue || undefined,
          }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setText((e.target as HTMLElement).textContent || "")}
          aria-label="Editable circle text"
        >
          {/* Uncontrolled contentEditable to preserve caret position during typing */}
          {text}
        </Box>
      </Box>
    </Box>
  );
};

export { App };

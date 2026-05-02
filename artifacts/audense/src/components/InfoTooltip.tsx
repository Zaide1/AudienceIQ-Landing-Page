import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  title: string;
  body: string;
  note?: string;
  size?: number;
}

export function InfoTooltip({ title, body, note, size = 13 }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  const position = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, []);

  const open = useCallback(() => { position(); setVisible(true); }, [position]);
  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const onOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onOutside);
    };
  }, [visible, close]);

  const tooltip = visible
    ? createPortal(
        <div
          id={tooltipId}
          role="tooltip"
          onMouseEnter={open}
          onMouseLeave={close}
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: "10px 12px",
            maxWidth: 260,
            minWidth: 180,
            pointerEvents: "auto",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 12.5, color: "#111827", marginBottom: 5 }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.55 }}>
            {body}
          </div>
          {note && (
            <div
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                marginTop: 8,
                paddingTop: 7,
                borderTop: "1px solid #F3F4F6",
                lineHeight: 1.5,
              }}
            >
              {note}
            </div>
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Info: ${title}`}
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={() => (visible ? close() : open())}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        <Info size={size} style={{ color: "#9CA3AF" }} />
      </button>
      {tooltip}
    </>
  );
}

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Mail, MessageCircle, ExternalLink } from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const close = useCallback(() => { onClose(); }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const CARD: React.CSSProperties = {
    display: "flex", alignItems: "flex-start", gap: 14,
    padding: "16px 18px", borderRadius: 10,
    border: "1px solid #E5E7EB", background: "#FAFAFA",
    marginBottom: 10, cursor: "default",
  };

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Get support"
      style={{
        position: "fixed", inset: 0, zIndex: 10001,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        style={{
          width: "min(480px, calc(100vw - 40px))",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 24px 80px rgba(15,23,42,0.22)",
          padding: "28px 28px 24px",
          position: "relative",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Get support</div>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>We're here to help. Reach out through any of these channels.</div>

        <div style={CARD}>
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: "#F4F0FF", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Mail size={16} style={{ color: "#7C3AED" }} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", marginBottom: 3 }}>Email us</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              Send us a message and we'll reply within one business day.
            </div>
            <a
              href="mailto:hello@audense.app"
              style={{ fontSize: 13, color: "#7C3AED", fontWeight: 500, marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
            >
              hello@audense.app <ExternalLink size={11} />
            </a>
          </div>
        </div>

        <div style={CARD}>
          <div style={{
            width: 38, height: 38, borderRadius: 9,
            background: "#F4F0FF", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MessageCircle size={16} style={{ color: "#7C3AED" }} />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827", marginBottom: 3 }}>Live chat</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
              Chat with us in real time during business hours (Mon–Fri, 9am–6pm GMT).
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 5 }}>Coming soon</div>
          </div>
        </div>

        <div style={{ marginTop: 6, padding: "12px 16px", background: "#F9F8FF", borderRadius: 8, border: "1px solid #EDE9FE" }}>
          <div style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.55 }}>
            <strong style={{ color: "#374151" }}>AudienceIQ is in early access.</strong> Some features may change as we improve the product. Your feedback helps us build better.
          </div>
        </div>

        <button
          type="button"
          aria-label="Close"
          onClick={close}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 30, height: 30, borderRadius: "50%",
            background: "#F3F4F6", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.15s",
          }}
        >
          <X size={15} style={{ color: "#6B7280" }} />
        </button>
      </div>
    </div>,
    document.body,
  );
}

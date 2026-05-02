import { DashboardPreview } from "@/components/landing/DashboardPreview";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";
import { useState } from "react";
import { useLocation } from "wouter";

const ROWS: { title: string; body: string }[] = [
  {
    title: "Map the audience",
    body: "See who is most likely to care, where they are, and how big the opportunity looks.",
  },
  {
    title: "Test the idea",
    body: "Ask what people might object to, what competitors they already use, and what to validate first.",
  },
  {
    title: "Turn research into action",
    body: "Get messaging angles, channel plans, and next steps based on your audience map.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Where do the audience estimates come from?",
    a: "Audience numbers are directional MVP estimates derived from your inputs and broad public signals. They are designed to help you prioritise segments, not to serve as official market sizing.",
  },
  {
    q: "Is this official market sizing?",
    a: "No. Audense gives you a working view of who might care and how big the opportunity could feel. Treat the numbers as a starting point for your own validation, not a verified statistic.",
  },
  {
    q: "Can Audense compare competitors?",
    a: "Yes. You can ask Audense who an audience is likely already using, what they tend to say about those tools, and where the gaps in messaging or experience seem to be.",
  },
  {
    q: "Do I need to sign up?",
    a: "You can run one research session as a guest to try it. To save your history, switch between sessions, or start additional research, you'll need to create a free account.",
  },
  {
    q: "What happens when I start a new research?",
    a: "Each new research creates its own session with its own audience map and chat. Your previous sessions stay intact in your history, and you can switch between them at any time.",
  },
];

/* ─── Section 1: Product value with large mockup ───────────────────── */
function ProductValueSection() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        padding: "clamp(96px, 12vw, 160px) clamp(24px, 5vw, 72px)",
        background:
          "linear-gradient(180deg, #FBFAFE 0%, #F4F1FB 55%, #EFEAF7 100%)",
        borderTop: "1px solid #ECE9F5",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "clamp(40px, 4.5vw, 68px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "#0D0D12",
            margin: 0,
            maxWidth: 920,
            marginInline: "auto",
          }}
        >
          Validate the audience before you build the product.
        </h2>
        <p
          style={{
            marginTop: 22,
            fontSize: "clamp(17px, 1.25vw, 21px)",
            lineHeight: 1.55,
            color: "#6B7280",
            maxWidth: 720,
            marginInline: "auto",
          }}
        >
          Audense helps founders turn rough ideas into target segments,
          objections, competitor angles, and first-channel plans.
        </p>

        {/* Large rounded product card */}
        <div
          style={{
            marginTop: 64,
            borderRadius: 28,
            padding: "clamp(20px, 3vw, 40px)",
            background:
              "linear-gradient(180deg, rgba(237,233,254,0.7) 0%, rgba(221,214,254,0.45) 100%)",
            border: "1px solid #E5DEFB",
            boxShadow:
              "0 1px 2px rgba(15,23,42,0.04), 0 24px 60px rgba(124,58,237,0.10)",
          }}
        >
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              background: "#fff",
              border: "1px solid #ECE9F5",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}
          >
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: Three calm explanation rows ───────────────────────── */
function ExplanationRows() {
  return (
    <section
      style={{
        width: "100%",
        padding: "clamp(80px, 10vw, 128px) clamp(24px, 5vw, 72px)",
        background: "#fff",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {ROWS.map((r, i) => (
            <article
              key={r.title}
              style={{
                background: "#FBFAFE",
                border: "1px solid #ECE9F5",
                borderRadius: 22,
                padding: "32px 30px 34px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#7C3AED",
                  letterSpacing: "0.08em",
                }}
              >
                0{i + 1}
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#0D0D12",
                  margin: 0,
                }}
              >
                {r.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#6B7280",
                  margin: 0,
                }}
              >
                {r.body}
              </p>
            </article>
          ))}
        </div>

        {/* Compact chat preview, sits beneath the rows */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              width: "100%",
              background: "#FAFAFB",
              border: "1px solid #ECE9F5",
              borderRadius: 22,
              padding: "26px 28px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#7C3AED",
                textTransform: "uppercase",
              }}
            >
              Audense chat
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
              <div
                style={{
                  background: "#F5F3FF",
                  border: "1px solid #DDD6FE",
                  borderRadius: "12px 12px 2px 12px",
                  padding: "10px 13px",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#4C1D95",
                  maxWidth: "85%",
                }}
              >
                Who should I target first?
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", minWidth: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: `transparent url(${logoImg}) center/contain no-repeat`,
                }}
              />
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px 12px 12px 2px",
                  padding: "10px 14px",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#111827",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                Start with the segment that has the clearest pain, easiest
                message, and most reachable channels.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: FAQ accordion ─────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #ECE9F5" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "22px 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            fontSize: "clamp(16px, 1.2vw, 18px)",
            fontWeight: 600,
            color: "#0D0D12",
            letterSpacing: "-0.01em",
          }}
        >
          {q}
        </span>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: open ? "#7C3AED" : "#F5F3FF",
            color: open ? "#fff" : "#7C3AED",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            lineHeight: 1,
            fontWeight: 700,
            transition: "background 0.18s, color 0.18s, transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 22,
            paddingRight: 56,
            fontSize: 15,
            lineHeight: 1.65,
            color: "#6B7280",
            maxWidth: 760,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  return (
    <section
      style={{
        width: "100%",
        padding: "clamp(80px, 10vw, 128px) clamp(24px, 5vw, 72px)",
        background: "transparent",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "clamp(32px, 3.2vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#0D0D12",
            margin: 0,
            marginBottom: 40,
          }}
        >
          Frequently asked questions
        </h2>
        <div>
          {FAQS.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 4: Footer ────────────────────────────────────────────── */
function Footer() {
  const [, navigate] = useLocation();
  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        padding: "clamp(56px, 8vw, 96px) clamp(24px, 5vw, 72px) 56px",
        background: "transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logoImg}
                alt="Audense"
                width={32}
                height={32}
                decoding="sync"
                loading="eager"
                fetchPriority="high"
                style={{ width: 32, height: 32, objectFit: "contain" }}
                className="rounded-lg"
              />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#0D0D12",
                }}
              >
                Audense
              </span>
              <span
                style={{
                  marginLeft: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  height: 22,
                  padding: "0 9px",
                  borderRadius: 999,
                  background: "#EDE9FE",
                  color: "#6D28D9",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Beta
              </span>
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.55,
                color: "#6B7280",
                margin: 0,
              }}
            >
              Audience intelligence for founders before they build.
            </p>
          </div>

          <nav
            aria-label="Footer"
            style={{
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Help", href: "/help" },
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(l.href);
                }}
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#374151",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  cursor: "pointer",
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            paddingTop: 24,
            borderTop: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>
            © {new Date().getFullYear()} Audense
          </span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>
            Built for founders.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Public composite ─────────────────────────────────────────────── */
export function BelowHero() {
  return (
    <>
      <ProductValueSection />
      <ExplanationRows />
      {/* Continuous bottom gradient that bleeds the FAQ down into the footer
          with no visible seam — soft lavender wash that "overextends" past
          the content, similar to the Cluely reference. */}
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FAF8FE 28%, #EFEAF8 62%, #E2D8F2 100%)",
        }}
      >
        {/* Soft purple bloom anchored bottom-center for a calm, premium glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(167,139,250,0.28) 0%, rgba(124,58,237,0.10) 45%, transparent 78%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <FAQSection />
          <Footer />
        </div>
      </div>
    </>
  );
}

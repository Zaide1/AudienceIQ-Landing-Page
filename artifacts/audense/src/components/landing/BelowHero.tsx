import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";
import { useState } from "react";
import { useLocation } from "wouter";
import { FaXTwitter, FaLinkedin, FaReddit } from "react-icons/fa6";

const WHERE_TO_TEST_PLATFORMS: { name: string; Icon: React.ComponentType<{ size?: number | string }>; color: string }[] = [
  { name: "X", Icon: FaXTwitter, color: "#000000" },
  { name: "LinkedIn", Icon: FaLinkedin, color: "#0A66C2" },
  { name: "Reddit", Icon: FaReddit, color: "#FF4500" },
];

function PlatformChip({ name, Icon, color }: { name: string; Icon: React.ComponentType<{ size?: number | string }>; color: string }) {
  return (
    <span
      title={name}
      aria-label={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#fff",
        border: "1px solid #ECE9F5",
        color,
        flexShrink: 0,
        boxShadow:
          "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(124,58,237,0.06)",
      }}
    >
      <Icon size={17} />
    </span>
  );
}

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
    a: "No. AudienceIQ gives you a working view of who might care and how big the opportunity could feel. Treat the numbers as a starting point for your own validation, not a verified statistic.",
  },
  {
    q: "Can AudienceIQ compare competitors?",
    a: "Yes. You can ask AudienceIQ who an audience is likely already using, what they tend to say about those tools, and where the gaps in messaging or experience seem to be.",
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

/* ─── Section 1: Product preview — chat moment + output card ──────── */

const PLAN_ROWS: { label: string; value: string }[] = [
  { label: "Audience", value: "Startup founders" },
  { label: "Pain", value: "“I can't find the file when I need it.”" },
  { label: "Where to test", value: "X · LinkedIn · Reddit" },
  { label: "First move", value: "Ask 5 founders what they use today" },
];

function ProductValueSection() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        padding: "clamp(96px, 12vw, 160px) clamp(24px, 5vw, 72px)",
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* Local feathered glow — confined to this section, edges masked so no rectangle is visible */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(167,139,250,0.22) 0%, rgba(167,139,250,0.10) 40%, rgba(167,139,250,0.04) 65%, transparent 80%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, #000 18%, #000 78%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, #000 18%, #000 78%, transparent 100%)",
        }}
      />
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "clamp(36px, 4vw, 60px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "#0D0D12",
            margin: 0,
            maxWidth: 880,
            marginInline: "auto",
          }}
        >
          Validate the audience before you build.
        </h2>
        <p
          style={{
            marginTop: 20,
            fontSize: "clamp(17px, 1.2vw, 20px)",
            lineHeight: 1.55,
            color: "#6B7280",
            maxWidth: 720,
            marginInline: "auto",
          }}
        >
          AudienceIQ turns a rough product idea into who to test with, what they
          care about, and where to start.
        </p>

        {/* Large soft panel */}
        <div
          style={{
            marginTop: 56,
            borderRadius: 28,
            padding: "clamp(28px, 4vw, 56px)",
            background:
              "linear-gradient(180deg, rgba(245,243,255,0.85) 0%, rgba(237,233,254,0.55) 100%)",
            border: "1px solid #E5DEFB",
            boxShadow:
              "0 1px 2px rgba(15,23,42,0.04), 0 24px 60px rgba(124,58,237,0.08)",
            textAlign: "left",
          }}
        >
          <div
            className="audense-preview-row"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "clamp(24px, 3vw, 48px)",
              alignItems: "stretch",
            }}
          >
            {/* LEFT — Chat moment */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 18,
                padding: "clamp(8px, 1.5vw, 20px) clamp(8px, 1vw, 16px)",
                minWidth: 0,
              }}
            >
              {/* Founder bubble */}
              <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
                <div
                  style={{
                    background: "#F5F3FF",
                    borderRadius: "16px 16px 4px 16px",
                    padding: "14px 18px",
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "#4C1D95",
                    maxWidth: "92%",
                    fontWeight: 500,
                  }}
                >
                  I'm thinking of building an AI file organiser for founders.
                </div>
              </div>

              {/* AudienceIQ bubble */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: `transparent url(${logoImg}) center/contain no-repeat`,
                  }}
                />
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "14px 18px",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "#111827",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    minWidth: 0,
                  }}
                >
                  Your first audience is likely founders who lose time hunting
                  for saved files. Test the pain before building the product.
                </div>
              </div>
            </div>

            {/* RIGHT — Output card */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #ECE9F5",
                borderRadius: 20,
                padding: "clamp(20px, 2vw, 28px)",
                boxShadow:
                  "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(124,58,237,0.08)",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    color: "#0D0D12",
                    margin: 0,
                  }}
                >
                  First audience plan
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 20,
                    padding: "0 8px",
                    borderRadius: 999,
                    background: "#F5F3FF",
                    color: "#6D28D9",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  AudienceIQ
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {PLAN_ROWS.map((r, i) => (
                  <div
                    key={r.label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                      gap: 16,
                      padding: "14px 0",
                      borderTop: i === 0 ? "none" : "1px solid #F1EEF8",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#9CA3AF",
                      }}
                    >
                      {r.label}
                    </span>
                    {r.label === "Where to test" ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        {WHERE_TO_TEST_PLATFORMS.map((p) => (
                          <PlatformChip key={p.name} name={p.name} Icon={p.Icon} color={p.color} />
                        ))}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 14.5,
                          lineHeight: 1.55,
                          color: "#111827",
                          fontWeight: 500,
                        }}
                      >
                        {r.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: stack columns on small screens */}
      <style>{`
        @media (max-width: 880px) {
          .audense-preview-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
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
              AudienceIQ chat
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
        className="audense-faq-button"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: "22px 12px",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          borderRadius: 8,
          transition: "background 0.15s ease",
          outline: "none",
          WebkitTapHighlightColor: "transparent",
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
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            padding: "0 12px 22px",
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
      <style>{`
        .audense-faq-button:hover {
          background: #FAFAFB;
        }
        .audense-faq-button:focus {
          outline: none;
        }
        .audense-faq-button:focus-visible {
          outline: none;
          background: #F5F3FF;
          box-shadow: inset 0 0 0 1px #E5DEFB;
        }
      `}</style>
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
                alt="AudienceIQ"
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
                AudienceIQ
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
            © {new Date().getFullYear()} AudienceIQ
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

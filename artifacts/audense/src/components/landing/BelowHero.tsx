import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

const CARDS: { title: string; body: string }[] = [
  {
    title: "Map the audience",
    body: "See who is most likely to care, where they are, and how big the opportunity looks.",
  },
  {
    title: "Validate the idea",
    body: "Ask what people might object to, what competitors they already use, and what to test first.",
  },
  {
    title: "Turn research into action",
    body: "Get messaging angles, channel plans, and next steps based on your audience map.",
  },
];

export function BelowHero() {
  return (
    <section
      style={{
        width: "100%",
        padding: "clamp(72px, 10vw, 128px) clamp(24px, 5vw, 72px) clamp(72px, 8vw, 112px)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Heading */}
        <div style={{ maxWidth: 820, marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(36px, 4vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#0D0D12",
              margin: 0,
            }}
          >
            Stop building before you know who wants it.
          </h2>
          <p
            style={{
              marginTop: 18,
              fontSize: "clamp(17px, 1.2vw, 20px)",
              lineHeight: 1.55,
              color: "#6B7280",
              maxWidth: 680,
            }}
          >
            Audense helps founders turn a rough idea into an audience map,
            validation plan, and go-to-market starting point.
          </p>
        </div>

        {/* Cards + chat preview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {CARDS.map((c) => (
            <article
              key={c.title}
              style={{
                background: "#fff",
                border: "1px solid #ECE9F5",
                borderRadius: 18,
                padding: "26px 26px 28px",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(124,58,237,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#F5F3FF",
                  border: "1px solid #E9E3FB",
                  marginBottom: 6,
                }}
              />
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "#0D0D12",
                  margin: 0,
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "#6B7280",
                  margin: 0,
                }}
              >
                {c.body}
              </p>
            </article>
          ))}

          {/* Chat preview card — same column sizing as the proof cards */}
          <article
            style={{
              background: "#FAFAFB",
              border: "1px solid #ECE9F5",
              borderRadius: 18,
              padding: "22px 22px 24px",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(124,58,237,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              gridColumn: "span 1",
              minWidth: 0,
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

            {/* Founder bubble */}
            <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
              <div
                style={{
                  background: "#F5F3FF",
                  border: "1px solid #DDD6FE",
                  borderRadius: "12px 12px 2px 12px",
                  padding: "10px 13px",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "#4C1D95",
                  maxWidth: "88%",
                  wordBreak: "break-word",
                }}
              >
                Who should I target first?
              </div>
            </div>

            {/* Audense bubble */}
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start", minWidth: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
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
                  padding: "10px 13px",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "#111827",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                Start with the segment that has the clearest pain, easiest
                message, and most reachable channels.
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

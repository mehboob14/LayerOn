import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { LayerLogo } from "./LayerLogo";

export interface AuthQuote {
  text: string;
  author: { name: string; role: string; initials: string };
}

interface AuthShellProps {
  /** Eyebrow label for the marketing pane (e.g. "★ Marketplace · 350 modules") */
  eyebrow: string;
  /** Headline for the marketing pane — supports inline JSX for italic accents */
  headline: ReactNode;
  /** Sub-paragraph under the headline */
  subhead?: ReactNode;
  /** Rotating quotes shown in the marketing pane */
  quotes?: AuthQuote[];
  /** Stat strip at the bottom of the marketing pane */
  stats?: Array<{ num: string; label: string }>;
  /** Right-pane content — typically the auth form */
  children: ReactNode;
  /** Top-right text + link (e.g. "New here? · Create account") */
  topRight?: { prompt: string; ctaLabel: string; ctaHref: string };
}

const DEFAULT_QUOTES: AuthQuote[] = [
  {
    text: "I built a strength-coaching module in two weekends. It's done 600+ chats this month. That's more income than the gym pays me, and I'm asleep when most of it happens.",
    author: { name: "Marcus T.", role: "Strength Coach · 14 yr", initials: "MT" },
  },
  {
    text: "Got specific lease advice in two minutes that would've cost me a £200 consultation. The module actually understood break clauses.",
    author: { name: "David K.", role: "Property Developer", initials: "DK" },
  },
  {
    text: "The tax module found deductions my accountant missed. Genuinely saved me £1,400 on my self-assessment.",
    author: { name: "Nina S.", role: "Freelance Designer", initials: "NS" },
  },
];

export function AuthShell({
  eyebrow,
  headline,
  subhead,
  quotes,
  stats,
  children,
  topRight,
}: AuthShellProps) {
  const [, setLocation] = useLocation();
  const list = quotes && quotes.length ? quotes : DEFAULT_QUOTES;
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return;
    const id = setInterval(() => {
      setActiveQuote((i) => (i + 1) % list.length);
    }, 7000);
    return () => clearInterval(id);
  }, [list.length]);

  const quote = list[activeQuote];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.05fr 1fr",
        background: "var(--bone)",
        color: "var(--ink)",
      }}
      className="auth-shell"
    >
      {/* LEFT — value prop / marketing */}
      <aside
        style={{
          background: "var(--ink)",
          color: "var(--bone)",
          padding: "2rem 3rem 3rem",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        className="auth-shell-left"
      >
        {/* Acid radial accent */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: 400,
            height: 400,
            background: "radial-gradient(circle, var(--acid) 0%, transparent 70%)",
            opacity: 0.18,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "-100px",
            bottom: "-100px",
            width: 320,
            height: 320,
            background: "radial-gradient(circle, var(--coral) 0%, transparent 70%)",
            opacity: 0.1,
            pointerEvents: "none",
          }}
        />

        <a
          className="layer-logo"
          onClick={() => setLocation("/")}
          style={{ cursor: "pointer", color: "var(--bone)", position: "relative", zIndex: 1 }}
        >
          <LayerLogo variant="bone" />
        </a>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1, padding: "3rem 0" }}>
          <span
            className="eyebrow"
            style={{
              color: "rgba(244,241,234,0.55)",
              marginBottom: "1.5rem",
            }}
          >
            <span className="num" style={{ color: "var(--acid)" }}>★</span> {eyebrow}
          </span>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
              fontWeight: 600,
              color: "var(--bone)",
              maxWidth: "16ch",
              marginBottom: "1.5rem",
            }}
          >
            {headline}
          </h1>
          {subhead && (
            <p
              style={{
                fontSize: "1.05rem",
                color: "rgba(244,241,234,0.7)",
                lineHeight: 1.55,
                maxWidth: "44ch",
                marginBottom: "3rem",
              }}
            >
              {subhead}
            </p>
          )}

          {/* Rotating quote */}
          <figure
            style={{
              borderLeft: "2px solid var(--acid)",
              paddingLeft: "1.25rem",
              maxWidth: "44ch",
              minHeight: 160,
              transition: "opacity 0.5s var(--ease)",
            }}
            key={activeQuote}
            className="auth-quote"
          >
            <blockquote
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1.25rem",
                lineHeight: 1.4,
                color: "var(--bone)",
                marginBottom: "1.25rem",
              }}
            >
              "{quote.text}"
            </blockquote>
            <figcaption style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--acid)",
                  color: "var(--ink)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {quote.author.initials}
              </span>
              <span>
                <strong style={{ color: "var(--bone)", fontWeight: 500, fontSize: "0.9rem" }}>{quote.author.name}</strong>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "rgba(244,241,234,0.55)",
                  }}
                >
                  {quote.author.role}
                </span>
              </span>
            </figcaption>
          </figure>

          {/* Quote dots */}
          {list.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: "1.5rem" }}>
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQuote(i)}
                  aria-label={`Quote ${i + 1}`}
                  style={{
                    width: i === activeQuote ? 24 : 8,
                    height: 4,
                    borderRadius: 2,
                    background: i === activeQuote ? "var(--acid)" : "rgba(244,241,234,0.2)",
                    border: 0,
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.3s var(--ease)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats strip */}
        {stats && stats.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
              gap: "1rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(244,241,234,0.12)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: "var(--bone)",
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "rgba(244,241,234,0.55)",
                    marginTop: "0.4rem",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* RIGHT — auth form */}
      <main
        style={{
          padding: "2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          background: "var(--bone)",
        }}
        className="auth-shell-right"
      >
        {/* Top-right link */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-4)",
          }}
        >
          {topRight && (
            <>
              <span>{topRight.prompt}</span>
              <button
                onClick={() => setLocation(topRight.ctaHref)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  textTransform: "inherit",
                  letterSpacing: "inherit",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textDecorationColor: "var(--acid)",
                  textDecorationThickness: 2,
                  textUnderlineOffset: 4,
                }}
                data-testid="auth-switch-link"
              >
                {topRight.ctaLabel}
              </button>
            </>
          )}
        </div>

        {/* Form area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem 0",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
        </div>

        {/* Footer line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--bone-edge)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-4)",
          }}
        >
          <span>© {new Date().getFullYear()} LayerOn Ltd.</span>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="#" style={{ color: "inherit" }}>Privacy</a>
            <a href="#" style={{ color: "inherit" }}>Terms</a>
            <button
              onClick={() => setLocation("/about")}
              style={{
                background: "transparent",
                border: 0,
                padding: 0,
                cursor: "pointer",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                textTransform: "inherit",
                letterSpacing: "inherit",
              }}
            >
              About
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 880px) {
          .auth-shell { grid-template-columns: 1fr !important; }
          .auth-shell-left { padding: 1.75rem 1.5rem 2rem !important; min-height: auto !important; }
          .auth-shell-left .auth-quote { display: none !important; }
        }
      `}</style>
    </div>
  );
}

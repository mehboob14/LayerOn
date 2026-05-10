import { useLocation } from "wouter";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";
import { Reveal } from "@/components/layer/Reveal";

const PRINCIPLES = [
  {
    n: "01",
    h: "Real people, not synthetic personas.",
    p: "Every module starts with a verified human expert. We check credentials, references, and a sample of their actual work. Generic AI invents authority. We borrow it from people who already have it.",
  },
  {
    n: "02",
    h: "Knowledge that breathes, not knowledge that's frozen.",
    p: "Foundation models hit a training cutoff and stop. LayerOn modules sync continuously from each expert's public work — Substack, YouTube, Medium, blog. The day Rachel publishes a take on the new Renters' Reform Bill, her module knows it.",
  },
  {
    n: "03",
    h: "Pay the experts. Every chat. Always.",
    p: "70% of every chat fee goes to the expert who built the module. No exclusivity. No quotas. The economics work because the expertise is the product, and the experts deserve to own it.",
  },
  {
    n: "04",
    h: "Refuse vague answers.",
    p: "If a question can't be answered well by the model — because it needs a human, a license, a courtroom — the module says so and offers to book the expert directly. Hedging is the failure mode of generic AI. We optimise against it.",
  },
  {
    n: "05",
    h: "One color per domain. One voice per expert.",
    p: "Acid is legal. Coral is fitness. Sage is finance. Every design choice reduces ambiguity. You scan the marketplace and you know what you're looking at — instantly, without reading.",
  },
];

const STATS = [
  { num: "350+", label: "Modules in marketplace" },
  { num: "120+", label: "Verified experts" },
  { num: "70%", label: "Of chat fee paid to creator" },
  { num: "~9 days", label: "Application to live module" },
];

export default function AboutPage() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <LayerNav />

      {/* HERO */}
      <header className="layer-section layer-divider" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">A</span> About LayerOn</span>
          <Reveal>
            <h1
              style={{
                fontSize: "var(--t-6)",
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                fontWeight: 600,
                maxWidth: "16ch",
                marginBottom: "1.5rem",
              }}
            >
              We're tired of AI that <span className="it">hedges.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "var(--t-3)",
                color: "var(--ink-3)",
                maxWidth: "30ch",
                marginBottom: "2rem",
              }}
            >
              "Consult a professional." Yeah, no kidding.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: "var(--t-2)", color: "var(--ink-3)", lineHeight: 1.5, maxWidth: "50ch" }}>
              LayerOn is a marketplace where domain experts package their craft into AI modules — and get paid every time someone uses them. The expertise is built in <strong style={{ color: "var(--ink)" }}>before you arrive</strong>. The expert keeps publishing. The module keeps learning.
            </p>
          </Reveal>
        </div>
      </header>

      {/* THE PROBLEM */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">01</span> The problem</span>
          <Reveal>
            <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1.5rem", maxWidth: "20ch" }}>
              Generic AI was trained on <span className="it">everyone.</span>
              <br />Which means it was trained on <span className="it">no one.</span>
            </h2>
          </Reveal>

          <div className="what-grid" style={{ marginTop: "3rem" }}>
            <Reveal>
              <div className="what-col">
                <h4>It averages.</h4>
                <p>
                  When you ask a foundation model about a lease clause, it averages a million Reddit threads and a thousand law-school outlines. The answer is <strong>technically correct and operationally useless</strong>. It doesn't know your jurisdiction's case law from last quarter. It doesn't know which clauses landlords actually fold on.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="what-col">
                <h4>It hedges.</h4>
                <p>
                  "This is general information, not legal advice. Consult a professional." That's the dominant failure mode. The model is trained to deflect, not to commit. <strong>It costs you nothing and gives you nothing.</strong>
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="what-col">
                <h4>It freezes.</h4>
                <p>
                  Foundation models hit a training cutoff and stop. Your accountant publishes a take on the autumn budget the morning it lands. The model still thinks it's last spring. <strong>Expertise is current. Generic AI is canned.</strong>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* THE WAY WE SEE IT */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">02</span> The way we see it</span>
          <Reveal>
            <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1.5rem", maxWidth: "22ch" }}>
              Custom GPTs were the right idea.<br />
              <span className="it">We're rebuilding what was missing.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              You can think of LayerOn as a custom-GPT marketplace — but with the limitations solved. A real expert behind every module. A continuously-syncing knowledge base that mirrors what they're actually publishing today. Earnings that go back to the person whose craft made the module valuable in the first place.
            </p>
          </Reveal>

          <div
            style={{
              marginTop: "3rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 0,
              border: "1px solid var(--bone-edge)",
              borderRadius: "var(--r-3)",
              overflow: "hidden",
            }}
            className="about-compare"
          >
            <div style={{ padding: "2rem", background: "var(--bone-light)", borderRight: "1px solid var(--bone-edge)" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--ink-4)",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                — Custom GPTs
              </span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  "Anyone can publish — no verification of who's behind it",
                  "Static one-shot uploads — knowledge freezes",
                  "Creators don't get paid",
                  "No accountability when answers are wrong",
                ].map((t) => (
                  <li
                    key={t}
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--ink-3)",
                      paddingLeft: "1.25rem",
                      position: "relative",
                      lineHeight: 1.55,
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: "var(--ink-4)" }}>—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: "2rem", background: "var(--ink)", color: "var(--bone)" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--acid)",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                — LayerOn
              </span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  "Every creator verified — credentials, references, work sample",
                  "Live sync from Medium, YouTube, Substack, blog — knowledge keeps breathing",
                  "70% of every chat fee goes to the expert",
                  "Quality issues = module pulled, credit refunded",
                ].map((t) => (
                  <li
                    key={t}
                    style={{
                      fontSize: "0.92rem",
                      color: "rgba(244,241,234,0.85)",
                      paddingLeft: "1.25rem",
                      position: "relative",
                      lineHeight: 1.55,
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: "var(--acid)" }}>+</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <style>{`
            @media (max-width: 760px) {
              .about-compare { grid-template-columns: 1fr !important; }
              .about-compare > div:first-child { border-right: 0 !important; border-bottom: 1px solid var(--bone-edge) !important; }
            }
          `}</style>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">03</span> Principles</span>
          <Reveal>
            <h2 className="five-title runon">
              Five<br />things<br />we<br /><span className="it">refuse</span><br />to budge on.
            </h2>
          </Reveal>

          <div className="five-grid">
            {PRINCIPLES.map((row) => (
              <Reveal key={row.n}>
                <div className="five-row">
                  <div className="five-num">{row.n}</div>
                  <h4>{row.h}</h4>
                  <p>{row.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">04</span> By the numbers</span>
          <div
            style={{
              marginTop: "2rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              background: "var(--bone-edge)",
              border: "1px solid var(--bone-edge)",
              borderRadius: "var(--r-3)",
              overflow: "hidden",
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "2.5rem 2rem",
                  background: "var(--bone-light)",
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--t-4)",
                    fontWeight: 600,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    color: "var(--ink)",
                    marginBottom: "0.6rem",
                  }}
                >
                  {s.num}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--ink-4)",
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM PLACEHOLDER */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">05</span> The team</span>
          <Reveal>
            <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1.5rem", maxWidth: "20ch" }}>
              A small team. <span className="it">An obsessive one.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              We're builders, designers, and former practitioners — the kind of people who used to <em>be</em> the expert behind the help desk. We've spent careers watching how AI gets the easy 80% right and the load-bearing 20% catastrophically wrong. LayerOn is our attempt to fix the 20% that actually matters.
            </p>
          </Reveal>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn btn-ink btn-lg" onClick={() => setLocation("/explore")}>
              Browse the marketplace <span className="arrow">→</span>
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => setLocation("/sign-up")}>
              Become a creator
            </button>
          </div>
        </div>
      </section>

      <LayerFooter />
    </div>
  );
}

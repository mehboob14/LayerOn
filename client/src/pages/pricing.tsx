import { useLocation } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";
import { Reveal } from "@/components/layer/Reveal";

const TIERS = [
  {
    key: "starter",
    name: "Starter",
    price: 4.99,
    credits: 50,
    description: "Try any module. Save chat history. Credits never expire.",
    features: ["Try any module", "Save chat history", "Credits never expire", "Email support"],
    featured: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 24.99,
    credits: 300,
    description: "For people who use modules every week.",
    features: [
      "Save expert favourites",
      "Priority module support",
      "15% discount on premium tier",
      "Early access to new modules",
      "Weekly digest of new modules in your domains",
    ],
    featured: true,
  },
  {
    key: "studio",
    name: "Studio",
    price: 99.0,
    credits: 1500,
    description: "Teams, agencies, and creators running heavy workloads.",
    features: [
      "Multi-seat workspace (up to 5 seats)",
      "API access",
      "Custom module commissions",
      "Direct line to creators",
      "Usage analytics + reports",
    ],
    featured: false,
  },
];

const FAQS = [
  {
    q: "What's a credit?",
    a: "A credit is the unit you spend to chat. One message to a standard module costs 5 credits. Premium-tier modules (built by senior practitioners) can cost more — usually 8 to 15 credits per message. Every module's price is shown upfront.",
  },
  {
    q: "Do credits expire?",
    a: "No. Once you buy them, they're yours. We don't claw back unused credits, and we don't charge maintenance fees. Hold them as long as you like.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Credits are pay-as-you-go, not subscriptions — so there's nothing to cancel. You buy a pack, you use it when you want. The Studio plan is monthly and can be cancelled from your billing page; remaining credits stay valid.",
  },
  {
    q: "What happens to creators when I pay?",
    a: "70% of every chat fee is passed to the creator who built the module. The other 30% covers infrastructure, model costs, verification, and platform development. We're transparent about it because the economics matter.",
  },
];

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const goCheckout = () => setLocation(isSignedIn ? "/billing" : "/sign-up");

  return (
    <div style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <LayerNav />

      {/* HERO */}
      <header className="layer-section layer-divider" style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">P</span> Pricing</span>
          <Reveal>
            <h1 style={{ fontSize: "var(--t-6)", lineHeight: 0.94, letterSpacing: "-0.045em", maxWidth: "16ch", marginBottom: "1.5rem" }}>
              Pay <span className="it">per chat,</span> not per month.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              Buy credits. Each chat costs 5 credits on standard modules. Credits never expire. The expert who built the module gets paid every time you use it.
            </p>
          </Reveal>
        </div>
      </header>

      {/* TIERS */}
      <section className="layer-section layer-divider" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <div className="price-grid" style={{ marginTop: 0 }}>
            {TIERS.map((tier) => {
              const [whole, fraction] = tier.price.toFixed(2).split(".");
              return (
                <div key={tier.key} className={`price-card ${tier.featured ? "featured" : ""}`}>
                  <div className="price-name">{tier.name}</div>
                  <div className="price-amt">
                    £{whole}<span>.{fraction}</span>
                  </div>
                  <div className="price-credits">
                    {tier.credits.toLocaleString()} credits · {Math.floor(tier.credits / 5)} chats
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "0.95rem",
                      color: tier.featured ? "rgba(244,241,234,0.7)" : "var(--ink-3)",
                      marginBottom: "1.25rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {tier.description}
                  </p>
                  <ul className="price-features">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button className="price-cta" onClick={goCheckout} data-testid={`tier-cta-${tier.key}`}>
                    {tier.featured ? "Most picked" : `Get ${tier.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CREATOR EARNINGS BLOCK */}
      <section className="layer-section">
        <div className="creators-block">
          <div>
            <span className="eyebrow" style={{ color: "rgba(244,241,234,0.6)", marginBottom: "1rem" }}>
              <span className="num" style={{ color: "var(--bone)" }}>★</span> For experts
            </span>
            <h2 style={{ fontSize: "var(--t-5)" }}>
              Creators earn <br /><span className="it">70% of every chat.</span>
            </h2>
            <p className="lead">
              No exclusivity. No quotas. No minimum hours. You build a module, it runs, and 70% of every fee paid by users lands in your account. Withdraw weekly.
            </p>

            <div className="creator-stats">
              <div className="creator-stat">
                <div className="num">£<em>1,840</em></div>
                <div className="lbl">Average monthly earnings · top tier</div>
              </div>
              <div className="creator-stat">
                <div className="num">~9 days</div>
                <div className="lbl">From application to live module</div>
              </div>
            </div>

            <button
              className="btn btn-acid btn-lg"
              onClick={() => setLocation("/sign-up")}
              data-testid="creator-apply"
            >
              Apply to be a creator <span className="arrow">→</span>
            </button>
          </div>

          <div className="creator-quote">
            <p className="q">
              "I built a strength-coaching module in two weekends. It's done 600+ chats this month. That's more income than the gym pays me, and I'm asleep when most of it happens."
            </p>
            <div className="who">
              <div className="av">MT</div>
              <div className="nm">
                <b>Marcus T.</b>
                <span>Strength Coach · LayerOn since 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE STANDARD VS PREMIUM */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">★</span> Premium tier</span>
          <Reveal>
            <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1.5rem", maxWidth: "22ch" }}>
              Some modules <span className="it">cost more.</span>
              <br />Here's why.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              About 10% of the marketplace is premium tier — modules built by senior practitioners with deep specialty: KCs, partner-level lawyers, board-certified physicians, senior CPAs. They charge 8–15 credits per chat. They're worth it.
            </p>
          </Reveal>

          <div
            style={{
              marginTop: "3rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
            className="pricing-compare"
          >
            <div
              style={{
                background: "var(--bone-light)",
                border: "1px solid var(--bone-edge)",
                borderRadius: "var(--r-3)",
                padding: "2rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--ink-4)",
                  marginBottom: "1rem",
                }}
              >
                — Standard
              </span>
              <p style={{ fontSize: "var(--t-3)", fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "0.75rem" }}>
                5 credits / chat
              </p>
              <p style={{ color: "var(--ink-3)", fontSize: "0.95rem", lineHeight: 1.55 }}>
                Built by verified practitioners with 5+ years in the field. Solid for everyday questions in legal, fitness, finance, and sales.
              </p>
            </div>
            <div
              style={{
                background: "var(--gold)",
                color: "var(--ink)",
                borderRadius: "var(--r-3)",
                padding: "2rem",
                position: "relative",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "var(--ink)",
                  marginBottom: "1rem",
                }}
              >
                ★ Premium
              </span>
              <p style={{ fontSize: "var(--t-3)", fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "0.75rem" }}>
                8–15 credits / chat
              </p>
              <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", lineHeight: 1.55 }}>
                Senior-practitioner builds. KCs, partner-level lawyers, board-certified physicians, senior CPAs. Carries an additional accuracy guarantee.
              </p>
            </div>
          </div>

          <style>{`
            @media (max-width: 760px) {
              .pricing-compare { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* FAQ */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">FAQ</span> Pricing FAQ</span>
          <Reveal>
            <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1.5rem" }}>
              Things <span className="it">people ask.</span>
            </h2>
          </Reveal>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`}>
                <button
                  className="faq-summary"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <h4>{item.q}</h4>
                  <span className="faq-toggle" aria-hidden />
                </button>
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: openFaq === i ? 400 : 0,
                    opacity: openFaq === i ? 1 : 0,
                    transition: "max-height 0.4s var(--ease), opacity 0.3s ease",
                  }}
                >
                  <div className="answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LayerFooter />
    </div>
  );
}

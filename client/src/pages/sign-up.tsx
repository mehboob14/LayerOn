import { SignUp } from "@clerk/clerk-react";
import { AuthShell } from "@/components/layer/AuthShell";
import { Check } from "lucide-react";

const STATS = [
  { num: "£1,840", label: "Avg / month · top tier" },
  { num: "~9 days", label: "Apply → live module" },
  { num: "70%", label: "Of every chat fee" },
];

const QUOTES = [
  {
    text: "I built a strength-coaching module in two weekends. It's done 600+ chats this month. That's more income than the gym pays me.",
    author: { name: "Marcus T.", role: "Strength Coach · 14 yr", initials: "MT" },
  },
  {
    text: "My playbook lives in my Substack. LayerOn just plugs into the feed and the module gets smarter every week. Zero extra work.",
    author: { name: "Rachel M.", role: "Commercial Law · 12 yr", initials: "RM" },
  },
  {
    text: "Six years of YouTube videos finally working for me 24/7. The module answers the questions I'd answer the same way — at 2am.",
    author: { name: "Dr. James L.", role: "Sports Medicine · 15 yr", initials: "DJ" },
  },
];

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#0E1628",
    colorText: "#0E1628",
    colorTextSecondary: "#4A5468",
    colorBackground: "#F4F1EA",
    colorInputBackground: "#F4F1EA",
    colorInputText: "#0E1628",
    colorDanger: "#FF7A5C",
    colorSuccess: "#7A9171",
    colorWarning: "#E0A23B",
    fontFamily: "Geist, sans-serif",
    fontFamilyButtons: "Geist, sans-serif",
    fontSize: "0.95rem",
    borderRadius: "8px",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: "layer-clerk-root",
    card: "layer-clerk-card",
    headerTitle: "layer-clerk-title",
    headerSubtitle: "layer-clerk-subtitle",
    formButtonPrimary: "layer-clerk-btn-primary",
    formFieldLabel: "layer-clerk-label",
    formFieldInput: "layer-clerk-input",
    socialButtonsBlockButton: "layer-clerk-social-btn",
    footer: "layer-clerk-footer",
    footerActionLink: "layer-clerk-footer-link",
    dividerLine: "layer-clerk-divider-line",
    dividerText: "layer-clerk-divider-text",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
};

const VALUE_BULLETS = [
  "Browse 350+ modules built by verified domain experts",
  "Or become a creator — keep 70% of every chat",
  "Live knowledge base that syncs from your Medium, YouTube, Substack, blog",
];

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Become a creator · or just chat"
      headline={
        <>
          Your craft, <span className="it">at work</span> while you sleep.
        </>
      }
      subhead="LayerOn turns your published work into a chat module that earns. Or skip the build and just talk to one — your call."
      quotes={QUOTES}
      stats={STATS}
      topRight={{ prompt: "Already a member?", ctaLabel: "Sign in", ctaHref: "/sign-in" }}
    >
      <div style={{ marginBottom: "1.75rem" }}>
        <span className="eyebrow"><span className="num">+</span> Create account</span>
        <h2
          style={{
            fontSize: "var(--t-3)",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: "0.6rem",
          }}
          data-testid="signup-heading"
        >
          Start in <span className="it">under a minute.</span>
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: "0.95rem", lineHeight: 1.55 }}>
          We'll ask three quick things after signup, then drop you into the marketplace or your studio — depending on what you came for.
        </p>
      </div>

      {/* Value bullets */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        {VALUE_BULLETS.map((b) => (
          <li
            key={b}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
              fontSize: "0.88rem",
              color: "var(--ink-2)",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: "var(--acid)",
                color: "var(--ink)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/onboarding"
        appearance={CLERK_APPEARANCE}
      />

      <p
        style={{
          marginTop: "1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        By signing up, you agree to our <a href="#" style={{ color: "var(--ink)", textDecoration: "underline" }}>Terms</a> and <a href="#" style={{ color: "var(--ink)", textDecoration: "underline" }}>Privacy Policy</a>.
      </p>
    </AuthShell>
  );
}

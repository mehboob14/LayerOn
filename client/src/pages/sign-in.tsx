import { SignIn } from "@clerk/clerk-react";
import { AuthShell } from "@/components/layer/AuthShell";

const STATS = [
  { num: "350+", label: "Modules" },
  { num: "120+", label: "Verified experts" },
  { num: "70%", label: "Goes to creators" },
];

const QUOTES = [
  {
    text: "Got specific lease advice in two minutes that would've cost me a £200 consultation. The module actually understood break clauses.",
    author: { name: "David K.", role: "Property Developer", initials: "DK" },
  },
  {
    text: "The tax module found deductions my accountant missed. Genuinely saved me £1,400 on my self-assessment.",
    author: { name: "Nina S.", role: "Freelance Designer", initials: "NS" },
  },
  {
    text: "Ran three commercial lease reviews through it in an afternoon. Each one would've been a £500 solicitor bill.",
    author: { name: "James P.", role: "Property Developer", initials: "JP" },
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

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      headline={
        <>
          Pick up where <span className="it">you left off.</span>
        </>
      }
      subhead="Your saved modules, recent chats, and credits are right where you left them. Built by experts who actually do the work — and who keep publishing."
      quotes={QUOTES}
      stats={STATS}
      topRight={{ prompt: "New here?", ctaLabel: "Create account", ctaHref: "/sign-up" }}
    >
      <div style={{ marginBottom: "1.75rem" }}>
        <span className="eyebrow"><span className="num">→</span> Sign in</span>
        <h2
          style={{
            fontSize: "var(--t-3)",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: "0.6rem",
          }}
          data-testid="signin-heading"
        >
          Layer <span className="it">on.</span>
        </h2>
        <p style={{ color: "var(--ink-3)", fontSize: "0.95rem", lineHeight: 1.55 }}>
          Sign in with your email or your favourite identity provider. We don't store passwords — Clerk handles that for us.
        </p>
      </div>

      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={CLERK_APPEARANCE}
      />

      <p
        style={{
          marginTop: "2rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
          textAlign: "center",
        }}
      >
        Trouble signing in? <a href="mailto:hello@layeron.com" style={{ color: "var(--coral)", fontWeight: 600 }}>hello@layeron.com</a>
      </p>
    </AuthShell>
  );
}

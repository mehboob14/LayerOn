import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { LayerLogo } from "@/components/layer/LayerLogo";
import { ArrowRight, Compass, BookOpen, Sparkles, Loader2 } from "lucide-react";

export default function SignOutPage() {
  const [, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && !signingOut) {
      setSigningOut(true);
      // Sign out then stay on this page (Clerk default redirects to "/")
      signOut({ redirectUrl: "/sign-out" }).catch(() => {
        // ignore — user can manually navigate
        setSigningOut(false);
      });
    }
  }, [isLoaded, isSignedIn, signOut, signingOut]);

  // While the sign-out call is in flight, show a tiny loader
  const showingGoodbye = isLoaded && !isSignedIn;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        color: "var(--bone)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Acid radial accent */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          right: "-160px",
          top: "-160px",
          width: 520,
          height: 520,
          background: "radial-gradient(circle, var(--acid) 0%, transparent 70%)",
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-100px",
          bottom: "-200px",
          width: 480,
          height: 480,
          background: "radial-gradient(circle, var(--coral) 0%, transparent 70%)",
          opacity: 0.1,
          pointerEvents: "none",
        }}
      />

      {/* Top bar */}
      <header
        style={{
          padding: "1.25rem 2rem",
          borderBottom: "1px solid rgba(244,241,234,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <a className="layer-logo" onClick={() => setLocation("/")} style={{ cursor: "pointer", color: "var(--bone)" }}>
          <LayerLogo variant="bone" />
        </a>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 720, width: "100%", textAlign: "center" }}>
          {!showingGoodbye ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--acid)" }} />
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(244,241,234,0.55)",
                }}
              >
                Signing you out…
              </p>
            </div>
          ) : (
            <>
              <span
                className="eyebrow"
                style={{ color: "rgba(244,241,234,0.55)", marginBottom: "1.5rem" }}
              >
                <span className="num" style={{ color: "var(--acid)" }}>★</span> Signed out
              </span>
              <h1
                style={{
                  fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)",
                  lineHeight: 0.96,
                  letterSpacing: "-0.045em",
                  fontWeight: 600,
                  color: "var(--bone)",
                  marginBottom: "1.25rem",
                }}
                data-testid="signout-heading"
              >
                See you <span className="it" style={{ color: "var(--acid)" }}>next time.</span>
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "1.4rem",
                  color: "rgba(244,241,234,0.78)",
                  lineHeight: 1.5,
                  maxWidth: "44ch",
                  margin: "0 auto 3rem",
                }}
              >
                Your modules will keep syncing. Your saved chats will keep waiting. Come back when you've got a real question.
              </p>

              {/* Quick actions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                  maxWidth: 640,
                  margin: "0 auto",
                }}
                className="signout-actions"
              >
                <ActionCard
                  icon={<ArrowRight className="w-5 h-5" />}
                  label="Sign in again"
                  onClick={() => setLocation("/sign-in")}
                  primary
                  testId="signout-signin"
                />
                <ActionCard
                  icon={<Compass className="w-5 h-5" />}
                  label="Browse modules"
                  onClick={() => setLocation("/explore")}
                  testId="signout-explore"
                />
                <ActionCard
                  icon={<BookOpen className="w-5 h-5" />}
                  label="Read field notes"
                  onClick={() => setLocation("/blog")}
                  testId="signout-blog"
                />
              </div>

              {/* Subtle teaser */}
              <div
                style={{
                  marginTop: "3.5rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 1rem",
                  background: "rgba(244,241,234,0.06)",
                  border: "1px solid rgba(244,241,234,0.12)",
                  borderRadius: 999,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(244,241,234,0.7)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--acid)" }} />
                350+ modules · 120+ verified experts
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "1.25rem 2rem",
          borderTop: "1px solid rgba(244,241,234,0.1)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "rgba(244,241,234,0.5)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span>© {new Date().getFullYear()} LayerOn Ltd.</span>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => setLocation("/about")}
            style={{ background: "transparent", border: 0, padding: 0, color: "inherit", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", cursor: "pointer" }}
          >
            About
          </button>
          <button
            onClick={() => setLocation("/pricing")}
            style={{ background: "transparent", border: 0, padding: 0, color: "inherit", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", cursor: "pointer" }}
          >
            Pricing
          </button>
          <a href="mailto:hello@layeron.com" style={{ color: "inherit" }}>hello@layeron.com</a>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .signout-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ActionCard({
  icon,
  label,
  onClick,
  primary,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  testId?: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.85rem",
        padding: "1.25rem 1.25rem",
        background: primary ? "var(--acid)" : "rgba(244,241,234,0.04)",
        color: primary ? "var(--ink)" : "var(--bone)",
        border: primary ? "1px solid var(--acid)" : "1px solid rgba(244,241,234,0.15)",
        borderRadius: "var(--r-3)",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "transform 0.2s var(--ease), border-color 0.2s var(--ease), background 0.2s var(--ease)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        if (!primary) {
          e.currentTarget.style.background = "rgba(244,241,234,0.08)";
          e.currentTarget.style.borderColor = "rgba(244,241,234,0.3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (!primary) {
          e.currentTarget.style.background = "rgba(244,241,234,0.04)";
          e.currentTarget.style.borderColor = "rgba(244,241,234,0.15)";
        }
      }}
    >
      <span style={{ color: primary ? "var(--ink)" : "var(--acid)" }}>{icon}</span>
      <span style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.005em" }}>{label}</span>
    </button>
  );
}

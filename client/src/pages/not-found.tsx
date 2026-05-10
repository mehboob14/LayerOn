import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { LayerLogo } from "@/components/layer/LayerLogo";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: "0 2rem" }}>
        <a className="layer-logo" onClick={() => setLocation("/")} style={{ cursor: "pointer", marginBottom: "2rem", display: "inline-flex" }}>
          <LayerLogo />
        </a>
        <p
          style={{
            fontSize: "clamp(5rem, 14vw, 9rem)",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            color: "var(--ink)",
            marginBottom: "0.5rem",
          }}
        >
          4<span className="it" style={{ color: "var(--coral)" }}>0</span>4
        </p>
        <p style={{ fontSize: "var(--t-3)", fontWeight: 600, marginBottom: "0.75rem", letterSpacing: "-0.025em" }}>
          Page <span className="it">not found.</span>
        </p>
        <p style={{ color: "var(--ink-3)", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.55 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className="btn btn-ink btn-lg" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4" /> Go home
        </button>
      </div>
    </div>
  );
}

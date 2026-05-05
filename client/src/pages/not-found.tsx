import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <div className="text-center">
        <p className="text-[80px] font-black leading-none mb-2" style={{ color: "rgba(37,99,235,0.15)" }}>404</p>
        <p className="text-[16px] font-bold" style={{ color: "#fafafa" }}>Page not found</p>
        <p className="text-[13px] mb-8" style={{ color: "#71717a" }}>The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => setLocation("/")} className="text-[13px] px-6 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }}>
          <ArrowLeft className="w-4 h-4" /> Go Home
        </button>
      </div>
    </div>
  );
}

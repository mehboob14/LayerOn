import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { ArrowLeft, CreditCard, Loader2, Zap, Check, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreditPackage {
  key: string;
  name: string;
  credits: number;
  price_cents: number;
  description: string;
  popular?: boolean;
}

export default function BillingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const pkgColors = ["var(--accent-blue)", "var(--accent-emerald)", "var(--accent-purple)"];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCredits();
        setCredits(data.credits || 0);
        if (data.packages) setPackages(data.packages);
      } catch (e) { console.error("Failed to load billing:", e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      toast({ title: "Payment successful!", description: "Credits have been added to your account." });
      api.getCredits().then(data => setCredits(data.credits || 0)).catch(() => {});
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("status") === "cancelled") {
      toast({ title: "Payment cancelled", description: "No charges were made." });
      window.history.replaceState({}, "", "/billing");
    }
  }, []);

  const handlePurchase = async (packageKey: string) => {
    setPurchasing(packageKey);
    try {
      const result = await api.createCheckout(packageKey);
      if (result.url) window.location.href = result.url;
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to start checkout", variant: "destructive" });
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ zIndex: 1 }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#52525b" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => setLocation("/dashboard")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bagel text-lg tracking-wider cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation("/")}>LAYERON</span>
          <span className="text-[13px] font-semibold" style={{ color: "#71717a" }}>/ Credits & Billing</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="p-8 rounded-2xl text-center relative overflow-hidden pulse-glow" style={{ backgroundColor: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.1)" }}>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-wider mb-3 font-semibold" style={{ color: "#71717a" }}>Current Balance</p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="w-7 h-7" style={{ color: "var(--accent-blue)" }} />
              <span className="text-5xl font-black" style={{ color: "#fafafa" }} data-testid="text-credits">{credits}</span>
            </div>
            <p className="text-[12px]" style={{ color: "#52525b" }}>credits available · {Math.floor(credits / 5)} messages remaining</p>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-emerald)" }} />
            <span className="text-xs font-semibold" style={{ color: "#71717a" }}>Packages</span>
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "#fafafa" }}>Buy Credits</h2>
          <p className="text-[13px] mb-8" style={{ color: "#71717a" }}>Each message costs 5 credits. Choose a package that fits your usage.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((pkg, i) => (
              <div key={pkg.key} className="p-6 rounded-2xl relative glass-card gentle-animation hover:elevated-shadow" style={{
                border: pkg.popular ? "1px solid rgba(37,99,235,0.2)" : undefined,
                backgroundColor: pkg.popular ? "rgba(37,99,235,0.03)" : undefined,
              }}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-wide" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }}>POPULAR</div>
                )}
                <div className="text-center mb-5">
                  <h3 className="text-[15px] font-bold mb-3" style={{ color: "#fafafa" }}>{pkg.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-black" style={{ color: "#fafafa" }}>${(pkg.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: "#52525b" }}>{pkg.credits} credits</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {[`${Math.floor(pkg.credits / 5)} messages`, `${(pkg.price_cents / pkg.credits).toFixed(1)}¢ per credit`, "Never expires"].map((text, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-[12px]" style={{ color: "#a1a1aa" }}>
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: pkgColors[i] || "var(--accent-blue)" }} />{text}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handlePurchase(pkg.key)} disabled={!!purchasing}
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 gentle-animation hover:scale-105 disabled:opacity-50"
                  style={{ backgroundColor: pkg.popular ? "var(--accent-blue)" : "rgba(255,255,255,0.04)", color: pkg.popular ? "#fff" : "#a1a1aa", border: pkg.popular ? "none" : "1px solid #27272a" }}
                  data-testid={`button-buy-${pkg.key}`}>
                  {purchasing === pkg.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Buy Now</>}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-4">
          <Lock className="w-3.5 h-3.5" style={{ color: "#3f3f46" }} />
          <p className="text-[11px]" style={{ color: "#52525b" }}>Payments processed securely by Stripe. Credits are instant and never expire.</p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CreditCard, Loader2, Zap, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";

interface CreditPackage {
  key: string;
  name: string;
  credits: number;
  price_cents: number;
  description: string;
  popular?: boolean;
}

export default function BillingPage() {
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCredits();
        setCredits(data.credits || 0);
        if (data.packages) setPackages(data.packages);
      } catch (e) {
        console.error("Failed to load billing:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      toast({ title: "Payment successful!", description: "Credits have been added to your account." });
      api.getCredits().then((data) => setCredits(data.credits || 0)).catch(() => {});
      window.history.replaceState({}, "", "/billing");
    } else if (params.get("status") === "cancelled") {
      toast({ title: "Payment cancelled", description: "No charges were made." });
      window.history.replaceState({}, "", "/billing");
    }
  }, [toast]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">05</span> Pricing</span>
          <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Pay <span className="it">per chat,</span> not per month.
          </h2>
          <p className="lead">
            Each message costs 5 credits. Credits never expire. The expert who built the module gets paid every time you use it.
          </p>

          <div
            style={{
              marginTop: "2.5rem",
              padding: "2.5rem 2rem",
              borderRadius: "var(--r-3)",
              background: "var(--ink)",
              color: "var(--bone)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: "0.7rem",
                  color: "var(--acid)",
                  marginBottom: "0.5rem",
                }}
              >
                Current balance
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                <Zap className="w-7 h-7" style={{ color: "var(--acid)" }} />
                <span style={{ fontSize: "3.5rem", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }} data-testid="text-credits">
                  {credits}
                </span>
                <span style={{ fontSize: "1rem", color: "rgba(244,241,234,0.6)" }}>credits</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "rgba(244,241,234,0.6)", marginTop: "0.4rem" }}>
                {Math.floor(credits / 5)} messages remaining
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="layer-section layer-divider" style={{ paddingTop: "0", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">06</span> Packages</span>
          <h2 style={{ fontSize: "var(--t-4)", marginBottom: "1rem" }}>
            Buy <span className="it">credits.</span>
          </h2>

          <div className="price-grid">
            {packages.map((pkg) => {
              const dollars = (pkg.price_cents / 100).toFixed(2);
              const [whole, fraction] = dollars.split(".");
              return (
                <div key={pkg.key} className={`price-card ${pkg.popular ? "featured" : ""}`}>
                  <div className="price-name">{pkg.name}</div>
                  <div className="price-amt">
                    ${whole}
                    <span>.{fraction}</span>
                  </div>
                  <div className="price-credits">
                    {pkg.credits} credits · {Math.floor(pkg.credits / 5)} chats
                  </div>
                  <ul className="price-features">
                    <li>{Math.floor(pkg.credits / 5)} messages</li>
                    <li>{(pkg.price_cents / pkg.credits).toFixed(1)}¢ per credit</li>
                    <li>Never expires</li>
                  </ul>
                  <button
                    className="price-cta"
                    onClick={() => handlePurchase(pkg.key)}
                    disabled={!!purchasing}
                    data-testid={`button-buy-${pkg.key}`}
                  >
                    {purchasing === pkg.key ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <CreditCard className="w-4 h-4" /> Buy now
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "1.5rem 0 0",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--ink-4)",
            }}
          >
            <Lock className="w-3 h-3" /> Payments processed securely by Stripe
          </div>
        </div>
      </section>

      <LayerFooter />
    </div>
  );
}

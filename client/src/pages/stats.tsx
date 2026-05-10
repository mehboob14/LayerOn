import { useState, useEffect } from "react";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Heart } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

export default function StatsPage() {
  const { toast } = useToast();
  const [, setModules] = useState<Module[]>([]);
  const [stats, setStats] = useState({ totalModules: 0, totalUses: 0, totalFavorites: 0, topModule: null as Module | null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const myModules = await api.getMyModules().catch(() => []);
        setModules(myModules || []);
        const totalUses = (myModules || []).reduce((sum, m) => sum + m.usageCount, 0);
        const totalFavorites = (myModules || []).reduce((sum, m) => sum + m.favoriteCount, 0);
        const topModule = (myModules || []).sort((a, b) => b.usageCount - a.usageCount)[0] || null;
        setStats({ totalModules: (myModules || []).length, totalUses, totalFavorites, topModule });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [toast]);

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">S</span> Statistics</span>
          <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Your modules, <span className="it">in numbers.</span>
          </h2>
          <p className="lead">Performance snapshot of every module you've published.</p>

          {loading ? (
            <p style={{ color: "var(--ink-4)", marginTop: "2rem" }}>Loading stats…</p>
          ) : (
            <>
              <div className="five-grid">
                {[
                  { n: "01", label: "Total Modules", value: stats.totalModules },
                  { n: "02", label: "Total Uses", value: stats.totalUses },
                  { n: "03", label: "Total Favorites", value: stats.totalFavorites },
                ].map((s) => (
                  <div key={s.label} className="five-row">
                    <div className="five-num">{s.n}</div>
                    <h4>{s.label}</h4>
                    <p style={{ fontSize: "2.5rem", fontWeight: 600, letterSpacing: "-0.04em", color: "var(--ink)", lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {stats.topModule && (
                <div
                  style={{
                    marginTop: "3rem",
                    padding: "2rem",
                    borderRadius: "var(--r-3)",
                    background: "var(--ink)",
                    color: "var(--bone)",
                  }}
                >
                  <span
                    className="eyebrow"
                    style={{ color: "rgba(244,241,234,0.55)", marginBottom: "1rem" }}
                  >
                    <span className="num" style={{ color: "var(--acid)" }}>★</span> Top performer
                  </span>
                  <h3 style={{ fontSize: "1.75rem", color: "var(--bone)", marginBottom: "1rem" }}>
                    {stats.topModule.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "2rem",
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontSize: "0.75rem",
                      color: "rgba(244,241,234,0.7)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp className="w-4 h-4" style={{ color: "var(--acid)" }} />
                      {stats.topModule.usageCount} uses
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Heart className="w-4 h-4" style={{ color: "var(--coral)" }} />
                      {stats.topModule.favoriteCount} favorites
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

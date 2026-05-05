import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, TrendingUp, Heart } from "lucide-react";

export default function StatsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
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
      } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    loadStats();
  }, [toast]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ position: "relative", zIndex: 1 }}>
      <p style={{ color: "#52525b" }}>Loading stats...</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ position: "relative", zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => setLocation("/dashboard")} className="flex items-center justify-center w-8 h-8 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-lg font-black" style={{ color: "#fafafa" }}>Statistics</span>
            <p className="text-xs" style={{ color: "#71717a" }}>Performance of your modules</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Modules", value: stats.totalModules, color: "var(--accent-blue)" },
            { label: "Total Uses", value: stats.totalUses, color: "var(--accent-emerald)" },
            { label: "Total Favorites", value: stats.totalFavorites, color: "var(--accent-purple)" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-6 glass-card">
              <p className="text-xs font-semibold mb-2" style={{ color: "#52525b" }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {stats.topModule && (
          <div className="rounded-2xl p-8 glass-card">
            <h2 className="text-lg font-black mb-4" style={{ color: "#fafafa" }}>Top Module</h2>
            <div className="p-5 rounded-xl" style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}>
              <h3 className="text-base font-bold mb-3" style={{ color: "#fafafa" }}>{stats.topModule.title}</h3>
              <div className="flex gap-6 text-sm">
                <span className="flex items-center gap-2" style={{ color: "var(--accent-emerald)" }}>
                  <TrendingUp className="w-4 h-4" />{stats.topModule.usageCount} uses
                </span>
                <span className="flex items-center gap-2" style={{ color: "#52525b" }}>
                  <Heart className="w-4 h-4" />{stats.topModule.favoriteCount} favorites
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

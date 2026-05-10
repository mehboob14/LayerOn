import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Heart, Loader2 } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";

const BANDS = ["band-acid", "band-coral", "band-sage", "band-plum", "band-gold"] as const;
const FILTERS = ["All", "Legal", "Fitness", "Finance", "Sales", "Premium ★"];

export default function ExplorePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState("All");

  const getBand = (i: number) => BANDS[i % BANDS.length];

  useEffect(() => {
    const loadModules = async () => {
      try {
        const [featured, all] = await Promise.all([
          api.getFeaturedModules().catch(() => []),
          api.getPublicModules(),
        ]);
        const combined = [...featured, ...all.filter((m) => !featured.find((f) => f.id === m.id))];
        setModules(combined);
        setFilteredModules(combined);
        try {
          const userFavs = await api.getFavorites();
          setFavorites(new Set(userFavs.map((f) => f.id)));
        } catch (e) {}
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, [toast]);

  useEffect(() => {
    let filtered = modules;
    if (search)
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase())
      );
    setFilteredModules(filtered);
  }, [search, modules]);

  const toggleFavorite = async (moduleId: string) => {
    try {
      if (favorites.has(moduleId)) {
        await api.removeFavorite(moduleId);
        favorites.delete(moduleId);
      } else {
        await api.addFavorite(moduleId);
        favorites.add(moduleId);
      }
      setFavorites(new Set(favorites));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">04</span> The marketplace</span>
          <h2 data-testid="text-explore-title" style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Built by people <span className="it">you'd hire.</span>
          </h2>
          <p className="lead">
            Browse {modules.length || 350}+ modules built by verified domain experts. Filter by category, tap any card to chat.
          </p>

          <div style={{ marginTop: "2rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ position: "relative", flex: "1 1 320px", maxWidth: 460 }}>
              <Search className="w-4 h-4" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
              <input
                placeholder="Search modules by name, domain, or creator…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem 0.7rem 2.5rem",
                  fontSize: "0.95rem",
                  fontFamily: "var(--font-sans)",
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-2)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`filter-chip ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="layer-section layer-divider" style={{ paddingTop: "2rem" }}>
        <div className="layer-container">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "6rem 0" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
            </div>
          ) : filteredModules.length > 0 ? (
            <div className="modules-grid">
              {filteredModules.map((module, i) => {
                const band = getBand(i);
                const initials = ((module as any).creator?.firstName?.[0] || module.title[0] || "L").toUpperCase() +
                  ((module as any).creator?.lastName?.[0] || module.title[1] || "O").toUpperCase();
                return (
                  <div
                    key={module.id}
                    className="module-card"
                    onClick={() => setLocation(`/modules/${module.id}`)}
                    data-testid={`card-module-${module.id}`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={`module-band ${band}`}>
                      <span className="band-pill">
                        {module.featured ? "★ Featured" : "★ Verified"} · {(module as any).category || "Expert"}
                      </span>
                      <span className="band-tier">{initials}</span>
                    </div>
                    <div className="module-body">
                      <div className="module-name">{module.title}</div>
                      <div className="module-by">
                        by {(module as any).creator?.firstName || "Expert Creator"}
                        {(module as any).provider && ` · ${(module as any).provider}`}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--ink-3)", marginBottom: "0.85rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {module.description}
                      </div>
                      <div className="module-stats" style={{ alignItems: "center" }}>
                        <div><b>{module.usageCount}</b>uses</div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: "0.6rem" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(module.id);
                            }}
                            data-testid={`button-favorite-${module.id}`}
                            style={{ background: "transparent", border: 0, padding: 4, cursor: "pointer" }}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={favorites.has(module.id) ? "var(--coral)" : "none"}
                              style={{ color: favorites.has(module.id) ? "var(--coral)" : "var(--ink-4)" }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: "var(--bone-light)", border: "1px solid var(--bone-edge)", borderRadius: "var(--r-3)", padding: "4rem", textAlign: "center" }}>
              <Search className="w-10 h-10" style={{ margin: "0 auto 1rem", color: "var(--ink-4)" }} />
              <p style={{ fontSize: "1rem", marginBottom: "0.5rem", fontWeight: 600 }}>No modules found</p>
              <p style={{ color: "var(--ink-3)", fontSize: "0.9rem" }}>Try adjusting your search or browse all modules.</p>
            </div>
          )}
        </div>
      </section>

      <LayerFooter />
    </div>
  );
}

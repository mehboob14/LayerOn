import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

export default function LibraryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<(Module & { creator: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const data = await api.getFavorites().catch(() => []);
        setFavorites(data || []);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [toast]);

  const handleRemoveFavorite = async (moduleId: string) => {
    try {
      await api.removeFavorite(moduleId);
      setFavorites(favorites.filter((m) => m.id !== moduleId));
      toast({ title: "Removed from library" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">L</span> My library</span>
          <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Modules <span className="it">you've saved.</span>
          </h2>
          <p className="lead">Quick access to the experts you keep coming back to.</p>

          <div style={{ marginTop: "2.5rem" }}>
            {loading ? (
              <p style={{ color: "var(--ink-4)" }}>Loading…</p>
            ) : favorites.length > 0 ? (
              <div
                style={{
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                  overflow: "hidden",
                }}
              >
                {favorites.map((module, i) => (
                  <div
                    key={module.id}
                    onClick={() => setLocation(`/modules/${module.id}`)}
                    style={{
                      padding: "1.25rem 1.5rem",
                      borderBottom: i < favorites.length - 1 ? "1px solid var(--bone-edge)" : "none",
                      cursor: "pointer",
                      transition: "background 0.2s var(--ease)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bone-deep)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.35rem" }}>{module.title}</h3>
                        <p
                          style={{
                            color: "var(--ink-3)",
                            fontSize: "0.88rem",
                            marginBottom: "0.6rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {module.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "var(--ink-4)",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <MessageSquare className="w-3 h-3" /> {module.usageCount} uses
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Heart className="w-3 h-3" /> {module.favoriteCount} favs
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(module.id);
                        }}
                        style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer", color: "var(--ink-4)", borderRadius: 6 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                }}
              >
                <Heart className="w-10 h-10" style={{ margin: "0 auto 1rem", color: "var(--ink-4)" }} />
                <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>No saved modules yet</p>
                <button className="btn btn-acid" onClick={() => setLocation("/explore")}>
                  Explore modules <span className="arrow">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

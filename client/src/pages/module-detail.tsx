import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Heart, Users, Zap, Loader2 } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

const BANDS = ["band-acid", "band-coral", "band-sage", "band-plum", "band-gold"] as const;

export default function ModuleDetailPage() {
  const [match, params] = useRoute("/modules/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!match || !params?.id) return;
    const loadModule = async () => {
      try {
        const data = await api.getModule(params.id);
        setModule(data);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadModule();
  }, [params?.id, toast, match]);

  const handleUse = async () => {
    setCreating(true);
    try {
      const conversation = await api.createConversation(module!.id, module!.title);
      setLocation(`/chat/${conversation.id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) await api.removeFavorite(module!.id);
      else await api.addFavorite(module!.id);
      setIsFavorited(!isFavorited);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading)
    return (
      <div style={{ background: "var(--bone)", minHeight: "100vh" }}>
        <LayerNav />
        <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
        </div>
      </div>
    );

  if (!module)
    return (
      <div style={{ background: "var(--bone)", minHeight: "100vh" }}>
        <LayerNav />
        <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Module not found</p>
            <button className="btn btn-ink" onClick={() => setLocation("/explore")}>
              Browse modules <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    );

  const initials = module.title.slice(0, 2).toUpperCase();
  const band = BANDS[Math.floor(module.title.length % BANDS.length)];

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <div className="layer-container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <button
          onClick={() => setLocation("/explore")}
          className="btn btn-ghost"
          data-testid="button-back"
          style={{ paddingLeft: 0 }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </button>
      </div>

      <section className="layer-section layer-divider" style={{ paddingTop: "1rem", paddingBottom: "4rem" }}>
        <div className="layer-container">
          <div
            style={{
              borderRadius: "var(--r-3)",
              overflow: "hidden",
              border: "1px solid var(--bone-edge)",
              marginBottom: "2.5rem",
            }}
          >
            <div className={`module-band ${band}`} style={{ height: 120, padding: "1.25rem 1.5rem" }}>
              <span className="band-pill">
                {module.featured ? "★ Featured" : "★ Verified"} ·{" "}
                {(module as any).category || "Expert module"}
              </span>
              <span className="band-tier" style={{ width: 48, height: 48, fontSize: "1rem" }}>
                {initials}
              </span>
            </div>
            <div style={{ background: "var(--bone-light)", padding: "2rem 1.75rem" }}>
              <h1 style={{ fontSize: "var(--t-4)", marginBottom: "0.75rem" }}>{module.title}</h1>
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--ink-4)",
                  marginBottom: "1rem",
                }}
              >
                {(module as any).creator?.firstName && (
                  <span>by {(module as any).creator.firstName}</span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Users className="w-3 h-3" /> {module.usageCount} uses
                </span>
                {(module as any).provider && (
                  <span>
                    {(module as any).provider} / {(module as any).model}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "var(--t-2)", color: "var(--ink-3)", lineHeight: 1.55, maxWidth: "60ch" }}>
                {module.description}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "2rem",
            }}
          >
            <div>
              {module.instructions && (
                <div
                  style={{
                    background: "var(--bone-light)",
                    border: "1px solid var(--bone-edge)",
                    borderRadius: "var(--r-3)",
                    padding: "2rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <span className="eyebrow"><span className="num">A</span> How it works</span>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--ink-3)",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {module.instructions}
                  </div>
                </div>
              )}
              {module?.conversationStarters && Array.isArray(module.conversationStarters) && module.conversationStarters.length > 0 && (
                <div
                  style={{
                    background: "var(--bone-light)",
                    border: "1px solid var(--bone-edge)",
                    borderRadius: "var(--r-3)",
                    padding: "2rem",
                  }}
                >
                  <span className="eyebrow"><span className="num">B</span> Suggested questions</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {module.conversationStarters.map((starter: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.55rem 0.9rem",
                          borderRadius: 999,
                          background: "var(--bone)",
                          border: "1px solid var(--bone-edge)",
                          color: "var(--ink-2)",
                          fontFamily: "var(--font-serif)",
                          fontStyle: "italic",
                        }}
                      >
                        {starter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside>
              <div
                style={{
                  background: "var(--ink)",
                  color: "var(--bone)",
                  borderRadius: "var(--r-3)",
                  padding: "1.5rem",
                  position: "sticky",
                  top: 80,
                }}
              >
                <button
                  className="btn btn-acid"
                  onClick={handleUse}
                  disabled={creating}
                  data-testid="button-use-module"
                  style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "0.95rem" }}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Starting…
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" /> Start conversation
                    </>
                  )}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  data-testid="button-favorite"
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "0.6rem",
                    background: "transparent",
                    color: isFavorited ? "var(--coral)" : "var(--bone)",
                    borderColor: "rgba(244,241,234,0.2)",
                  }}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? "Saved" : "Save to library"}
                </button>

                <div
                  style={{
                    marginTop: "1.25rem",
                    padding: "1rem",
                    borderRadius: "var(--r-2)",
                    background: "rgba(244,241,234,0.04)",
                    border: "1px solid rgba(244,241,234,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.78rem",
                    }}
                  >
                    <span style={{ color: "rgba(244,241,234,0.55)" }}>Cost per message</span>
                    <span
                      style={{
                        color: "var(--acid)",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Zap className="w-3 h-3" /> 5 credits
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .module-detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </div>
  );
}

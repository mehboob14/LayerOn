import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module, type Conversation, type User } from "@/lib/api";
import {
  MessageSquare,
  Clock,
  Trash2,
  ArrowRight,
  Loader2,
  Heart,
  Compass,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LayerNav } from "@/components/layer/LayerNav";

const BANDS = ["band-acid", "band-coral", "band-sage", "band-plum", "band-gold"] as const;

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [me, setMe] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favorites, setFavorites] = useState<(Module & { creator: any })[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [user, convs, favs, creditsData] = await Promise.all([
          api.getMe().catch(() => null),
          api.getConversations().catch(() => []),
          api.getFavorites().catch(() => []),
          api.getCredits().catch(() => ({ credits: 0 })),
        ]);
        setMe(user);
        setConversations(convs || []);
        setFavorites(favs || []);
        setCredits(creditsData?.credits || 0);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await api.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} data-testid="text-loading" />
      </div>
    );
  }

  const recentConvs = [...conversations]
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
    .slice(0, 5);

  const isCreator = me?.role === "creator";

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav
        primaryCta={{ label: "Browse modules", href: "/explore" }}
        links={[
          { label: "Explore", href: "/explore" },
          { label: "Library", href: "/library" },
          { label: "History", href: "/history" },
          { label: "Billing", href: "/billing" },
        ]}
      />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "2.5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">★</span> Welcome back</span>
          <h1 data-testid="text-dashboard-title" style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Your <span className="it">layer</span> on top.
          </h1>
          <p className="lead">Pick up a recent chat, browse new modules, or top up credits.</p>
        </div>
      </section>

      <section className="layer-section" style={{ paddingTop: 0, paddingBottom: "2rem" }}>
        <div className="layer-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1px",
              background: "var(--bone-edge)",
              border: "1px solid var(--bone-edge)",
              borderRadius: "var(--r-3)",
              overflow: "hidden",
            }}
          >
            <StatCard
              label="Conversations"
              value={conversations.length}
              icon={<MessageSquare className="w-4 h-4" />}
              onClick={() => setLocation("/history")}
            />
            <StatCard
              label="Saved modules"
              value={favorites.length}
              icon={<Heart className="w-4 h-4" />}
              onClick={() => setLocation("/library")}
            />
            <StatCard
              label="Credits"
              value={credits}
              icon={<CreditCard className="w-4 h-4" />}
              accent
              onClick={() => setLocation("/billing")}
            />
            {isCreator ? (
              <StatCard
                label="Studio"
                value="Open"
                icon={<Sparkles className="w-4 h-4" />}
                accentInk
                onClick={() => setLocation("/studio")}
              />
            ) : (
              <StatCard
                label="Become a creator"
                value="→"
                icon={<Sparkles className="w-4 h-4" />}
                accentInk
                onClick={() => setLocation("/profile")}
              />
            )}
          </div>
        </div>
      </section>

      <section className="layer-section layer-divider" style={{ paddingTop: "1.5rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }} className="dash-grid">
            {/* LEFT: recent chats */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <span className="eyebrow"><span className="num">R</span> Recent chats</span>
                {conversations.length > 5 && (
                  <button onClick={() => setLocation("/history")} className="btn btn-ghost" style={{ padding: 0, fontSize: "0.85rem" }}>
                    See all <ArrowRight className="w-3.5 h-3.5 arrow" />
                  </button>
                )}
              </div>
              {recentConvs.length === 0 ? (
                <EmptyCard
                  icon={<MessageSquare className="w-8 h-8" />}
                  title="No chats yet"
                  desc="Browse modules built by verified experts and start your first conversation."
                  cta={{ label: "Browse modules", onClick: () => setLocation("/explore") }}
                />
              ) : (
                <div
                  style={{
                    background: "var(--bone-light)",
                    border: "1px solid var(--bone-edge)",
                    borderRadius: "var(--r-3)",
                    overflow: "hidden",
                  }}
                >
                  {recentConvs.map((conv, idx) => (
                    <div
                      key={conv.id}
                      onClick={() => setLocation(`/chat/${conv.id}`)}
                      data-testid={`recent-conv-${conv.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.95rem 1.25rem",
                        borderBottom: idx < recentConvs.length - 1 ? "1px solid var(--bone-edge)" : "none",
                        cursor: "pointer",
                        transition: "background 0.15s var(--ease)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bone-deep)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                        <div className="band-tier" style={{ width: 28, height: 28, fontSize: "0.7rem", flexShrink: 0 }}>
                          {(conv.title || "??").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {conv.title || "Untitled chat"}
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.85rem",
                              marginTop: 2,
                              fontSize: "0.7rem",
                              fontFamily: "var(--font-mono)",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "var(--ink-4)",
                            }}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Clock className="w-3 h-3" /> {timeAgo(conv.updatedAt || conv.createdAt)}
                            </span>
                            <span>{(conv.messages || []).length} msgs</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          aria-label="Delete"
                          style={{ background: "transparent", border: 0, padding: 6, cursor: "pointer", color: "var(--ink-4)", borderRadius: 4 }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-4 h-4" style={{ color: "var(--ink-4)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: saved modules */}
            <aside>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <span className="eyebrow"><span className="num">L</span> Library</span>
                {favorites.length > 0 && (
                  <button onClick={() => setLocation("/library")} className="btn btn-ghost" style={{ padding: 0, fontSize: "0.85rem" }}>
                    All <ArrowRight className="w-3.5 h-3.5 arrow" />
                  </button>
                )}
              </div>
              {favorites.length === 0 ? (
                <div
                  style={{
                    background: "var(--bone-light)",
                    border: "1px dashed var(--bone-edge)",
                    borderRadius: "var(--r-3)",
                    padding: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  <Heart className="w-6 h-6" style={{ margin: "0 auto 0.6rem", color: "var(--ink-4)" }} />
                  <p style={{ fontSize: "0.9rem", color: "var(--ink-3)", marginBottom: "0.85rem" }}>
                    No saved modules yet.
                  </p>
                  <button className="btn btn-outline" onClick={() => setLocation("/explore")}>
                    <Compass className="w-3.5 h-3.5" /> Explore
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {favorites.slice(0, 4).map((m, i) => {
                    const band = BANDS[i % BANDS.length];
                    const initials = m.title.slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={m.id}
                        onClick={() => setLocation(`/modules/${m.id}`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.75rem",
                          background: "var(--bone-light)",
                          border: "1px solid var(--bone-edge)",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "border-color 0.15s var(--ease)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--bone-edge)")}
                      >
                        <div className={`module-band ${band}`} style={{ width: 36, height: 36, padding: 0, borderRadius: 6, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span className="band-tier" style={{ width: 26, height: 26, fontSize: "0.65rem" }}>
                            {initials}
                          </span>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {m.title}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.7rem",
                              fontFamily: "var(--font-mono)",
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "var(--ink-4)",
                              marginTop: 2,
                            }}
                          >
                            {m.usageCount} uses
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .dash-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  accentInk,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  accentInk?: boolean;
  onClick: () => void;
}) {
  const bg = accentInk ? "var(--ink)" : accent ? "var(--acid)" : "var(--bone-light)";
  const fg = accentInk ? "var(--bone)" : "var(--ink)";
  const labelColor = accentInk ? "var(--acid)" : accent ? "var(--ink-2)" : "var(--ink-4)";
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: bg,
        color: fg,
        padding: "1.5rem 1.25rem",
        border: 0,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "transform 0.15s var(--ease)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.6rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: labelColor,
          }}
        >
          {label}
        </span>
        <span style={{ color: labelColor }}>{icon}</span>
      </div>
      <p style={{ fontSize: "var(--t-3)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
    </button>
  );
}

function EmptyCard({
  icon,
  title,
  desc,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: { label: string; onClick: () => void };
}) {
  return (
    <div
      style={{
        background: "var(--bone-light)",
        border: "1px dashed var(--bone-edge)",
        borderRadius: "var(--r-3)",
        padding: "3rem 2rem",
        textAlign: "center",
      }}
    >
      <div style={{ display: "inline-flex", marginBottom: "1rem", color: "var(--ink-4)" }}>{icon}</div>
      <p style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.5rem" }}>{title}</p>
      <p style={{ fontSize: "0.92rem", color: "var(--ink-3)", marginBottom: "1.5rem", maxWidth: "44ch", margin: "0 auto 1.5rem" }}>
        {desc}
      </p>
      <button className="btn btn-acid" onClick={cta.onClick}>
        {cta.label} <span className="arrow">→</span>
      </button>
    </div>
  );
}

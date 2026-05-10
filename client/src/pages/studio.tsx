import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module, type CreatorKBSummary, type CreatorSource, type User } from "@/lib/api";
import { LayerNav } from "@/components/layer/LayerNav";
import { Reveal } from "@/components/layer/Reveal";
import {
  Plus,
  Library,
  Sparkles,
  Loader2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Youtube,
  PenSquare,
  BookOpen,
  Globe,
  RefreshCw,
  Eye,
  Pencil,
  ExternalLink,
} from "lucide-react";

const PLATFORM_ICON: Record<string, any> = {
  youtube: Youtube,
  medium: PenSquare,
  substack: BookOpen,
  rss: Globe,
};
const PLATFORM_LABEL: Record<string, string> = {
  youtube: "YouTube",
  medium: "Medium",
  substack: "Substack",
  rss: "RSS",
};

const BANDS = ["band-acid", "band-coral", "band-sage", "band-plum", "band-gold"] as const;

export default function StudioPage() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<User | null>(null);
  const [myModules, setMyModules] = useState<Module[]>([]);
  const [kb, setKb] = useState<CreatorKBSummary | null>(null);
  const [sources, setSources] = useState<CreatorSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [user, modules, kbSummary, srcs] = await Promise.all([
          api.getMe().catch(() => null),
          api.getMyModules().catch(() => []),
          api.getCreatorKBSummary().catch(() => null),
          api.getCreatorSources().catch(() => []),
        ]);
        setMe(user);
        setMyModules(modules || []);
        setKb(kbSummary);
        setSources(srcs || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // pretend-earnings: 70% of (uses × 5 credits × £0.10/credit) — purely illustrative until backend ships
  const totalUses = myModules.reduce((s, m) => s + (m.usageCount || 0), 0);
  const grossEarnings = totalUses * 5 * 0.1;
  const netEarnings = grossEarnings * 0.7;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
      </div>
    );
  }

  const isCreator = me?.role === "creator";

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav
        primaryCta={{ label: "New module", href: "/studio/modules/new" }}
        links={[
          { label: "My modules", href: "/studio" },
          { label: "Knowledge base", href: "/knowledge-base" },
          { label: "Stats", href: "/stats" },
          { label: "Public profile", href: me?.id ? `/creators/${me.id}` : "/profile" },
        ]}
      />

      {/* HEADER */}
      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "2.5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">★</span> Studio</span>
          <Reveal>
            <h1 style={{ fontSize: "var(--t-5)", letterSpacing: "-0.045em", marginBottom: "1rem" }}>
              Build, ship, <span className="it">get paid.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="lead">
              {isCreator
                ? "Your creator workspace. Build modules, manage your live knowledge base, and track earnings."
                : "Switch your profile to creator to start publishing modules and earning. We'll guide you through it."}
            </p>
          </Reveal>

          {!isCreator && (
            <div
              style={{
                marginTop: "2rem",
                background: "var(--acid)",
                color: "var(--ink)",
                padding: "1.25rem 1.5rem",
                borderRadius: "var(--r-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>You're not a creator yet.</p>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}>Switch your role in profile to unlock the studio.</p>
              </div>
              <button className="btn btn-ink" onClick={() => setLocation("/profile")}>
                Become a creator <span className="arrow">→</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
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
            <Stat label="My modules" value={myModules.length} accent="ink" />
            <Stat label="Total uses" value={totalUses.toLocaleString()} />
            <Stat label="KB chunks" value={kb?.chunkCount?.toLocaleString() ?? 0} />
            <Stat
              label="Earnings (est.)"
              value={`£${netEarnings.toFixed(2)}`}
              footnote="70% of fees · this month"
              accent="acid"
            />
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="layer-section layer-divider" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "2rem",
            }}
            className="studio-grid"
          >
            {/* LEFT — modules + recent activity */}
            <div>
              {/* My modules */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <span className="eyebrow"><span className="num">M</span> My modules</span>
                <button
                  className="btn btn-acid"
                  onClick={() => setLocation("/studio/modules/new")}
                  data-testid="button-new-module"
                >
                  <Plus className="w-4 h-4" /> New module
                </button>
              </div>

              {myModules.length === 0 ? (
                <EmptyModulesState onCreate={() => setLocation("/studio/modules/new")} />
              ) : (
                <div className="modules-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {myModules.map((m, i) => {
                    const band = BANDS[i % BANDS.length];
                    const initials = m.title.slice(0, 2).toUpperCase();
                    return (
                      <div key={m.id} className="module-card" style={{ cursor: "pointer" }} onClick={() => setLocation(`/modules/${m.id}`)}>
                        <div className={`module-band ${band}`}>
                          <span className="band-pill">{m.isPublic ? "★ Public" : "Private"}</span>
                          <span className="band-tier">{initials}</span>
                        </div>
                        <div className="module-body">
                          <div className="module-name">{m.title}</div>
                          <div className="module-by">
                            {m.provider || "openai"} / {m.model || "gpt-4o-mini"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--ink-3)",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              marginBottom: "0.85rem",
                            }}
                          >
                            {m.description}
                          </div>
                          <div className="module-stats" style={{ alignItems: "center" }}>
                            <div><b>{m.usageCount}</b>uses</div>
                            <div><b>{m.favoriteCount}</b>favs</div>
                            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/modules/${m.id}`);
                                }}
                                aria-label="View"
                                style={iconBtnStyle}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/create?id=${m.id}`);
                                }}
                                aria-label="Edit"
                                style={iconBtnStyle}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* "General" module callout */}
              <div
                style={{
                  marginTop: "2.5rem",
                  background: "var(--ink)",
                  color: "var(--bone)",
                  borderRadius: "var(--r-3)",
                  padding: "2rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "-80px",
                    top: "-80px",
                    width: 240,
                    height: 240,
                    background: "radial-gradient(circle, var(--acid) 0%, transparent 70%)",
                    opacity: 0.15,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "var(--acid)",
                      marginBottom: "1rem",
                    }}
                  >
                    ★ Your general module
                  </span>
                  <h3 style={{ fontSize: "var(--t-3)", color: "var(--bone)", marginBottom: "0.75rem", lineHeight: 1.2, letterSpacing: "-0.025em" }}>
                    Ask {me?.firstName || "me"} anything
                  </h3>
                  <p style={{ color: "rgba(244,241,234,0.75)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "55ch", marginBottom: "1.25rem" }}>
                    Every creator gets a default module that uses your full general knowledge base — your synced posts, videos, and writings. Visitors to your public profile can chat with this directly.
                  </p>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    {me?.id && (
                      <button
                        className="btn btn-acid"
                        onClick={() => setLocation(`/creators/${me.id}`)}
                      >
                        View public profile <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      className="btn btn-outline"
                      style={{ borderColor: "rgba(244,241,234,0.25)", color: "var(--bone)" }}
                      onClick={() => setLocation("/knowledge-base")}
                    >
                      Manage knowledge base
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — KB health + integrations */}
            <aside style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <KBHealthCard kb={kb} sources={sources} onManage={() => setLocation("/knowledge-base")} />
              <IntegrationsCard sources={sources} onManage={() => setLocation("/knowledge-base")} />
              <PayoutCard netEarnings={netEarnings} />
            </aside>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .studio-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  padding: 6,
  cursor: "pointer",
  color: "var(--ink-4)",
  borderRadius: 4,
};

function Stat({
  label,
  value,
  footnote,
  accent,
}: {
  label: string;
  value: string | number;
  footnote?: string;
  accent?: "ink" | "acid";
}) {
  const bg = accent === "ink" ? "var(--ink)" : accent === "acid" ? "var(--acid)" : "var(--bone-light)";
  const fg = accent === "ink" ? "var(--bone)" : "var(--ink)";
  const labelColor = accent === "ink" ? "var(--acid)" : accent === "acid" ? "var(--ink-2)" : "var(--ink-4)";
  return (
    <div style={{ background: bg, color: fg, padding: "1.5rem 1.25rem" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: labelColor,
          marginBottom: "0.6rem",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "var(--t-3)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
      {footnote && (
        <p style={{ fontSize: "0.7rem", marginTop: "0.4rem", color: accent === "ink" ? "rgba(244,241,234,0.6)" : "var(--ink-4)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {footnote}
        </p>
      )}
    </div>
  );
}

function EmptyModulesState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem 2rem",
        background: "var(--bone-light)",
        border: "1px dashed var(--bone-edge)",
        borderRadius: "var(--r-3)",
      }}
    >
      <Library className="w-10 h-10" style={{ margin: "0 auto 1rem", color: "var(--ink-4)" }} />
      <h3 style={{ fontSize: "var(--t-3)", marginBottom: "0.75rem" }}>
        Build your <span className="it">first module.</span>
      </h3>
      <p style={{ color: "var(--ink-3)", fontSize: "0.95rem", maxWidth: "44ch", margin: "0 auto 1.5rem" }}>
        Package your expertise — your playbook, your voice, your sources — into an AI module that works 24/7. We handle the model wiring; you bring the knowledge.
      </p>
      <button className="btn btn-acid btn-lg" onClick={onCreate}>
        Start building <span className="arrow">→</span>
      </button>
    </div>
  );
}

function KBHealthCard({
  kb,
  sources,
  onManage,
}: {
  kb: CreatorKBSummary | null;
  sources: CreatorSource[];
  onManage: () => void;
}) {
  const synced = kb?.byStatus.synced ?? 0;
  const working = (kb?.byStatus.syncing ?? 0) + (kb?.byStatus.pending ?? 0);
  const errors = kb?.byStatus.error ?? 0;
  const total = sources.length;
  const health: "ok" | "working" | "issue" = errors > 0 ? "issue" : working > 0 ? "working" : "ok";

  return (
    <div
      style={{
        background: "var(--bone-light)",
        border: "1px solid var(--bone-edge)",
        borderRadius: "var(--r-3)",
        padding: "1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <span className="eyebrow"><span className="num">KB</span> Knowledge base</span>
        <HealthDot kind={health} />
      </div>
      {total === 0 ? (
        <>
          <p style={{ fontSize: "0.95rem", color: "var(--ink-3)", lineHeight: 1.55, marginBottom: "1rem" }}>
            You haven't linked any sources yet. Connect your YouTube, Medium, or blog and the modules you build will inherit your live work.
          </p>
          <button className="btn btn-ink" onClick={onManage} style={{ width: "100%", justifyContent: "center" }}>
            Link a source <span className="arrow">→</span>
          </button>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <Pill label={`${synced} synced`} variant="ok" />
            {working > 0 && <Pill label={`${working} working`} variant="working" />}
            {errors > 0 && <Pill label={`${errors} errors`} variant="error" />}
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-3)", lineHeight: 1.5, marginBottom: "1rem" }}>
            {kb?.chunkCount?.toLocaleString() ?? 0} indexed chunks across {total} source{total !== 1 ? "s" : ""}.
          </p>
          <button className="btn btn-outline" onClick={onManage} style={{ width: "100%", justifyContent: "center" }}>
            Manage <span className="arrow">→</span>
          </button>
        </>
      )}
    </div>
  );
}

function HealthDot({ kind }: { kind: "ok" | "working" | "issue" }) {
  const color = kind === "ok" ? "var(--sage)" : kind === "working" ? "var(--gold)" : "var(--coral)";
  const Icon = kind === "ok" ? CheckCircle2 : kind === "working" ? RefreshCw : AlertCircle;
  return <Icon className={`w-4 h-4 ${kind === "working" ? "animate-spin" : ""}`} style={{ color }} />;
}

function Pill({ label, variant }: { label: string; variant: "ok" | "working" | "error" }) {
  const bg =
    variant === "ok"
      ? "var(--sage-soft)"
      : variant === "working"
      ? "rgba(224,162,59,0.18)"
      : "var(--coral-soft)";
  const color = variant === "ok" ? "var(--sage)" : variant === "working" ? "var(--gold)" : "var(--coral)";
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        padding: "0.3rem 0.6rem",
        borderRadius: 999,
        background: bg,
        color,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function IntegrationsCard({ sources, onManage }: { sources: CreatorSource[]; onManage: () => void }) {
  const platforms = ["youtube", "medium", "substack", "rss"] as const;
  const linked = new Set(sources.map((s) => s.platform));

  return (
    <div
      style={{
        background: "var(--bone-light)",
        border: "1px solid var(--bone-edge)",
        borderRadius: "var(--r-3)",
        padding: "1.5rem",
      }}
    >
      <span className="eyebrow" style={{ marginBottom: "1rem" }}><span className="num">I</span> Integrations</span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {platforms.map((p) => {
          const Icon = PLATFORM_ICON[p];
          const isLinked = linked.has(p);
          return (
            <div
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.6rem 0.75rem",
                background: isLinked ? "var(--bone)" : "transparent",
                border: "1px solid var(--bone-edge)",
                borderRadius: 8,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: "var(--ink-3)" }} />
              <span style={{ fontSize: "0.88rem", flex: 1 }}>{PLATFORM_LABEL[p]}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isLinked ? "var(--sage)" : "var(--ink-4)",
                }}
              >
                {isLinked ? "✓ Linked" : "—"}
              </span>
            </div>
          );
        })}
      </div>
      <button
        className="btn btn-ghost"
        onClick={onManage}
        style={{ marginTop: "0.85rem", padding: 0, fontSize: "0.85rem" }}
      >
        Manage all <ArrowRight className="w-3.5 h-3.5 arrow" />
      </button>
    </div>
  );
}

function PayoutCard({ netEarnings }: { netEarnings: number }) {
  return (
    <div
      style={{
        background: "var(--ink)",
        color: "var(--bone)",
        borderRadius: "var(--r-3)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        className="eyebrow"
        style={{ color: "rgba(244,241,234,0.55)", marginBottom: "1rem" }}
      >
        <span className="num" style={{ color: "var(--acid)" }}>£</span> Earnings
      </span>
      <p style={{ fontSize: "var(--t-3)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "0.5rem" }}>
        £{netEarnings.toFixed(2)}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "rgba(244,241,234,0.55)",
          marginBottom: "1.25rem",
        }}
      >
        Estimated · 70% of fees
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0.6rem 0.75rem",
          background: "rgba(244,241,234,0.06)",
          border: "1px solid rgba(244,241,234,0.12)",
          borderRadius: 6,
          fontSize: "0.78rem",
          color: "rgba(244,241,234,0.7)",
        }}
      >
        <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--acid)" }} />
        Withdrawals open monthly. Stripe Connect coming soon.
      </div>
    </div>
  );
}

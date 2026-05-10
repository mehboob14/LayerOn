import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { api, type User, type Module } from "@/lib/api";
import { Globe, Twitter, Linkedin, MessageSquare, Users, Star, Calendar, Loader2 } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

const BANDS = ["band-acid", "band-coral", "band-sage", "band-plum", "band-gold"] as const;

export default function CreatorProfilePage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/creators/:id");
  const [creator, setCreator] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    const load = async () => {
      try {
        const data = await api.getCreatorProfile(params.id);
        setCreator(data.user);
        setModules(data.modules);
      } catch (e: any) {
        setError(e.message || "Creator not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
      </div>
    );

  if (error || !creator)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>Creator not found</p>
          <button className="btn btn-ink" onClick={() => setLocation("/explore")}>
            Browse modules <span className="arrow">→</span>
          </button>
        </div>
      </div>
    );

  const totalUsage = modules.reduce((sum, m) => sum + (m.usageCount || 0), 0);
  const initials = [creator.firstName, creator.lastName].filter(Boolean).map((n) => n![0]).join("") || creator.email[0].toUpperCase();
  const displayName = [creator.firstName, creator.lastName].filter(Boolean).join(" ") || creator.email.split("@")[0];

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem" }}>
        <div className="layer-container" style={{ maxWidth: 1000 }}>
          <span className="eyebrow"><span className="num">★</span> Creator</span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginTop: "1.5rem", marginBottom: "3rem", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0 }}>
              {creator.profilePictureUrl ? (
                <img
                  src={creator.profilePictureUrl}
                  alt={displayName}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "var(--r-3)",
                    objectFit: "cover",
                    border: "1px solid var(--bone-edge)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "var(--r-3)",
                    background: "var(--ink)",
                    color: "var(--acid)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h1 style={{ fontSize: "var(--t-4)", marginBottom: "0.4rem" }} data-testid="text-creator-name">
                {displayName}
              </h1>
              {creator.headline && (
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "1.2rem",
                    color: "var(--ink-3)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {creator.headline}
                </p>
              )}
              {creator.bio && (
                <p style={{ fontSize: "1rem", color: "var(--ink-3)", lineHeight: 1.65, marginBottom: "1rem", maxWidth: "60ch" }}>
                  {creator.bio}
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: "1rem" }}>
                {creator.expertise?.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.3rem 0.7rem",
                      borderRadius: 999,
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      background: "var(--bone-light)",
                      color: "var(--ink-3)",
                      border: "1px solid var(--bone-edge)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--ink-4)",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MessageSquare className="w-3.5 h-3.5" /> {modules.length} module{modules.length !== 1 ? "s" : ""}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Users className="w-3.5 h-3.5" /> {totalUsage} uses
                </span>
                {creator.createdAt && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(creator.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                )}
              </div>

              {(creator.website || creator.twitter || creator.linkedin) && (
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  {creator.website && (
                    <a
                      href={creator.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid var(--bone-edge)",
                        color: "var(--ink-3)",
                        display: "inline-flex",
                      }}
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {creator.twitter && (
                    <a
                      href={`https://twitter.com/${creator.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid var(--bone-edge)",
                        color: "var(--ink-3)",
                        display: "inline-flex",
                      }}
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {creator.linkedin && (
                    <a
                      href={creator.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid var(--bone-edge)",
                        color: "var(--ink-3)",
                        display: "inline-flex",
                      }}
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "var(--t-3)", marginBottom: "1.5rem" }}>
              Modules by <span className="it">{creator.firstName || displayName}</span>
            </h2>
            {modules.length === 0 ? (
              <p style={{ color: "var(--ink-3)" }}>No public modules yet.</p>
            ) : (
              <div className="modules-grid">
                {modules.map((m, i) => {
                  const band = BANDS[i % BANDS.length];
                  const init = m.title.slice(0, 2).toUpperCase();
                  return (
                    <div
                      key={m.id}
                      className="module-card"
                      onClick={() => setLocation(`/modules/${m.id}`)}
                      data-testid={`module-card-${m.id}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={`module-band ${band}`}>
                        <span className="band-pill">★ Module</span>
                        <span className="band-tier">{init}</span>
                      </div>
                      <div className="module-body">
                        <div className="module-name">{m.title}</div>
                        <div className="module-by">{m.provider || "openai"} · {m.model || "gpt-4o-mini"}</div>
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
                        <div className="module-stats">
                          <div>
                            <Star className="w-3 h-3" style={{ display: "inline", marginRight: 4, color: "var(--gold)" }} />
                            <b>{m.usageCount || 0}</b>uses
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

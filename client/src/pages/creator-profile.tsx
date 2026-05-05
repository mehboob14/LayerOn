import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { api, type User, type Module } from "@/lib/api";
import { ArrowLeft, Globe, Twitter, Linkedin, MessageSquare, Users, Star, Calendar, Loader2 } from "lucide-react";

export default function CreatorProfilePage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/creators/:id");
  const [creator, setCreator] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const colors = ["var(--accent-blue)", "var(--accent-emerald)", "var(--accent-purple)", "var(--accent-amber)", "var(--accent-red)"];
  const getColor = (i: number) => colors[i % colors.length];

  useEffect(() => {
    if (!params?.id) return;
    const load = async () => {
      try { const data = await api.getCreatorProfile(params.id); setCreator(data.user); setModules(data.modules); }
      catch (e: any) { setError(e.message || "Creator not found"); }
      finally { setLoading(false); }
    };
    load();
  }, [params?.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ zIndex: 1 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-blue)" }} />
    </div>
  );

  if (error || !creator) return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ zIndex: 1 }}>
      <div className="text-center">
        <p className="text-xl font-black mb-2" style={{ color: "#fafafa" }}>Creator not found</p>
        <button onClick={() => setLocation("/explore")} className="text-sm font-semibold" style={{ color: "var(--accent-blue)" }}>Browse modules</button>
      </div>
    </div>
  );

  const totalUsage = modules.reduce((sum, m) => sum + (m.usageCount || 0), 0);
  const initials = [creator.firstName, creator.lastName].filter(Boolean).map(n => n![0]).join("") || creator.email[0].toUpperCase();
  const displayName = [creator.firstName, creator.lastName].filter(Boolean).join(" ") || creator.email.split("@")[0];

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-1.5 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold" style={{ color: "#fafafa" }}>{displayName}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="shrink-0">
            {creator.profilePictureUrl ? (
              <img src={creator.profilePictureUrl} alt={displayName} className="w-24 h-24 rounded-2xl object-cover" style={{ border: "1px solid #27272a" }} />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black" style={{ backgroundColor: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", color: "var(--accent-blue)" }}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black mb-1" style={{ color: "#fafafa" }} data-testid="text-creator-name">{displayName}</h1>
            {creator.headline && <p className="text-sm mb-3" style={{ color: "#a1a1aa" }}>{creator.headline}</p>}
            {creator.bio && <p className="text-sm leading-[1.8] mb-4" style={{ color: "#71717a" }}>{creator.bio}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {creator.expertise?.map((tag, i) => (
                <span key={i} className="text-[11px] px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "var(--accent-blue)", border: "1px solid rgba(37,99,235,0.15)" }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-5 text-xs" style={{ color: "#71717a" }}>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {modules.length} module{modules.length !== 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {totalUsage} uses</span>
              {creator.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(creator.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              )}
            </div>

            {(creator.website || creator.twitter || creator.linkedin) && (
              <div className="flex items-center gap-3 mt-4">
                {creator.website && (
                  <a href={creator.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }}>
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {creator.twitter && (
                  <a href={`https://twitter.com/${creator.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }}>
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {creator.linkedin && (
                  <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }}>
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black mb-6" style={{ color: "#fafafa" }}>Modules by {creator.firstName || displayName}</h2>
          {modules.length === 0 ? (
            <p className="text-sm" style={{ color: "#71717a" }}>No public modules yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((m, i) => (
                <button key={m.id} onClick={() => setLocation(`/modules/${m.id}`)} className="p-5 rounded-xl text-left glass-card gentle-animation hover:elevated-shadow" data-testid={`module-card-${m.id}`}>
                  <h3 className="text-sm font-bold mb-1" style={{ color: "#fafafa" }}>{m.title}</h3>
                  <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: "#71717a" }}>{m.description}</p>
                  <div className="flex items-center gap-4 text-[11px]" style={{ color: "#52525b" }}>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: getColor(i) }} /> {m.usageCount || 0} uses</span>
                    <span>{m.provider || "openai"} · {m.model || "gpt-4o-mini"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

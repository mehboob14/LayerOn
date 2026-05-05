import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Heart, ArrowLeft, Users, Star, Grid3X3, LayoutList, ArrowRight, Loader2, MessageSquare } from "lucide-react";

export default function ExplorePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const colors = ["var(--accent-blue)", "var(--accent-emerald)", "var(--accent-purple)", "var(--accent-amber)", "var(--accent-red)"];
  const getColor = (i: number) => colors[i % colors.length];

  useEffect(() => {
    const loadModules = async () => {
      try {
        const [featured, all] = await Promise.all([
          api.getFeaturedModules().catch(() => []),
          api.getPublicModules(),
        ]);
        const combined = [...featured, ...all.filter(m => !featured.find(f => f.id === m.id))];
        setModules(combined);
        setFilteredModules(combined);
        try { const userFavs = await api.getFavorites(); setFavorites(new Set(userFavs.map(f => f.id))); } catch (e) {}
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally { setLoading(false); }
    };
    loadModules();
  }, [toast]);

  useEffect(() => {
    let filtered = modules;
    if (search) filtered = filtered.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()));
    setFilteredModules(filtered);
  }, [search, modules]);

  const toggleFavorite = async (moduleId: string) => {
    try {
      if (favorites.has(moduleId)) { await api.removeFavorite(moduleId); favorites.delete(moduleId); }
      else { await api.addFavorite(moduleId); favorites.add(moduleId); }
      setFavorites(new Set(favorites));
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/dashboard")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bagel text-lg tracking-wider cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation("/")} data-testid="link-home">LAYERON</span>
          </div>
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#52525b" }} />
              <input placeholder="Search modules by name, domain, or creator..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl outline-none transition-all focus:ring-1 focus:ring-[var(--accent-blue)]"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid #27272a", color: "#fafafa" }} data-testid="input-search" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[{ m: "grid" as const, Icon: Grid3X3 }, { m: "list" as const, Icon: LayoutList }].map(({ m, Icon }) => (
              <button key={m} onClick={() => setViewMode(m)} className="p-2 rounded-lg gentle-animation"
                style={{ backgroundColor: viewMode === m ? "rgba(37,99,235,0.1)" : "transparent", color: viewMode === m ? "var(--accent-blue)" : "#52525b" }}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-emerald)" }} />
            <span className="text-xs font-semibold" style={{ color: "#71717a" }}>Marketplace</span>
          </div>
          <h2 className="text-3xl font-black mb-2" style={{ color: "#fafafa" }} data-testid="text-explore-title">Explore Modules</h2>
          <p className="text-sm" style={{ color: "#71717a" }}>Discover AI modules built by verified domain experts.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#52525b" }} /></div>
        ) : filteredModules.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModules.map((module, i) => (
                <div key={module.id} className="group p-6 rounded-2xl glass-card gentle-animation hover:elevated-shadow" data-testid={`card-module-${module.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${getColor(i)} 12%, transparent)`, color: getColor(i) }}>
                      {module.title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      {module.featured && (
                        <div className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(37,99,235,0.2)" }}>Featured</div>
                      )}
                      <button onClick={() => toggleFavorite(module.id)} className="p-1.5 rounded-lg gentle-animation hover:bg-white/5" data-testid={`button-favorite-${module.id}`}>
                        <Heart className="w-4 h-4" fill={favorites.has(module.id) ? "var(--accent-red)" : "none"} style={{ color: favorites.has(module.id) ? "var(--accent-red)" : "#3f3f46" }} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold mb-1 group-hover:text-[var(--accent-blue)] transition-colors cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation(`/modules/${module.id}`)}>{module.title}</h3>
                  <p className="text-[11px] mb-3" style={{ color: "#52525b" }}>
                    by {(module as any).creator?.firstName || "Expert Creator"}
                    {(module as any).provider && <span> · {(module as any).provider}/{(module as any).model}</span>}
                  </p>
                  <p className="text-[12px] leading-[1.6] mb-5 line-clamp-2" style={{ color: "#71717a" }}>{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] flex items-center gap-1" style={{ color: "#52525b" }}><Users className="w-3 h-3" />{module.usageCount}</span>
                    <button onClick={() => setLocation(`/modules/${module.id}`)} className="text-[12px] font-semibold px-4 py-1.5 rounded-lg gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid={`button-view-${module.id}`}>View</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden glass-card">
              {filteredModules.map((module, index) => (
                <div key={module.id} className="flex items-center gap-5 px-6 py-5 gentle-animation hover:bg-white/[0.02] cursor-pointer" style={{ borderBottom: index < filteredModules.length - 1 ? "1px solid #27272a" : "none" }} onClick={() => setLocation(`/modules/${module.id}`)} data-testid={`card-module-${module.id}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${getColor(index)} 12%, transparent)`, color: getColor(index) }}>
                    {module.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold" style={{ color: "#fafafa" }}>{module.title}</h3>
                    <p className="text-[12px] line-clamp-1" style={{ color: "#71717a" }}>{module.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[11px] flex items-center gap-1" style={{ color: "#52525b" }}><Users className="w-3 h-3" /> {module.usageCount}</span>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(module.id); }} className="p-1.5 rounded-lg gentle-animation hover:bg-white/5" data-testid={`button-favorite-${module.id}`}>
                      <Heart className="w-3.5 h-3.5" fill={favorites.has(module.id) ? "var(--accent-red)" : "none"} style={{ color: favorites.has(module.id) ? "var(--accent-red)" : "#3f3f46" }} />
                    </button>
                    <ArrowRight className="w-4 h-4" style={{ color: "#3f3f46" }} />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl p-16 text-center glass-card">
            <Search className="w-10 h-10 mx-auto mb-4" style={{ color: "#27272a" }} />
            <p className="text-[14px] mb-2 font-bold" style={{ color: "#fafafa" }}>No modules found</p>
            <p className="text-[13px]" style={{ color: "#71717a" }}>Try adjusting your search or browse all modules.</p>
          </div>
        )}
      </div>
    </div>
  );
}

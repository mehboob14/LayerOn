import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, MessageSquare, Trash2 } from "lucide-react";

export default function LibraryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<(Module & { creator: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try { const data = await api.getFavorites().catch(() => []); setFavorites(data || []); }
      catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    loadFavorites();
  }, [toast]);

  const handleRemoveFavorite = async (moduleId: string) => {
    try { await api.removeFavorite(moduleId); setFavorites(favorites.filter(m => m.id !== moduleId)); toast({ title: "Removed from library" }); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ position: "relative", zIndex: 1 }}>
      <p style={{ color: "#52525b" }}>Loading...</p>
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
            <span className="text-lg font-black" style={{ color: "#fafafa" }}>My Library</span>
            <p className="text-xs" style={{ color: "#71717a" }}>Modules you've saved</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {favorites.length > 0 ? (
          <div className="rounded-2xl overflow-hidden glass-card">
            {favorites.map((module, i) => (
              <div key={module.id} className="px-6 py-5 cursor-pointer gentle-animation hover:bg-white/[0.02]" style={{ borderBottom: i < favorites.length - 1 ? "1px solid #27272a" : "none" }} onClick={() => setLocation(`/modules/${module.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold mb-1" style={{ color: "#fafafa" }}>{module.title}</h3>
                    <p className="text-sm mb-2 truncate" style={{ color: "#71717a" }}>{module.description}</p>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "#52525b" }}>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{module.usageCount} uses</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{module.favoriteCount} favorites</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(module.id); }} className="ml-4 p-2 rounded-lg gentle-animation hover:bg-red-500/10" style={{ color: "#52525b" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl glass-card">
            <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: "#27272a" }} />
            <p className="text-sm mb-5 font-bold" style={{ color: "#fafafa" }}>No saved modules yet</p>
            <button onClick={() => setLocation("/explore")} className="py-2.5 px-5 rounded-lg text-sm font-semibold gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }}>Explore Modules</button>
          </div>
        )}
      </div>
    </div>
  );
}

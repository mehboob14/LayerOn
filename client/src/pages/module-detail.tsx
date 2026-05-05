import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Heart, Star, Users, Zap, FileText, Loader2 } from "lucide-react";

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
      try { const data = await api.getModule(params.id); setModule(data); }
      catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    loadModule();
  }, [params?.id, toast, match]);

  const handleUse = async () => {
    setCreating(true);
    try { const conversation = await api.createConversation(module!.id, module!.title); setLocation(`/chat/${conversation.id}`); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setCreating(false); }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) await api.removeFavorite(module!.id);
      else await api.addFavorite(module!.id);
      setIsFavorited(!isFavorited);
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#52525b" }} />
    </div>
  );

  if (!module) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <div className="text-center">
        <p className="text-[14px] font-bold mb-4" style={{ color: "#fafafa" }}>Module not found</p>
        <button onClick={() => setLocation("/explore")} className="text-[13px] px-5 py-2.5 rounded-xl font-semibold" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }}>Browse Modules</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center gap-4">
          <button onClick={() => setLocation("/explore")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bagel text-lg tracking-wider cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation("/")}>LAYERON</span>
          <span className="text-[13px] font-semibold" style={{ color: "#71717a" }}>/ Module Details</span>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-6 py-10">
        <div className="mb-10">
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[14px] font-bold shrink-0" style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "var(--accent-blue)" }}>
              {module.title.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: "#fafafa" }}>{module.title}</h1>
              <div className="flex items-center gap-4 text-[12px]" style={{ color: "#71717a" }}>
                {(module as any).creator?.firstName && <span>by {(module as any).creator.firstName}</span>}
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {module.usageCount} uses</span>
                {module.featured && <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "var(--accent-blue)", border: "1px solid rgba(37,99,235,0.15)" }}>Featured</span>}
              </div>
            </div>
          </div>
          <p className="text-[14px] leading-[1.8]" style={{ color: "#a1a1aa" }}>{module.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {module.instructions && (
              <div className="p-8 rounded-2xl glass-card">
                <h2 className="text-lg font-black mb-4" style={{ color: "#fafafa" }}>How It Works</h2>
                <div className="text-[13px] leading-[1.8] whitespace-pre-wrap" style={{ color: "#71717a" }}>{module.instructions}</div>
              </div>
            )}
            {module?.conversationStarters && Array.isArray(module.conversationStarters) && module.conversationStarters.length > 0 && (
              <div className="p-8 rounded-2xl glass-card">
                <h2 className="text-lg font-black mb-4" style={{ color: "#fafafa" }}>Suggested Questions</h2>
                <div className="flex flex-wrap gap-2">
                  {module.conversationStarters.map((starter: string, idx: number) => (
                    <span key={idx} className="text-[12px] px-4 py-2 rounded-xl glass-card" style={{ color: "#a1a1aa" }}>{starter}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="p-6 rounded-2xl sticky top-20 space-y-3 glass-card">
              <button onClick={handleUse} disabled={creating} className="w-full py-3 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 gentle-animation hover:scale-105 disabled:opacity-50" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-use-module">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                {creating ? "Starting..." : "Start Conversation"}
              </button>
              <button onClick={handleToggleFavorite} className="w-full py-3 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 glass-card gentle-animation" style={{ color: isFavorited ? "var(--accent-red)" : "#a1a1aa" }} data-testid="button-favorite">
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Saved" : "Save to Library"}
              </button>
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #27272a" }}>
                <div className="flex items-center justify-between text-[12px]">
                  <span style={{ color: "#52525b" }}>Cost per message</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--accent-blue)" }}><Zap className="w-3 h-3" /> 5 credits</span>
                </div>
              </div>
              {(module as any)?.provider && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid #27272a" }}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span style={{ color: "#52525b" }}>AI Model</span>
                    <span className="font-semibold" style={{ color: "#a1a1aa" }}>{(module as any).provider}/{(module as any).model}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

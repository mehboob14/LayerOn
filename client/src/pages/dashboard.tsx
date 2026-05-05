import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Module, type Conversation } from "@/lib/api";
import { Plus, Home, MessageSquare, Clock, Trash2, ArrowRight, Loader2, Layers, CreditCard, BarChart3, Settings, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserButton } from "@clerk/clerk-react";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myModules, setMyModules] = useState<Module[]>([]);
  const [stats, setStats] = useState({ modules: 0, conversations: 0, credits: 100, notifications: 0 });
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"modules" | "conversations" | "my-modules">("modules");

  const colors = ["var(--accent-blue)", "var(--accent-emerald)", "var(--accent-purple)", "var(--accent-amber)", "var(--accent-red)"];
  const getColor = (i: number) => colors[i % colors.length];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [publicModules, userConversations, creatorModules] = await Promise.all([
          api.getPublicModules().catch(() => []),
          api.getConversations().catch(() => []),
          api.getMyModules().catch(() => []),
        ]);
        setModules(publicModules || []);
        setConversations(userConversations || []);
        setMyModules(creatorModules || []);
        setStats({ modules: (publicModules || []).length, conversations: (userConversations || []).length, credits: 100, notifications: 0 });
      } catch (error) { console.error("Failed to load dashboard data:", error); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const handleStartConversation = async (moduleId: string, moduleTitle: string) => {
    setStartingChat(moduleId);
    try {
      const conversation = await api.createConversation(moduleId, moduleTitle);
      setLocation(`/chat/${conversation.id}`);
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setStartingChat(null); }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await api.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      setStats(prev => ({ ...prev, conversations: prev.conversations - 1 }));
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#52525b" }} data-testid="text-loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bagel text-lg tracking-wider cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation("/")} data-testid="link-home">LAYERON</span>
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => setLocation("/")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-home"><Home className="w-[18px] h-[18px]" /></button>
              <button onClick={() => setLocation("/explore")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }}><Search className="w-[18px] h-[18px]" /></button>
              <button onClick={() => setLocation("/create")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-create"><Plus className="w-[18px] h-[18px]" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/billing")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] gentle-animation hover:bg-white/5" style={{ border: "1px solid #27272a", color: "#a1a1aa" }} data-testid="stat-credits">
              <CreditCard className="w-3.5 h-3.5" style={{ color: "var(--accent-blue)" }} />
              {stats.credits} credits
            </button>
            <button onClick={() => setLocation("/profile")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-profile"><Settings className="w-[18px] h-[18px]" /></button>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-emerald)" }} />
            <span className="text-xs font-semibold" style={{ color: "#71717a" }}>Your workspace</span>
          </div>
          <h2 className="text-3xl font-black mb-2" style={{ color: "#fafafa" }} data-testid="text-dashboard-title">Dashboard</h2>
          <p className="text-sm" style={{ color: "#71717a" }}>Manage your modules, conversations, and credits.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Available Modules", value: stats.modules, id: "stat-modules", color: "var(--accent-blue)" },
            { label: "Conversations", value: stats.conversations, id: "stat-conversations", color: "var(--accent-emerald)" },
            { label: "My Modules", value: myModules.length, id: "stat-my-modules", color: "var(--accent-purple)" },
            { label: "Credits", value: stats.credits, id: "stat-credits-card", color: "var(--accent-amber)", accent: true },
          ].map((s) => (
            <div key={s.id} className="p-5 rounded-2xl glass-card gentle-animation" data-testid={s.id}>
              <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "#52525b" }}>{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.accent ? s.color : "#fafafa" }}>{s.value}</p>
              {s.accent && <button onClick={() => setLocation("/billing")} className="text-[11px] mt-1 font-semibold" style={{ color: "var(--accent-blue)" }}>Buy more →</button>}
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-8" style={{ borderBottom: "1px solid #27272a" }}>
          {[
            { id: "modules" as const, label: "Browse Modules", icon: Layers },
            { id: "conversations" as const, label: "Conversations", icon: MessageSquare },
            { id: "my-modules" as const, label: "My Modules", icon: Plus },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)} className="flex items-center gap-2 px-5 py-3 text-[13px] font-medium gentle-animation relative" style={{ color: activeView === tab.id ? "#fafafa" : "#52525b", borderBottom: activeView === tab.id ? "2px solid var(--accent-blue)" : "2px solid transparent", marginBottom: "-1px" }} data-testid={`tab-${tab.id}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === "modules" && (
          modules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((module, i) => (
                <div key={module.id} className="group p-6 rounded-2xl glass-card gentle-animation hover:elevated-shadow" data-testid={`card-module-${module.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${getColor(i)} 12%, transparent)`, color: getColor(i) }}>
                      {module.title.slice(0, 2).toUpperCase()}
                    </div>
                    {(module as any).provider && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: "#52525b", border: "1px solid #27272a" }}>
                        {(module as any).provider}/{(module as any).model}
                      </span>
                    )}
                  </div>
                  <h4 className="text-[15px] font-bold mb-1.5 group-hover:text-[var(--accent-blue)] transition-colors" style={{ color: "#fafafa" }}>{module.title}</h4>
                  <p className="text-[12px] mb-5 line-clamp-2 leading-[1.6]" style={{ color: "#71717a" }}>{module.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "#52525b" }}>{module.usageCount} uses</span>
                    <button onClick={() => handleStartConversation(module.id, module.title)} disabled={startingChat === module.id} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold gentle-animation hover:scale-105 disabled:opacity-50" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid={`button-start-chat-${module.id}`}>
                      {startingChat === module.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl glass-card">
              <Layers className="w-10 h-10 mx-auto mb-4" style={{ color: "#27272a" }} />
              <p className="text-[14px] font-bold mb-2" style={{ color: "#fafafa" }}>No modules available yet</p>
              <p className="text-[13px] mb-6" style={{ color: "#71717a" }}>Be the first to create one.</p>
              <button onClick={() => setLocation("/create")} className="text-[13px] px-5 py-2.5 rounded-lg font-semibold" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-create-first">Create Module</button>
            </div>
          )
        )}

        {activeView === "conversations" && (
          conversations.length > 0 ? (
            <div className="rounded-2xl overflow-hidden glass-card">
              {conversations.map((conv, idx) => (
                <div key={conv.id} className="flex items-center justify-between px-6 py-4 cursor-pointer gentle-animation hover:bg-white/[0.02] group" style={{ borderBottom: idx < conversations.length - 1 ? "1px solid #27272a" : "none" }} onClick={() => setLocation(`/chat/${conv.id}`)} data-testid={`card-conversation-${conv.id}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "var(--accent-blue)" }}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold" style={{ color: "#fafafa" }}>{conv.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] mt-0.5" style={{ color: "#52525b" }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(conv.updatedAt || conv.createdAt)}</span>
                        <span>{(conv.messages || []).length} messages</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" style={{ color: "#3f3f46" }} />
                    <button onClick={(e) => handleDeleteConversation(conv.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10" style={{ color: "#52525b" }} data-testid={`delete-conv-${conv.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-2xl glass-card">
              <MessageSquare className="w-10 h-10 mx-auto mb-4" style={{ color: "#27272a" }} />
              <p className="text-[14px] font-bold mb-2" style={{ color: "#fafafa" }}>No conversations yet</p>
              <p className="text-[13px] mb-6" style={{ color: "#71717a" }}>Start chatting with a module to see conversations here.</p>
              <button onClick={() => setActiveView("modules")} className="text-[13px] px-5 py-2.5 rounded-lg font-semibold" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-browse-modules">Browse Modules</button>
            </div>
          )
        )}

        {activeView === "my-modules" && (
          <div>
            <div className="flex justify-end mb-6">
              <button onClick={() => setLocation("/create")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-create-new">
                <Plus className="w-4 h-4" /> Create Module
              </button>
            </div>
            {myModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myModules.map((module, i) => (
                  <div key={module.id} className="group p-6 rounded-2xl glass-card gentle-animation hover:elevated-shadow" data-testid={`card-my-module-${module.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-[15px] font-bold" style={{ color: "#fafafa" }}>{module.title}</h4>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium" style={{ color: module.isPublic ? "var(--accent-emerald)" : "#52525b", border: `1px solid ${module.isPublic ? "rgba(5,150,105,0.2)" : "#27272a"}` }}>
                        {module.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                    <p className="text-[12px] mb-4 leading-[1.6]" style={{ color: "#71717a" }}>{module.description}</p>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: "#52525b" }}>
                      <span>{module.usageCount} uses</span>
                      {(module as any).provider && <span>{(module as any).provider}/{(module as any).model}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl glass-card">
                <Plus className="w-10 h-10 mx-auto mb-4" style={{ color: "#27272a" }} />
                <p className="text-[14px] font-bold mb-2" style={{ color: "#fafafa" }}>No modules created yet</p>
                <p className="text-[13px]" style={{ color: "#71717a" }}>Package your expertise into an AI module.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Conversation, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare, Trash2, Calendar } from "lucide-react";

export default function HistoryPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [modules, setModules] = useState<Record<string, Module>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const convs = await api.getConversations().catch(() => []);
        setConversations((convs || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        const modulesMap: Record<string, Module> = {};
        for (const conv of convs || []) {
          if (!modulesMap[conv.moduleId]) {
            try { modulesMap[conv.moduleId] = await api.getModule(conv.moduleId); } catch (e) { console.error(e); }
          }
        }
        setModules(modulesMap);
      } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    loadHistory();
  }, [toast]);

  const handleDelete = async (conversationId: string) => {
    if (!window.confirm("Delete this conversation?")) return;
    try { await api.deleteConversation(conversationId); setConversations(conversations.filter(c => c.id !== conversationId)); toast({ title: "Conversation deleted" }); }
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
            <span className="text-lg font-black" style={{ color: "#fafafa" }}>Conversation History</span>
            <p className="text-xs" style={{ color: "#71717a" }}>Your past interactions</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {conversations.length > 0 ? (
          <div className="rounded-2xl overflow-hidden glass-card">
            {conversations.map((conv, i) => {
              const module = modules[conv.moduleId];
              return (
                <div key={conv.id} className="px-6 py-4 cursor-pointer gentle-animation hover:bg-white/[0.02]" style={{ borderBottom: i < conversations.length - 1 ? "1px solid #27272a" : "none" }} onClick={() => setLocation(`/chat/${conv.id}`)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold mb-1" style={{ color: "#fafafa" }}>{module?.title || "Module"}</h3>
                      <div className="flex items-center gap-4 text-xs" style={{ color: "#52525b" }}>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{conv.messages.length} messages</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(conv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }} className="ml-4 p-2 rounded-lg gentle-animation hover:bg-red-500/10" style={{ color: "#52525b" }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl glass-card">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "#27272a" }} />
            <p className="text-sm mb-5 font-bold" style={{ color: "#fafafa" }}>No conversation history yet</p>
            <button onClick={() => setLocation("/explore")} className="py-2.5 px-5 rounded-lg text-sm font-semibold gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }}>Explore Modules</button>
          </div>
        )}
      </div>
    </div>
  );
}

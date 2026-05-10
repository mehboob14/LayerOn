import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { api, type Conversation, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Trash2, Calendar } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

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
        setConversations(
          (convs || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        const modulesMap: Record<string, Module> = {};
        for (const conv of convs || []) {
          if (!modulesMap[conv.moduleId]) {
            try {
              modulesMap[conv.moduleId] = await api.getModule(conv.moduleId);
            } catch (e) {
              console.error(e);
            }
          }
        }
        setModules(modulesMap);
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [toast]);

  const handleDelete = async (conversationId: string) => {
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await api.deleteConversation(conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));
      toast({ title: "Conversation deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">H</span> History</span>
          <h2 style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
            Your past <span className="it">conversations.</span>
          </h2>
          <p className="lead">Pick up where you left off.</p>

          <div style={{ marginTop: "2.5rem" }}>
            {loading ? (
              <p style={{ color: "var(--ink-4)" }}>Loading…</p>
            ) : conversations.length > 0 ? (
              <div
                style={{
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                  overflow: "hidden",
                }}
              >
                {conversations.map((conv, i) => {
                  const module = modules[conv.moduleId];
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setLocation(`/chat/${conv.id}`)}
                      style={{
                        padding: "1.1rem 1.5rem",
                        borderBottom: i < conversations.length - 1 ? "1px solid var(--bone-edge)" : "none",
                        cursor: "pointer",
                        transition: "background 0.2s var(--ease)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bone-deep)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 4 }}>{module?.title || "Module"}</h3>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono)",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            color: "var(--ink-4)",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <MessageSquare className="w-3 h-3" /> {conv.messages.length} msgs
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Calendar className="w-3 h-3" /> {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conv.id);
                        }}
                        style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer", color: "var(--ink-4)", borderRadius: 6 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "5rem 2rem",
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                }}
              >
                <MessageSquare className="w-10 h-10" style={{ margin: "0 auto 1rem", color: "var(--ink-4)" }} />
                <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>No conversation history yet</p>
                <button className="btn btn-acid" onClick={() => setLocation("/explore")}>
                  Explore modules <span className="arrow">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

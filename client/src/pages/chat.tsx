import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { api, type Conversation, type Module, type ChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Trash2, Zap, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [match, params] = useRoute("/chat/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [module, setModule] = useState<(Module & { creator?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!match || !params?.id) return;
    const loadConversation = async () => {
      try {
        const conv = await api.getConversation(params.id);
        setConversation(conv);
        try {
          const mod = await api.getModule(conv.moduleId);
          setModule(mod);
        } catch {
          setModule({ id: conv.moduleId, title: "Module", description: "", instructions: "", isPublic: true, featured: false, usageCount: 0, favoriteCount: 0, creatorId: "", createdAt: "", updatedAt: "" });
        }
      } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
      finally { setLoading(false); }
    };
    loadConversation();
  }, [params?.id, toast, match]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversation) return;
    const currentMessage = messageText;
    setMessageText("");
    setSending(true);
    const optimisticMessages: ChatMessage[] = [...(conversation.messages || []), { role: "user" as const, content: currentMessage }];
    setConversation({ ...conversation, messages: optimisticMessages });
    try {
      const response = await api.sendMessage(conversation.id, currentMessage);
      if (response.conversation) setConversation(response.conversation);
      else { const updatedConv = await api.getConversation(conversation.id); setConversation(updatedConv); }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setConversation({ ...conversation, messages: conversation.messages });
      setMessageText(currentMessage);
    } finally { setSending(false); }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this conversation?")) {
      try { await api.deleteConversation(conversation!.id); setLocation("/dashboard"); }
      catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#52525b" }} data-testid="text-loading" />
    </div>
  );

  if (!conversation) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <div className="text-center">
        <p className="text-[14px] mb-4 font-bold" style={{ color: "#fafafa" }} data-testid="text-not-found">Conversation not found</p>
        <button onClick={() => setLocation("/dashboard")} className="px-5 py-2.5 text-[13px] font-semibold rounded-xl gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }}>Back to Dashboard</button>
      </div>
    </div>
  );

  const messages = conversation.messages || [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="p-2 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[14px] font-bold" style={{ color: "#fafafa" }} data-testid="text-module-title">{module?.title || "Chat"}</h1>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "#52525b" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-emerald)" }} />
                <span>{messages.length} messages</span>
                {module?.creator?.firstName && <span>· {module.creator.firstName}</span>}
                {(module as any)?.provider && <span>· {(module as any).provider}/{(module as any).model}</span>}
              </div>
            </div>
          </div>
          <button onClick={handleDelete} className="p-2 rounded-lg gentle-animation hover:bg-red-500/10" style={{ color: "#52525b" }} data-testid="button-delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto px-6 py-8 space-y-5">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center min-h-[400px]">
            <div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "var(--accent-blue)" }}>
                <Send className="w-6 h-6" />
              </div>
              <p className="text-xl font-black mb-2" style={{ color: "#fafafa" }} data-testid="text-welcome">Start a Conversation</p>
              <p className="text-[13px] max-w-md leading-[1.7]" style={{ color: "#71717a" }}>
                {module?.description || "Ask anything and get expert-informed answers."}
              </p>
              {module?.conversationStarters && Array.isArray(module.conversationStarters) && module.conversationStarters.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {module.conversationStarters.map((starter: string, idx: number) => (
                    <button key={idx} onClick={() => setMessageText(starter)} className="text-[12px] px-4 py-2 rounded-xl glass-card gentle-animation" style={{ color: "#a1a1aa" }} data-testid={`button-starter-${idx}`}>
                      {starter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message: ChatMessage, idx: number) => (
              <div key={message.id || idx} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} data-testid={`message-${message.role}-${idx}`}>
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${message.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`} style={
                  message.role === "user"
                    ? { backgroundColor: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }
                    : { backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                }>
                  <p className="text-[13px] leading-[1.7] whitespace-pre-wrap" style={{ color: message.role === "user" ? "#e4e4e7" : "#a1a1aa" }}>{message.content}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#3f3f46" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#3f3f46", animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "#3f3f46", animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="sticky bottom-0 glass-navbar" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..." disabled={sending}
              className="flex-1 h-12 px-4 text-[13px] rounded-xl outline-none transition-all focus:ring-1 focus:ring-[var(--accent-blue)]"
              style={{ border: "1px solid #27272a", backgroundColor: "rgba(255,255,255,0.02)", color: "#fafafa" }} data-testid="input-message" />
            <button type="submit" disabled={sending || !messageText.trim()} className="h-12 w-12 flex items-center justify-center rounded-xl gentle-animation hover:scale-105 disabled:opacity-30" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-send">
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: "#52525b" }}>
            <Zap className="w-3 h-3" style={{ color: "var(--accent-blue)" }} /> 5 credits per message
          </p>
        </div>
      </div>
    </div>
  );
}

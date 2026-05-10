import { useState, useEffect, useRef, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { api, type Conversation, type Module, type ChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Trash2,
  Zap,
  Loader2,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  MoreHorizontal,
  Pencil,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { LayerLogo } from "@/components/layer/LayerLogo";

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function bucketLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";
  const week = new Date(now);
  week.setDate(now.getDate() - 7);
  if (d > week) return "Last 7 days";
  const month = new Date(now);
  month.setDate(now.getDate() - 30);
  if (d > month) return "Last 30 days";
  return "Older";
}

const BUCKET_ORDER = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Older"];

// ────────────────────────────────────────────────────────────────────
// Sidebar
// ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  conversations: Conversation[];
  modulesById: Record<string, Module>;
  activeId?: string;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
  onCollapse?: () => void;
  collapsed?: boolean;
  isMobileDrawer?: boolean;
}

function Sidebar({
  conversations,
  modulesById,
  activeId,
  onSelect,
  onRename,
  onShare,
  onDelete,
  onNewChat,
  onClose,
  onCollapse,
  collapsed,
  isMobileDrawer,
}: SidebarProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [moduleSwitcherOpen, setModuleSwitcherOpen] = useState(true);

  // unique modules from conversations, sorted by most recent activity
  const modulesUsed = useMemo(() => {
    const seen = new Map<string, { mod: Module | undefined; lastIso: string; count: number }>();
    conversations.forEach((c) => {
      const existing = seen.get(c.moduleId);
      const conv_iso = c.updatedAt || c.createdAt;
      if (!existing || conv_iso > existing.lastIso) {
        seen.set(c.moduleId, {
          mod: modulesById[c.moduleId],
          lastIso: conv_iso,
          count: (existing?.count ?? 0) + 1,
        });
      } else {
        existing.count += 1;
      }
    });
    return Array.from(seen.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => (a.lastIso < b.lastIso ? 1 : -1));
  }, [conversations, modulesById]);

  // grouped + filtered conversations
  const grouped = useMemo(() => {
    const filtered = search
      ? conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
      : conversations;
    const sorted = [...filtered].sort((a, b) => {
      const ai = a.updatedAt || a.createdAt;
      const bi = b.updatedAt || b.createdAt;
      return bi.localeCompare(ai);
    });
    const buckets: Record<string, Conversation[]> = {};
    sorted.forEach((c) => {
      const k = bucketLabel(c.updatedAt || c.createdAt);
      (buckets[k] ||= []).push(c);
    });
    return buckets;
  }, [conversations, search]);

  if (collapsed && !isMobileDrawer) {
    return (
      <aside
        style={{
          width: 56,
          background: "var(--bone-light)",
          borderRight: "1px solid var(--bone-edge)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0.85rem 0",
          gap: "0.6rem",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onCollapse}
          aria-label="Open sidebar"
          style={{ background: "transparent", border: 0, padding: 8, cursor: "pointer", color: "var(--ink-3)", borderRadius: 6 }}
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          aria-label="New chat"
          style={{ background: "var(--ink)", color: "var(--bone)", border: 0, padding: 8, cursor: "pointer", borderRadius: 8 }}
        >
          <Plus className="w-4 h-4" />
        </button>
        <a className="layer-logo" onClick={() => setLocation("/")} style={{ marginTop: "auto", marginBottom: 4, cursor: "pointer", flexDirection: "column" }}>
          <svg className="layer-logo-mark" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="4" width="20" height="3.6" rx="0.5" fill="#0E1628" />
            <rect x="2" y="10" width="20" height="3.6" rx="0.5" fill="#FF7A5C" />
            <rect x="2" y="16" width="20" height="3.6" rx="0.5" fill="#D4FF3A" />
          </svg>
        </a>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: isMobileDrawer ? "min(320px, 88vw)" : 300,
        background: "var(--bone-light)",
        borderRight: "1px solid var(--bone-edge)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100vh",
        position: isMobileDrawer ? "fixed" : "relative",
        left: 0,
        top: 0,
        zIndex: isMobileDrawer ? 60 : 1,
        boxShadow: isMobileDrawer ? "2px 0 30px rgba(14,22,40,0.18)" : "none",
      }}
    >
      {/* Header */}
      <div style={{ padding: "0.85rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--bone-edge)" }}>
        <a className="layer-logo" onClick={() => setLocation("/")} style={{ cursor: "pointer", fontSize: "0.95rem" }}>
          <LayerLogo />
        </a>
        <div style={{ display: "flex", gap: 4 }}>
          {isMobileDrawer ? (
            <button onClick={onClose} aria-label="Close" style={iconBtnStyle}>
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={onCollapse} aria-label="Collapse sidebar" style={iconBtnStyle}>
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* New chat */}
      <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--bone-edge)" }}>
        <button
          onClick={onNewChat}
          data-testid="button-new-chat"
          className="btn btn-ink"
          style={{ width: "100%", justifyContent: "center", padding: "0.7rem 0.85rem", fontSize: "0.9rem" }}
        >
          <Plus className="w-4 h-4" /> New chat
        </button>
      </div>

      {/* Module switcher */}
      <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--bone-edge)" }}>
        <button
          onClick={() => setModuleSwitcherOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: 0,
            padding: 0,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-4)",
            marginBottom: "0.6rem",
          }}
        >
          <span>Modules · {modulesUsed.length}</span>
          <ChevronDown className="w-3.5 h-3.5" style={{ transform: moduleSwitcherOpen ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s var(--ease)" }} />
        </button>
        {moduleSwitcherOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 180, overflowY: "auto" }}>
            <button
              onClick={() => setLocation("/explore")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: 0,
                padding: "0.5rem 0.6rem",
                borderRadius: 6,
                cursor: "pointer",
                color: "var(--ink-3)",
                fontFamily: "inherit",
                fontSize: "0.85rem",
                textAlign: "left",
                transition: "background 0.15s var(--ease)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bone-deep)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Search className="w-3.5 h-3.5" /> Browse all modules
            </button>
            {modulesUsed.map(({ id, mod }) => {
              const initials = (mod?.title || "??").slice(0, 2).toUpperCase();
              return (
                <button
                  key={id}
                  onClick={() => setLocation(`/modules/${id}`)}
                  data-testid={`module-pin-${id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "transparent",
                    border: 0,
                    padding: "0.4rem 0.6rem",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "var(--ink-2)",
                    fontFamily: "inherit",
                    fontSize: "0.85rem",
                    textAlign: "left",
                    transition: "background 0.15s var(--ease)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bone-deep)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 5,
                      background: "var(--ink)",
                      color: "var(--bone)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {mod?.title || "Module"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--bone-edge)" }}>
        <div style={{ position: "relative" }}>
          <Search className="w-3.5 h-3.5" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
          <input
            type="text"
            placeholder="Search chats…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-chat-search"
            style={{
              width: "100%",
              padding: "0.5rem 0.6rem 0.5rem 2rem",
              fontSize: "0.85rem",
              background: "var(--bone)",
              border: "1px solid var(--bone-edge)",
              borderRadius: 6,
              color: "var(--ink)",
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* History list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0.6rem 1rem" }}>
        {conversations.length === 0 ? (
          <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--ink-4)", fontSize: "0.85rem" }}>
            No chats yet. Start one with any module.
          </div>
        ) : (
          BUCKET_ORDER.filter((b) => grouped[b]?.length).map((bucket) => (
            <div key={bucket} style={{ marginBottom: "0.85rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--ink-4)",
                  padding: "0.35rem 0.5rem 0.4rem",
                }}
              >
                {bucket}
              </div>
              {grouped[bucket].map((conv) => {
                const isActive = conv.id === activeId;
                const isEditing = editingId === conv.id;
                return (
                  <div
                    key={conv.id}
                    style={{
                      position: "relative",
                      borderRadius: 6,
                      background: isActive ? "var(--ink)" : "transparent",
                      transition: "background 0.15s var(--ease)",
                      marginBottom: 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget.style.background = "var(--bone-deep)");
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget.style.background = "transparent");
                    }}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => {
                          if (editTitle.trim()) onRename(conv.id, editTitle.trim());
                          setEditingId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.6rem",
                          fontSize: "0.85rem",
                          background: "var(--bone-light)",
                          border: "1px solid var(--ink)",
                          borderRadius: 6,
                          color: "var(--ink)",
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => onSelect(conv.id)}
                        data-testid={`conv-${conv.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "0.5rem 0.6rem",
                          cursor: "pointer",
                          color: isActive ? "var(--bone)" : "var(--ink-2)",
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.88rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {conv.title || "Untitled chat"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                          }}
                          aria-label="More"
                          style={{
                            background: "transparent",
                            border: 0,
                            padding: 4,
                            cursor: "pointer",
                            color: isActive ? "var(--acid)" : "var(--ink-4)",
                            borderRadius: 4,
                            opacity: isActive || openMenuId === conv.id ? 1 : 0.5,
                          }}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {openMenuId === conv.id && !isEditing && (
                      <div
                        style={{
                          position: "absolute",
                          right: 6,
                          top: "100%",
                          marginTop: 4,
                          background: "var(--bone)",
                          border: "1px solid var(--bone-edge)",
                          borderRadius: 6,
                          padding: 4,
                          zIndex: 10,
                          boxShadow: "0 8px 24px -8px rgba(14,22,40,0.18)",
                          minWidth: 140,
                        }}
                      >
                        <MenuButton
                          icon={<Pencil className="w-3.5 h-3.5" />}
                          label="Rename"
                          onClick={() => {
                            setEditingId(conv.id);
                            setEditTitle(conv.title || "");
                            setOpenMenuId(null);
                          }}
                        />
                        <MenuButton
                          icon={<Share2 className="w-3.5 h-3.5" />}
                          label="Share"
                          onClick={() => {
                            onShare(conv.id);
                            setOpenMenuId(null);
                          }}
                        />
                        <MenuButton
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          label="Delete"
                          danger
                          onClick={() => {
                            onDelete(conv.id);
                            setOpenMenuId(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0.85rem 1rem",
          borderTop: "1px solid var(--bone-edge)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--ink-4)",
        }}
      >
        <button
          onClick={() => setLocation("/dashboard")}
          style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "inherit", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}
        >
          ← Dashboard
        </button>
        <button
          onClick={() => setLocation("/billing")}
          style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "var(--ink-2)", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}
        >
          Credits →
        </button>
      </div>
    </aside>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  padding: 6,
  cursor: "pointer",
  color: "var(--ink-3)",
  borderRadius: 6,
};

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "0.45rem 0.6rem",
        background: "transparent",
        border: 0,
        cursor: "pointer",
        fontSize: "0.82rem",
        color: danger ? "var(--coral)" : "var(--ink-2)",
        textAlign: "left",
        fontFamily: "inherit",
        borderRadius: 4,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "var(--coral-soft)" : "var(--bone-deep)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}
      {label}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [match, params] = useRoute("/chat/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(params?.id);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [module, setModule] = useState<(Module & { creator?: any }) | null>(null);
  const [modulesById, setModulesById] = useState<Record<string, Module>>({});

  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState<boolean>(!!params?.id);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync route → activeId
  useEffect(() => {
    if (match && params?.id) {
      setActiveId(params.id);
    } else {
      setActiveId(undefined);
      setConversation(null);
      setModule(null);
      setLoadingChat(false);
    }
  }, [match, params?.id]);

  // Load all conversations for sidebar
  useEffect(() => {
    const loadList = async () => {
      try {
        const list = await api.getConversations().catch(() => []);
        setConversations(list || []);
        // load modules referenced
        const ids = Array.from(new Set((list || []).map((c) => c.moduleId)));
        const modMap: Record<string, Module> = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const m = await api.getModule(id);
              modMap[id] = m;
            } catch {}
          })
        );
        setModulesById(modMap);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setLoadingList(false);
      }
    };
    loadList();
  }, [toast]);

  // Load active conversation
  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      setLoadingChat(true);
      try {
        const conv = await api.getConversation(activeId);
        setConversation(conv);
        try {
          const mod = await api.getModule(conv.moduleId);
          setModule(mod);
          setModulesById((prev) => ({ ...prev, [conv.moduleId]: mod }));
        } catch {
          setModule(null);
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      } finally {
        setLoadingChat(false);
      }
    };
    load();
  }, [activeId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversation) return;
    const current = messageText;
    setMessageText("");
    setSending(true);
    const optimistic: ChatMessage[] = [
      ...(conversation.messages || []),
      { role: "user" as const, content: current },
    ];
    setConversation({ ...conversation, messages: optimistic });
    try {
      const res = await api.sendMessage(conversation.id, current);
      const updated = res?.conversation ?? (await api.getConversation(conversation.id));
      setConversation(updated);
      // refresh sidebar list (preserve order with this conv at top)
      setConversations((prev) => {
        const without = prev.filter((c) => c.id !== updated.id);
        return [updated, ...without];
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setMessageText(current);
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = async () => {
    setMobileDrawerOpen(false);
    if (module?.id) {
      try {
        const conv = await api.createConversation(module.id, module.title);
        setConversations((prev) => [conv, ...prev]);
        setLocation(`/chat/${conv.id}`);
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    } else {
      setLocation("/explore");
    }
  };

  const handleSelect = (id: string) => {
    setMobileDrawerOpen(false);
    setLocation(`/chat/${id}`);
  };

  const handleRename = async (id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    if (conversation?.id === id) setConversation({ ...conversation, title });
    // best-effort backend update — endpoint may or may not exist
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    } catch {}
    toast({ title: "Renamed" });
  };

  const handleShare = async (id: string) => {
    const url = `${window.location.origin}/chat/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Share link copied to clipboard." });
    } catch {
      toast({ title: "Share", description: url });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setLocation("/chat");
      toast({ title: "Conversation deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const messages = conversation?.messages || [];
  const initials = (module?.title || "??").slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bone)", color: "var(--ink)" }}>
      {/* Mobile drawer overlay */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(14,22,40,0.4)",
            zIndex: 55,
          }}
          aria-hidden
        />
      )}

      {/* Desktop sidebar */}
      <div className="chat-sidebar-desktop" style={{ display: "flex" }}>
        <Sidebar
          conversations={conversations}
          modulesById={modulesById}
          activeId={activeId}
          onSelect={handleSelect}
          onRename={handleRename}
          onShare={handleShare}
          onDelete={handleDelete}
          onNewChat={handleNewChat}
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile drawer */}
      {mobileDrawerOpen && (
        <Sidebar
          conversations={conversations}
          modulesById={modulesById}
          activeId={activeId}
          onSelect={handleSelect}
          onRename={handleRename}
          onShare={handleShare}
          onDelete={handleDelete}
          onNewChat={handleNewChat}
          isMobileDrawer
          onClose={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header
          style={{
            padding: "0.85rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(237,233,224,0.78)",
            backdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "1px solid var(--bone-edge)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open menu"
              className="chat-mobile-trigger"
              style={iconBtnStyle}
            >
              <Menu className="w-4 h-4" />
            </button>
            {module ? (
              <>
                <div
                  className="band-tier"
                  style={{ width: 32, height: 32, fontSize: "0.7rem" }}
                  onClick={() => setLocation(`/modules/${module.id}`)}
                >
                  {initials}
                </div>
                <div>
                  <h1
                    style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.1, cursor: "pointer" }}
                    onClick={() => setLocation(`/modules/${module.id}`)}
                    data-testid="text-module-title"
                  >
                    {module.title}
                  </h1>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--ink-4)",
                      marginTop: 2,
                    }}
                  >
                    {messages.length} messages
                    {module.creator?.firstName && ` · ${module.creator.firstName}`}
                  </div>
                </div>
              </>
            ) : (
              <h1 style={{ fontSize: "1rem", fontWeight: 600 }}>New chat</h1>
            )}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {conversation && (
              <>
                <button onClick={() => handleShare(conversation.id)} aria-label="Share" style={iconBtnStyle} data-testid="button-share">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(conversation.id)} aria-label="Delete" style={iconBtnStyle} data-testid="button-delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1.5rem" }}>
            {loadingChat ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
              </div>
            ) : !conversation ? (
              <EmptyChatState
                onPickModule={() => setLocation("/explore")}
                hasHistory={conversations.length > 0}
              />
            ) : messages.length === 0 ? (
              <WelcomeState module={module} onSeed={(t) => setMessageText(t)} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {messages.map((message: ChatMessage, idx: number) => (
                  <MessageBubble key={message.id || idx} message={message} />
                ))}
                {sending && <TypingBubble />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        {conversation && (
          <div
            style={{
              borderTop: "1px solid var(--bone-edge)",
              background: "rgba(237,233,224,0.85)",
              backdropFilter: "blur(20px) saturate(180%)",
              flexShrink: 0,
            }}
          >
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "1rem 1.5rem" }}>
              <form onSubmit={handleSend} style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Message ${module?.title || "the module"}…`}
                  disabled={sending}
                  data-testid="input-message"
                  style={{
                    flex: 1,
                    height: 48,
                    padding: "0 1rem",
                    fontSize: "0.95rem",
                    borderRadius: "var(--r-2)",
                    border: "1px solid var(--bone-edge)",
                    background: "var(--bone-light)",
                    color: "var(--ink)",
                    outline: "none",
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  data-testid="button-send"
                  className="btn btn-acid"
                  style={{ width: 48, height: 48, justifyContent: "center", padding: 0 }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p
                style={{
                  fontSize: "0.7rem",
                  marginTop: "0.5rem",
                  color: "var(--ink-4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                <Zap className="w-3 h-3" style={{ color: "var(--ink)" }} /> 5 credits per message
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 800px) {
          .chat-sidebar-desktop { display: none !important; }
        }
        @media (min-width: 801px) {
          .chat-mobile-trigger { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }} data-testid={`message-${message.role}`}>
      <div
        style={{
          maxWidth: "78%",
          padding: "0.85rem 1rem",
          borderRadius: 14,
          borderBottomRightRadius: isUser ? 4 : 14,
          borderBottomLeftRadius: !isUser ? 4 : 14,
          background: isUser ? "var(--ink)" : "var(--bone-light)",
          color: isUser ? "var(--bone)" : "var(--ink)",
          border: isUser ? "1px solid var(--ink)" : "1px solid var(--bone-edge)",
        }}
      >
        <p style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{message.content}</p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          padding: "0.85rem 1rem",
          borderRadius: 14,
          borderBottomLeftRadius: 4,
          background: "var(--bone-light)",
          border: "1px solid var(--bone-edge)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 0.15, 0.3].map((d, i) => (
            <span
              key={i}
              className="animate-bounce"
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink-4)", animationDelay: `${d}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function WelcomeState({ module, onSeed }: { module: (Module & { creator?: any }) | null; onSeed: (text: string) => void }) {
  return (
    <div style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--r-3)",
            background: "var(--acid)",
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
          }}
        >
          <Send className="w-6 h-6" />
        </div>
        <p style={{ fontSize: "var(--t-3)", fontWeight: 600, marginBottom: "0.75rem", letterSpacing: "-0.025em" }}>
          Start the <span className="it">conversation.</span>
        </p>
        <p style={{ fontSize: "0.95rem", color: "var(--ink-3)", maxWidth: 420, lineHeight: 1.6, margin: "0 auto" }}>
          {module?.description || "Ask anything and get expert-informed answers."}
        </p>
        {module?.conversationStarters && Array.isArray(module.conversationStarters) && module.conversationStarters.length > 0 && (
          <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {module.conversationStarters.map((starter: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onSeed(starter)}
                data-testid={`button-starter-${idx}`}
                style={{
                  fontSize: "0.85rem",
                  padding: "0.55rem 0.9rem",
                  borderRadius: 999,
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  cursor: "pointer",
                }}
              >
                {starter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChatState({ onPickModule, hasHistory }: { onPickModule: () => void; hasHistory: boolean }) {
  return (
    <div style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div>
        <span className="eyebrow"><span className="num">★</span> Layer on</span>
        <h2 style={{ fontSize: "var(--t-4)", marginBottom: "1rem" }}>
          {hasHistory ? <>Pick up <span className="it">where you left off.</span></> : <>What do you want <span className="it">to know?</span></>}
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--ink-3)", maxWidth: 420, margin: "0 auto 1.5rem", lineHeight: 1.55 }}>
          {hasHistory
            ? "Open a chat from the sidebar, or browse a new module to start fresh."
            : "Browse the marketplace and pick a module built by a verified expert. Then ask anything."}
        </p>
        <button className="btn btn-acid btn-lg" onClick={onPickModule} data-testid="button-browse-modules">
          Browse modules <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
}

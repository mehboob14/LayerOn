import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreatorChunk, type CreatorPlatform, type CreatorSource } from "@/lib/api";
import {
  Youtube,
  PenSquare,
  BookOpen,
  Globe,
  RefreshCw,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";

const PLATFORM_META: Record<CreatorPlatform, { label: string; placeholder: string; helper: string; Icon: any }> = {
  youtube: { label: "YouTube", placeholder: "@channelHandle  or  channel URL", helper: "Indexes recent videos: title, description, transcript.", Icon: Youtube },
  medium:  { label: "Medium",  placeholder: "@username  or  https://yourdomain.medium.com", helper: "Public Medium feed.", Icon: PenSquare },
  substack:{ label: "Substack",placeholder: "yoursub.substack.com", helper: "Substack RSS feed.", Icon: BookOpen },
  rss:     { label: "Blog / RSS", placeholder: "https://yourblog.com/feed", helper: "Any RSS or Atom feed URL.", Icon: Globe },
};

const POLL_INTERVAL_MS = 4000;

export default function KnowledgeBasePage() {
  const qc = useQueryClient();

  const platforms = useQuery({
    queryKey: ["creator-platforms"],
    queryFn: () => api.getCreatorPlatforms(),
  });

  const summary = useQuery({
    queryKey: ["creator-kb-summary"],
    queryFn: () => api.getCreatorKBSummary(),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const sourcesQuery = useQuery({
    queryKey: ["creator-sources"],
    queryFn: () => api.getCreatorSources(),
    refetchInterval: (q) => {
      const data = q.state.data as CreatorSource[] | undefined;
      const inFlight = data?.some((s) => s.status === "pending" || s.status === "syncing");
      return inFlight ? POLL_INTERVAL_MS : false;
    },
  });

  const sources = sourcesQuery.data ?? [];

  // Add-source form
  const [platform, setPlatform] = useState<CreatorPlatform>("youtube");
  const [handle, setHandle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const addSource = useMutation({
    mutationFn: () =>
      api.addCreatorSource({ platform, handle: handle.trim(), enabled: true }),
    onSuccess: () => {
      setHandle("");
      setFormError(null);
      qc.invalidateQueries({ queryKey: ["creator-sources"] });
      qc.invalidateQueries({ queryKey: ["creator-kb-summary"] });
    },
    onError: (e: any) => setFormError(e?.message ?? "Failed to add"),
  });

  const sync = useMutation({
    mutationFn: (id: string) => api.syncCreatorSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creator-sources"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteCreatorSource(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creator-sources"] });
      qc.invalidateQueries({ queryKey: ["creator-kb-summary"] });
    },
  });

  const toggleEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.updateCreatorSource(id, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creator-sources"] }),
  });

  const onSubmit = () => {
    if (!handle.trim()) {
      setFormError("Enter a handle or URL");
      return;
    }
    addSource.mutate();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <LayerNav />
      <div className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="layer-container" style={{ maxWidth: 1000 }}>
          <span className="eyebrow"><span className="num">KB</span> Knowledge base</span>
        <h1 style={{ fontSize: "var(--t-5)", marginBottom: "1rem" }}>
          Your <span className="it">knowledge base.</span>
        </h1>
        <p className="lead" style={{ marginBottom: "2.5rem" }}>
          Link the places you publish. Every module you build gets your voice and your work as background — so users get answers grounded in what you've actually said.
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <SummaryCard label="Linked sources" value={summary.data?.sourceCount ?? 0} />
          <SummaryCard label="Indexed chunks" value={summary.data?.chunkCount ?? 0} />
          <SummaryCard
            label="Status"
            value={
              summary.data
                ? `${summary.data.byStatus.synced} synced · ${summary.data.byStatus.syncing + summary.data.byStatus.pending} working`
                : "—"
            }
            small
          />
        </div>

        {/* Web identity discovery */}
        {platforms.data?.webIdentityEnabled && <WebIdentityCard />}

        {/* Add source */}
        <div
          className="p-5 rounded-2xl mb-6 glass-card"
          style={{ border: "1px solid var(--bone-edge)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Link a new source</h3>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {(Object.keys(PLATFORM_META) as CreatorPlatform[]).map((p) => {
              const m = PLATFORM_META[p];
              const active = platform === p;
              const Icon = m.Icon;
              return (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className="p-3 rounded-xl flex items-center justify-center gap-2 gentle-animation"
                  style={{
                    backgroundColor: active ? "var(--ink)" : "var(--bone)",
                    border: active ? "1px solid var(--ink)" : "1px solid var(--bone-edge)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: active ? "var(--acid)" : "var(--ink-3)" }} />
                  <span className="text-xs" style={{ color: active ? "var(--bone)" : "var(--ink-3)" }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={handle}
              onChange={(e) => { setHandle(e.target.value); if (formError) setFormError(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") onSubmit(); }}
              placeholder={PLATFORM_META[platform].placeholder}
              className="flex-1 px-3 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--bone)",
                color: "var(--ink)",
                border: "1px solid var(--bone-edge)",
              }}
            />
            <button
              onClick={onSubmit}
              disabled={addSource.isPending || !handle.trim()}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 gentle-animation"
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--bone)",
                opacity: addSource.isPending || !handle.trim() ? 0.5 : 1,
              }}
            >
              {addSource.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Link & sync"}
            </button>
          </div>
          <p className="text-[11px] mt-2" style={{ color: "var(--ink-4)" }}>{PLATFORM_META[platform].helper}</p>
          {formError && <p className="text-[11px] mt-1.5" style={{ color: "var(--coral)" }}>{formError}</p>}
        </div>

        {/* Sources list */}
        {sourcesQuery.isLoading ? (
          <div className="flex items-center justify-center py-12" style={{ color: "var(--ink-3)" }}>
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sources.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {sources.map((s) => (
              <SourceRow
                key={s.id}
                source={s}
                onSync={() => sync.mutate(s.id)}
                onDelete={() => {
                  if (confirm(`Remove ${PLATFORM_META[s.platform].label} source? Indexed chunks will be deleted.`)) {
                    remove.mutate(s.id);
                  }
                }}
                onToggle={(enabled) => toggleEnabled.mutate({ id: s.id, enabled })}
                isSyncing={sync.isPending && sync.variables === s.id}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SummaryCard({ label, value, small }: { label: string; value: number | string; small?: boolean }) {
  return (
    <div className="p-4 rounded-2xl glass-card" style={{ border: "1px solid var(--bone-edge)" }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-3)" }}>{label}</p>
      <p className={small ? "text-sm font-semibold" : "text-2xl font-black"} style={{ color: "var(--ink)" }}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="p-10 rounded-2xl text-center glass-card"
      style={{ border: "1px dashed var(--bone-edge)" }}
    >
      <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--accent-blue)" }} />
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>No sources yet</p>
      <p className="text-xs" style={{ color: "var(--ink-3)" }}>
        Link your first publishing channel above. We'll index your work in the background.
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: CreatorSource["status"] }) {
  const style = {
    pending: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: Loader2, label: "Pending", spin: true },
    syncing: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", icon: Loader2, label: "Syncing", spin: true },
    synced: { color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: CheckCircle2, label: "Synced", spin: false },
    error: { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: AlertCircle, label: "Error", spin: false },
  }[status];
  const Icon = style.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-semibold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <Icon className={`w-3 h-3 ${style.spin ? "animate-spin" : ""}`} />
      {style.label}
    </span>
  );
}

function SourceRow({
  source, onSync, onDelete, onToggle, isSyncing,
}: {
  source: CreatorSource;
  onSync: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
  isSyncing: boolean;
}) {
  const meta = PLATFORM_META[source.platform];
  const Icon = meta.Icon;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl glass-card overflow-hidden" style={{ border: "1px solid var(--bone-edge)" }}>
      <div className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--bone)" }}>
          <Icon className="w-5 h-5" style={{ color: "var(--ink-3)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--ink-3)" }}>{meta.label}</span>
            <StatusPill status={source.status} />
          </div>
          <p className="text-sm truncate" style={{ color: "var(--ink)" }}>
            {source.displayName || source.handle}
          </p>
          {source.displayName && (
            <p className="text-[11px] truncate" style={{ color: "var(--ink-3)" }}>{source.handle}</p>
          )}
          {source.lastError && (
            <p className="text-[11px] mt-1 truncate" style={{ color: "var(--coral)" }}>{source.lastError}</p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{source.itemCount}</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>items</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconBtn title={source.enabled ? "Mute" : "Enable"} onClick={() => onToggle(!source.enabled)}>
            <span
              className="text-[10px] uppercase tracking-wide font-semibold"
              style={{ color: source.enabled ? "#34d399" : "#71717a" }}
            >
              {source.enabled ? "On" : "Off"}
            </span>
          </IconBtn>
          <IconBtn title="Re-sync" onClick={onSync} disabled={isSyncing || source.status === "syncing"}>
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} style={{ color: "var(--ink-3)" }} />
          </IconBtn>
          <IconBtn title="Delete" onClick={onDelete}>
            <Trash2 className="w-4 h-4" style={{ color: "var(--ink-3)" }} />
          </IconBtn>
          <IconBtn title="View chunks" onClick={() => setExpanded((x) => !x)}>
            {expanded ? <ChevronDown className="w-4 h-4" style={{ color: "var(--ink-3)" }} /> : <ChevronRight className="w-4 h-4" style={{ color: "var(--ink-3)" }} />}
          </IconBtn>
        </div>
      </div>

      {expanded && <ChunksDrawer sourceId={source.id} />}
    </div>
  );
}

function IconBtn({ children, onClick, disabled, title }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-lg gentle-animation hover:bg-white/5 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ChunksDrawer({ sourceId }: { sourceId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["creator-source-chunks", sourceId],
    queryFn: () => api.getCreatorSourceChunks(sourceId, { limit: 50 }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.toggleCreatorChunk(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creator-source-chunks", sourceId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deleteCreatorChunk(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creator-source-chunks", sourceId] }),
  });

  if (isLoading) {
    return (
      <div className="px-4 pb-4">
        <div className="border-t pt-3 flex items-center gap-2 text-xs" style={{ borderColor: "var(--bone-edge)", color: "var(--ink-3)" }}>
          <Loader2 className="w-3 h-3 animate-spin" /> Loading chunks…
        </div>
      </div>
    );
  }

  const chunks = data?.chunks ?? [];
  if (chunks.length === 0) {
    return (
      <div className="px-4 pb-4">
        <div className="border-t pt-3 text-xs" style={{ borderColor: "var(--bone-edge)", color: "var(--ink-3)" }}>
          No indexed chunks yet. Wait for the first sync to finish.
        </div>
      </div>
    );
  }

  // Group by source item.
  const grouped = chunks.reduce<Record<string, CreatorChunk[]>>((acc, c) => {
    const key = c.url ?? c.title ?? c.id;
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="px-4 pb-4">
      <div className="border-t pt-3 space-y-3" style={{ borderColor: "var(--bone-edge)" }}>
        {Object.entries(grouped).map(([key, items]) => (
          <div key={key}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold truncate" style={{ color: "var(--ink)" }}>
                {items[0].title ?? "(untitled)"}
              </span>
              {items[0].url && (
                <a href={items[0].url} target="_blank" rel="noreferrer" className="shrink-0">
                  <ExternalLink className="w-3 h-3" style={{ color: "var(--ink-3)" }} />
                </a>
              )}
              <span className="text-[10px]" style={{ color: "var(--ink-3)" }}>· {items.length} chunk{items.length === 1 ? "" : "s"}</span>
            </div>
            <div className="space-y-1.5 pl-2 border-l" style={{ borderColor: "var(--bone-edge)" }}>
              {items.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-[11px]" style={{ color: c.enabled ? "#a1a1aa" : "#52525b" }}>
                  <span className="mt-0.5 shrink-0 w-5 text-[10px] text-right" style={{ color: "var(--ink-4)" }}>#{c.chunkIndex}</span>
                  <span className="flex-1 line-clamp-2 leading-relaxed">{c.contentPreview}</span>
                  <button
                    onClick={() => toggle.mutate({ id: c.id, enabled: !c.enabled })}
                    className="shrink-0 text-[10px] uppercase tracking-wider"
                    style={{ color: c.enabled ? "#34d399" : "#71717a" }}
                  >
                    {c.enabled ? "on" : "off"}
                  </button>
                  <button
                    onClick={() => remove.mutate(c.id)}
                    className="shrink-0 p-0.5 rounded hover:bg-white/5"
                  >
                    <Trash2 className="w-3 h-3" style={{ color: "var(--ink-3)" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function WebIdentityCard() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof api.discoverCreatorIdentity>> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setErr(null);
    try {
      const r = await api.discoverCreatorIdentity();
      setResult(r);
    } catch (e: any) {
      setErr(e?.message ?? "Discovery failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl mb-6 glass-card" style={{ border: "1px solid rgba(124,58,237,0.2)", backgroundColor: "rgba(124,58,237,0.03)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "var(--accent-purple)" }} />
          <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Web identity discovery</h3>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="text-[11px] uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
        Find public mentions of you across the web — a starting point for the channels worth linking.
      </p>

      {open && (
        <div className="mt-3">
          <button
            onClick={run}
            disabled={running}
            className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
            style={{ backgroundColor: "var(--plum)", color: "var(--bone)", opacity: running ? 0.6 : 1 }}
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {running ? "Searching…" : "Discover"}
          </button>

          {err && <p className="text-[11px] mt-2" style={{ color: "var(--coral)" }}>{err}</p>}

          {result && (
            <div className="mt-3 space-y-3">
              {result.summary && (
                <p className="text-xs leading-relaxed p-3 rounded-lg" style={{ color: "var(--ink)", backgroundColor: "var(--bone)" }}>
                  {result.summary}
                </p>
              )}
              {result.results?.length ? (
                <div className="space-y-2">
                  {result.results.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-2.5 rounded-lg gentle-animation hover:bg-white/5"
                      style={{ border: "1px solid var(--bone-edge)" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-3 h-3" style={{ color: "var(--ink-3)" }} />
                        <span className="text-xs font-semibold truncate" style={{ color: "var(--ink)" }}>{r.title ?? r.url}</span>
                      </div>
                      <p className="text-[11px] line-clamp-2" style={{ color: "var(--ink-3)" }}>{r.snippet}</p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-[11px]" style={{ color: "var(--ink-3)" }}>No results.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

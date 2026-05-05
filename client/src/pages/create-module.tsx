import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { api, type ModuleDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Plus, X, MessageSquare, Brain, Upload, Settings2, FileText, Wrench, Trash2, Check, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PROVIDERS = [
  { id: "openai", label: "OpenAI", icon: MessageSquare, models: ["gpt-4o", "gpt-4o-mini"], color: "var(--accent-blue)" },
  { id: "claude", label: "Claude", icon: Brain, models: ["claude-3-5-sonnet", "claude-3-opus"], color: "var(--accent-purple)" },
  { id: "gemini", label: "Gemini", icon: Sparkles, models: ["gemini-1.5-pro", "gemini-1.5-flash"], color: "var(--accent-emerald)" },
];

export default function CreateModulePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [isPublic, setIsPublic] = useState(true);
  const [conversationStarters, setConversationStarters] = useState<string[]>([]);
  const [starterInput, setStarterInput] = useState("");
  const [savedModuleId, setSavedModuleId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ModuleDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const selectedProvider = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  const addStarter = () => {
    if (starterInput.trim() && conversationStarters.length < 5) {
      setConversationStarters([...conversationStarters, starterInput.trim()]);
      setStarterInput("");
    }
  };

  const removeStarter = (idx: number) => setConversationStarters(conversationStarters.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!title.trim()) { toast({ title: "Missing Info", description: "Please enter a module name", variant: "destructive" }); return; }
    if (!instructions.trim()) { toast({ title: "Missing Info", description: "Please enter system instructions", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (savedModuleId) {
        await api.updateModule(savedModuleId, { title, description, instructions, provider, model, isPublic, conversationStarters: conversationStarters as any } as any);
        toast({ title: "Updated", description: "Module saved successfully" });
      } else {
        const created = await api.createModule({ title, description, instructions, provider, model, isPublic, conversationStarters });
        setSavedModuleId(created.id);
        toast({ title: "Created", description: "Module created! You can now upload documents." });
      }
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => { await handleSave(); toast({ title: "Published", description: "Your module is now live!" }); setLocation("/dashboard"); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!savedModuleId) { toast({ title: "Save First", description: "Please save the module before uploading documents", variant: "destructive" }); return; }
    setUploading(true);
    try {
      for (const file of Array.from(files)) { const doc = await api.uploadDocument(savedModuleId, file); setDocuments(prev => [...prev, doc as ModuleDocument]); }
      toast({ title: "Uploaded", description: `${files.length} document(s) uploaded and processed` });
    } catch (error: any) { toast({ title: "Upload Error", description: error.message, variant: "destructive" }); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!savedModuleId) return;
    try { await api.deleteDocument(savedModuleId, docId); setDocuments(prev => prev.filter(d => d.id !== docId)); toast({ title: "Deleted", description: "Document removed" }); }
    catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const formatFileSize = (bytes: number) => { if (bytes < 1024) return bytes + " B"; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"; return (bytes / (1024 * 1024)).toFixed(1) + " MB"; };

  const tabs = [
    { id: "basic", label: "Identity & Instructions", icon: MessageSquare },
    { id: "model", label: "Model Selection", icon: Brain },
    { id: "knowledge", label: "Knowledge Base", icon: FileText },
    { id: "starters", label: "Conversation Starters", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "transparent", position: "relative", zIndex: 1 }}>
      <nav className="sticky top-0 z-50 glass-navbar">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/dashboard")} className="flex items-center justify-center w-9 h-9 rounded-lg gentle-animation hover:bg-white/5" style={{ border: "1px solid #27272a", color: "#71717a" }} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-black" style={{ color: "#fafafa" }} data-testid="text-page-title">Module Studio</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium gentle-animation disabled:opacity-50" style={{ border: "1px solid #27272a", color: "#a1a1aa", backgroundColor: "#18181b" }} data-testid="button-save-draft">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savedModuleId ? "Update" : "Save Draft"}
            </button>
            <button onClick={handlePublish} disabled={saving || !title.trim() || !instructions.trim()} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold gentle-animation hover:scale-105 disabled:opacity-50" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-publish">
              Publish Module
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-3 space-y-1">
            {tabs.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium gentle-animation" style={{
                backgroundColor: activeTab === item.id ? "#18181b" : "transparent",
                color: activeTab === item.id ? "#fafafa" : "#52525b",
                border: activeTab === item.id ? "1px solid #27272a" : "1px solid transparent",
              }} data-testid={`tab-${item.id}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            {savedModuleId && (
              <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}>
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--accent-emerald)" }}>
                  <Check className="w-3.5 h-3.5" /> Module saved
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-9">
            <div className="space-y-8">
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Module Name</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sales Research Assistant" className="h-12 rounded-lg" style={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fafafa" }} data-testid="input-title" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this module do?" className="min-h-[100px] rounded-lg" style={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fafafa" }} data-testid="input-description" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>System Instructions (Expert Logic)</Label>
                    <p className="text-xs" style={{ color: "#52525b" }}>The core logic that defines AI behaviour. Be specific about domain expertise, rules, and behaviour.</p>
                    <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="You are an expert in [domain]..." className="min-h-[300px] font-mono text-sm rounded-lg" style={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fafafa" }} data-testid="input-instructions" />
                  </div>
                </div>
              )}

              {activeTab === "model" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-black mb-2" style={{ color: "#fafafa" }}>Select AI Provider & Model</h3>
                    <p className="text-sm" style={{ color: "#71717a" }}>The model used for ALL users interacting with this module.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PROVIDERS.map((p) => (
                      <button key={p.id} onClick={() => { setProvider(p.id); setModel(p.models[0]); }} className="p-6 rounded-xl text-left glass-card gentle-animation" style={{
                        border: provider === p.id ? `2px solid ${p.color}` : "1px solid #27272a",
                        backgroundColor: provider === p.id ? `color-mix(in srgb, ${p.color} 5%, transparent)` : undefined,
                      }} data-testid={`provider-${p.id}`}>
                        <p.icon className="w-7 h-7 mb-3" style={{ color: provider === p.id ? p.color : "#52525b" }} />
                        <h4 className="font-bold text-base" style={{ color: "#fafafa" }}>{p.label}</h4>
                        <p className="text-xs mt-1" style={{ color: "#52525b" }}>{p.models.join(", ")}</p>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Select Model</Label>
                    <div className="flex gap-3">
                      {selectedProvider.models.map((m) => (
                        <button key={m} onClick={() => setModel(m)} className="px-5 py-3 rounded-lg text-sm font-medium gentle-animation" style={{
                          border: model === m ? `2px solid ${selectedProvider.color}` : "1px solid #27272a",
                          backgroundColor: model === m ? "#18181b" : "transparent",
                          color: model === m ? "#fafafa" : "#71717a",
                        }} data-testid={`model-${m}`}>{m}</button>
                      ))}
                    </div>
                    <p className="text-xs mt-2" style={{ color: "#52525b" }}>
                      Current: <span className="font-semibold" style={{ color: "#fafafa" }}>{provider} / {model}</span>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "knowledge" && (
                <div className="space-y-6">
                  <div className="rounded-xl overflow-hidden glass-card">
                    <div className="p-6" style={{ borderBottom: "1px solid #27272a" }}>
                      <h3 className="text-lg font-black flex items-center gap-2" style={{ color: "#fafafa" }}>
                        <FileText className="w-5 h-5" style={{ color: "#52525b" }} /> Knowledge Base
                      </h3>
                      <p className="text-sm mt-1" style={{ color: "#71717a" }}>Upload documents (PDF, DOCX, TXT) to give your module domain expertise.</p>
                    </div>
                    <div className="p-6">
                      {!savedModuleId && (
                        <div className="text-center p-4 rounded-lg mb-6" style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}>
                          <p className="text-sm font-medium" style={{ color: "#a1a1aa" }}>Save your module first before uploading documents</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".pdf,.docx,.txt,.md,.csv,.json" className="hidden" data-testid="input-file-upload" />
                      <div onClick={() => savedModuleId && fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-10 text-center space-y-4 gentle-animation" style={{ borderColor: "#27272a", opacity: savedModuleId ? 1 : 0.5, cursor: savedModuleId ? "pointer" : "not-allowed" }} data-testid="dropzone-upload">
                        {uploading ? (
                          <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: "#52525b" }} />
                        ) : (
                          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }}>
                            <Upload className="w-6 h-6" style={{ color: "#52525b" }} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold" style={{ color: "#fafafa" }}>{uploading ? "Processing..." : "Click to upload documents"}</p>
                          <p className="text-sm" style={{ color: "#71717a" }}>PDF, DOCX, TXT, MD, CSV, JSON (Max 10MB each)</p>
                        </div>
                      </div>
                      {documents.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <h4 className="text-sm font-semibold" style={{ color: "#a1a1aa" }}>Uploaded Documents ({documents.length})</h4>
                          {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "#18181b", border: "1px solid #27272a" }} data-testid={`doc-${doc.id}`}>
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5" style={{ color: "#52525b" }} />
                                <div>
                                  <p className="text-sm font-medium" style={{ color: "#fafafa" }}>{doc.fileName}</p>
                                  <p className="text-xs" style={{ color: "#52525b" }}>{formatFileSize(doc.fileSize)} {doc.isProcessed && "- Processed"}</p>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 rounded-lg gentle-animation hover:bg-red-500/10" style={{ color: "#52525b" }} data-testid={`delete-doc-${doc.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "starters" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black mb-2" style={{ color: "#fafafa" }}>Conversation Starters</h3>
                    <p className="text-sm" style={{ color: "#71717a" }}>Suggest prompts users see when starting a chat. Add up to 5.</p>
                  </div>
                  <div className="flex gap-3">
                    <Input value={starterInput} onChange={(e) => setStarterInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStarter())} placeholder='e.g. "Help me write a cold email..."' className="flex-1 rounded-lg" style={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fafafa" }} data-testid="input-starter" />
                    <button onClick={addStarter} disabled={!starterInput.trim() || conversationStarters.length >= 5} className="flex items-center justify-center w-10 h-10 rounded-lg gentle-animation disabled:opacity-50" style={{ border: "1px solid #27272a", color: "#a1a1aa", backgroundColor: "#18181b" }} data-testid="button-add-starter">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {conversationStarters.length > 0 ? (
                    <div className="space-y-2">
                      {conversationStarters.map((starter, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ border: "1px solid #27272a", backgroundColor: "#18181b" }} data-testid={`starter-${idx}`}>
                          <MessageSquare className="w-4 h-4 shrink-0" style={{ color: "#52525b" }} />
                          <span className="text-sm flex-1" style={{ color: "#a1a1aa" }}>{starter}</span>
                          <button onClick={() => removeStarter(idx)} className="p-1" style={{ color: "#52525b" }}><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 rounded-xl border-2 border-dashed" style={{ borderColor: "#27272a" }}>
                      <MessageSquare className="w-8 h-8 mx-auto mb-3" style={{ color: "#27272a" }} />
                      <p className="text-sm" style={{ color: "#52525b" }}>No conversation starters yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="rounded-xl glass-card overflow-hidden">
                  <div className="p-6" style={{ borderBottom: "1px solid #27272a" }}>
                    <h3 className="text-lg font-black" style={{ color: "#fafafa" }}>Advanced Settings</h3>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="font-semibold" style={{ color: "#fafafa" }}>Public Visibility</Label>
                        <p className="text-sm" style={{ color: "#71717a" }}>Allow other users to discover and use this module.</p>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} data-testid="switch-public" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

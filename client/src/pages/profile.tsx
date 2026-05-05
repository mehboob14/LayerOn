import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser, UserButton } from "@clerk/clerk-react";
import { api, type User } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Globe, Twitter, Linkedin, Plus, X, Sparkles, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "", headline: "", expertise: [] as string[], website: "", twitter: "", linkedin: "", role: "user" });

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setProfile(me);
        setForm({ firstName: me.firstName || "", lastName: me.lastName || "", bio: me.bio || "", headline: me.headline || "", expertise: me.expertise || [], website: me.website || "", twitter: me.twitter || "", linkedin: me.linkedin || "", role: me.role || "user" });
      } catch {
        try {
          const synced = await api.syncUser({ role: "user" });
          setProfile(synced);
          setForm({ firstName: synced.firstName || "", lastName: synced.lastName || "", bio: synced.bio || "", headline: synced.headline || "", expertise: synced.expertise || [], website: synced.website || "", twitter: synced.twitter || "", linkedin: synced.linkedin || "", role: synced.role || "user" });
        } catch (e) { console.error("Failed to load profile:", e); }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try { const updated = await api.updateProfile(form); setProfile(updated); toast({ title: "Profile saved", description: "Your changes have been saved." }); }
    catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const addTag = () => { const tag = newTag.trim(); if (tag && !form.expertise.includes(tag) && form.expertise.length < 10) { setForm({ ...form, expertise: [...form.expertise, tag] }); setNewTag(""); } };
  const removeTag = (tag: string) => setForm({ ...form, expertise: form.expertise.filter(t => t !== tag) });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ zIndex: 1 }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-blue)" }} />
    </div>
  );

  const inputStyle = { backgroundColor: "#18181b", border: "1px solid #27272a", color: "#fafafa" };

  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      <header className="sticky top-0 z-40 glass-navbar">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/dashboard")} className="p-1.5 rounded-lg gentle-animation hover:bg-white/5" style={{ color: "#71717a" }} data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-bagel text-lg tracking-wider cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation("/")}>LAYERON</span>
            <span className="text-[13px] font-semibold" style={{ color: "#71717a" }}>/ Profile</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="text-sm px-5 py-2 rounded-lg font-semibold flex items-center gap-2 gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-save">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center gap-5">
          <UserButton appearance={{ elements: { avatarBox: { width: 64, height: 64 } } }} />
          <div>
            <p className="font-bold" style={{ color: "#fafafa" }}>{clerkUser?.fullName || profile?.email}</p>
            <p className="text-xs" style={{ color: "#71717a" }}>{profile?.email}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl space-y-5 glass-card">
          <h2 className="text-sm font-bold" style={{ color: "#fafafa" }}>Account Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setForm({ ...form, role: "user" })} className="p-4 rounded-xl text-left glass-card gentle-animation" style={{
              border: form.role === "user" ? "1px solid rgba(37,99,235,0.3)" : undefined,
              backgroundColor: form.role === "user" ? "rgba(37,99,235,0.05)" : undefined,
            }} data-testid="button-switch-user">
              <Users className="w-5 h-5 mb-2" style={{ color: form.role === "user" ? "var(--accent-blue)" : "#52525b" }} />
              <p className="text-sm font-bold" style={{ color: "#fafafa" }}>General User</p>
              <p className="text-[11px]" style={{ color: "#71717a" }}>Browse and use modules</p>
            </button>
            <button onClick={() => setForm({ ...form, role: "creator" })} className="p-4 rounded-xl text-left glass-card gentle-animation" style={{
              border: form.role === "creator" ? "1px solid rgba(124,58,237,0.3)" : undefined,
              backgroundColor: form.role === "creator" ? "rgba(124,58,237,0.05)" : undefined,
            }} data-testid="button-switch-creator">
              <Sparkles className="w-5 h-5 mb-2" style={{ color: form.role === "creator" ? "var(--accent-purple)" : "#52525b" }} />
              <p className="text-sm font-bold" style={{ color: "#fafafa" }}>Creator</p>
              <p className="text-[11px]" style={{ color: "#71717a" }}>Build and publish modules</p>
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl space-y-5 glass-card">
          <h2 className="text-sm font-bold" style={{ color: "#fafafa" }}>Basic Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#71717a" }}>First Name</label>
              <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent-blue)]" style={inputStyle} data-testid="input-first-name" />
            </div>
            <div>
              <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#71717a" }}>Last Name</label>
              <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent-blue)]" style={inputStyle} data-testid="input-last-name" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#71717a" }}>Headline</label>
            <input value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Commercial Lawyer · 12 Years" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent-blue)]" style={inputStyle} data-testid="input-headline" />
          </div>
          <div>
            <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#71717a" }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell people about your experience..." rows={4} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none focus:ring-1 focus:ring-[var(--accent-blue)]" style={inputStyle} data-testid="input-bio" />
          </div>
        </div>

        {form.role === "creator" && (
          <div className="p-6 rounded-2xl space-y-5 glass-card">
            <h2 className="text-sm font-bold" style={{ color: "#fafafa" }}>Creator Profile</h2>
            <div>
              <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#71717a" }}>Expertise Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {form.expertise.map((tag, i) => (
                  <span key={i} className="text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "var(--accent-blue)", border: "1px solid rgba(37,99,235,0.15)" }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add expertise (e.g. Contract Law)" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent-blue)]" style={inputStyle} data-testid="input-expertise" />
                <button onClick={addTag} className="px-3 py-2 rounded-lg text-sm gentle-animation" style={{ backgroundColor: "#18181b", border: "1px solid #27272a", color: "var(--accent-blue)" }}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Globe, label: "Website", key: "website", placeholder: "https://yourwebsite.com" },
                { icon: Twitter, label: "Twitter Handle", key: "twitter", placeholder: "@username" },
                { icon: Linkedin, label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/username" },
              ].map(({ icon: Icon, label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] font-semibold mb-1.5 block" style={{ color: "#71717a" }}>
                    <Icon className="w-3 h-3 inline mr-1" /> {label}
                  </label>
                  <input value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[var(--accent-blue)]" style={inputStyle} data-testid={`input-${key}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pb-8">
          <button onClick={handleSave} disabled={saving} className="w-full py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-save-bottom">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

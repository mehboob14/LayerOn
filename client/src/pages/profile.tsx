import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { api, type User } from "@/lib/api";
import { Save, Loader2, Globe, Twitter, Linkedin, Plus, X, Sparkles, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LayerNav } from "@/components/layer/LayerNav";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  fontSize: "0.92rem",
  background: "var(--bone)",
  border: "1px solid var(--bone-edge)",
  borderRadius: "var(--r-2)",
  color: "var(--ink)",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.45rem",
  fontFamily: "var(--font-mono)",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--ink-4)",
};

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    headline: "",
    expertise: [] as string[],
    website: "",
    twitter: "",
    linkedin: "",
    role: "user",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setProfile(me);
        setForm({
          firstName: me.firstName || "",
          lastName: me.lastName || "",
          bio: me.bio || "",
          headline: me.headline || "",
          expertise: me.expertise || [],
          website: me.website || "",
          twitter: me.twitter || "",
          linkedin: me.linkedin || "",
          role: me.role || "user",
        });
      } catch {
        try {
          const synced = await api.syncUser({ role: "user" });
          setProfile(synced);
          setForm({
            firstName: synced.firstName || "",
            lastName: synced.lastName || "",
            bio: synced.bio || "",
            headline: synced.headline || "",
            expertise: synced.expertise || [],
            website: synced.website || "",
            twitter: synced.twitter || "",
            linkedin: synced.linkedin || "",
            role: synced.role || "user",
          });
        } catch (e) {
          console.error("Failed to load profile:", e);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      toast({ title: "Profile saved", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !form.expertise.includes(tag) && form.expertise.length < 10) {
      setForm({ ...form, expertise: [...form.expertise, tag] });
      setNewTag("");
    }
  };
  const removeTag = (tag: string) =>
    setForm({ ...form, expertise: form.expertise.filter((t) => t !== tag) });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ink-4)" }} />
      </div>
    );

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      <LayerNav />

      <section className="layer-section layer-divider" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
        <div className="layer-container" style={{ maxWidth: 880 }}>
          <span className="eyebrow"><span className="num">P</span> Profile</span>
          <h2 style={{ fontSize: "var(--t-4)", marginBottom: "1rem" }}>
            Your <span className="it">identity.</span>
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "2rem", marginBottom: "2.5rem" }}>
            <UserButton appearance={{ elements: { avatarBox: { width: 56, height: 56 } } }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: "1.05rem" }}>{clerkUser?.fullName || profile?.email}</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-4)" }}>
                {profile?.email}
              </p>
            </div>
          </div>

          <Card title="Account type">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                onClick={() => setForm({ ...form, role: "user" })}
                data-testid="button-switch-user"
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  borderRadius: "var(--r-2)",
                  background: form.role === "user" ? "var(--ink)" : "var(--bone)",
                  color: form.role === "user" ? "var(--bone)" : "var(--ink)",
                  border: form.role === "user" ? "1px solid var(--ink)" : "1px solid var(--bone-edge)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Users className="w-5 h-5" style={{ marginBottom: 8, color: form.role === "user" ? "var(--acid)" : "var(--ink-3)" }} />
                <p style={{ fontSize: "0.95rem", fontWeight: 600 }}>General User</p>
                <p style={{ fontSize: "0.78rem", marginTop: 2, opacity: 0.7 }}>Browse and use modules</p>
              </button>
              <button
                onClick={() => setForm({ ...form, role: "creator" })}
                data-testid="button-switch-creator"
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  borderRadius: "var(--r-2)",
                  background: form.role === "creator" ? "var(--ink)" : "var(--bone)",
                  color: form.role === "creator" ? "var(--bone)" : "var(--ink)",
                  border: form.role === "creator" ? "1px solid var(--ink)" : "1px solid var(--bone-edge)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Sparkles className="w-5 h-5" style={{ marginBottom: 8, color: form.role === "creator" ? "var(--acid)" : "var(--ink-3)" }} />
                <p style={{ fontSize: "0.95rem", fontWeight: 600 }}>Creator</p>
                <p style={{ fontSize: "0.78rem", marginTop: 2, opacity: 0.7 }}>Build and publish modules</p>
              </button>
            </div>
          </Card>

          <Card title="Basic info">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  style={inputStyle}
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  style={inputStyle}
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Headline</label>
              <input
                value={form.headline}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                placeholder="e.g. Commercial Lawyer · 12 Years"
                style={inputStyle}
                data-testid="input-headline"
              />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell people about your experience…"
                rows={4}
                style={{ ...inputStyle, resize: "none" }}
                data-testid="input-bio"
              />
            </div>
          </Card>

          {form.role === "creator" && (
            <Card title="Creator profile">
              <div>
                <label style={labelStyle}>Expertise tags</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {form.expertise.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.78rem",
                        padding: "0.3rem 0.7rem",
                        borderRadius: 999,
                        background: "var(--ink)",
                        color: "var(--bone)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{ background: "transparent", border: 0, padding: 0, cursor: "pointer", color: "var(--acid)" }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add expertise (e.g. Contract Law)"
                    style={inputStyle}
                    data-testid="input-expertise"
                  />
                  <button onClick={addTag} className="btn btn-ink" style={{ padding: "0.5rem 0.85rem" }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { icon: Globe, label: "Website", key: "website", placeholder: "https://yourwebsite.com" },
                  { icon: Twitter, label: "Twitter handle", key: "twitter", placeholder: "@username" },
                  { icon: Linkedin, label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/username" },
                ].map(({ icon: Icon, label, key, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>
                      <Icon className="w-3 h-3" style={{ display: "inline", marginRight: 4 }} /> {label}
                    </label>
                    <input
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      style={inputStyle}
                      data-testid={`input-${key}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          <button
            className="btn btn-acid btn-lg"
            onClick={handleSave}
            disabled={saving}
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            data-testid="button-save"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save profile
          </button>
        </div>
      </section>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bone-light)",
        border: "1px solid var(--bone-edge)",
        borderRadius: "var(--r-3)",
        padding: "1.5rem",
        marginBottom: "1.25rem",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--ink-4)",
          marginBottom: "1.25rem",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

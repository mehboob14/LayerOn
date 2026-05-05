import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";
import { api, type CreatorPlatform } from "@/lib/api";
import {
  Sparkles,
  Users,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Youtube,
  PenSquare,
  BookOpen,
  Globe,
  Trash2,
} from "lucide-react";

type Step = "role" | "profile" | "sources";
type DraftSource = { platform: CreatorPlatform; handle: string };

const PLATFORM_META: Record<
  CreatorPlatform,
  { label: string; placeholder: string; helper: string; Icon: any }
> = {
  youtube: {
    label: "YouTube",
    placeholder: "@channelHandle  or  channel URL",
    helper: "We'll pull recent video titles, descriptions and transcripts.",
    Icon: Youtube,
  },
  medium: {
    label: "Medium",
    placeholder: "@username  or  https://yourdomain.medium.com",
    helper: "We'll subscribe to your public Medium feed.",
    Icon: PenSquare,
  },
  substack: {
    label: "Substack",
    placeholder: "yoursub.substack.com",
    helper: "We'll pull recent posts via your Substack RSS feed.",
    Icon: BookOpen,
  },
  rss: {
    label: "Blog / RSS",
    placeholder: "https://yourblog.com/feed",
    helper: "Any RSS or Atom feed URL works.",
    Icon: Globe,
  },
};

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<"creator" | "user" | null>(null);

  // Step 2: profile
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profession, setProfession] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Step 3: sources
  const [drafts, setDrafts] = useState<DraftSource[]>([]);
  const [draftPlatform, setDraftPlatform] = useState<CreatorPlatform>("youtube");
  const [draftHandle, setDraftHandle] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continueFromRole = async () => {
    if (!selectedRole) return;
    if (selectedRole === "user") {
      setLoading(true);
      try {
        await api.syncUser({ role: "user" });
        await api.updateProfile({ markOnboarded: true });
        setLocation("/explore");
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      await api.syncUser({ role: "creator" });
      setStep("profile");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const continueFromProfile = async () => {
    if (!profession.trim()) {
      setError("Tell us what you do — that's what we'll search the web for.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        profession: profession.trim(),
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        website: website.trim() || undefined,
        twitter: twitter.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      });
      setStep("sources");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const addDraft = () => {
    const handle = draftHandle.trim();
    if (!handle) return;
    setDrafts((prev) => [...prev, { platform: draftPlatform, handle }]);
    setDraftHandle("");
  };

  const removeDraft = (idx: number) =>
    setDrafts((prev) => prev.filter((_, i) => i !== idx));

  const finish = async () => {
    setLoading(true);
    setError(null);
    try {
      for (const d of drafts) {
        try {
          await api.addCreatorSource(d);
        } catch (e) {
          console.error("source add failed", d, e);
        }
      }
      await api.updateProfile({ markOnboarded: true });
      setLocation("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Failed to finish onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-6 py-10" style={{ zIndex: 1 }}>
      <div className="max-w-xl w-full">
        {/* Step indicator */}
        {selectedRole === "creator" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["role", "profile", "sources"] as Step[]).map((s, i) => (
              <div
                key={s}
                className="h-1.5 w-8 rounded-full"
                style={{
                  backgroundColor:
                    step === s
                      ? "var(--accent-blue)"
                      : (["role", "profile", "sources"].indexOf(step) > i
                        ? "rgba(37,99,235,0.5)"
                        : "rgba(255,255,255,0.08)"),
                }}
              />
            ))}
          </div>
        )}

        {step === "role" && (
          <RoleStep
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            firstName={user?.firstName}
            loading={loading}
            onContinue={continueFromRole}
          />
        )}

        {step === "profile" && (
          <ProfileStep
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            profession={profession} setProfession={setProfession}
            headline={headline} setHeadline={setHeadline}
            bio={bio} setBio={setBio}
            website={website} setWebsite={setWebsite}
            twitter={twitter} setTwitter={setTwitter}
            linkedin={linkedin} setLinkedin={setLinkedin}
            loading={loading}
            error={error}
            onBack={() => setStep("role")}
            onContinue={continueFromProfile}
          />
        )}

        {step === "sources" && (
          <SourcesStep
            drafts={drafts}
            draftPlatform={draftPlatform}
            setDraftPlatform={setDraftPlatform}
            draftHandle={draftHandle}
            setDraftHandle={setDraftHandle}
            addDraft={addDraft}
            removeDraft={removeDraft}
            loading={loading}
            error={error}
            onBack={() => setStep("profile")}
            onFinish={finish}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — role
// ---------------------------------------------------------------------------

function RoleStep({
  selectedRole, setSelectedRole, firstName, loading, onContinue,
}: {
  selectedRole: "creator" | "user" | null;
  setSelectedRole: (r: "creator" | "user") => void;
  firstName?: string | null;
  loading: boolean;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black mb-3" style={{ color: "#fafafa" }} data-testid="text-welcome">
          Welcome{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-sm" style={{ color: "#71717a" }}>How do you want to use LayerOn?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <RoleCard
          active={selectedRole === "user"}
          onClick={() => setSelectedRole("user")}
          color="rgba(37,99,235,0.3)"
          tint="rgba(37,99,235,0.05)"
          iconTint="rgba(37,99,235,0.1)"
          iconColor="var(--accent-blue)"
          Icon={Users}
          title="Use modules"
          subtitle="Browse expert-built AI modules and get domain-specific answers."
          testId="button-role-user"
        />
        <RoleCard
          active={selectedRole === "creator"}
          onClick={() => setSelectedRole("creator")}
          color="rgba(124,58,237,0.3)"
          tint="rgba(124,58,237,0.05)"
          iconTint="rgba(124,58,237,0.1)"
          iconColor="var(--accent-purple)"
          Icon={Sparkles}
          title="Create modules"
          subtitle="Turn your expertise into AI modules that learn from your work."
          testId="button-role-creator"
        />
      </div>

      <PrimaryButton onClick={onContinue} disabled={!selectedRole || loading} loading={loading}>
        Continue <ArrowRight className="w-4 h-4" />
      </PrimaryButton>

      <p className="text-center text-[11px] mt-6" style={{ color: "#52525b" }}>
        You can always change this later in your profile settings.
      </p>
    </>
  );
}

function RoleCard({ active, onClick, color, tint, iconTint, iconColor, Icon, title, subtitle, testId }: any) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-2xl text-left glass-card gentle-animation"
      style={{
        border: active ? `1px solid ${color}` : undefined,
        backgroundColor: active ? tint : undefined,
      }}
      data-testid={testId}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: iconTint, color: iconColor }}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold mb-1" style={{ color: "#fafafa" }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>{subtitle}</p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — profile
// ---------------------------------------------------------------------------

function ProfileStep(props: {
  firstName: string; setFirstName: (v: string) => void;
  lastName: string; setLastName: (v: string) => void;
  profession: string; setProfession: (v: string) => void;
  headline: string; setHeadline: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  website: string; setWebsite: (v: string) => void;
  twitter: string; setTwitter: (v: string) => void;
  linkedin: string; setLinkedin: (v: string) => void;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-2" style={{ color: "#fafafa" }}>Tell us about you</h1>
        <p className="text-sm" style={{ color: "#71717a" }}>
          We'll use this to introduce you to module users — and to seed your AI knowledge base.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" value={props.firstName} onChange={props.setFirstName} placeholder="Jane" />
          <Field label="Last name" value={props.lastName} onChange={props.setLastName} placeholder="Doe" />
        </div>
        <Field
          label="What you do *"
          value={props.profession}
          onChange={props.setProfession}
          placeholder="Tax accountant for freelancers"
          helper="One short phrase. We'll use this for web identity discovery."
          required
        />
        <Field label="Headline" value={props.headline} onChange={props.setHeadline} placeholder="Helping creators stay sane at tax time" />
        <Textarea label="Short bio" value={props.bio} onChange={props.setBio} placeholder="2–3 sentences about your background and approach." />
        <div className="grid grid-cols-1 gap-3">
          <Field label="Website" value={props.website} onChange={props.setWebsite} placeholder="https://yourwebsite.com" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Twitter / X" value={props.twitter} onChange={props.setTwitter} placeholder="@handle" />
            <Field label="LinkedIn" value={props.linkedin} onChange={props.setLinkedin} placeholder="linkedin.com/in/you" />
          </div>
        </div>
      </div>

      {props.error && <ErrorBanner message={props.error} />}

      <div className="flex items-center gap-3">
        <SecondaryButton onClick={props.onBack}><ArrowLeft className="w-4 h-4" /> Back</SecondaryButton>
        <PrimaryButton onClick={props.onContinue} disabled={props.loading} loading={props.loading}>
          Continue <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — sources
// ---------------------------------------------------------------------------

function SourcesStep(props: {
  drafts: DraftSource[];
  draftPlatform: CreatorPlatform; setDraftPlatform: (p: CreatorPlatform) => void;
  draftHandle: string; setDraftHandle: (v: string) => void;
  addDraft: () => void;
  removeDraft: (idx: number) => void;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onFinish: () => void;
}) {
  const meta = PLATFORM_META[props.draftPlatform];
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-2" style={{ color: "#fafafa" }}>Connect your work</h1>
        <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
          Link the places you publish. We'll index your public posts and videos so any module
          you build can answer in your voice and reference your work. You can add more later.
        </p>
      </div>

      {/* Platform picker */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {(Object.keys(PLATFORM_META) as CreatorPlatform[]).map((p) => {
          const m = PLATFORM_META[p];
          const active = props.draftPlatform === p;
          const Icon = m.Icon;
          return (
            <button
              key={p}
              onClick={() => props.setDraftPlatform(p)}
              className="p-3 rounded-xl flex flex-col items-center gap-1.5 gentle-animation glass-card"
              style={{
                border: active ? "1px solid rgba(37,99,235,0.4)" : undefined,
                backgroundColor: active ? "rgba(37,99,235,0.05)" : undefined,
              }}
              data-testid={`button-platform-${p}`}
            >
              <Icon className="w-5 h-5" style={{ color: active ? "var(--accent-blue)" : "#a1a1aa" }} />
              <span className="text-[11px]" style={{ color: "#d4d4d8" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Handle input */}
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={props.draftHandle}
          onChange={(e) => props.setDraftHandle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") props.addDraft(); }}
          placeholder={meta.placeholder}
          className="flex-1 px-3 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            color: "#fafafa",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          data-testid="input-source-handle"
        />
        <SecondaryButton onClick={props.addDraft} disabled={!props.draftHandle.trim()}>Add</SecondaryButton>
      </div>
      <p className="text-[11px] mb-6" style={{ color: "#52525b" }}>{meta.helper}</p>

      {/* Drafts */}
      {props.drafts.length > 0 && (
        <div className="space-y-2 mb-6">
          {props.drafts.map((d, i) => {
            const m = PLATFORM_META[d.platform];
            const Icon = m.Icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#a1a1aa" }} />
                <span className="text-xs uppercase tracking-wide" style={{ color: "#71717a" }}>{m.label}</span>
                <span className="text-sm flex-1 truncate" style={{ color: "#fafafa" }}>{d.handle}</span>
                <button
                  onClick={() => props.removeDraft(i)}
                  className="p-1.5 rounded gentle-animation hover:bg-white/5"
                  style={{ color: "#71717a" }}
                  data-testid={`button-remove-source-${i}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {props.error && <ErrorBanner message={props.error} />}

      <div className="flex items-center gap-3">
        <SecondaryButton onClick={props.onBack}><ArrowLeft className="w-4 h-4" /> Back</SecondaryButton>
        <PrimaryButton onClick={props.onFinish} loading={props.loading}>
          {props.drafts.length > 0 ? "Connect & finish" : "Skip for now"}
          <ArrowRight className="w-4 h-4" />
        </PrimaryButton>
      </div>

      <p className="text-center text-[11px] mt-6" style={{ color: "#52525b" }}>
        We only index public content. You can disable or delete anything from your knowledge base later.
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tiny shared bits
// ---------------------------------------------------------------------------

function Field({
  label, value, onChange, placeholder, helper, required,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; helper?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#a1a1aa" }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg text-sm"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          color: "#fafafa",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      {helper && <p className="text-[11px] mt-1" style={{ color: "#52525b" }}>{helper}</p>}
    </div>
  );
}

function Textarea({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#a1a1aa" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2.5 rounded-lg text-sm resize-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          color: "#fafafa",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}

function PrimaryButton({ onClick, disabled, loading, children }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex-1 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 gentle-animation hover:scale-[1.02]"
      style={{
        backgroundColor: disabled ? "rgba(255,255,255,0.05)" : "var(--accent-blue)",
        color: disabled ? "#52525b" : "#fff",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function SecondaryButton({ onClick, disabled, children }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 gentle-animation glass-card"
      style={{ color: "#fafafa", opacity: disabled ? 0.4 : 1 }}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="px-3 py-2.5 mb-4 rounded-lg text-xs"
      style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#fca5a5", border: "1px solid rgba(220,38,38,0.2)" }}
    >
      {message}
    </div>
  );
}

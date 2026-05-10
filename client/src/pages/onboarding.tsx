import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";
import { api, type CreatorPlatform, type WebIdentityResult } from "@/lib/api";
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
  Linkedin,
  Twitter,
  Instagram,
  Search,
  Check,
  ExternalLink,
  Plus,
} from "lucide-react";
import { LayerLogo } from "@/components/layer/LayerLogo";

type Step = "role" | "profile" | "discover" | "platforms" | "review";
type DraftSource = { platform: CreatorPlatform; handle: string };

const STEP_ORDER: Step[] = ["role", "profile", "discover", "platforms", "review"];

const PLATFORM_META: Record<
  CreatorPlatform,
  { label: string; placeholder: string; helper: string; Icon: any }
> = {
  youtube: {
    label: "YouTube",
    placeholder: "@channelHandle  or  channel URL",
    helper: "We'll pull recent video titles, descriptions, and transcripts.",
    Icon: Youtube,
  },
  medium: {
    label: "Medium",
    placeholder: "@username  or  https://yourdomain.medium.com",
    helper: "We subscribe to your public Medium feed.",
    Icon: PenSquare,
  },
  substack: {
    label: "Substack",
    placeholder: "yoursub.substack.com",
    helper: "We pull recent posts via your Substack RSS feed.",
    Icon: BookOpen,
  },
  rss: {
    label: "Blog / RSS",
    placeholder: "https://yourblog.com/feed",
    helper: "Any RSS or Atom feed URL works.",
    Icon: Globe,
  },
};

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<"creator" | "user" | null>(null);

  // profile
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profession, setProfession] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // discover
  const [discovering, setDiscovering] = useState(false);
  const [discovery, setDiscovery] = useState<WebIdentityResult | null>(null);
  const [confirmedIdentity, setConfirmedIdentity] = useState<boolean | null>(null);

  // platforms
  const [drafts, setDrafts] = useState<DraftSource[]>([]);
  const [draftPlatform, setDraftPlatform] = useState<CreatorPlatform>("youtube");
  const [draftHandle, setDraftHandle] = useState("");
  const [extras, setExtras] = useState({ linkedin: "", twitter: "", instagram: "", website: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── step navigation ──────────────────────────────────────────────
  const goNext = () => {
    const idx = selectedRole === "creator" ? STEP_ORDER.indexOf(step) : 0;
    setStep(STEP_ORDER[idx + 1]);
  };
  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  // ── handlers ─────────────────────────────────────────────────────
  const continueFromRole = async () => {
    if (!selectedRole) return;
    if (selectedRole === "user") {
      setLoading(true);
      try {
        await api.syncUser({ role: "user" });
        await api.updateProfile({ markOnboarded: true } as any);
        setLocation("/explore");
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      await api.syncUser({ role: "creator" });
      goNext();
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
      });
      goNext();
      // kick off discovery in background
      runDiscovery();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const runDiscovery = async () => {
    setDiscovering(true);
    setError(null);
    try {
      const fullName = [firstName, lastName].filter(Boolean).join(" ") || user?.fullName || "";
      const hints = [profession, headline].filter(Boolean);
      const result = await api.discoverCreatorIdentity({ name: fullName, hints });
      setDiscovery(result);
    } catch (e: any) {
      // graceful fallback — pretend we couldn't find anything
      setDiscovery({
        enabled: false,
        results: [],
        error: e?.message ?? "Web identity service unavailable",
      });
    } finally {
      setDiscovering(false);
    }
  };

  const finish = async () => {
    setLoading(true);
    setError(null);
    try {
      // save extra socials
      const extraPatch: any = {};
      if (extras.linkedin.trim()) extraPatch.linkedin = extras.linkedin.trim();
      if (extras.twitter.trim()) extraPatch.twitter = extras.twitter.trim();
      if (extras.website.trim()) extraPatch.website = extras.website.trim();
      if (Object.keys(extraPatch).length) await api.updateProfile(extraPatch);

      // create platform sources
      for (const d of drafts) {
        try {
          await api.addCreatorSource(d);
        } catch (e) {
          console.error("source add failed", d, e);
        }
      }
      await api.updateProfile({ markOnboarded: true } as any);
      setLocation("/studio");
    } catch (e: any) {
      setError(e?.message ?? "Failed to finish onboarding");
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

  const addSuggested = (platform: CreatorPlatform, handle: string) => {
    if (drafts.some((d) => d.platform === platform && d.handle === handle)) return;
    setDrafts((prev) => [...prev, { platform, handle }]);
  };

  const removeDraft = (idx: number) => setDrafts((prev) => prev.filter((_, i) => i !== idx));

  // ── render ───────────────────────────────────────────────────────
  const totalSteps = selectedRole === "creator" ? STEP_ORDER.length : 1;
  const currentStepIdx = STEP_ORDER.indexOf(step);

  return (
    <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
      {/* top bar */}
      <header
        style={{
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--bone-edge)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a className="layer-logo" onClick={() => setLocation("/")} style={{ cursor: "pointer" }}>
          <LayerLogo />
        </a>
        {selectedRole === "creator" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--ink-4)",
            }}
          >
            <span>
              Step {Math.max(currentStepIdx, 0) + 1} of {totalSteps}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {STEP_ORDER.map((s, i) => (
                <span
                  key={s}
                  style={{
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    background: i <= currentStepIdx ? "var(--ink)" : "var(--bone-edge)",
                    transition: "background 0.3s var(--ease)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
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
            loading={loading}
            error={error}
            onBack={goBack}
            onContinue={continueFromProfile}
          />
        )}

        {step === "discover" && (
          <DiscoverStep
            firstName={firstName}
            profession={profession}
            discovering={discovering}
            discovery={discovery}
            confirmedIdentity={confirmedIdentity}
            setConfirmedIdentity={setConfirmedIdentity}
            onRerun={runDiscovery}
            onBack={goBack}
            onContinue={goNext}
          />
        )}

        {step === "platforms" && (
          <PlatformsStep
            discovery={discovery}
            drafts={drafts}
            draftPlatform={draftPlatform}
            setDraftPlatform={setDraftPlatform}
            draftHandle={draftHandle}
            setDraftHandle={setDraftHandle}
            extras={extras}
            setExtras={setExtras}
            addDraft={addDraft}
            addSuggested={addSuggested}
            removeDraft={removeDraft}
            error={error}
            onBack={goBack}
            onContinue={goNext}
          />
        )}

        {step === "review" && (
          <ReviewStep
            firstName={firstName}
            lastName={lastName}
            profession={profession}
            drafts={drafts}
            extras={extras}
            loading={loading}
            error={error}
            onBack={goBack}
            onFinish={finish}
          />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 1 — role
// ────────────────────────────────────────────────────────────────────
function RoleStep({
  selectedRole,
  setSelectedRole,
  firstName,
  loading,
  onContinue,
}: {
  selectedRole: "creator" | "user" | null;
  setSelectedRole: (r: "creator" | "user") => void;
  firstName?: string | null;
  loading: boolean;
  onContinue: () => void;
}) {
  return (
    <>
      <span className="eyebrow"><span className="num">01</span> Welcome</span>
      <h1
        style={{
          fontSize: "var(--t-5)",
          letterSpacing: "-0.045em",
          lineHeight: 1.05,
          marginBottom: "1rem",
          maxWidth: "16ch",
        }}
      >
        Welcome{firstName ? `, ${firstName}` : ""}.<br />
        How will you <span className="it">use LayerOn?</span>
      </h1>
      <p className="lead">You can switch later, but the answer changes which tools we set up first.</p>

      <div
        style={{
          marginTop: "2.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
        className="role-grid"
      >
        <RoleCard
          active={selectedRole === "user"}
          onClick={() => setSelectedRole("user")}
          Icon={Users}
          title="I want to use modules"
          subtitle="Browse expert-built AI modules and chat with them. Skip the creator setup."
          testId="button-role-user"
        />
        <RoleCard
          active={selectedRole === "creator"}
          onClick={() => setSelectedRole("creator")}
          Icon={Sparkles}
          title="I want to build modules"
          subtitle="Package your expertise into a paid module. We'll find your work online and help you link it."
          testId="button-role-creator"
        />
      </div>

      <div style={{ marginTop: "2rem" }}>
        <PrimaryButton onClick={onContinue} disabled={!selectedRole || loading} loading={loading}>
          Continue <ArrowRight className="w-4 h-4 arrow" />
        </PrimaryButton>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .role-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

function RoleCard({
  active,
  onClick,
  Icon,
  title,
  subtitle,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  Icon: any;
  title: string;
  subtitle: string;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      style={{
        textAlign: "left",
        padding: "1.5rem",
        background: active ? "var(--ink)" : "var(--bone-light)",
        color: active ? "var(--bone)" : "var(--ink)",
        border: active ? "1px solid var(--ink)" : "1px solid var(--bone-edge)",
        borderRadius: "var(--r-3)",
        cursor: "pointer",
        transition: "transform 0.2s var(--ease), border-color 0.2s var(--ease)",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: active ? "var(--acid)" : "var(--bone)",
          color: "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: "0.4rem" }}>{title}</h3>
      <p style={{ fontSize: "0.88rem", color: active ? "rgba(244,241,234,0.7)" : "var(--ink-3)", lineHeight: 1.55 }}>{subtitle}</p>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 2 — profile
// ────────────────────────────────────────────────────────────────────
function ProfileStep({
  firstName, setFirstName,
  lastName, setLastName,
  profession, setProfession,
  headline, setHeadline,
  bio, setBio,
  loading, error, onBack, onContinue,
}: any) {
  return (
    <>
      <span className="eyebrow"><span className="num">02</span> Tell us about you</span>
      <h1 style={{ fontSize: "var(--t-4)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: "1rem", maxWidth: "18ch" }}>
        What do you <span className="it">actually do?</span>
      </h1>
      <p className="lead">
        Your profession is the most important thing here — we'll use it to discover your work online in the next step.
      </p>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
          <Field label="First name" value={firstName} onChange={setFirstName} placeholder="Jane" />
          <Field label="Last name" value={lastName} onChange={setLastName} placeholder="Doe" />
        </div>
        <Field
          label="What you do"
          value={profession}
          onChange={setProfession}
          placeholder="Tax accountant for freelancers"
          helper="One short phrase. Be specific."
          required
        />
        <Field
          label="Headline (optional)"
          value={headline}
          onChange={setHeadline}
          placeholder="Helping creators stay sane at tax time"
        />
        <Textarea
          label="Short bio (optional)"
          value={bio}
          onChange={setBio}
          placeholder="2–3 sentences about your background and approach."
        />
      </div>

      {error && <ErrorBanner message={error} />}
      <NavRow loading={loading} onBack={onBack} onContinue={onContinue} continueLabel="Find me online" />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 3 — discover
// ────────────────────────────────────────────────────────────────────
function DiscoverStep({
  firstName,
  profession,
  discovering,
  discovery,
  confirmedIdentity,
  setConfirmedIdentity,
  onRerun,
  onBack,
  onContinue,
}: {
  firstName: string;
  profession: string;
  discovering: boolean;
  discovery: WebIdentityResult | null;
  confirmedIdentity: boolean | null;
  setConfirmedIdentity: (v: boolean | null) => void;
  onRerun: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      <span className="eyebrow"><span className="num">03</span> Web discovery</span>
      <h1 style={{ fontSize: "var(--t-4)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: "1rem", maxWidth: "20ch" }}>
        Is this <span className="it">you?</span>
      </h1>
      <p className="lead">
        We searched for "{firstName} · {profession}" online. Confirm what's actually you, and we'll use it as the starting point for your knowledge base.
      </p>

      <div style={{ marginTop: "2rem" }}>
        {discovering ? (
          <div
            style={{
              padding: "3rem 2rem",
              textAlign: "center",
              background: "var(--bone-light)",
              border: "1px solid var(--bone-edge)",
              borderRadius: "var(--r-3)",
            }}
          >
            <Loader2 className="w-8 h-8 animate-spin" style={{ margin: "0 auto 1rem", color: "var(--ink-3)" }} />
            <p style={{ fontSize: "0.95rem", color: "var(--ink-3)" }}>Searching across the open web…</p>
            <p
              style={{
                marginTop: "0.6rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--ink-4)",
              }}
            >
              YouTube · Medium · Substack · LinkedIn · X · Personal sites
            </p>
          </div>
        ) : discovery?.error || !discovery?.enabled ? (
          <div
            style={{
              padding: "1.5rem",
              background: "var(--bone-light)",
              border: "1px solid var(--bone-edge)",
              borderRadius: "var(--r-3)",
            }}
          >
            <p style={{ fontSize: "0.95rem", color: "var(--ink-3)", marginBottom: "0.85rem" }}>
              Web discovery isn't available right now. No problem — you can link your platforms manually in the next step.
            </p>
            <button className="btn btn-outline" onClick={onRerun}>
              <Search className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        ) : (
          <>
            {discovery?.summary && (
              <div
                style={{
                  padding: "1.5rem",
                  background: "var(--ink)",
                  color: "var(--bone)",
                  borderRadius: "var(--r-3)",
                  marginBottom: "1.25rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "var(--acid)",
                    marginBottom: "0.85rem",
                  }}
                >
                  ★ Identity summary
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: "1.15rem",
                    lineHeight: 1.5,
                    color: "var(--bone)",
                  }}
                >
                  {discovery.summary}
                </p>
              </div>
            )}

            {discovery?.results && discovery.results.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {discovery.results.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1rem 1.25rem",
                      background: "var(--bone-light)",
                      border: "1px solid var(--bone-edge)",
                      borderRadius: "var(--r-2)",
                      display: "flex",
                      gap: "0.85rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <ExternalLink className="w-4 h-4" style={{ color: "var(--ink-4)", marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 4 }}
                      >
                        {r.title || r.url}
                      </a>
                      {r.snippet && (
                        <p style={{ fontSize: "0.85rem", color: "var(--ink-3)", lineHeight: 1.5 }}>{r.snippet}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.95rem", color: "var(--ink-3)" }}>
                We didn't find much. That's fine — you can still link your platforms manually.
              </p>
            )}

            <div
              style={{
                marginTop: "2rem",
                padding: "1.25rem",
                background: "var(--acid-soft)",
                border: "1px solid var(--acid)",
                borderRadius: "var(--r-3)",
              }}
            >
              <p style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>Is this you?</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setConfirmedIdentity(true)}
                  className={confirmedIdentity === true ? "btn btn-ink" : "btn btn-outline"}
                  data-testid="confirm-yes"
                >
                  <Check className="w-4 h-4" /> Yes, that's me
                </button>
                <button
                  onClick={() => setConfirmedIdentity(false)}
                  className={confirmedIdentity === false ? "btn btn-ink" : "btn btn-outline"}
                  data-testid="confirm-no"
                >
                  Not me
                </button>
                <button onClick={onRerun} className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem" }}>
                  <Search className="w-4 h-4" /> Re-run
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <NavRow
        loading={false}
        onBack={onBack}
        onContinue={onContinue}
        continueLabel="Link my platforms"
      />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 4 — platforms
// ────────────────────────────────────────────────────────────────────
function PlatformsStep({
  discovery,
  drafts,
  draftPlatform,
  setDraftPlatform,
  draftHandle,
  setDraftHandle,
  extras,
  setExtras,
  addDraft,
  addSuggested,
  removeDraft,
  error,
  onBack,
  onContinue,
}: any) {
  const meta = PLATFORM_META[draftPlatform as CreatorPlatform];
  const Icon = meta.Icon;

  // simple URL→platform inference for suggestions from discovery
  const suggestions = inferPlatformsFromDiscovery(discovery);

  return (
    <>
      <span className="eyebrow"><span className="num">04</span> Connect your work</span>
      <h1 style={{ fontSize: "var(--t-4)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: "1rem", maxWidth: "22ch" }}>
        Link <span className="it">where you publish.</span>
      </h1>
      <p className="lead">
        We index continuously — so the modules you build always have your latest takes, not last year's. Public content only.
      </p>

      {/* Suggested from discovery */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.25rem",
            background: "var(--acid-soft)",
            border: "1px solid var(--acid)",
            borderRadius: "var(--r-3)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "var(--ink-2)",
              marginBottom: "0.85rem",
            }}
          >
            ★ Suggested from your web identity
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {suggestions.map((s, i) => {
              const SIcon = PLATFORM_META[s.platform].Icon;
              const already = drafts.some((d: DraftSource) => d.platform === s.platform && d.handle === s.handle);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0.85rem",
                    background: "var(--bone)",
                    border: "1px solid var(--bone-edge)",
                    borderRadius: 6,
                  }}
                >
                  <SIcon className="w-4 h-4" style={{ color: "var(--ink-3)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)" }}>
                      {PLATFORM_META[s.platform].label}
                    </p>
                    <p style={{ fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.handle}</p>
                  </div>
                  <button
                    className={already ? "btn btn-outline" : "btn btn-ink"}
                    style={{ padding: "0.35rem 0.7rem", fontSize: "0.78rem" }}
                    onClick={() => addSuggested(s.platform, s.handle)}
                    disabled={already}
                  >
                    {already ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual add */}
      <div style={{ marginTop: "1.75rem" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-4)",
            marginBottom: "0.85rem",
          }}
        >
          Add manually
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            marginBottom: "0.75rem",
          }}
        >
          {(Object.keys(PLATFORM_META) as CreatorPlatform[]).map((p) => {
            const m = PLATFORM_META[p];
            const PIcon = m.Icon;
            const active = draftPlatform === p;
            return (
              <button
                key={p}
                onClick={() => setDraftPlatform(p)}
                data-testid={`platform-${p}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "0.65rem 0.5rem",
                  background: active ? "var(--ink)" : "var(--bone-light)",
                  color: active ? "var(--bone)" : "var(--ink-2)",
                  border: active ? "1px solid var(--ink)" : "1px solid var(--bone-edge)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.82rem",
                  transition: "all 0.2s var(--ease)",
                }}
              >
                <PIcon className="w-4 h-4" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Icon className="w-4 h-4" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
            <input
              type="text"
              value={draftHandle}
              onChange={(e) => setDraftHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDraft())}
              placeholder={meta.placeholder}
              style={{
                width: "100%",
                padding: "0.7rem 0.85rem 0.7rem 2.5rem",
                fontSize: "0.92rem",
                background: "var(--bone)",
                color: "var(--ink)",
                border: "1px solid var(--bone-edge)",
                borderRadius: 8,
                outline: "none",
                fontFamily: "inherit",
              }}
              data-testid="input-handle"
            />
          </div>
          <button onClick={addDraft} disabled={!draftHandle.trim()} className="btn btn-ink" style={{ padding: "0.7rem 0.95rem" }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--ink-4)", marginTop: "0.5rem" }}>{meta.helper}</p>
      </div>

      {/* Drafts list */}
      {drafts.length > 0 && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {drafts.map((d: DraftSource, i: number) => {
            const m = PLATFORM_META[d.platform];
            const DIcon = m.Icon;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.85rem",
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: 6,
                }}
              >
                <DIcon className="w-4 h-4" style={{ color: "var(--ink-3)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)" }}>
                  {m.label}
                </span>
                <span style={{ flex: 1, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.handle}</span>
                <button
                  onClick={() => removeDraft(i)}
                  style={{ background: "transparent", border: 0, padding: 6, cursor: "pointer", color: "var(--ink-4)", borderRadius: 4 }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Extra socials */}
      <div style={{ marginTop: "2rem" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--ink-4)",
            marginBottom: "0.85rem",
          }}
        >
          Other links (optional)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <SocialField icon={Linkedin} label="LinkedIn" value={extras.linkedin} onChange={(v: string) => setExtras({ ...extras, linkedin: v })} placeholder="linkedin.com/in/you" />
          <SocialField icon={Twitter} label="X / Twitter" value={extras.twitter} onChange={(v: string) => setExtras({ ...extras, twitter: v })} placeholder="@handle" />
          <SocialField icon={Instagram} label="Instagram" value={extras.instagram} onChange={(v: string) => setExtras({ ...extras, instagram: v })} placeholder="@handle" />
          <SocialField icon={Globe} label="Website" value={extras.website} onChange={(v: string) => setExtras({ ...extras, website: v })} placeholder="https://yoursite.com" />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      <NavRow loading={false} onBack={onBack} onContinue={onContinue} continueLabel="Review" />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Step 5 — review
// ────────────────────────────────────────────────────────────────────
function ReviewStep({
  firstName,
  lastName,
  profession,
  drafts,
  extras,
  loading,
  error,
  onBack,
  onFinish,
}: any) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return (
    <>
      <span className="eyebrow"><span className="num">05</span> Almost there</span>
      <h1 style={{ fontSize: "var(--t-4)", letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: "1rem", maxWidth: "20ch" }}>
        Ready to <span className="it">go live?</span>
      </h1>
      <p className="lead">Review the basics. You can change anything later from your studio.</p>

      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <SummaryRow label="You">{fullName || "—"}</SummaryRow>
        <SummaryRow label="What you do">{profession || "—"}</SummaryRow>
        <SummaryRow label="Linked platforms">
          {drafts.length === 0 ? (
            <span style={{ color: "var(--ink-4)" }}>None linked yet — you can add later.</span>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {drafts.map((d: DraftSource, i: number) => {
                const m = PLATFORM_META[d.platform];
                const DIcon = m.Icon;
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "0.25rem 0.6rem",
                      borderRadius: 999,
                      background: "var(--bone)",
                      border: "1px solid var(--bone-edge)",
                      fontSize: "0.78rem",
                    }}
                  >
                    <DIcon className="w-3 h-3" /> {m.label}
                  </span>
                );
              })}
            </div>
          )}
        </SummaryRow>
        {(extras.linkedin || extras.twitter || extras.instagram || extras.website) && (
          <SummaryRow label="Socials">
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: "0.85rem", color: "var(--ink-3)" }}>
              {extras.linkedin && <span>LinkedIn ✓</span>}
              {extras.twitter && <span>X ✓</span>}
              {extras.instagram && <span>Instagram ✓</span>}
              {extras.website && <span>Website ✓</span>}
            </div>
          </SummaryRow>
        )}
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background: "var(--ink)",
          color: "var(--bone)",
          borderRadius: "var(--r-3)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--acid)",
            marginBottom: "0.75rem",
          }}
        >
          ★ What happens next
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            "We start syncing your linked platforms in the background.",
            "Your studio dashboard opens — build your first module any time.",
            "Visitors can chat with your auto-generated 'general' module right away.",
            "You can re-run web discovery whenever you want.",
          ].map((t, i) => (
            <li
              key={i}
              style={{
                fontSize: "0.92rem",
                color: "rgba(244,241,234,0.85)",
                lineHeight: 1.55,
                paddingLeft: "1.25rem",
                position: "relative",
              }}
            >
              <span style={{ position: "absolute", left: 0, color: "var(--acid)" }}>+</span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      {error && <ErrorBanner message={error} />}
      <NavRow loading={loading} onBack={onBack} onContinue={onFinish} continueLabel="Open my studio" />
    </>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tiny shared
// ────────────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, helper, required,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; helper?: string; required?: boolean }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
          marginBottom: "0.45rem",
        }}
      >
        {label} {required && <span style={{ color: "var(--coral)" }}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "0.7rem 0.85rem",
          fontSize: "0.92rem",
          background: "var(--bone-light)",
          color: "var(--ink)",
          border: "1px solid var(--bone-edge)",
          borderRadius: 8,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      {helper && (
        <p style={{ fontSize: "0.78rem", marginTop: "0.4rem", color: "var(--ink-4)" }}>{helper}</p>
      )}
    </div>
  );
}

function Textarea({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
          marginBottom: "0.45rem",
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: "100%",
          padding: "0.7rem 0.85rem",
          fontSize: "0.92rem",
          background: "var(--bone-light)",
          color: "var(--ink)",
          border: "1px solid var(--bone-edge)",
          borderRadius: 8,
          outline: "none",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
    </div>
  );
}

function SocialField({ icon: Icon, label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
          marginBottom: "0.4rem",
        }}
      >
        <Icon className="w-3 h-3" /> {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.55rem 0.75rem",
          fontSize: "0.85rem",
          background: "var(--bone-light)",
          color: "var(--ink)",
          border: "1px solid var(--bone-edge)",
          borderRadius: 6,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: "1rem",
        padding: "0.85rem 1rem",
        background: "var(--bone-light)",
        border: "1px solid var(--bone-edge)",
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--ink-4)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "0.95rem" }}>{children}</span>
    </div>
  );
}

function NavRow({ loading, onBack, onContinue, continueLabel }: { loading: boolean; onBack: () => void; onContinue: () => void; continueLabel: string }) {
  return (
    <div style={{ marginTop: "2.5rem", display: "flex", gap: "0.75rem" }}>
      {onBack && (
        <button onClick={onBack} className="btn btn-outline btn-lg" disabled={loading}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
      <PrimaryButton onClick={onContinue} loading={loading}>
        {continueLabel} <ArrowRight className="w-4 h-4 arrow" />
      </PrimaryButton>
    </div>
  );
}

function PrimaryButton({ onClick, disabled, loading, children }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn btn-acid btn-lg"
      style={{ flex: 1, justifyContent: "center", opacity: disabled ? 0.5 : 1 }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "0.75rem 1rem",
        background: "var(--coral-soft)",
        border: "1px solid var(--coral)",
        color: "var(--ink)",
        borderRadius: 8,
        fontSize: "0.85rem",
      }}
    >
      {message}
    </div>
  );
}

// Helper: parse discovery results to suggest platforms
function inferPlatformsFromDiscovery(discovery: WebIdentityResult | null): { platform: CreatorPlatform; handle: string }[] {
  if (!discovery?.results) return [];
  const out: { platform: CreatorPlatform; handle: string }[] = [];
  const seen = new Set<string>();
  for (const r of discovery.results) {
    if (!r.url) continue;
    let plat: CreatorPlatform | null = null;
    const url = r.url.toLowerCase();
    if (url.includes("youtube.com") || url.includes("youtu.be")) plat = "youtube";
    else if (url.includes("medium.com")) plat = "medium";
    else if (url.includes("substack.com")) plat = "substack";
    else if (url.match(/\/(rss|feed|atom)/)) plat = "rss";
    if (!plat) continue;
    const key = `${plat}::${r.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ platform: plat, handle: r.url });
    if (out.length >= 4) break;
  }
  return out;
}

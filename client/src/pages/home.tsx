import { useLocation } from "wouter";
import { ArrowRight, ChevronRight, ChevronDown, Check, Star, Users, Shield, MessageSquare, Upload, Settings, Brain, Layers, Lock, Sparkles, Zap, BarChart3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth, UserButton } from "@clerk/clerk-react";

const LLM_PROVIDER_ICONS = [
  { name: "GPT", src: "https://cdn.simpleicons.org/openai/ffffff", color: "#10b981", speed: 0.22, phase: 0.2 },
  { name: "Grok", src: "https://cdn.simpleicons.org/xai/ffffff", color: "#f59e0b", speed: 0.18, phase: 1.3 },
  { name: "Gemini", src: "https://cdn.simpleicons.org/googlegemini/ffffff", color: "#38bdf8", speed: 0.24, phase: 2.1 },
  { name: "Perplexity", src: "https://cdn.simpleicons.org/perplexity/ffffff", color: "#22d3ee", speed: 0.16, phase: 2.9 },
  { name: "DeepSeek", src: "https://cdn.simpleicons.org/deepseek/ffffff", color: "#f43f5e", speed: 0.27, phase: 3.4 },
  { name: "Claude", src: "https://cdn.simpleicons.org/anthropic/ffffff", color: "#f97316", speed: 0.2, phase: 4.2 },
  { name: "Meta AI", src: "https://cdn.simpleicons.org/meta/ffffff", color: "#60a5fa", speed: 0.23, phase: 5.1 },
  { name: "Mistral", src: "https://cdn.simpleicons.org/mistralai/ffffff", color: "#facc15", speed: 0.19, phase: 5.9 },
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

function useCounter(end: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, end, duration]);
  return count;
}

function Reveal({ children, className = "", delay = 0, y = 40 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const { ref, isVisible } = useInView(0.08);
  return (
    <div ref={ref} className={className} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : `translateY(${y}px)`, transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s` }}>
      {children}
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 mb-6">
      <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-emerald)" }} />
      <span className="text-sm font-semibold" style={{ color: "#71717a" }}>{children}</span>
      <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-blue)", animationDelay: "1s" }} />
    </div>
  );
}

const DOMAINS = [
  "Legal Advisory", "Tax Strategy", "Fitness Programming", "E-commerce Growth",
  "Immigration Law", "Sales Playbooks", "Medical Triage", "Real Estate Analysis",
  "Career Strategy", "Contract Review", "Financial Planning", "Marketing Ops",
];

const MODULES_SHOWCASE = [
  { title: "Lease Reviewer", creator: "Rachel M.", field: "Commercial Law", exp: "12 yr", desc: "Analyse break clauses, dilapidations, and rent review mechanisms in commercial leases.", users: 340, rating: 4.9, color: "var(--accent-blue)" },
  { title: "Outreach Builder", creator: "Mehboob A.", field: "Growth & Sales", exp: "6 yr", desc: "Generate personalised cold outreach sequences that actually get replies.", users: 520, rating: 4.8, color: "var(--accent-emerald)" },
  { title: "Gym Programme", creator: "Dr. James L.", field: "Sports Science", exp: "9 yr", desc: "Evidence-based training programmes tailored to your goals and experience level.", users: 890, rating: 4.9, color: "var(--accent-purple)" },
  { title: "Tax Prep Assistant", creator: "Tom B.", field: "Tax & Accounting", exp: "15 yr", desc: "Find deductions, estimate liability, and prepare self-assessment returns.", users: 410, rating: 4.7, color: "var(--accent-amber)" },
  { title: "Visa Advisor", creator: "Sarah W.", field: "Immigration Law", exp: "8 yr", desc: "Check visa eligibility, required documents, and application timelines.", users: 270, rating: 4.8, color: "var(--accent-red)" },
  { title: "Etsy Optimiser", creator: "Priya K.", field: "E-commerce SEO", exp: "5 yr", desc: "Optimise listings, titles, and tags to rank higher on Etsy search.", users: 630, rating: 4.6, color: "var(--accent-blue)" },
];

const TESTIMONIALS = [
  { name: "David K.", role: "Startup Founder", text: "Got specific lease advice in 2 minutes that would've cost me a £200 consultation. The module actually understood break clauses.", avatar: "DK" },
  { name: "Nina S.", role: "Freelance Designer", text: "The tax module found deductions my accountant missed. Genuinely saved me £1,400 on my self-assessment.", avatar: "NS" },
  { name: "Marcus T.", role: "Gym Owner", text: "I built a programme module and 80+ people use it monthly. It's proper passive income from my actual expertise.", avatar: "MT" },
  { name: "Aisha R.", role: "HR Manager", text: "Immigration visa module gave me exact eligibility criteria for sponsorship. Normally takes weeks of research.", avatar: "AR" },
  { name: "James P.", role: "Property Developer", text: "Ran three commercial lease reviews through it in an afternoon. Each one would've been a £500 solicitor bill.", avatar: "JP" },
  { name: "Laura C.", role: "E-commerce Seller", text: "My Etsy listings went from page 4 to page 1 in two weeks after using the optimiser module.", avatar: "LC" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Find your module", desc: "Browse modules built by verified specialists. Filter by domain, credentials, and ratings.", icon: <Layers className="w-6 h-6" />, color: "var(--accent-blue)" },
  { step: "02", title: "Check the expert", desc: "Every creator shows their real credentials, years of experience, and domain expertise.", icon: <Shield className="w-6 h-6" />, color: "var(--accent-emerald)" },
  { step: "03", title: "Get real answers", desc: "Chat with AI that's been pre-loaded with domain knowledge and the right model for the job.", icon: <MessageSquare className="w-6 h-6" />, color: "var(--accent-purple)" },
];

const FAQ_ITEMS = [
  { q: "What exactly is a module?", a: "A module is a pre-configured AI assistant built by a domain expert. It includes custom instructions, uploaded knowledge documents, and the right AI model — so you get answers informed by real expertise." },
  { q: "How is this different from ChatGPT?", a: "ChatGPT is general-purpose. LayerOn modules are specialist. Each one has been shaped by someone with years of hands-on experience, with their methodology and knowledge baked in." },
  { q: "Who builds the modules?", a: "Real professionals — lawyers, accountants, coaches, marketers, engineers. Every creator shows their credentials publicly. No anonymous creators." },
  { q: "How does pricing work?", a: "You purchase credits that let you chat with any module. Each message costs 5 credits. Packages start at $4.99 for 50 credits. Credits never expire." },
  { q: "Can I build my own module?", a: "Yes. Upload your knowledge, write custom instructions, choose an AI model, and publish. Other users pay credits to use it." },
  { q: "What file types can I upload?", a: "PDF, DOCX, and plain text files. The platform extracts and chunks the content automatically so the AI can reference it during conversations." },
];

function FAQItem({ item, isOpen, onToggle }: { item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid #27272a" }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between py-6 text-left group gentle-animation" data-testid={`faq-${item.q.slice(0, 20)}`}>
        <span className="text-[15px] font-medium pr-8" style={{ color: "#fafafa" }}>{item.q}</span>
        <ChevronDown className="w-5 h-5 shrink-0 transition-transform duration-300" style={{ color: "#52525b", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "200px" : "0", opacity: isOpen ? 1 : 0 }}>
        <p className="text-sm leading-[1.8] pb-6" style={{ color: "#71717a" }}>{item.a}</p>
      </div>
    </div>
  );
}

function LiveChat() {
  const [step, setStep] = useState(0);
  const messages = [
    { role: "user", text: "Review this break clause — what am I actually liable for?" },
    { role: "ai", text: "Rolling break at month 18. Clause 2.3(b) requires 6 months' written notice + vacant possession. Dilapidations capped at 3 months' rent — that's your leverage." },
    { role: "user", text: "What should I push back on?" },
    { role: "ai", text: "Challenge any Schedule 4 items beyond internal repairs — the 7.1 cap doesn't cover landlord improvements. Also negotiate the notice period to 3 months." },
  ];

  useEffect(() => {
    const timers = messages.map((_, i) => setTimeout(() => setStep(i + 1), 600 + i * 1400));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden glass-card">
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "rgba(37,99,235,0.15)", color: "var(--accent-blue)" }}>RM</div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: "#fafafa" }}>Lease Reviewer</p>
            <p className="text-[10px]" style={{ color: "#52525b" }}>Rachel M. · Commercial Law · 12 yr</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-emerald)" }} />
          <span className="text-[10px]" style={{ color: "#52525b" }}>Online</span>
        </div>
      </div>
      <div className="px-5 py-5 space-y-4" style={{ minHeight: 260 }}>
        {messages.slice(0, step).map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} style={{ animation: "fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div className={`max-w-[82%] px-4 py-3 rounded-2xl ${msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
              style={{ backgroundColor: msg.role === "user" ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${msg.role === "user" ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.05)"}` }}>
              <p className="text-[12px] leading-[1.7]" style={{ color: msg.role === "user" ? "#e4e4e7" : "#a1a1aa" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {step < messages.length && (
          <div className="flex justify-start">
            <div className="flex gap-1 px-4 py-3">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#3f3f46" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#3f3f46", animationDelay: "0.15s" }} />
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#3f3f46", animationDelay: "0.3s" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroProviderNetwork({
  mouse,
}: {
  mouse: { x: number; y: number; active: boolean };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1280, height: 720 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setSize({ width: rect.width, height: rect.height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      setTime((now - start) / 1000);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const positions = LLM_PROVIDER_ICONS.map((provider, idx) => {
    const angle = provider.phase + time * provider.speed;
    const spreadX = size.width * 0.44;
    const spreadY = size.height * 0.34;
    const x = size.width / 2 + Math.cos(angle) * spreadX + Math.sin(time * 0.8 + idx) * 24;
    const y = size.height / 2 + Math.sin(angle * 1.25) * spreadY + Math.cos(time * 0.7 + idx) * 20;
    const dx = mouse.x - x;
    const dy = mouse.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hoverBoost = mouse.active ? Math.max(0, 1 - dist / 220) : 0;

    return {
      ...provider,
      x,
      y,
      scale: 1 + hoverBoost * 0.28,
      alpha: 0.5 + hoverBoost * 0.45,
    };
  });

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        {positions.map((p1, i) =>
          positions.slice(i + 1).map((p2) => {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            const opacity = Math.max(0, 0.18 - dist / 1400);
            if (opacity <= 0) return null;
            return (
              <line
                key={`${p1.name}-${p2.name}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(148,163,184,0.45)"
                strokeOpacity={opacity}
                strokeWidth="1"
              />
            );
          })
        )}
      </svg>

      {positions.map((provider) => (
        <div
          key={provider.name}
          className="absolute llm-icon-travel"
          style={{
            left: provider.x,
            top: provider.y,
            transform: `translate(-50%, -50%) scale(${provider.scale})`,
            opacity: provider.alpha,
            filter: `drop-shadow(0 0 16px ${provider.color})`,
          }}
          title={provider.name}
          aria-label={provider.name}
        >
          <img src={provider.src} alt={provider.name} className="w-8 h-8 md:w-10 md:h-10 object-contain" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [heroMouse, setHeroMouse] = useState({ x: 0, y: 0, active: false });
  const [globalMouse, setGlobalMouse] = useState({ x: 0, y: 0, active: false });

  useEffect(() => { setTimeout(() => setHeroLoaded(true), 100); }, []);
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const statsRef = useInView(0.2);
  const usersCount = useCounter(2400, statsRef.isVisible);
  const creatorsCount = useCounter(120, statsRef.isVisible);
  const modulesCount = useCounter(350, statsRef.isVisible);

  return (
    <div
      className="min-h-screen relative"
      style={{ zIndex: 1 }}
      onMouseMove={(event) => setGlobalMouse({ x: event.clientX, y: event.clientY, active: true })}
      onMouseLeave={() => setGlobalMouse((prev) => ({ ...prev, active: false }))}
    >
      <div
        className="global-mouse-glow"
        style={{
          left: globalMouse.x,
          top: globalMouse.y,
          opacity: globalMouse.active ? 0.9 : 0,
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
        backgroundColor: isScrolled ? "rgba(9,9,11,0.85)" : "transparent",
        backdropFilter: isScrolled ? "blur(20px) saturate(1.8)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <span className="font-bagel text-xl tracking-wider cursor-pointer" style={{ color: "#fafafa" }} onClick={() => setLocation("/")} data-testid="link-home">LAYERON</span>
            <div className="hidden md:flex items-center gap-8">
              {[
                ["Explore", "/explore"],
                ["How it works", "#how-it-works"],
                ["Creators", "#creators"],
                ["Pricing", "/billing"],
              ].map(([label, href]) => (
                <button key={label} onClick={() => href.startsWith("#") ? document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" }) : setLocation(href)} className="text-sm font-medium gentle-animation hover:scale-105" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <button onClick={() => setLocation("/dashboard")} className="text-sm font-medium px-4 py-2 rounded-lg gentle-animation hover:scale-105" style={{ color: "rgba(255,255,255,0.7)" }} data-testid="button-dashboard">Dashboard</button>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
              </>
            ) : (
              <>
                <button onClick={() => setLocation("/sign-in")} className="text-sm font-medium px-4 py-2 rounded-lg gentle-animation" style={{ color: "rgba(255,255,255,0.6)" }} data-testid="button-login">Log in</button>
                <button onClick={() => setLocation("/sign-up")} className="text-sm font-semibold px-6 py-2.5 rounded-lg gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-get-started">Get started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh" }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setHeroMouse({ x: event.clientX - rect.left, y: event.clientY - rect.top, active: true });
        }}
        onMouseLeave={() => setHeroMouse((prev) => ({ ...prev, active: false }))}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.04) 50%, rgba(5,150,105,0.06) 100%)" }} />

        <HeroProviderNetwork mouse={heroMouse} />

        <div className="absolute top-20 left-20 w-4 h-4 rounded-full float-gentle" style={{ backgroundColor: "var(--accent-blue)", opacity: 0.4 }} />
        <div className="absolute top-40 right-32 w-6 h-6 rounded-full drift-right" style={{ backgroundColor: "var(--accent-emerald)", opacity: 0.3 }} />
        <div className="absolute bottom-32 left-1/4 w-5 h-5 rounded-full drift-left" style={{ backgroundColor: "var(--accent-purple)", opacity: 0.35 }} />
        <div className="absolute top-1/3 right-1/5 w-3 h-3 rounded-full float-gentle" style={{ backgroundColor: "var(--accent-amber)", opacity: 0.25, animationDelay: "2s" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center" style={{ minHeight: "100vh", paddingTop: 100, paddingBottom: 100 }}>
          <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(15px)", transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s" }}>
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-8 glass-effect">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-emerald)" }} />
              <span className="text-xs font-semibold tracking-wide" style={{ color: "#a1a1aa" }}>Expert-built AI modules for real work</span>
            </div>
          </div>

          <h1 className="font-black leading-[1.05] tracking-tight mb-8 max-w-5xl text-shadow-strong" style={{
            fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
            color: "#fafafa",
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? "translateY(0)" : "translateY(25px)",
            transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
          }}>
            AI shaped by people who{" "}
            <span style={{ color: "var(--accent-blue)" }}>actually know</span>{" "}
            the work.
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{
            color: "#71717a",
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
          }}>
            Browse ready-to-use modules from trusted creators. Get domain-specific answers from AI that's been pre-loaded with real expertise.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16" style={{
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s",
          }}>
            <button onClick={() => setLocation("/explore")} className="text-sm font-semibold px-8 py-3.5 rounded-lg inline-flex items-center gap-2 glass-effect gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }} data-testid="button-browse-marketplace">
              Browse modules <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setLocation(isSignedIn ? "/create" : "/sign-up")} className="text-sm font-medium px-8 py-3.5 rounded-lg inline-flex items-center gap-2 glass-effect gentle-animation" style={{ color: "rgba(255,255,255,0.8)" }} data-testid="button-build-earn">
              Build a module <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6" style={{
            opacity: heroLoaded ? 1 : 0, transition: "opacity 1s ease 1s",
          }}>
            <div className="flex -space-x-2.5">
              {["RK", "NP", "TJ", "AS", "MC"].map((init, i) => (
                <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: "#18181b", color: "#a1a1aa", border: "2px solid #09090b", zIndex: 5 - i }}>{init}</div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5" fill="var(--accent-amber)" style={{ color: "var(--accent-amber)" }} />)}
              <span className="text-xs ml-1 font-medium" style={{ color: "#71717a" }}>2,400+ professionals</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #09090b)" }} />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ opacity: heroLoaded ? 0.4 : 0, transition: "opacity 1s ease 1.5s", animation: "scrollBounce 2s ease-in-out infinite" }}>
          <div className="w-5 h-8 rounded-full flex justify-center pt-1.5" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="w-1 h-2 rounded-full animate-scroll-dot" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden" style={{ borderTop: "1px solid #27272a", borderBottom: "1px solid #27272a" }}>
        <div className="py-5">
          <div className="animate-marquee flex items-center whitespace-nowrap" style={{ width: "max-content" }}>
            {[...DOMAINS, ...DOMAINS, ...DOMAINS].map((item, idx) => (
              <span key={idx} className="flex items-center gap-8 px-8">
                <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "#3f3f46" }}>{item}</span>
                <span className="text-[6px]" style={{ color: "#27272a" }}>&#9679;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef.ref} className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <Reveal>
            <SectionBadge>Trusted by professionals</SectionBadge>
            <h2 className="font-black leading-tight mb-8" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fafafa" }}>
              Real expertise.<br />Real results.
            </h2>
          </Reveal>
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { value: usersCount, suffix: "+", label: "Professionals using LayerOn", color: "var(--accent-blue)" },
              { value: creatorsCount, suffix: "+", label: "Verified expert creators", color: "var(--accent-emerald)" },
              { value: modulesCount, suffix: "+", label: "Ready-to-use modules", color: "var(--accent-purple)" },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1} className="text-center py-8">
                <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: s.color }}>{s.value}{s.suffix}</p>
                <p className="text-xs" style={{ color: "#52525b" }}>{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-2xl p-8 md:p-12 glass-card">
              <div>
                <SectionBadge>See it in action</SectionBadge>
                <h2 className="font-black leading-tight mb-5" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "#fafafa" }}>
                  Expert knowledge,<br />instant answers.
                </h2>
                <p className="text-sm leading-[1.8] mb-8" style={{ color: "#71717a" }}>
                  Each module is pre-loaded with domain-specific knowledge, custom instructions, and the right AI model. You're chatting with expertise, not a generic bot.
                </p>
                <div className="space-y-3">
                  {[
                    { text: "Pre-loaded with expert documents", color: "var(--accent-blue)" },
                    { text: "Custom instructions from specialists", color: "var(--accent-emerald)" },
                    { text: "Right AI model for each use case", color: "var(--accent-purple)" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)` }}>
                        <Check className="w-3 h-3" style={{ color: item.color }} />
                      </div>
                      <span className="text-[13px]" style={{ color: "#a1a1aa" }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <LiveChat />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="how-it-works" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal className="text-center mb-20">
            <SectionBadge>How it works</SectionBadge>
            <h2 className="font-black leading-tight mb-8" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fafafa" }}>
              Three steps to<br />better answers.
            </h2>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#71717a" }}>Browse, verify, and chat — that's it.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, idx) => (
              <Reveal key={idx} delay={idx * 0.12} className="group relative p-8 rounded-2xl glass-card gentle-animation hover:elevated-shadow">
                <div className="absolute top-6 right-6 text-[56px] font-black leading-none" style={{ color: "rgba(255,255,255,0.03)" }}>{item.step}</div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 10%, transparent)`, color: item.color }}>{item.icon}</div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "#fafafa" }}>{item.title}</h3>
                <p className="text-sm leading-[1.7]" style={{ color: "#71717a" }}>{item.desc}</p>
                <div className="flex space-x-2 mt-6">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--accent-blue)" }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--accent-emerald)" }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--accent-purple)" }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <SectionBadge>Featured modules</SectionBadge>
              <h2 className="font-black leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fafafa" }}>
                Built by people who<br />know the domain.
              </h2>
            </div>
            <button onClick={() => setLocation("/explore")} className="text-sm font-semibold inline-flex items-center gap-1.5 gentle-animation hover:scale-105" style={{ color: "var(--accent-blue)" }} data-testid="link-view-all">
              View all modules <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES_SHOWCASE.map((m, idx) => (
              <Reveal key={idx} delay={idx * 0.06}>
                <button onClick={() => setLocation("/explore")} className="w-full text-left p-6 rounded-2xl glass-card gentle-animation hover:elevated-shadow group" data-testid={`module-card-${idx}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${m.color} 12%, transparent)`, color: m.color }}>
                      {m.creator.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" fill="var(--accent-amber)" style={{ color: "var(--accent-amber)" }} />
                      <span className="text-[11px] font-medium" style={{ color: "#71717a" }}>{m.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-[15px] font-bold mb-1 group-hover:text-(--accent-blue) transition-colors" style={{ color: "#fafafa" }}>{m.title}</h3>
                  <p className="text-[11px] mb-3 font-medium" style={{ color: m.color }}>{m.creator} · {m.field} · {m.exp}</p>
                  <p className="text-[12px] leading-[1.6] mb-5 line-clamp-2" style={{ color: "#71717a" }}>{m.desc}</p>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: "#52525b" }}>
                    <Users className="w-3 h-3" /> {m.users} users
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal className="text-center mb-16">
            <SectionBadge>The difference</SectionBadge>
            <h2 className="font-black leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fafafa" }}>Generic AI vs. expert AI.</h2>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="p-8 rounded-2xl glass-card gentle-animation">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid #27272a" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "#52525b" }}>Generic chatbot</span>
                </div>
                <p className="text-[13px] italic leading-[1.7] mb-6" style={{ color: "#52525b" }}>
                  "A break clause allows a tenant to end the lease early. You should review the terms and consult a solicitor for specific advice."
                </p>
                <div className="space-y-2">
                  {["Vague, textbook response", "No specific clause analysis", "Suggests you hire someone else"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#3f3f46" }} />
                      <span className="text-[11px]" style={{ color: "#52525b" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 rounded-2xl relative overflow-hidden gentle-animation pulse-glow" style={{ backgroundColor: "rgba(37,99,235,0.03)", border: "1px solid rgba(37,99,235,0.15)" }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)" }} />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--accent-blue)" }}>Lease Reviewer on LayerOn</span>
                  </div>
                  <p className="text-[13px] leading-[1.7] mb-6" style={{ color: "#a1a1aa" }}>
                    "Rolling break at month 18. Clause 2.3(b) requires 6 months' written notice + vacant possession. Dilapidations capped at 3 months' rent — push back on Schedule 4 items."
                  </p>
                  <div className="space-y-2">
                    {["Pinpoints exact clauses", "Actionable legal strategy", "Built by a 12-year commercial lawyer"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" style={{ color: "var(--accent-emerald)" }} />
                        <span className="text-[11px]" style={{ color: "#a1a1aa" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="creators" className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <Reveal>
              <SectionBadge>For creators</SectionBadge>
              <h2 className="font-black leading-tight mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#fafafa" }}>
                Turn your expertise<br />into a product.
              </h2>
              <p className="text-base leading-[1.8] mb-10" style={{ color: "#71717a" }}>
                You've spent years learning your craft. Package that knowledge into an AI module that works for people 24/7.
              </p>
              <div className="space-y-6">
                {[
                  { icon: <Upload className="w-5 h-5" />, title: "Upload your knowledge", desc: "PDFs, documents, playbooks — your proprietary knowledge becomes the module's foundation.", color: "var(--accent-blue)" },
                  { icon: <Settings className="w-5 h-5" />, title: "Write your instructions", desc: "Tell the AI how to think, what to prioritise, and how to communicate.", color: "var(--accent-emerald)" },
                  { icon: <Brain className="w-5 h-5" />, title: "Choose your model", desc: "Pick the AI model that fits your domain best. GPT-4o, Claude, Gemini — you decide.", color: "var(--accent-purple)" },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl glass-card gentle-animation">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${step.color} 12%, transparent)`, color: step.color }}>{step.icon}</div>
                    <div>
                      <h4 className="text-[14px] font-bold mb-1" style={{ color: "#fafafa" }}>{step.title}</h4>
                      <p className="text-[12px] leading-[1.7]" style={{ color: "#71717a" }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setLocation(isSignedIn ? "/create" : "/sign-up")} className="mt-10 text-sm font-semibold px-7 py-3.5 rounded-lg inline-flex items-center gap-2 gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-start-creating">
                Start creating <ArrowRight className="w-4 h-4" />
              </button>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {MODULES_SHOWCASE.slice(0, 4).map((m, i) => (
                  <div key={i} className="p-5 rounded-xl glass-card gentle-animation">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold mb-3" style={{ backgroundColor: `color-mix(in srgb, ${m.color} 12%, transparent)`, color: m.color }}>
                      {m.creator.split(" ").map(w => w[0]).join("")}
                    </div>
                    <p className="text-[13px] font-bold mb-0.5" style={{ color: "#fafafa" }}>{m.title}</p>
                    <p className="text-[10px] mb-2" style={{ color: "#52525b" }}>{m.creator}</p>
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: "#3f3f46" }}>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {m.users}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" fill="var(--accent-amber)" style={{ color: "var(--accent-amber)" }} /> {m.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal className="text-center mb-16">
            <SectionBadge>Testimonials</SectionBadge>
            <h2 className="font-black leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fafafa" }}>Loved by professionals.</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={idx} delay={idx * 0.06} className="p-7 rounded-2xl glass-card gentle-animation hover:elevated-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5" fill="var(--accent-amber)" style={{ color: "var(--accent-amber)" }} />)}
                </div>
                <p className="text-[13px] leading-[1.7] mb-6" style={{ color: "#a1a1aa" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#18181b", color: "#a1a1aa" }}>{t.avatar}</div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: "#fafafa" }}>{t.name}</p>
                    <p className="text-[11px]" style={{ color: "#52525b" }}>{t.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <Reveal className="text-center mb-12">
            <SectionBadge>FAQ</SectionBadge>
            <h2 className="font-black leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#fafafa" }}>Common questions.</h2>
          </Reveal>
          <Reveal>
            <div style={{ borderTop: "1px solid #27272a" }}>
              {FAQ_ITEMS.map((item, idx) => (
                <FAQItem key={idx} item={item} isOpen={openFaq === idx} onToggle={() => setOpenFaq(openFaq === idx ? null : idx)} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal>
            <div className="text-center py-20 px-8 rounded-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(124,58,237,0.04) 50%, rgba(5,150,105,0.06) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="relative">
                <h2 className="font-black leading-tight mb-6 max-w-3xl mx-auto" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "#fafafa" }}>
                  Stop settling for<br />generic AI.
                </h2>
                <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "#71717a" }}>
                  Get answers from AI that's been shaped by people who actually know your domain.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => setLocation(isSignedIn ? "/explore" : "/sign-up")} className="text-sm font-semibold px-8 py-3.5 rounded-lg inline-flex items-center gap-2 gentle-animation hover:scale-105" style={{ backgroundColor: "var(--accent-blue)", color: "#fff" }} data-testid="button-cta-final">
                    Get started free <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setLocation("/explore")} className="text-sm font-medium px-8 py-3.5 rounded-lg glass-effect gentle-animation" style={{ color: "rgba(255,255,255,0.8)" }}>
                    Browse modules
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer style={{ backgroundColor: "#09090b", borderTop: "1px solid #27272a" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 md:col-span-4">
              <span className="font-bagel text-3xl tracking-wider" style={{ color: "#fafafa" }}>LAYERON</span>
              <p className="text-sm leading-[1.8] mt-4 mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>Expert-built AI modules for real work. Tools shaped by people who know the domain.</p>
              <div className="flex items-center gap-4">
                {["X", "Li", "In"].map((s, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold gentle-animation hover:scale-110 cursor-pointer" style={{ backgroundColor: "#18181b", color: "#71717a" }}>{s}</div>
                ))}
              </div>
            </div>
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#fafafa" }}>Product</p>
                  <div className="space-y-3">
                    {[["Explore modules", "/explore"], ["Create a module", "/create"], ["Pricing", "/billing"], ["Dashboard", "/dashboard"]].map(([label, href]) => (
                      <button key={label} onClick={() => setLocation(href)} className="block text-sm font-medium gentle-animation" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#fafafa" }}>Company</p>
                  <div className="space-y-3">
                    {["About", "Creators", "Blog", "Contact"].map((label) => (
                      <p key={label} className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#fafafa" }}>Legal</p>
                  <div className="space-y-3">
                    {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label) => (
                      <p key={label} className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 mt-16" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>&copy; {new Date().getFullYear()} LayerOn. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Secured by Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

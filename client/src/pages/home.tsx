import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@clerk/clerk-react";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";
import { Reveal } from "@/components/layer/Reveal";

const EXPERTS = [
  { name: "Rachel M.", role: "Commercial Law · 12 yr" },
  { name: "Dr. James L.", role: "Sports Medicine · 15 yr" },
  { name: "Tom B.", role: "CPA, EA · 9 yr" },
  { name: "Mehboob A.", role: "Sales Ops · 7 yr" },
  { name: "Aisha R.", role: "Immigration Law · 11 yr" },
  { name: "Marcus T.", role: "Strength Coach · 14 yr" },
  { name: "Nina P.", role: "Tax Strategy · 10 yr" },
  { name: "David K.", role: "Real Estate · 18 yr" },
];

const CATEGORIES = [
  { className: "cat-acid", name: "Acid", domain: "Legal", hex: "#D4FF3A", count: "62 modules" },
  { className: "cat-coral", name: "Coral", domain: "Fitness & Health", hex: "#FF7A5C", count: "89 modules" },
  { className: "cat-sage", name: "Sage", domain: "Finance & Tax", hex: "#7A9171", count: "71 modules" },
  { className: "cat-plum", name: "Plum", domain: "Sales & Strategy", hex: "#4A2D52", count: "54 modules" },
  { className: "cat-gold", name: "Gold", domain: "Premium tier", hex: "#E0A23B", count: "38 modules" },
];

const MODULES = [
  { band: "band-acid", pill: "★ Verified · Legal", tier: "RM", tierGold: false, name: "Lease Reviewer", by: "Rachel M. · ex-Linklaters", uses: 340, rating: 4.9, price: "£0.40" },
  { band: "band-coral", pill: "★ Verified · Fitness", tier: "DJ", tierGold: true, name: "Gym Programme", by: "Dr. James L. · Sports Med", uses: 890, rating: 4.9, price: "£0.30" },
  { band: "band-sage", pill: "★ Verified · Finance", tier: "TB", tierGold: false, name: "Tax Prep Assistant", by: "Tom B. · CPA, EA", uses: 410, rating: 4.7, price: "£0.45" },
  { band: "band-plum", pill: "★ Verified · Sales", tier: "MA", tierGold: false, name: "Outreach Builder", by: "Mehboob A. · Sales Ops", uses: 520, rating: 4.8, price: "£0.35" },
  { band: "band-acid", pill: "★ Verified · Legal", tier: "AR", tierGold: false, name: "Visa Eligibility", by: "Aisha R. · Immigration Law", uses: 270, rating: 4.9, price: "£0.50" },
  { band: "band-coral", pill: "★ Verified · Fitness", tier: "MT", tierGold: false, name: "Strength Coach", by: "Marcus T. · 14 yr coaching", uses: 620, rating: 4.8, price: "£0.30" },
  { band: "band-sage", pill: "★ Verified · Finance", tier: "NP", tierGold: false, name: "Tax Strategy Pro", by: "Nina P. · Senior CPA", uses: 340, rating: 4.8, price: "£0.55" },
  { band: "band-gold", pill: "★ Premium · Real Estate", tier: "DK", tierGold: true, name: "Deal Underwriter", by: "David K. · 18 yr investing", uses: 180, rating: 4.9, price: "£1.20" },
];

const FAQ_ITEMS = [
  {
    q: "How is this different from just using ChatGPT with a long prompt?",
    a: (
      <p>
        Three real differences: <strong>(1)</strong> the modules are built by domain experts who upload their actual reviewed work — case files, training programs, tax returns — not just a prompt; <strong>(2)</strong> we run a verification process so you know the credentials are real; <strong>(3)</strong> the expert chooses the underlying model, gives the system instructions, and gets paid for every chat. None of that happens when you write a prompt yourself.
      </p>
    ),
  },
  {
    q: "Are the experts actually answering, or is it just AI?",
    a: (
      <>
        <p>
          It's AI — we're transparent about that. But the AI has been loaded with the expert's specific knowledge, voice, and instructions. So when you ask Rachel's module about a lease clause, the AI answers in <em>her</em> voice with <em>her</em> playbook. It's not Rachel typing. It's a model that's been trained to think like Rachel does.
        </p>
        <p>
          For complex matters, the modules will explicitly flag <em>"this is the kind of question that needs the human"</em> and offer to book Rachel directly.
        </p>
      </>
    ),
  },
  {
    q: "What stops a fake expert from creating a module?",
    a: (
      <p>
        Every creator submits credentials, two professional references, and a sample of their work. We verify all three before they can publish. Industry-specific verification varies — for legal we check bar registration; for medical we verify licensure; for finance we check certification numbers. <strong>About 38% of applicants get through.</strong> The rest get specific feedback on what's missing.
      </p>
    ),
  },
  {
    q: "What if a module gives me wrong advice?",
    a: (
      <p>
        Modules are advisory, not legally binding. But because every chat carries the expert's name and credentials, we hold creators accountable in ways generic AI doesn't. <strong>Repeated quality issues mean the module gets pulled and the credit refunded.</strong> Top-tier modules carry an additional accuracy guarantee — read the module's about page for specifics.
      </p>
    ),
  },
  {
    q: "What does it cost?",
    a: (
      <p>
        Credits start at £4.99 for 50. Each chat is 5 credits. Premium tier modules cost more per chat — they're built by senior practitioners with deeper specialty. Credits don't expire. <strong>You can run a full lease review for under a pound.</strong> A standard solicitor consultation in the UK runs £200-400.
      </p>
    ),
  },
  {
    q: "I'm an expert. How much will I make?",
    a: (
      <>
        <p>
          Honestly, it depends on demand for your domain and how good your module is. Our top quartile of creators earns over £1,400/month. The median is around £180/month. The bottom quartile earns less than £20/month — usually because they didn't upload enough material or didn't write tight system instructions.
        </p>
        <p>
          What we can promise: <strong>70% of every chat fee goes to the creator.</strong> No exclusivity, no minimum hours, no quotas. You build it, it runs, you get paid.
        </p>
      </>
    ),
  },
];

function FAQItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button
        className="faq-summary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        data-testid={`faq-${q.slice(0, 20)}`}
      >
        <h4>{q}</h4>
        <span className="faq-toggle" aria-hidden />
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? 600 : 0,
          opacity: open ? 1 : 0,
          transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease",
        }}
      >
        <div className="answer">{a}</div>
      </div>
    </div>
  );
}

const HERO_SCENARIOS: Array<{ who: string; not: string }> = [
  { who: "12-year commercial lawyer", not: "a foundation model." },
  { who: "sports-medicine doctor", not: "an AI summary." },
  { who: "CPA who actually files returns", not: "a Reddit consensus." },
  { who: "strength coach with 14 years on the floor", not: "a YouTube workout video." },
  { who: "M&A banker who's closed 80+ deals", not: "a CNBC explainer." },
  { who: "immigration lawyer reading case files daily", not: "a visa-blog post." },
  { who: "real-estate underwriter, 18 years deep", not: "a Zillow estimate." },
  { who: "tax strategist who saved clients £4M last year", not: "an HMRC FAQ." },
];

function HeroRotator() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  const scenario = HERO_SCENARIOS[idx];
  const full = `${scenario.who}, not ${scenario.not}`;
  const whoLen = scenario.who.length;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setText(full);
      return;
    }

    let timer: number | undefined;

    if (phase === "typing") {
      if (text.length < full.length) {
        const nextChar = full[text.length];
        // Natural cadence: brief beat after punctuation, slight variance on letters
        const delay =
          nextChar === "," || nextChar === "."
            ? 240
            : nextChar === " "
            ? 55
            : 26 + Math.random() * 36;
        timer = window.setTimeout(() => setText(full.slice(0, text.length + 1)), delay);
      } else {
        // Hold the completed phrase, then start deleting
        timer = window.setTimeout(() => setPhase("deleting"), 1700);
      }
    } else {
      if (text.length > 0) {
        timer = window.setTimeout(() => setText(text.slice(0, -1)), 14);
      } else {
        // Tiny gap, then advance to next scenario and start typing again
        timer = window.setTimeout(() => {
          setIdx((i) => (i + 1) % HERO_SCENARIOS.length);
          setPhase("typing");
        }, 220);
      }
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [text, phase, full]);

  const typed =
    text.length <= whoLen ? (
      <strong>{text}</strong>
    ) : (
      <>
        <strong>{scenario.who}</strong>
        <span className="hero-rotator-foil">{text.slice(whoLen)}</span>
      </>
    );

  return (
    <div className="hero-rotator" data-reveal>
      <span className="hero-rotator-prefix">Talk to a</span>
      <p className="hero-rotator-line" aria-live="polite" aria-atomic="true">
        {typed}
        <span className="hero-rotator-cursor" aria-hidden="true">│</span>
      </p>
    </div>
  );
}

function HeroStack() {
  const stageRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const stage = stageRef.current;
    const stack = stackRef.current;
    if (!stage || !stack) return;

    let tx = 0, ty = 0, ax = 0, ay = 0, raf: number | null = null, hovering = false;
    const tick = () => {
      ax += (tx - ax) * 0.08;
      ay += (ty - ay) * 0.08;
      if (!hovering) stack.style.transform = `rotateX(${ay}deg) rotateY(${ax}deg)`;
      if (Math.abs(tx - ax) > 0.02 || Math.abs(ty - ay) > 0.02) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = ((e.clientX - cx) / window.innerWidth) * 8;
      ty = -((e.clientY - cy) / window.innerHeight) * 6;
      kick();
    };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; tx = 0; ty = 0; kick(); };

    window.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="stack-stage" ref={stageRef} aria-hidden="true">
      <div className="stack-side-label label-l1"><span className="num">01</span>Foundation</div>
      <div className="stack-side-label label-l4"><span className="num">04</span>You chat with this</div>

      <div className="stack" ref={stackRef}>
        <div className="layer layer-1">
          <div className="layer-head">
            <span className="layer-tag">01 · Foundation Model</span>
            <span className="layer-meta">Generic</span>
          </div>
          <div className="layer-line">Trained on the open web</div>
          <div className="layer-line">No domain specialty</div>
        </div>

        <div className="layer layer-2">
          <div className="layer-head">
            <span className="layer-tag">02 · Domain Knowledge</span>
            <span className="layer-meta">+ books</span>
          </div>
          <div className="layer-line">UK property statutes 1925→2024</div>
          <div className="layer-line">200+ landmark case law citations</div>
        </div>

        <div className="layer layer-3">
          <div className="layer-head">
            <span className="layer-tag">03 · Expert Training</span>
            <span className="layer-meta">+ Rachel</span>
          </div>
          <div className="layer-line">Rachel M.'s 12 years of practice</div>
          <div className="layer-line">500+ commercial leases reviewed</div>
        </div>

        <div className="layer layer-4">
          <div className="layer-head">
            <span className="layer-tag">04 · LEASE REVIEWER</span>
            <span className="layer-meta">★ Live</span>
          </div>
          <div className="layer-4-chat">
            <div className="chat-q">"Can I break my lease at month 18?"</div>
            <div className="chat-a">
              Your <b>clause 2.3(b)</b> grants a rolling break — six months' notice + vacant possession. Dilapidations capped at three months' rent. <b>That's your leverage.</b>
            </div>
          </div>
          <div className="layer-author">
            <div className="av">RM</div>
            <div className="nm"><strong>Rachel M.</strong> Commercial Law · 12 yr</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ m }: { m: typeof MODULES[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const card = cardRef.current;
    if (!card) return;
    let rx = 0, ry = 0, arx = 0, ary = 0, raf: number | null = null;
    const tick = () => {
      arx += (rx - arx) * 0.12;
      ary += (ry - ary) * 0.12;
      card.style.transform = `perspective(1200px) rotateX(${arx}deg) rotateY(${ary}deg)`;
      if (Math.abs(rx - arx) > 0.01 || Math.abs(ry - ary) > 0.01) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry = px * 12;
      rx = -py * 8;
      kick();
    };
    const onLeave = () => { rx = 0; ry = 0; kick(); };
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="module-card" ref={cardRef}>
      <div className={`module-band ${m.band}`}>
        <span className="band-pill">{m.pill}</span>
        <span className={`band-tier ${m.tierGold ? "gold" : ""}`}>{m.tier}</span>
      </div>
      <div className="module-body">
        <div className="module-name">{m.name}</div>
        <div className="module-by">{m.by}</div>
        <div className="module-stats">
          <div><b>{m.uses}</b>uses</div>
          <div><b>{m.rating}</b>rating</div>
          <div><b>{m.price}</b>per chat</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All · 350");

  // Magnetic + reveal hookups
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reveal-on-scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 80, 500)}ms`;
      io.observe(el);
    });

    if (reduceMotion) return () => io.disconnect();

    // Magnetic buttons
    const cleanups: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((btn) => {
      let dx = 0, dy = 0, ax = 0, ay = 0, raf: number | null = null;
      const tick = () => {
        ax += (dx - ax) * 0.18;
        ay += (dy - ay) * 0.18;
        btn.style.transform = `translate(${ax}px,${ay}px)`;
        if (Math.abs(dx - ax) > 0.05 || Math.abs(dy - ay) > 0.05) raf = requestAnimationFrame(tick);
        else raf = null;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        dx = Math.max(-12, Math.min(12, (e.clientX - cx) * 0.35));
        dy = Math.max(-12, Math.min(12, (e.clientY - cy) * 0.35));
        kick();
      };
      const onLeave = () => { dx = 0; dy = 0; kick(); };
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", onLeave);
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => {
      io.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const goExplore = () => setLocation("/explore");
  const goCreate = () => setLocation(isSignedIn ? "/create" : "/sign-up");

  return (
    <div style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <LayerNav />

      {/* HERO */}
      <header className="hero layer-divider" style={{ position: "relative", padding: "4rem 0 6rem", overflow: "hidden" }}>
        <div className="layer-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1fr",
              gap: "4rem",
              alignItems: "center",
              minHeight: 620,
            }}
            className="hero-grid"
          >
            <div>
              <div className="hero-trust" data-reveal>
                <span className="badge">Y</span>
                Backed by 120+ verified domain experts
              </div>
              <h1 className="hero-title" data-reveal>
                Want advice from<br />
                people who <span className="it">actually do</span><br />
                the <span className="ac">work?</span>
              </h1>
              <p className="hero-q" data-reveal>"We hired them. You chat with them."</p>
              <p className="hero-sub" data-reveal>
                LayerOn is a marketplace of AI modules built by domain experts.
              </p>
              <HeroRotator />
              <div className="hero-cta" data-reveal>
                <button className="btn btn-acid btn-lg" data-magnetic onClick={goExplore} data-testid="hero-cta-browse">
                  Browse 350+ modules <span className="arrow">→</span>
                </button>
                <button className="btn btn-outline btn-lg" data-magnetic data-testid="hero-cta-demo">
                  Watch a 90-second demo
                </button>
              </div>
            </div>
            <HeroStack />
          </div>
        </div>

        <style>{`
          @media (max-width: 1000px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; min-height: auto !important; }
          }
          @media (max-width: 768px) {
            .hero { padding: 2.5rem 0 4rem !important; }
          }
        `}</style>
      </header>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {[...EXPERTS, ...EXPERTS].map((e, i) => (
            <span key={i} className="name">
              {e.name}<span className="role">{e.role}</span>
            </span>
          ))}
        </div>
      </div>

      {/* WHAT IT IS */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">01</span> What LayerOn is</span>
          <h2 data-reveal style={{ fontSize: "var(--t-5)", marginBottom: "1.25rem" }}>
            Generic AI gives <span className="it">vague</span> advice. <br />LayerOn loads in <span className="it">the expert.</span>
          </h2>

          <div className="what-grid">
            <div className="what-col" data-reveal>
              <h4>Each module is a person.</h4>
              <p>
                Every LayerOn module starts with a <strong>real domain expert</strong> — a lawyer, a doctor, a CPA, a sales lead. They upload their methodology, their reviewed work, their playbooks. The model is loaded with their specific knowledge, not a Wikipedia synthesis.
              </p>
            </div>
            <div className="what-col" data-reveal>
              <h4>You chat. They've prepared.</h4>
              <p>
                When you ask a question, you're not running a fresh prompt against GPT. You're hitting a pre-loaded module that already knows the case law, the contraindications, the tax brackets, the playbook. <strong>The expertise is built in before you arrive.</strong>
              </p>
            </div>
            <div className="what-col" data-reveal>
              <h4>We pay the experts.</h4>
              <p>
                Every time someone uses a module, the expert who built it gets paid. <strong>Real income for the people who actually do the work</strong> — and that's why the best ones agree to put their craft on the platform in the first place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FIVE LAYERS */}
      <section id="how" className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">02</span> How it works</span>
          <h2 className="five-title runon" data-reveal>
            Fivelayers<br />betweenyou<br />and<span className="it">badadvice.</span>
          </h2>
          <p className="lead" data-reveal style={{ marginTop: "1.5rem" }}>
            Read it as five words or one — every LayerOn module is built in the same five steps. The result is what you chat with.
          </p>

          <div className="five-grid">
            {[
              { n: "01", h: "The expert applies.", p: "Rachel — 12 years at Magic Circle litigation, ex-Linklaters — submits her credentials, two reference partners, and a sample of her commercial lease analyses. Our verification team checks every line. Not everyone gets in." },
              { n: "02", h: "She uploads her brain.", p: "Five hundred lease reviews she's done. The annotated playbook her firm uses internally. Statutes she references most. Email exchanges where she explained complex clauses to laypeople. The model now has her reasoning, not just her conclusions." },
              { n: "03", h: "She writes the instructions.", p: "Tone, escalation rules, what to refuse, when to push back, what to flag for human review. Her instructions, not ours. The same way she'd brief a junior associate on her team." },
              { n: "04", h: "We choose the model.", p: "Different domains need different foundations. Legal benefits from Claude's careful reasoning. Sales benefits from GPT-4o's rapport. Medical needs the most cautious model on the market. The expert picks; we wire it up." },
              { n: "05", h: "You chat with the result.", p: "You ask a question about your lease. The module answers in Rachel's voice, with her playbook, citing the same cases she'd cite. You don't get \"consult a lawyer\" — you get her actual advice, every time, for fewer credits than a coffee." },
            ].map((row) => (
              <div key={row.n} className="five-row" data-reveal>
                <div className="five-num">{row.n}</div>
                <h4>{row.h}</h4>
                <p>{row.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">03</span> Categories</span>
          <h2 data-reveal style={{ fontSize: "var(--t-5)", marginBottom: "1.25rem" }}>
            One color <span className="it">per domain.</span> Always.
          </h2>
          <p className="lead" data-reveal>
            Every LayerOn category gets a single color. Once you learn the system — acid is legal, coral is fitness, sage is finance, plum is sales — you can scan the marketplace at a glance.
          </p>

          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <div key={c.name} className={`cat-card ${c.className}`} onClick={goExplore} data-testid={`cat-${c.name}`}>
                <div>
                  <div className="cat-name">— {c.name}</div>
                  <div className="cat-domain">{c.domain}</div>
                </div>
                <div>
                  <div className="cat-hex">{c.hex}</div>
                  <div className="cat-count"><span>{c.count}</span><span>—→</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="layer-section layer-divider">
        <div className="layer-container">
          <div className="browser-head">
            <div>
              <span className="eyebrow"><span className="num">04</span> The marketplace</span>
              <h2 data-reveal style={{ fontSize: "var(--t-5)", marginBottom: 0 }}>
                Built by people <span className="it">you'd hire.</span>
              </h2>
            </div>
            <div className="filter-row">
              {["All · 350", "Legal", "Fitness", "Finance", "Sales", "Premium ★"].map((f) => (
                <button
                  key={f}
                  className={`filter-chip ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="modules-grid">
            {MODULES.map((m, i) => (
              <ModuleCard key={i} m={m} />
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">05</span> Pricing</span>
          <h2 data-reveal style={{ fontSize: "var(--t-5)", marginBottom: "1.25rem" }}>
            Pay <span className="it">per chat,</span> not per month.
          </h2>
          <p className="lead" data-reveal>
            You buy credits. Each chat costs five credits. Credits never expire. The expert who built the module gets paid every time you use it.
          </p>

          <div className="price-grid">
            <div className="price-card">
              <div className="price-name">Starter</div>
              <div className="price-amt">£4<span>.99</span></div>
              <div className="price-credits">50 credits · 10 chats</div>
              <ul className="price-features">
                <li>Try any module</li>
                <li>Save chat history</li>
                <li>Credits never expire</li>
              </ul>
              <button className="price-cta" onClick={() => setLocation("/billing")}>Get started</button>
            </div>
            <div className="price-card featured">
              <div className="price-name">Pro</div>
              <div className="price-amt">£24<span>.99</span></div>
              <div className="price-credits">300 credits · 60 chats</div>
              <ul className="price-features">
                <li>Save expert favourites</li>
                <li>Priority module support</li>
                <li>15% discount on premium tier</li>
                <li>Early access to new modules</li>
              </ul>
              <button className="price-cta" onClick={() => setLocation("/billing")}>Most picked</button>
            </div>
            <div className="price-card">
              <div className="price-name">Studio</div>
              <div className="price-amt">£99<span>.00</span></div>
              <div className="price-credits">1,500 credits · 300 chats</div>
              <ul className="price-features">
                <li>Multi-seat workspace</li>
                <li>API access</li>
                <li>Custom module commissions</li>
                <li>Direct line to creators</li>
              </ul>
              <button className="price-cta" onClick={() => setLocation("/billing")}>Get Studio</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOR CREATORS */}
      <section id="creators" className="layer-section">
        <div className="creators-block">
          <div>
            <span className="eyebrow" style={{ color: "rgba(244,241,234,0.6)", marginBottom: "1rem" }}>
              <span className="num" style={{ color: "var(--bone)" }}>06</span> For experts
            </span>
            <h2 style={{ fontSize: "var(--t-5)" }}>
              Build a module. <br /><span className="it">Get paid forever.</span>
            </h2>
            <p className="lead">
              Your craft already works. Now make it work for you 24/7. Top creators on LayerOn earn between £600 and £4,200 per month — real passive income from real expertise.
            </p>

            <div className="creator-stats">
              <div className="creator-stat">
                <div className="num">£<em>1,840</em></div>
                <div className="lbl">Average monthly earnings · top tier</div>
              </div>
              <div className="creator-stat">
                <div className="num">~9 days</div>
                <div className="lbl">From application to live module</div>
              </div>
            </div>

            <button className="btn btn-acid btn-lg" data-magnetic onClick={goCreate} data-testid="creator-apply">
              Apply to be a creator <span className="arrow">→</span>
            </button>
          </div>

          <div className="creator-quote">
            <p className="q">
              "I built a strength-coaching module in two weekends. It's done 600+ chats this month. That's more income than the gym pays me, and I'm asleep when most of it happens."
            </p>
            <div className="who">
              <div className="av">MT</div>
              <div className="nm">
                <b>Marcus T.</b>
                <span>Strength Coach · LayerOn since 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="layer-section layer-divider">
        <div className="layer-container">
          <span className="eyebrow"><span className="num">07</span> FAQ</span>
          <h2 data-reveal style={{ fontSize: "var(--t-5)", marginBottom: "1.25rem" }}>
            Things <span className="it">people ask</span> first.
          </h2>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      <LayerFooter />
    </div>
  );
}

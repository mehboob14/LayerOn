import { useRoute, useLocation } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";
import { POSTS, type BlogPost } from "./blog";

interface PostBody {
  intro: string;
  sections: Array<{ heading: string; paragraphs: Array<string | { kind: "quote"; text: string } | { kind: "list"; items: string[] }> }>;
  closing: string;
}

const BODIES: Record<string, PostBody> = {
  "why-we-built-layeron": {
    intro:
      "I asked GPT-4 about a clause in my commercial lease last week. The reply was twelve paragraphs long, beautifully written, and ended with the words: 'consult a solicitor for specific advice.' Twelve paragraphs to tell me to ask a real lawyer. That's when I knew the problem wasn't capability. It was incentives.",
    sections: [
      {
        heading: "Custom GPTs were almost the answer.",
        paragraphs: [
          "When OpenAI shipped Custom GPTs, the format clicked. A system prompt, a few uploaded PDFs, and suddenly you had an assistant that knew something. People built thousands of them. They went viral. They quietly disappeared.",
          "Three things broke. First, anyone could publish — including people pretending to be lawyers, doctors, accountants. There was no verification. Second, the knowledge was static. You uploaded a PDF in March; the model was still answering from that PDF in October. The world had moved on. The module hadn't. Third — and this is the one that really mattered — the people whose expertise made the module valuable weren't getting paid.",
          { kind: "quote", text: "If the expert isn't getting paid, the best experts won't show up. And if the best experts don't show up, you don't have a marketplace — you have a hobby project." },
          "We'd seen this movie before. Every two-sided marketplace in history has run on the same principle: pay the supply side enough that they'll keep showing up. Spotify pays artists (badly, but it pays them). Etsy pays sellers. Substack pays writers. Custom GPT marketplaces — to date — pay the model provider and nothing else.",
        ],
      },
      {
        heading: "The three things we fixed.",
        paragraphs: [
          "LayerOn started from those three failures, in reverse order.",
          {
            kind: "list",
            items: [
              "**Pay the experts.** 70% of every chat fee goes to the creator. Not 30. Not 50. Seventy. We'll explain the unit economics in a separate post — the short version is, when the supply side wins, the marketplace works.",
              "**Live knowledge.** Every creator links the places they publish — Medium, YouTube, Substack, blog. New posts get indexed within hours and added to the module's working set. The model still has to be retrained for new behavior, but the *facts it cites* are continuously fresh.",
              "**Verify everyone.** We turn down about 62% of applicants. We check bar registration for legal modules, licensure for medical, certification for finance. We ask for two professional references. We ask for a sample of actual reviewed work — not a CV.",
            ],
          },
          "The result is a module that knows what Rachel knows, citing what Rachel cited last week, in Rachel's voice — and Rachel gets paid every time you use it.",
        ],
      },
      {
        heading: "What we're not.",
        paragraphs: [
          "LayerOn is not a foundation model. We don't train models. We orchestrate them. The expert picks which model their module uses — Claude, GPT-4o, Gemini, depending on the domain. We just make sure the right context is loaded at the right time.",
          "LayerOn is also not a replacement for hiring a professional. If your question is load-bearing — a contract you're about to sign, a diagnosis you're trying to confirm, a tax position the IRS could challenge — the module will tell you so and offer to book the human directly. Hedging is the failure mode of generic AI. We optimised against it. But refusing to hedge is not the same as refusing to acknowledge limits.",
        ],
      },
    ],
    closing:
      "We're early. Three hundred and fifty modules. A hundred and twenty experts. Most of them not famous, all of them excellent at the thing they do. If that sounds like the kind of marketplace you'd want to build inside, the creator application is one click away.",
  },
  "the-knowledge-base-that-breathes": {
    intro:
      "Here's a fact most foundation-model demos quietly avoid: every model you talk to has a knowledge cutoff. ChatGPT's is sometime in 2024. Claude's is somewhere similar. The model you're chatting with right now has no idea what happened last Thursday. And in domains where last Thursday matters — tax law, medical guidelines, employment regulation — that gap is the whole game.",
    sections: [
      {
        heading: "The cutoff problem, in plain English.",
        paragraphs: [
          "Foundation models are trained on a snapshot of the web. The snapshot ends. The model freezes. Then it ships. Six months later you ask it about the latest Renters' Reform Bill amendment, and it confidently tells you about the version from two amendments ago.",
          "RAG (retrieval-augmented generation) is the standard answer: bolt a search step on top so the model can pull current docs at query time. RAG works. But RAG over the open web is noisy — half the results are SEO spam, half are outdated forum threads, and the model has no way to weigh which sources to trust.",
          { kind: "quote", text: "Generic RAG asks the model to figure out who to trust. Expert RAG tells it." },
        ],
      },
      {
        heading: "What changes when the source list is curated by an expert.",
        paragraphs: [
          "Every LayerOn module has a knowledge base, and every knowledge base has a source list curated by the creator themselves. Rachel's lease-reviewer module pulls from her own Medium, the Law Society's RSS, and three judgment databases she paid for. When you ask it about the new lease bill, it's reading what Rachel reads — not what Google ranks.",
          "More importantly, the sync is continuous. Rachel publishes a Medium post on Tuesday morning. By Tuesday afternoon her module has indexed it. The expertise compounds without the expert having to manually update anything.",
        ],
      },
      {
        heading: "The platforms we sync from today.",
        paragraphs: [
          {
            kind: "list",
            items: [
              "**YouTube.** Recent video titles, descriptions, and full transcripts.",
              "**Medium & Substack.** Public posts via RSS.",
              "**Blogs.** Any RSS or Atom feed URL works. We've tested with Ghost, WordPress, custom feeds.",
              "**LinkedIn & X.** Coming soon — these need careful handling for ToS compliance.",
            ],
          },
          "Every chunk we index is reviewable inside the creator's knowledge-base panel. The creator can disable a single chunk, an entire source, or trigger a manual re-sync. Nothing is one-way.",
        ],
      },
    ],
    closing:
      "Static expertise has its place. Textbooks are still useful. But for anyone whose work is to know what's true *today*, the module needs to breathe with them. That's the bet we're making.",
  },
};

const FALLBACK_BODY: PostBody = {
  intro: "This post is being prepared by the team. Check back shortly for the full article.",
  sections: [
    {
      heading: "Coming soon",
      paragraphs: [
        "We're drafting this one. In the meantime, head back to the blog index for posts that are live.",
      ],
    },
  ],
  closing: "Thanks for your patience.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

function ParagraphBlock({ block }: { block: string | { kind: "quote"; text: string } | { kind: "list"; items: string[] } }) {
  if (typeof block === "string") {
    return (
      <p style={{ fontSize: "1.05rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: "1.25rem" }}>{block}</p>
    );
  }
  if (block.kind === "quote") {
    return (
      <blockquote
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "1.5rem",
          lineHeight: 1.35,
          color: "var(--ink)",
          padding: "1.25rem 1.75rem",
          borderLeft: "3px solid var(--acid)",
          background: "var(--acid-soft)",
          borderRadius: "0 var(--r-2) var(--r-2) 0",
          margin: "2rem 0",
          maxWidth: "62ch",
        }}
      >
        {block.text}
      </blockquote>
    );
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {block.items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: "1.05rem",
            color: "var(--ink-2)",
            lineHeight: 1.65,
            paddingLeft: "1.5rem",
            position: "relative",
          }}
          dangerouslySetInnerHTML={{ __html: `<span style="position:absolute;left:0;color:var(--coral);font-weight:600">+</span>${renderInline(item)}` }}
        />
      ))}
    </ul>
  );
}

function renderInline(text: string) {
  // bold for **...**
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--ink);font-weight:500">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em style="font-family:var(--font-serif);font-style:italic">$1</em>');
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const [, setLocation] = useLocation();

  const post = POSTS.find((p) => p.slug === params?.slug);
  const body = BODIES[params?.slug ?? ""] ?? FALLBACK_BODY;

  if (!post) {
    return (
      <div style={{ background: "var(--bone)", minHeight: "100vh", color: "var(--ink)" }}>
        <LayerNav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Post not found</p>
            <button className="btn btn-ink" onClick={() => setLocation("/blog")}>
              <ArrowLeft className="w-4 h-4" /> Back to blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const next = POSTS[(POSTS.indexOf(post) + 1) % POSTS.length];

  return (
    <div style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <LayerNav />

      <article>
        {/* HEADER */}
        <header className="layer-section layer-divider" style={{ paddingTop: "4rem", paddingBottom: "3rem" }}>
          <div className="layer-container" style={{ maxWidth: 820 }}>
            <button onClick={() => setLocation("/blog")} className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: "1.5rem" }}>
              <ArrowLeft className="w-4 h-4" /> Field notes
            </button>
            <span className="eyebrow"><span className="num">★</span> {post.category}</span>
            <h1
              style={{
                fontSize: "var(--t-5)",
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
                marginBottom: "1.5rem",
                maxWidth: "22ch",
              }}
            >
              {post.title}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                paddingTop: "1.25rem",
                borderTop: "1px solid var(--bone-edge)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div className="band-tier">{post.author.initials}</div>
                <div style={{ fontSize: "0.85rem" }}>
                  <strong style={{ fontWeight: 500 }}>{post.author.name}</strong>
                  <span style={{ color: "var(--ink-4)", marginLeft: 6 }}>· {post.author.role}</span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--ink-4)",
                }}
              >
                {formatDate(post.date)} · {post.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* BODY */}
        <section className="layer-section" style={{ paddingTop: "1rem", paddingBottom: "5rem" }}>
          <div className="layer-container" style={{ maxWidth: 760 }}>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "1.5rem",
                color: "var(--ink-2)",
                lineHeight: 1.4,
                marginBottom: "2.5rem",
                maxWidth: "60ch",
              }}
            >
              {body.intro}
            </p>

            {body.sections.map((s, i) => (
              <section key={i} style={{ marginBottom: "2.5rem" }}>
                <h2 style={{ fontSize: "var(--t-3)", marginBottom: "1.25rem", letterSpacing: "-0.025em" }}>
                  {s.heading}
                </h2>
                {s.paragraphs.map((b, j) => (
                  <ParagraphBlock key={j} block={b} />
                ))}
              </section>
            ))}

            <p style={{ fontSize: "1.05rem", color: "var(--ink-2)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
              {body.closing}
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--bone-edge)",
                flexWrap: "wrap",
              }}
            >
              <button className="btn btn-acid" onClick={() => setLocation("/explore")}>
                Browse modules <span className="arrow">→</span>
              </button>
              <button className="btn btn-outline" onClick={() => setLocation("/sign-up")}>
                Become a creator
              </button>
            </div>
          </div>
        </section>

        {/* NEXT POST */}
        {next && next.slug !== post.slug && (
          <section className="layer-section layer-divider" style={{ paddingTop: 0, paddingBottom: "5rem" }}>
            <div className="layer-container" style={{ maxWidth: 820 }}>
              <span className="eyebrow"><span className="num">→</span> Read next</span>
              <NextPostCard post={next} onClick={() => setLocation(`/blog/${next.slug}`)} />
            </div>
          </section>
        )}
      </article>

      <LayerFooter />
    </div>
  );
}

function NextPostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      style={{
        background: "var(--bone-light)",
        border: "1px solid var(--bone-edge)",
        borderRadius: "var(--r-3)",
        cursor: "pointer",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        gap: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--bone-edge)")}
    >
      <div style={{ padding: "2rem" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--ink-4)",
            marginBottom: "0.75rem",
          }}
        >
          {post.category}
        </span>
        <h3 style={{ fontSize: "1.5rem", lineHeight: 1.2, marginBottom: "0.75rem", letterSpacing: "-0.025em" }}>{post.title}</h3>
        <p
          style={{
            color: "var(--ink-3)",
            fontSize: "0.92rem",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.excerpt}
        </p>
        <div style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink)", fontSize: "0.85rem", fontWeight: 500 }}>
          Continue <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className={`module-band ${post.band}`} style={{ height: "100%", padding: "1.25rem", alignItems: "flex-end" }}>
        <span className="band-tier">{post.author.initials}</span>
      </div>
    </article>
  );
}

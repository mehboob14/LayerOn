import { useLocation } from "wouter";
import { LayerNav } from "@/components/layer/LayerNav";
import { LayerFooter } from "@/components/layer/LayerFooter";
import { Reveal } from "@/components/layer/Reveal";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: "Manifesto" | "Creator" | "Product" | "Engineering";
  band: "band-acid" | "band-coral" | "band-sage" | "band-plum" | "band-gold";
  author: { name: string; role: string; initials: string };
  featured?: boolean;
}

export const POSTS: BlogPost[] = [
  {
    slug: "why-we-built-layeron",
    title: "Why we built LayerOn (and why custom GPTs weren't enough)",
    excerpt:
      "Every great expert tells you the same thing: the answer depends. But generic AI was trained to never say it depends. So we built a marketplace for the people who can.",
    date: "2026-04-22",
    readTime: "6 min",
    category: "Manifesto",
    band: "band-acid",
    author: { name: "Mehboob A.", role: "Founder", initials: "MA" },
    featured: true,
  },
  {
    slug: "the-knowledge-base-that-breathes",
    title: "Knowledge that breathes: why your module needs a live feed",
    excerpt:
      "Foundation models freeze on their training cutoff. Real expertise doesn't. Here's how LayerOn modules pull from Medium, YouTube, and Substack — continuously — so the answer keeps getting better.",
    date: "2026-04-08",
    readTime: "9 min",
    category: "Product",
    band: "band-coral",
    author: { name: "Aisha R.", role: "Product", initials: "AR" },
  },
  {
    slug: "70-percent-economics",
    title: "Why 70% of every chat goes to the creator",
    excerpt:
      "Most platforms get the economics wrong. We did the math. Here's why the experts who built it deserve the lion's share — and how we still keep the lights on.",
    date: "2026-03-19",
    readTime: "5 min",
    category: "Creator",
    band: "band-sage",
    author: { name: "Tom B.", role: "Operations", initials: "TB" },
  },
  {
    slug: "modules-as-a-product-category",
    title: "Modules as a product category, not a feature",
    excerpt:
      "A module isn't a system prompt. It's a person, a verification process, a knowledge feed, a model choice, and an accountability loop. Here's the design philosophy.",
    date: "2026-03-04",
    readTime: "8 min",
    category: "Product",
    band: "band-plum",
    author: { name: "Rachel M.", role: "Editorial", initials: "RM" },
  },
  {
    slug: "verification-process",
    title: "How we verify a creator (and what gets a module rejected)",
    excerpt:
      "We turn down ~62% of applicants. Here's what we look for, what we ask references, and the three failure modes that get a module pulled after launch.",
    date: "2026-02-15",
    readTime: "7 min",
    category: "Creator",
    band: "band-gold",
    author: { name: "Nina P.", role: "Verification", initials: "NP" },
  },
  {
    slug: "the-stack-metaphor",
    title: "Why we call it LayerOn",
    excerpt:
      "Foundation model. Domain knowledge. Expert training. Module. Four layers, stacked. The metaphor is the product. The product is the metaphor.",
    date: "2026-02-02",
    readTime: "4 min",
    category: "Manifesto",
    band: "band-acid",
    author: { name: "Marcus T.", role: "Brand", initials: "MT" },
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndexPage() {
  const [, setLocation] = useLocation();
  const featured = POSTS.find((p) => p.featured);
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <div style={{ background: "var(--bone)", color: "var(--ink)" }}>
      <LayerNav />

      <header className="layer-section layer-divider" style={{ paddingTop: "5rem", paddingBottom: "3.5rem" }}>
        <div className="layer-container">
          <span className="eyebrow"><span className="num">B</span> Field notes</span>
          <Reveal>
            <h1 style={{ fontSize: "var(--t-6)", lineHeight: 0.94, letterSpacing: "-0.045em", maxWidth: "16ch", marginBottom: "1.25rem" }}>
              The <span className="it">field notes.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead">
              Long-form on what's working, what's broken, and what we're shipping next. Written by the team and the experts on the platform.
            </p>
          </Reveal>
        </div>
      </header>

      {/* FEATURED */}
      {featured && (
        <section className="layer-section layer-divider" style={{ paddingTop: 0, paddingBottom: "4rem" }}>
          <div className="layer-container">
            <div
              onClick={() => setLocation(`/blog/${featured.slug}`)}
              data-testid={`post-${featured.slug}`}
              style={{
                cursor: "pointer",
                background: "var(--ink)",
                color: "var(--bone)",
                borderRadius: "var(--r-4)",
                padding: "3rem 2.5rem",
                position: "relative",
                overflow: "hidden",
              }}
              className="blog-featured"
            >
              <div
                style={{
                  position: "absolute",
                  right: "-100px",
                  top: "-100px",
                  width: 360,
                  height: 360,
                  background: "radial-gradient(circle, var(--acid) 0%, transparent 70%)",
                  opacity: 0.18,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "3rem", alignItems: "center" }} className="blog-featured-grid">
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      color: "var(--acid)",
                      marginBottom: "1.25rem",
                    }}
                  >
                    ★ Featured · {featured.category}
                  </span>
                  <h2 style={{ fontSize: "var(--t-4)", color: "var(--bone)", lineHeight: 1.05, marginBottom: "1.25rem", maxWidth: "20ch" }}>
                    {featured.title}
                  </h2>
                  <p style={{ fontSize: "1rem", color: "rgba(244,241,234,0.75)", lineHeight: 1.6, maxWidth: "50ch", marginBottom: "1.75rem" }}>
                    {featured.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div className="band-tier" style={{ background: "var(--acid)", color: "var(--ink)" }}>
                        {featured.author.initials}
                      </div>
                      <div style={{ fontSize: "0.85rem" }}>
                        <strong style={{ color: "var(--bone)", fontWeight: 500 }}>{featured.author.name}</strong>
                        <span style={{ color: "rgba(244,241,234,0.55)", marginLeft: 6 }}>· {featured.author.role}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(244,241,234,0.55)",
                      }}
                    >
                      {formatDate(featured.date)} · {featured.readTime}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    aspectRatio: "1 / 1",
                    background: "var(--acid)",
                    borderRadius: "var(--r-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink)",
                    fontFamily: "'Bagel Fat One', cursive",
                    fontSize: "clamp(3rem, 9vw, 6rem)",
                    letterSpacing: "0.04em",
                  }}
                  aria-hidden
                >
                  L
                </div>
              </div>
              <style>{`
                @media (max-width: 800px) {
                  .blog-featured-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>
            </div>
          </div>
        </section>
      )}

      {/* GRID */}
      <section className="layer-section layer-divider" style={{ paddingTop: 0, paddingBottom: "5rem" }}>
        <div className="layer-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {rest.map((post) => (
              <article
                key={post.slug}
                onClick={() => setLocation(`/blog/${post.slug}`)}
                data-testid={`post-${post.slug}`}
                style={{
                  background: "var(--bone-light)",
                  border: "1px solid var(--bone-edge)",
                  borderRadius: "var(--r-3)",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "border-color 0.3s var(--ease), box-shadow 0.3s var(--ease)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--ink)";
                  e.currentTarget.style.boxShadow = "0 30px 60px -25px rgba(14,22,40,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--bone-edge)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className={`module-band ${post.band}`} style={{ height: 80, padding: "1rem" }}>
                  <span className="band-pill">{post.category}</span>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.2rem", lineHeight: 1.25, marginBottom: "0.75rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
                    {post.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--ink-3)",
                      lineHeight: 1.55,
                      marginBottom: "1.25rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--bone-edge)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-4)",
                    }}
                  >
                    <span>{post.author.name}</span>
                    <span>{formatDate(post.date)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <LayerFooter />
    </div>
  );
}

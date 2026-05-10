import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { LayerLogo } from "./LayerLogo";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface NavLink {
  label: string;
  href: string;
}

interface LayerNavProps {
  links?: NavLink[];
  primaryCta?: { label: string; href: string };
}

const PUBLIC_LINKS: NavLink[] = [
  { label: "How it works", href: "/#how" },
  { label: "Modules", href: "/explore" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function LayerNav({ links, primaryCta }: LayerNavProps) {
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setRole(null);
      return;
    }
    let cancelled = false;
    api
      .getMe()
      .then((u) => {
        if (!cancelled) setRole(u?.role || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const isCreator = role === "creator";
  const navLinks = links ?? PUBLIC_LINKS;
  const cta = primaryCta ?? { label: "Browse modules", href: "/explore" };

  const handleNav = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (window.location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        setLocation("/");
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
      }
    } else {
      setLocation(href);
    }
  };

  return (
    <nav className="layer-nav" data-testid="layer-nav">
      <div className="layer-nav-inner">
        <a className="layer-logo" onClick={() => setLocation("/")} data-testid="link-home" style={{ cursor: "pointer" }}>
          <LayerLogo />
        </a>
        <ul className="layer-nav-links">
          {navLinks.map((l) => (
            <li key={l.label}>
              <button onClick={() => handleNav(l.href)}>{l.label}</button>
            </li>
          ))}
        </ul>
        <div className="layer-nav-right">
          {isSignedIn ? (
            <>
              {isCreator ? (
                <button className="btn btn-ghost" onClick={() => setLocation("/studio")} data-testid="button-studio">
                  Studio
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={() => setLocation("/dashboard")} data-testid="button-dashboard">
                  Dashboard
                </button>
              )}
              <UserButton afterSignOutUrl="/sign-out" appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} />
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setLocation("/sign-in")} data-testid="button-login">
                Sign in
              </button>
              <button className="btn btn-ink" onClick={() => handleNav(cta.href)} data-testid="button-primary-cta">
                {cta.label} <ArrowRight className="w-3.5 h-3.5 arrow" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

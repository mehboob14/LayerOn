import { useLocation } from "wouter";
import { LayerLogo } from "./LayerLogo";
import { ArrowRight } from "lucide-react";

export function LayerFooter() {
  const [, setLocation] = useLocation();

  return (
    <footer className="layer-footer">
      <div className="layer-container">
        <div className="foot-cta">
          <h2>
            Stop settling for<br />
            <span className="it">generic</span> AI.
          </h2>
          <button className="btn btn-acid btn-lg" onClick={() => setLocation("/explore")} data-testid="footer-cta">
            Browse 350+ modules <span className="arrow">→</span>
          </button>
        </div>

        <div className="foot-grid">
          <div className="foot-brand">
            <a className="layer-logo" onClick={() => setLocation("/")} style={{ cursor: "pointer" }}>
              <LayerLogo variant="bone" />
            </a>
            <p>
              AI guided by people who actually do the work. 350+ modules. 120+ verified experts. The marketplace where expertise becomes infinitely accessible.
            </p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <ul>
              <li><button onClick={() => setLocation("/explore")}>Browse modules</button></li>
              <li><button onClick={() => setLocation("/explore")}>Categories</button></li>
              <li><button onClick={() => setLocation("/billing")}>Pricing</button></li>
              <li><button onClick={() => setLocation("/explore")}>Premium tier</button></li>
              <li><button onClick={() => setLocation("/explore")}>For teams</button></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Creators</h5>
            <ul>
              <li><button onClick={() => setLocation("/create")}>Apply</button></li>
              <li><a href="#">Creator handbook</a></li>
              <li><a href="#">Earnings model</a></li>
              <li><a href="#">Success stories</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-end">
          <span>© {new Date().getFullYear()} LayerOn Ltd.</span>
          <span>Privacy · Terms · Cookies</span>
          <span>founders@layeron.com</span>
        </div>
      </div>
    </footer>
  );
}

// Re-export for ergonomic usage
export { ArrowRight };

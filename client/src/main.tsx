import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Debug logging
console.log("Environment check:");
console.log("VITE_CLERK_PUBLISHABLE_KEY:", CLERK_KEY);
console.log("All env vars:", import.meta.env);

if (!CLERK_KEY) {
  console.error("❌ CLERK KEY IS MISSING! Check your .env file.");
  console.error("Expected: VITE_CLERK_PUBLISHABLE_KEY");
  console.error("Make sure to restart the Vite dev server after changing .env");
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <ClerkProvider
      publishableKey={CLERK_KEY}
      appearance={{
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#09090b",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          colorInputBackground: "#18181b",
          colorInputText: "#fafafa",
          borderRadius: "0.5rem",
        },
        elements: {
          card: { backgroundColor: "#09090b", border: "1px solid #27272a", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
          headerTitle: { color: "#fafafa", fontFamily: "'Inter', sans-serif", fontWeight: "800" },
          headerSubtitle: { color: "#71717a" },
          formButtonPrimary: { backgroundColor: "#2563eb", color: "#fff", fontWeight: "600" },
          formFieldInput: { backgroundColor: "#18181b", border: "1px solid #27272a", color: "#fafafa" },
          footerActionLink: { color: "#2563eb" },
          identityPreviewEditButton: { color: "#2563eb" },
          formFieldLabel: { color: "#a1a1aa" },
          dividerLine: { borderColor: "#27272a" },
          dividerText: { color: "#52525b" },
          socialButtonsBlockButton: { backgroundColor: "#18181b", border: "1px solid #27272a", color: "#fafafa" },
          socialButtonsBlockButtonText: { color: "#a1a1aa" },
          userButtonPopoverCard: { backgroundColor: "#09090b", border: "1px solid #27272a" },
          userButtonPopoverActionButton: { color: "#a1a1aa" },
          userButtonPopoverActionButtonText: { color: "#a1a1aa" },
          userButtonPopoverFooter: { display: "none" },
          userPreviewMainIdentifier: { color: "#fafafa" },
          userPreviewSecondaryIdentifier: { color: "#71717a" },
        },
      }}
    >
      <App />
    </ClerkProvider>
  );
}

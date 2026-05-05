import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import HomePage from "@/pages/home";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import CreateModulePage from "@/pages/create-module";
import ExplorePage from "@/pages/explore";
import ChatPage from "@/pages/chat";
import ModuleDetailPage from "@/pages/module-detail";
import LibraryPage from "@/pages/library";
import HistoryPage from "@/pages/history";
import StatsPage from "@/pages/stats";
import NotificationsPage from "@/pages/notifications";
import OnboardingPage from "@/pages/onboarding";
import CreatorProfilePage from "@/pages/creator-profile";
import BillingPage from "@/pages/billing";
import KnowledgeBasePage from "@/pages/knowledge-base";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useClerkAuth } from "@/hooks/use-clerk-auth";

function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ zIndex: 1 }}>
      {mode === "sign-in" ? (
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
      ) : (
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
      )}
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ zIndex: 1 }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(37,99,235,0.3)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isSignedIn) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/sign-in">{() => <AuthPage mode="sign-in" />}</Route>
      <Route path="/sign-in/:rest*">{() => <AuthPage mode="sign-in" />}</Route>
      <Route path="/sign-up">{() => <AuthPage mode="sign-up" />}</Route>
      <Route path="/sign-up/:rest*">{() => <AuthPage mode="sign-up" />}</Route>
      <Route path="/onboarding">{() => <ProtectedRoute component={OnboardingPage} />}</Route>
      <Route path="/dashboard">{() => <ProtectedRoute component={DashboardPage} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={ProfilePage} />}</Route>
      <Route path="/create">{() => <ProtectedRoute component={CreateModulePage} />}</Route>
      <Route path="/explore" component={ExplorePage} />
      <Route path="/modules/:id" component={ModuleDetailPage} />
      <Route path="/creators/:id" component={CreatorProfilePage} />
      <Route path="/chat/:id">{() => <ProtectedRoute component={ChatPage} />}</Route>
      <Route path="/library">{() => <ProtectedRoute component={LibraryPage} />}</Route>
      <Route path="/history">{() => <ProtectedRoute component={HistoryPage} />}</Route>
      <Route path="/stats">{() => <ProtectedRoute component={StatsPage} />}</Route>
      <Route path="/billing">{() => <ProtectedRoute component={BillingPage} />}</Route>
      <Route path="/knowledge-base">{() => <ProtectedRoute component={KnowledgeBasePage} />}</Route>
      <Route path="/notifications">{() => <ProtectedRoute component={NotificationsPage} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AmbientBackground() {
  return (
    <>
      <div className="ambient-glow">
        <div className="glow-1" />
        <div className="glow-2" />
        <div className="glow-3" />
      </div>
      <div className="noise-overlay" />
    </>
  );
}

function AuthInit() {
  useClerkAuth();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthInit />
        <AmbientBackground />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

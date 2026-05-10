import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@clerk/clerk-react";
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
import AboutPage from "@/pages/about";
import BlogIndexPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog-post";
import PricingPage from "@/pages/pricing";
import StudioPage from "@/pages/studio";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import SignOutPage from "@/pages/sign-out";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useClerkAuth } from "@/hooks/use-clerk-auth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bone)" }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--bone-edge)", borderTopColor: "var(--ink)" }} />
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
      <Route path="/about" component={AboutPage} />
      <Route path="/blog" component={BlogIndexPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-in/:rest*" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route path="/sign-up/:rest*" component={SignUpPage} />
      <Route path="/sign-out" component={SignOutPage} />
      <Route path="/onboarding">{() => <ProtectedRoute component={OnboardingPage} />}</Route>
      <Route path="/dashboard">{() => <ProtectedRoute component={DashboardPage} />}</Route>
      <Route path="/studio">{() => <ProtectedRoute component={StudioPage} />}</Route>
      <Route path="/profile">{() => <ProtectedRoute component={ProfilePage} />}</Route>
      <Route path="/create">{() => <ProtectedRoute component={CreateModulePage} />}</Route>
      <Route path="/studio/modules/new">{() => <ProtectedRoute component={CreateModulePage} />}</Route>
      <Route path="/explore" component={ExplorePage} />
      <Route path="/modules/:id" component={ModuleDetailPage} />
      <Route path="/creators/:id" component={CreatorProfilePage} />
      <Route path="/chat/:id">{() => <ProtectedRoute component={ChatPage} />}</Route>
      <Route path="/chat">{() => <ProtectedRoute component={ChatPage} />}</Route>
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

function AuthInit() {
  useClerkAuth();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthInit />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

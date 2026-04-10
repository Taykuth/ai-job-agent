import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CVs from "./pages/CVs";
import NewApplication from "./pages/NewApplication";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import Upgrade from "./pages/Upgrade";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/cvs" component={CVs} />
      <Route path="/dashboard/new" component={NewApplication} />
      <Route path="/dashboard/applications" component={Applications} />
      <Route path="/dashboard/applications/:id" component={ApplicationDetail} />
      <Route path="/dashboard/upgrade" component={Upgrade} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

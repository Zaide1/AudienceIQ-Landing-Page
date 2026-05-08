import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import {
  PainPointsPage,
  ViralOpportunitiesPage,
  QuotesPage,
  MentionsPage,
  ThemesPage,
  PlatformsPage,
  ContentIdeasPage,
  SubredditsPage,
  SentimentPage,
  CompetitorsPage,
  SavedPage,
} from "@/pages/DetailPages";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pain-points" component={PainPointsPage} />
      <Route path="/viral-opportunities" component={ViralOpportunitiesPage} />
      <Route path="/quotes" component={QuotesPage} />
      <Route path="/mentions" component={MentionsPage} />
      <Route path="/themes" component={ThemesPage} />
      <Route path="/platforms" component={PlatformsPage} />
      <Route path="/content-ideas" component={ContentIdeasPage} />
      <Route path="/subreddits" component={SubredditsPage} />
      <Route path="/sentiment" component={SentimentPage} />
      <Route path="/competitor-watch" component={CompetitorsPage} />
      <Route path="/saved" component={SavedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

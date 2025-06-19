import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Catalog from "@/pages/catalog";
import Thread from "@/pages/thread";
import CreateThread from "@/pages/create-thread";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/thread/:id" component={Thread} />
      <Route path="/create" component={CreateThread} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen" style={{ backgroundColor: '#FFFFEE' }}>
          {/* Header */}
          <div className="bg-white border-b-2 border-black p-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23228B22' d='M16 4c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z'/%3E%3Cpath fill='%2300CED1' d='M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 12c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z'/%3E%3C/svg%3E" alt="Mopchan" className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-black">Mopchan</h1>
            </div>
            <div className="text-sm mt-1 text-blue-600">
              <a href="/create" className="underline">[post a thread]</a>
            </div>
          </div>

          {/* Top Navigation Bar */}
          <div className="bg-gray-200 border-b border-gray-400 px-4 py-1">
            <div className="flex justify-between items-center text-xs">
              <div className="flex gap-4">
                <span className="bg-gray-300 px-2 py-1">[archive]</span>
                <span className="bg-gray-300 px-2 py-1">[bottom]</span>
                <span className="bg-gray-300 px-2 py-1">[5 minutes ago]</span>
                <span className="bg-gray-400 px-2 py-1 text-white">search</span>
              </div>
              <div className="font-bold">catalog</div>
              <div className="flex gap-2">
                <span className="bg-gray-300 px-2 py-1">new to old</span>
                <span className="bg-gray-300 px-2 py-1">catalog</span>
              </div>
            </div>
          </div>

          <Router />
        </div>
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Catalog from "@/pages/catalog";
import Thread from "@/pages/thread";
import NotFound from "@/pages/not-found";
import CreateThreadModal from "@/components/create-thread-modal";
import ThreadWatcher from "@/components/thread-watcher";
import StyleChooser from "@/components/style-chooser";
import Chatroom from "@/components/chatroom";
import AdminLogin from "@/components/admin-login";
import AdminPanel from "@/components/admin-panel";
import type { User } from "@shared/schema";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"bump" | "reply" | "time">("bump");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const handleAdminLogin = (user: User, token: string) => {
    setAdminUser(user);
    setAdminToken(token);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    setShowAdminPanel(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen theme-bg-main">
          {/* Admin Login Button - Top Left */}
          <div className="absolute top-2 left-2 z-10">
            {!adminUser ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
              >
                Admin
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700"
                >
                  Admin Panel
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <StyleChooser />
          {/* Header */}
          <div className="theme-bg-header border-b-2 theme-border p-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath fill='%23228B22' d='M16 4c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z'/%3E%3Cpath fill='%2300CED1' d='M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 12c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z'/%3E%3C/svg%3E" alt="Mopchan" className="w-8 h-8" />
              <h1 className="text-2xl font-bold theme-text-main">Mopchan</h1>
            </div>
            <div className="text-sm mt-1 text-blue-600 flex flex-col items-center">
              <CreateThreadModal
                trigger={<button className="underline">[post a thread]</button>}
              />
              <Chatroom />
            </div>
          </div>

          {/* Top Navigation Bar */}
          <div className="theme-bg-nav border-b theme-border py-1">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs px-4">
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search threads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border px-2 py-1 text-xs"
                  style={{ minWidth: '120px' }}
                />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "bump" | "reply" | "time")}
                  className="bg-white border px-2 py-1 text-xs"
                >
                  <option value="bump">Bump Order</option>
                  <option value="reply">Reply Count</option>
                  <option value="time">Time Posted</option>
                </select>
              </div>
              
              <div className="font-bold absolute left-1/2 transform -translate-x-1/2">catalog</div>
              
              <div className="flex gap-2 items-center">
                <button 
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  className="bg-gray-300 hover:bg-gray-400 px-2 py-1 cursor-pointer"
                >
                  [bottom]
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4 pb-4">
            <Switch>
              <Route path="/" component={() => <Catalog searchTerm={searchTerm} sortBy={sortBy} />} />
              <Route path="/catalog" component={() => <Catalog searchTerm={searchTerm} sortBy={sortBy} />} />
              <Route path="/thread/:id" component={Thread} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <ThreadWatcher />
        </div>
        
        {/* Admin Modals */}
        {showAdminLogin && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onClose={() => setShowAdminLogin(false)}
          />
        )}
        
        {showAdminPanel && adminUser && adminToken && (
          <AdminPanel
            user={adminUser}
            token={adminToken}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
        
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

// client/src/components/Layout.tsx

import { Outlet, Link, useParams } from "react-router-dom";

export function Layout() {
  const { board } = useParams();

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="border-b border-neutral-700 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-400">Mopchan</Link>
          <nav className="space-x-4">
            <Link to="/b" className="hover:underline">/b/</Link>
            <Link to="/tech" className="hover:underline">/tech/</Link>
            <Link to="/admin" className="hover:underline text-red-400">Admin</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-700 p-4 text-center text-sm text-neutral-400">
        &copy; {new Date().getFullYear()} Mopchan — Inspired by 4chan. No account required.
      </footer>
    </div>
  );
}

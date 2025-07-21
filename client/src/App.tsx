// client/src/App.tsx

import { Route, Routes, Navigate } from "react-router-dom";
import { CatalogPage } from "./pages/CatalogPage";
import { ThreadPage } from "./pages/ThreadPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/b" replace />} />

        {/* Board Catalog */}
        <Route path=":board" element={<CatalogPage />} />

        {/* Individual Thread View */}
        <Route path=":board/thread/:threadId" element={<ThreadPage />} />

        {/* Admin Panel */}
        <Route path="admin" element={<AdminPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />


        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

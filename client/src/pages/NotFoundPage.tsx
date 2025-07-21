// client/src/pages/NotFoundPage.tsx

import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
      <p className="mb-2">This route does not exist.</p>
      <Link to="/" className="text-blue-400 underline">Go to Home</Link>
    </div>
  );
}

// client/src/pages/CatalogPage.tsx
import { Link } from "react-router-dom";
import { useFetchThreads } from "../hooks/useFetchThreads";
import { ThreadPreview } from "../components/ThreadPreview";

export function CatalogPage() {
  // Grab the “board” part of the URL, e.g. “b” or “tech”
  const board = window.location.pathname.split("/")[1] || "b";
  const { threads, loading, error } = useFetchThreads(board);

  if (loading) {
    return <div className="p-4 text-white">Loading /{board}/…</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-white">/{board}/ Catalog</h1>
      {threads.length === 0 && (
        <p className="text-gray-400">No threads yet. Be the first to post!</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {threads.map((t) => (
          <Link
            key={t.id}
            to={`/${board}/thread/${t.id}`}
            className="block bg-neutral-800 rounded p-3 hover:bg-neutral-700 transition"
          >
            <ThreadPreview thread={t} />
          </Link>
        ))}
      </div>
    </div>
  );
}

// client/src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function AdminLoginPage() {
  const { login, error } = useAuth();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(user, pass);
    if (ok) navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <form onSubmit={handleSubmit} className="bg-neutral-800 p-6 rounded space-y-4">
        <h1 className="text-xl text-white font-bold">Admin Login</h1>
        {error && <p className="text-red-400">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full p-2 rounded bg-neutral-700 text-white"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full p-2 rounded bg-neutral-700 text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-500 text-white p-2 rounded"
        >
          Log in
        </button>
      </form>
    </div>
  );
}

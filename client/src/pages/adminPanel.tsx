import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    axios.get("/api/me").then((res) => {
      if (!res.data.isAdmin && !res.data.isModerator) {
        window.location.href = "/";
      } else {
        setMe(res.data);
      }
    });
  }, []);

  useEffect(() => {
    if (me) {
      axios.get("/api/users").then((res) => setUsers(res.data));
      axios.get("/api/threads").then((res) => setThreads(res.data));
    }
  }, [me]);

  const updateRole = (id, role) => {
    axios.post(`/admin/user/${id}/role`, { role }).then(() => {
      axios.get("/api/users").then((res) => setUsers(res.data));
    });
  };

  const pinThread = (id) => {
    axios.post(`/admin/threads/${id}/pin`).then(() => {
      axios.get("/api/threads").then((res) => setThreads(res.data));
    });
  };

  const unpinThread = (id) => {
    axios.delete(`/admin/threads/${id}/pin`).then(() => {
      axios.get("/api/threads").then((res) => setThreads(res.data));
    });
  };

  const banIp = () => {
    if (!ip) return;
    axios.post("/admin/ban-ip", { ipAddress: ip, reason }).then(() => {
      alert("IP banned.");
      setIp("");
      setReason("");
    });
  };

  if (!me) return <div style={{ fontFamily: 'Tahoma', padding: 20 }}>Loading admin data...</div>;

  return (
    <div style={{ fontFamily: 'Tahoma', maxWidth: 960, margin: '0 auto', padding: 20, background: '#f0e0d6', color: '#000' }}>
      <h1 style={{ fontSize: '1.5rem', borderBottom: '1px solid #800000' }}>Admin Panel</h1>
      <div style={{ margin: '1rem 0' }}>
        <button onClick={() => setTab("users")} style={tab === "users" ? activeTab : tabStyle}>Users</button>
        <button onClick={() => setTab("threads")} style={tab === "threads" ? activeTab : tabStyle}>Threads</button>
        <button onClick={() => setTab("bans")} style={tab === "bans" ? activeTab : tabStyle}>IP Bans</button>
      </div>

      {tab === "users" && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Set Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.isAdmin ? "admin" : u.isModerator ? "moderator" : "user"}</td>
                <td>
                  <select
                    value={u.isAdmin ? "admin" : u.isModerator ? "moderator" : "user"}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "threads" && (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {threads.map((t) => (
              <li key={t.id} style={{ padding: 10, borderBottom: '1px dotted #ccc' }}>
                <span>{t.subject || "(no subject)"}</span>
                <button onClick={() => pinThread(t.id)} style={{ marginLeft: 10 }}>📌 Pin</button>
                <button onClick={() => unpinThread(t.id)} style={{ marginLeft: 5 }}>❌ Unpin</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "bans" && (
        <div>
          <label>
            IP Address:
            <input value={ip} onChange={(e) => setIp(e.target.value)} style={inputStyle} />
          </label>
          <br />
          <label>
            Reason:
            <input value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle} />
          </label>
          <br />
          <button onClick={banIp}>Ban IP</button>
        </div>
      )}
    </div>
  );
}

const tabStyle = {
  background: '#eee',
  padding: '0.5rem 1rem',
  marginRight: 5,
  border: '1px solid #ccc',
  fontSize: '0.9rem'
};

const activeTab = {
  ...tabStyle,
  background: '#d6bfbf',
  border: '1px solid #800000',
  fontWeight: 'bold'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.9rem',
};

const inputStyle = {
  marginLeft: 8,
  marginBottom: 8,
  padding: 4,
  fontFamily: 'monospace'
};

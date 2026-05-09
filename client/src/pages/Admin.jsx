import { useEffect, useState } from "react";

const API_URL = "https://game-ratings-app.onrender.com";
const ADMIN_KEY = prompt("Enter admin key");

function Admin() {
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newGame, setNewGame] = useState({
    name: "",
    genre: "",
    platform: "",
    company: "",
    link: "",
    image: ""
  });

  const login = () => {
    if (password === ADMIN_KEY) {
      setAllowed(true);
    } else {
      alert("Wrong password");
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/suggestions`, {
        headers: { "admin-key": ADMIN_KEY }
      });

      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to load suggestions");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (allowed) fetchSuggestions();
  }, [allowed]);

  const addGame = async () => {
    if (!newGame.name.trim()) {
      alert("Game name is required");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "admin-key": ADMIN_KEY
        },
        body: JSON.stringify(newGame)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add game");
      }

      alert("Game added successfully!");

      setNewGame({
        name: "",
        genre: "",
        platform: "",
        company: "",
        link: "",
        image: ""
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const approveSuggestion = async (id) => {
    await fetch(`${API_URL}/suggestions/${id}/approve`, {
      method: "POST",
      headers: { "admin-key": ADMIN_KEY }
    });

    fetchSuggestions();
  };

  const rejectSuggestion = async (id) => {
    await fetch(`${API_URL}/suggestions/${id}/reject`, {
      method: "POST",
      headers: { "admin-key": ADMIN_KEY }
    });

    fetchSuggestions();
  };

  if (!allowed) {
    return (
      <div style={styles.page}>
        <div style={styles.box}>
          <h1>Admin Login</h1>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.button}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <p style={styles.subtitle}>Manage games and submitted suggestions</p>

      <div style={styles.section}>
        <h2>Add Game</h2>

        <div style={styles.formGrid}>
          <input
            placeholder="Game Name"
            value={newGame.name}
            onChange={(e) =>
              setNewGame({ ...newGame, name: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Genre"
            value={newGame.genre}
            onChange={(e) =>
              setNewGame({ ...newGame, genre: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Platform"
            value={newGame.platform}
            onChange={(e) =>
              setNewGame({ ...newGame, platform: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Company"
            value={newGame.company}
            onChange={(e) =>
              setNewGame({ ...newGame, company: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Official Link"
            value={newGame.link}
            onChange={(e) =>
              setNewGame({ ...newGame, link: e.target.value })
            }
            style={styles.input}
          />

          <input
            placeholder="Image URL"
            value={newGame.image}
            onChange={(e) =>
              setNewGame({ ...newGame, image: e.target.value })
            }
            style={styles.input}
          />
        </div>

        <button onClick={addGame} style={styles.approve}>
          Add Game
        </button>
      </div>

      <div style={styles.section}>
        <h2>Submitted Suggestions</h2>

        <button onClick={fetchSuggestions} style={styles.button}>
          Refresh Suggestions
        </button>

        {loading && <p>Loading suggestions...</p>}

        {suggestions.length === 0 && !loading && (
          <p style={styles.muted}>No suggestions yet.</p>
        )}

        <div style={styles.grid}>
          {suggestions.map((s) => (
            <div key={s._id} style={styles.card}>
              <h3>{s.gameTitle}</h3>
              <p>
                <b>From:</b> {s.name || "Anonymous"}
              </p>
              <p>
                <b>Message:</b> {s.message || "No message"}
              </p>
              <p>
                <b>Status:</b> {s.status}
              </p>

              <button
                onClick={() => approveSuggestion(s._id)}
                style={styles.approve}
              >
                Approve
              </button>

              <button
                onClick={() => rejectSuggestion(s._id)}
                style={styles.reject}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px",
    background: "#020617",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },

  title: {
    marginBottom: "4px"
  },

  subtitle: {
    opacity: 0.7,
    marginBottom: "20px"
  },

  box: {
    maxWidth: "400px",
    margin: "80px auto",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "14px"
  },

  section: {
    background: "#0f172a",
    padding: "18px",
    borderRadius: "16px",
    marginBottom: "22px"
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "10px",
    boxSizing: "border-box",
    fontSize: "16px"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "10px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px"
  },

  card: {
    background: "#1e293b",
    padding: "16px",
    borderRadius: "14px"
  },

  approve: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#16a34a",
    color: "white",
    fontWeight: "bold",
    marginBottom: "8px",
    cursor: "pointer"
  },

  reject: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#dc2626",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  muted: {
    opacity: 0.7
  }
};

export default Admin;
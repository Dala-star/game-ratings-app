import { useEffect, useState } from "react";

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [games, setGames] = useState([]);
  const [user] = useState("Guest");

  const [commentInputs, setCommentInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  /* ---------------- ADMIN ---------------- */
  const ADMIN_KEY = "1234";

  const [newGame, setNewGame] = useState({
    name: "",
    genre: "",
    platform: "",
    company: "",
    link: "",
    image: ""
  });

  /* ---------------- SUGGESTION FORM ---------------- */
  const [suggestion, setSuggestion] = useState({
    name: "",
    gameTitle: "",
    message: ""
  });

  /* =================================================
     FETCH GAMES
  ================================================= */
  const fetchGames = async () => {
    try {
      const res = await fetch("https://game-ratings-app.onrender.com/games");
      const data = await res.json();
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 15000);
    return () => clearInterval(interval);
  }, []);

  /* =================================================
     UPDATE HELPERS
  ================================================= */
  const updateGameInState = (updated) => {
    setGames((prev) =>
      prev.map((g) => (g._id === updated._id ? updated : g))
    );
  };

  /* =================================================
     ADMIN: ADD GAME
  ================================================= */
const addGame = async () => {
  if (!newGame.name.trim()) {
    alert("Game name is required");
    return;
  }

  const key = prompt("Enter admin key");
  if (!key) return;

  try {
    const res = await fetch("https://game-ratings-app.onrender.com/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "admin-key": key
      },
      body: JSON.stringify(newGame)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    setGames((prev) => [data, ...prev]);

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
  /* =================================================
     RATE GAME
  ================================================= */
  const rateGame = async (id) => {
    let rating = Number(ratingInputs[id]);
    if (!rating) return;

    // clamp 1–5
    rating = Math.max(1, Math.min(5, rating));

    const res = await fetch(`https://game-ratings-app.onrender.com/games/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating })
    });

    const data = await res.json();
    setRatingInputs({ ...ratingInputs, [id]: "" });

    if (res.ok) updateGameInState(data);
  };

  /* =================================================
     COMMENT
  ================================================= */
  const addComment = async (id) => {
    const text = commentInputs[id];
    if (!text) return;

    const res = await fetch(`https://game-ratings-app.onrender.com/games/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user })
    });

    const data = await res.json();
    setCommentInputs({ ...commentInputs, [id]: "" });

    if (res.ok) updateGameInState(data);
  };

  /* =================================================
     SUGGEST GAME (NEW FEATURE)
  ================================================= */
  const submitSuggestion = async () => {
    if (!suggestion.gameTitle) return;

    const res = await fetch("https://game-ratings-app.onrender.com/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(suggestion)
    });

    if (res.ok) {
      alert("Suggestion submitted!");
      setSuggestion({ name: "", gameTitle: "", message: "" });
    }
  };

  /* =================================================
     UTIL
  ================================================= */
  const getAvg = (ratings = []) =>
    ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  const processedGames = games
    .filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") {
        return getAvg(b.ratings) - getAvg(a.ratings);
      }
      return 0;
    });

  /* =================================================
     UI
  ================================================= */
  return (
    <div style={styles.page}>
      <h1>🎮 GameVault</h1>

      {/* SEARCH */}
      <div style={styles.controls}>
        <input
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
       />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      <button
  onClick={() => setShowAdmin(!showAdmin)}
  style={styles.button}
>
  {showAdmin ? "Hide Admin Panel" : "Admin Panel"}
</button>

{/* ADMIN ADD GAME */}
{showAdmin && (
  <div style={styles.adminBox}>
        <h3>Admin Panel(Not for others)</h3>

        {Object.keys(newGame).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={newGame[key]}
            onChange={(e) =>
              setNewGame({ ...newGame, [key]: e.target.value })
            }
          />
        ))}

        <button onClick={addGame}>➕ Add Game</button>
      </div>
)}

      {/* SUGGESTION SYSTEM */}
      <div style={styles.adminBox}>
        <h3>Suggest a Game</h3>

        <input
          placeholder="Your name"
          value={suggestion.name}
          onChange={(e) =>
            setSuggestion({ ...suggestion, name: e.target.value })
          }
        />

        <input
          placeholder="Game title"
          value={suggestion.gameTitle}
          onChange={(e) =>
            setSuggestion({
              ...suggestion,
              gameTitle: e.target.value
            })
          }
        />

        <input
          placeholder="Message"
          value={suggestion.message}
          onChange={(e) =>
            setSuggestion({
              ...suggestion,
              message: e.target.value
            })
          }
        />

        <button onClick={submitSuggestion}>
          Submit Suggestion
        </button>
      </div>

      {/* GAME LIST */}
      <div style={styles.grid}>
        {processedGames.map((game) => {
          const avg = getAvg(game.ratings);
          const stars = Math.round(avg);

          return (
            <div key={game._id} style={styles.card}>
              <img src={game.image} alt="" style={styles.image} />

              <h2>{game.name}</h2>

              <div>
                {"★".repeat(stars)}
                {"☆".repeat(5 - stars)}
                <span> {avg.toFixed(1)}</span>
              </div>

              <div>{game.genre}</div>
        <button
              onClick={() => setExpanded(expanded === game._id ? null : game._id)}
               style={styles.button}
>  
              {expanded === game._id ? "Close" : "View Details"}
        </button>

              {/* RATE */}
              <input
                placeholder="1-5"
                value={ratingInputs[game._id] || ""}
                onChange={(e) =>
                  setRatingInputs({
                    ...ratingInputs,
                    [game._id]: e.target.value
                  })
                }
              />
              <button onClick={() => rateGame(game._id)} style={styles.button}>
                Rate
              </button>

              {/* COMMENTS */}
              <div>
                {(game.comments || []).map((c, i) => (
                  <div key={i}>
                    <b>{c.user}</b>: {c.text}
                  </div>
                ))}

                <input
                  placeholder="comment..."
                  value={commentInputs[game._id] || ""}
                  onChange={(e) =>
                    setCommentInputs({
                      ...commentInputs,
                      [game._id]: e.target.value
                    })
                  }
                />
                <button onClick={() => addComment(game._id)} style={styles.button}>
                  Post
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "16px",
    background: "linear-gradient(135deg, #020617, #0f172a)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box"
  },

  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px"
  },

  adminBox: {
    margin: "20px 0",
    padding: "16px",
    background: "#1e293b",
    borderRadius: "14px",
    display: "grid",
    gap: "10px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px"
  },

  card: {
    background: "#1e293b",
    padding: "14px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    overflow: "hidden"
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    boxSizing: "border-box",
    marginTop: "8px"
  },

  button: {
    width: "100%",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    marginTop: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
export default App;
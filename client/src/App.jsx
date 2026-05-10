import { useEffect, useState } from "react";

const API_URL = "https://game-ratings-app.onrender.com";

function App() {
  const [expanded, setExpanded] = useState(null);
  const [games, setGames] = useState([]);
  const [user] = useState("Guest");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentInputs, setCommentInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [suggestion, setSuggestion] = useState({
    name: "",
    gameTitle: "",
    message: ""
  });

  const fetchGames = async (retries = 3) => {
    setLoading(true);
    setError("");

    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(`${API_URL}/games`);

        if (!res.ok) throw new Error("Backend waking up");

        const data = await res.json();

        setGames(Array.isArray(data) ? data : []);
        setLoading(false);
        return;
      } catch (err) {
        if (i === retries - 1) {
          setError("Backend is waking up. Please refresh in a moment.");
          setLoading(false);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    }
  };

  useEffect(() => {
    fetchGames();

    const interval = setInterval(fetchGames, 15000);

    return () => clearInterval(interval);
  }, []);

  const updateGameInState = (updated) => {
    setGames((prev) =>
      prev.map((g) => (g._id === updated._id ? updated : g))
    );
  };

  const rateGame = async (id) => {
    let rating = Number(ratingInputs[id]);

    if (!rating) return;

    rating = Math.max(1, Math.min(5, rating));

    const res = await fetch(`${API_URL}/games/${id}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rating })
    });

    const data = await res.json();

    setRatingInputs({
      ...ratingInputs,
      [id]: ""
    });

    if (res.ok) updateGameInState(data);
  };

  const addComment = async (id) => {
    const text = commentInputs[id];

    if (!text) return;

    const res = await fetch(`${API_URL}/games/${id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, user })
    });

    const data = await res.json();

    setCommentInputs({
      ...commentInputs,
      [id]: ""
    });

    if (res.ok) updateGameInState(data);
  };

  const submitSuggestion = async () => {
    if (!suggestion.gameTitle.trim()) {
      alert("Please enter a game title");
      return;
    }

    const res = await fetch(`${API_URL}/suggestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(suggestion)
    });

    if (res.ok) {
      alert("Suggestion submitted!");

      setSuggestion({
        name: "",
        gameTitle: "",
        message: ""
      });
    }
  };

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

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🎮 GameVault</h1>

      <p style={styles.subtitle}>
        Rate, review, and suggest games
      </p>

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
          style={styles.input}
        >
          <option value="default">Default</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div style={styles.suggestionBox}>
        <h3>Suggest a Game</h3>

        <p style={styles.muted}>
          Want a game added? Send a suggestion and I’ll review it.
        </p>

        <input
          placeholder="Your name"
          value={suggestion.name}
          style={styles.input}
          onChange={(e) =>
            setSuggestion({
              ...suggestion,
              name: e.target.value
            })
          }
        />

        <input
          placeholder="Game title"
          value={suggestion.gameTitle}
          style={styles.input}
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
          style={styles.input}
          onChange={(e) =>
            setSuggestion({
              ...suggestion,
              message: e.target.value
            })
          }
        />

        <button
          onClick={submitSuggestion}
          style={styles.button}
        >
          Submit Suggestion
        </button>
      </div>

      {loading && (
        <p style={styles.message}>Loading games...</p>
      )}

      {error && (
        <p style={styles.error}>{error}</p>
      )}

      <div style={styles.grid}>
        {processedGames.map((game) => {
          const avg = getAvg(game.ratings);

          const stars = Math.round(avg);

          const isOpen = expanded === game._id;

          return (
            <div
              key={game._id}
              style={styles.card}
            >
              <img
                src={game.image}
                alt={game.name}
                style={styles.image}
              />

              <h2>{game.name}</h2>

              <div style={styles.rating}>
                {"★".repeat(stars)}
                {"☆".repeat(5 - stars)}

                <span> {avg.toFixed(1)} / 5</span>
              </div>

              <p style={styles.genre}>
                {game.genre}
              </p>

              <button
                onClick={() =>
                  setExpanded(isOpen ? null : game._id)
                }
                style={styles.button}
              >
                {isOpen
                  ? "Close Details"
                  : "View Details"}
              </button>

              {isOpen && (
                <div style={styles.details}>
                  <p>
                    <b>Company:</b>{" "}
                    {game.company || "Unknown"}
                  </p>

                  <p>
                    <b>Platform:</b>{" "}
                    {game.platform || "Unknown"}
                  </p>

                  <p>
                    <b>Reviews:</b>{" "}
                    {(game.comments || []).length}
                  </p>

                  {game.link && (
                    <a
                      href={game.link}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.link}
                    >
                      Visit Official Page
                    </a>
                  )}

                  <div style={styles.section}>
                    <h4>Rate this game</h4>

                    <input
                      placeholder="Rate 1-5"
                      value={
                        ratingInputs[game._id] || ""
                      }
                      style={styles.input}
                      onChange={(e) =>
                        setRatingInputs({
                          ...ratingInputs,
                          [game._id]:
                            e.target.value
                        })
                      }
                    />

                    <button
                      onClick={() =>
                        rateGame(game._id)
                      }
                      style={styles.button}
                    >
                      Rate
                    </button>
                  </div>

                  <div style={styles.section}>
                    <h4>Reviews</h4>

                    {(game.comments || []).length ===
                      0 && (
                      <p style={styles.muted}>
                        No reviews yet.
                      </p>
                    )}

                    {(game.comments || []).map(
                      (c, i) => (
                        <div
                          key={i}
                          style={styles.comment}
                        >
                          <b>
                            {c.user || "Guest"}:
                          </b>{" "}
                          {c.text}
                        </div>
                      )
                    )}

                    <input
                      placeholder="Write a review..."
                      value={
                        commentInputs[game._id] || ""
                      }
                      style={styles.input}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [game._id]:
                            e.target.value
                        })
                      }
                    />

                    <button
                      onClick={() =>
                        addComment(game._id)
                      }
                      style={styles.button}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "16px",
    color: "white",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    background: "transparent"
  },

  title: {
    textAlign: "center",
    marginBottom: "4px"
  },

  subtitle: {
    textAlign: "center",
    opacity: 0.75,
    marginBottom: "18px"
  },

  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "14px"
  },

  suggestionBox: {
    margin: "20px 0",
    padding: "16px",
    background: "rgba(15, 23, 42, 0.62)",
    backdropFilter: "blur(16px)",
    borderRadius: "22px",
    display: "grid",
    gap: "10px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px"
  },

  card: {
    background: "rgba(15, 23, 42, 0.62)",
    backdropFilter: "blur(16px)",
    padding: "14px",
    borderRadius: "22px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
    overflow: "hidden"
  },

  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "16px"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    boxSizing: "border-box",
    marginTop: "8px",
    fontSize: "16px",
    background: "rgba(30,41,59,0.65)",
    color: "white"
  },

  button: {
    width: "100%",
    background:
      "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "14px",
    marginTop: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px"
  },

  rating: {
    color: "#facc15",
    marginBottom: "8px"
  },

  genre: {
    opacity: 0.8
  },

  details: {
    marginTop: "12px",
    padding: "12px",
    background: "rgba(2, 6, 23, 0.6)",
    backdropFilter: "blur(14px)",
    borderRadius: "16px"
  },

  section: {
    marginTop: "14px"
  },

  comment: {
    background: "rgba(30, 41, 59, 0.55)",
    padding: "8px",
    borderRadius: "12px",
    marginBottom: "6px",
    fontSize: "14px"
  },

  link: {
    display: "block",
    color: "#60a5fa",
    marginTop: "8px",
    textDecoration: "none",
    fontWeight: "bold"
  },

  message: {
    textAlign: "center",
    opacity: 0.8
  },

  error: {
    textAlign: "center",
    background: "#7f1d1d",
    padding: "12px",
    borderRadius: "10px"
  },

  muted: {
    opacity: 0.65,
    fontSize: "14px"
  }
};

export default App;
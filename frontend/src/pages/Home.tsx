import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

type Deck = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

function Home() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    api
      .get<Deck[]>("/decks/")
      .then((res) => setDecks(res.data))
      .catch(() => {
        setError("Could not load decks. Try logging in again.");
        localStorage.removeItem("access_token");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  async function handleCreateDeck(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const { data } = await api.post<Deck>("/decks/", {
        name,
        description,
      });

      // Add the new deck to the top of the list without refetching
      setDecks((prev) => [data, ...prev]);
      setName("");
      setDescription("");
    } catch {
      setError("Could not create deck.");
    } finally {
      setCreating(false);
    }
  }  

  if (loading)
    return (
      <main>
        <p>Loading decks...</p>
      </main>
    );

  return (
    <main>
      <h1>Your decks</h1>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section>
        <h2>Create a deck</h2>
        <form onSubmit={handleCreateDeck}>
          <div>
            <label htmlFor="deck-name">Name</label>
            <input
              id="deck-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="deck-description">Description</label>
            <input
              id="deck-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create deck"}
          </button>
        </form>
      </section>

      {decks.length === 0 ? (
        <p>No decks yet. Create one above.</p>
      ) : (
        <ul>
          {decks.map((deck) => (
            <li key={deck.id}>
              <Link to={`/decks/${deck.id}`}>
                <strong>{deck.name}</strong>
              </Link>
              {deck.description ? ` — ${deck.description}` : null}{" "}
              <Link to={`/decks/${deck.id}/study`}>Study</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Home;

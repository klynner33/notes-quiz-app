import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import api from "../api/client";

type Deck = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

type Card = {
  id: number;
  deck: number;
  front: string;
  back: string;
  box: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  created_at: string;
};

function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!deckId) return;

    setLoading(true);
    setError("");

    Promise.all([
      api.get<Deck>(`/decks/${deckId}/`),
      api.get<Card[]>("/cards/"),
    ])
      .then(([deckRes, cardsRes]) => {
        setDeck(deckRes.data);
        const id = Number(deckId);
        setCards(cardsRes.data.filter((card) => card.deck === id));
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        setError("Could not load this deck.");
      })
      .finally(() => setLoading(false));
  }, [deckId, navigate]);

  async function handleCreateCard(e: FormEvent) {
    e.preventDefault();
    if (!deckId) return;

    setError("");
    setCreating(true);

    try {
      const { data } = await api.post<Card>("/cards/", {
        deck: Number(deckId),
        front,
        back,
      });

      setCards((prev) => [data, ...prev]);
      setFront("");
      setBack("");
    } catch {
      setError("Could not create card.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteCard(cardId: number) {
    if (!window.confirm("Delete this card?")) return;

    try {
      await api.delete(`/cards/${cardId}/`);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch {
      setError("Could not delete card.");
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading deck...</p>
      </main>
    );
  }

  function startEdit(card: Card) {
    setEditingId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (editingId === null) return;

    try {
      const { data } = await api.patch<Card>(`/cards/${editingId}/`, {
        front: editFront,
        back: editBack,
      });
      setCards((prev) => prev.map((c) => (c.id === editingId ? data : c)));
      setEditingId(null);
    } catch {
      setError("Could not update card.");
    }
  }

  if (!deck) {
    return (
      <main>
        <p>{error || "Deck not found."}</p>
        <Link to="/">Back to decks</Link>
      </main>
    );
  }

  return (
    <main className="deck-details-main">
      <p>
        <Link to="/">← Decks</Link>
      </p>

      <h1>{deck.name}</h1>
      {deck.description && <p>{deck.description}</p>}

      <p>
        <Link to={`/decks/${deck.id}/study`}>Study this deck</Link>
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section className="deck-details-add-card-section">
        <h2>Add a card</h2>
        <form onSubmit={handleCreateCard}>
          <div className="deck-details-add-card-section-field">
            <label htmlFor="front">Front (question)</label>
            <textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              required
            />
          </div>

          <div className="deck-details-add-card-section-field">
            <label htmlFor="back">Back (answer)</label>
            <textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="deck-details-add-card-section-button"
          >
            {creating ? "Adding..." : "Add card"}
          </button>
        </form>
      </section>

      <section className="deck-details-card-list-section">
        <h2>Cards ({cards.length})</h2>
        {cards.length === 0 ? (
          <p>No cards yet. Add one above.</p>
        ) : (
          <ul className="deck-details-card-list">
            {cards.map((card) => (
              <li key={card.id} className="deck-details-card-list-item">
                {editingId === card.id ? (
                  <form
                    className="deck-details-card-edit-form"
                    onSubmit={handleSaveEdit}
                  >
                    <label className="deck-details-card-edit-label">
                      Front
                      <textarea
                        className="deck-details-card-edit-textarea"
                        value={editFront}
                        onChange={(e) => setEditFront(e.target.value)}
                        required
                      />
                    </label>
                    <label className="deck-details-card-edit-label">
                      Back
                      <textarea
                        className="deck-details-card-edit-textarea"
                        value={editBack}
                        onChange={(e) => setEditBack(e.target.value)}
                        required
                      />
                    </label>
                    <div className="deck-details-card-actions">
                      <button type="submit" className="deck-details-card-btn">
                        Save
                      </button>
                      <button
                        type="button"
                        className="deck-details-card-btn deck-details-card-btn-secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="deck-details-card-content">
                      <strong className="deck-details-card-front">
                        {card.front}
                      </strong>
                      <div className="deck-details-card-back">{card.back}</div>
                    </div>
                    <div className="deck-details-card-actions">
                      <button
                        type="button"
                        className="deck-details-card-btn"
                        onClick={() => startEdit(card)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="deck-details-card-btn deck-details-card-btn-danger"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default DeckDetail;
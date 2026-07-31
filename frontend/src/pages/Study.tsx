import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

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

type Rating = "easy" | "medium" | "hard";

function Study() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!deckId) return;

    setLoading(true);
    setError("");

    api
      .get<Card[]>(`/decks/${deckId}/study/`)
      .then((res) => {
        setCards(res.data);
        setIndex(0);
        setRevealed(false);
      })
      .catch(() => setError("Could not load study cards."))
      .finally(() => setLoading(false));
  }, [deckId, navigate]);

  const current = cards[index];
  const done = !loading && !error && cards.length === 0;
  const finishedSession =
    !loading && !error && cards.length > 0 && index >= cards.length;

  async function handleRating(rating: Rating) {
    if (!current || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post(`/cards/${current.id}/review/`, { rating });
      setRevealed(false);
      setIndex((i) => i + 1);
    } catch {
      setError("Could not save rating. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading study session...</p>
      </main>
    );
  }

  if (done || finishedSession) {
    return (
      <main>
        <h1>Study complete</h1>
        <p>
          {done
            ? "No cards due right now."
            : "You've reviewed all due cards in this session."}
        </p>
        <Link to="/">Back to decks</Link>
      </main>
    );
  }

  if (!current) {
    return (
      <main>
        <p>Something went wrong.</p>
        <Link to="/">Back to decks</Link>
      </main>
    );
  }

  return (
    <main>
      <p>
        <Link to="/">← Decks</Link>
      </p>
      <h1>Study</h1>
      <p>
        Card {index + 1} of {cards.length}
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section>
        <h2>Question</h2>
        <p>{current.front}</p>

        {!revealed ? (
          <button type="button" onClick={() => setRevealed(true)}>
            Reveal answer
          </button>
        ) : (
          <>
            <h2>Answer</h2>
            <p>{current.back}</p>

            <div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRating("hard")}
              >
                Hard
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRating("medium")}
              >
                Medium
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRating("easy")}
              >
                Easy
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Study;

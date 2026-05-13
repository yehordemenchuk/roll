import { useEffect, useState } from 'react';
import { api } from '../api';
import type { Score } from '../api';
import { GAME_NAME } from '../game/constants';

export function LeaderboardPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await api.topScores(GAME_NAME);
        if (!cancelled) setScores(list.slice(0, 10));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Chyba pri načítaní');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="container">
      <header className="card">
        <h1>Top 10 — CubeRoll</h1>
        <p className="muted">Najlepšie skóre podľa backendu.</p>
      </header>
      <section className="card stats-home">
        <h2>Rebríček</h2>
        {loading ? <p>Načítavam…</p> : null}
        {error ? <p className="status error">{error}</p> : null}
        {!loading && !error ? (
          <ol className="top-list">
            {scores.length === 0 ? <li>Zatiaľ žiadne skóre</li> : null}
            {scores.map((score) => (
              <li key={score.id}>
                <span>{score.player}</span>
                <strong>{score.points}</strong>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </main>
  );
}

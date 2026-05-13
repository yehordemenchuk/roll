import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { GAME_NAME } from '../game/constants';
import { useAuth } from '../auth/AuthContext';

type Status = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export function HomePage() {
  const { username, email } = useAuth();
  const [ratingValue, setRatingValue] = useState(5);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({
    loading: false,
    error: null,
    success: null,
  });

  const player = (username?.trim() || email?.trim() || '').trim();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const avg = await api.averageRating(GAME_NAME);
        if (!cancelled) {
          setAverageRating(
            typeof avg.averageRating === 'number' ? avg.averageRating : null,
          );
        }
      } catch {
        if (!cancelled) setAverageRating(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitRatingRequest() {
    if (!player) return;
    setStatus({ loading: true, error: null, success: null });
    try {
      await api.upsertRating({
        game: GAME_NAME,
        player,
        rating: ratingValue,
        ratedOn: new Date().toISOString(),
      });
      const avg = await api.averageRating(GAME_NAME);
      setAverageRating(typeof avg.averageRating === 'number' ? avg.averageRating : null);
      setStatus({ loading: false, error: null, success: 'Hodnotenie uložené.' });
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Chyba pri ukladaní hodnotenia',
        success: null,
      });
    }
  }

  return (
    <main className="container">
      <header className="card home-hero">
        <h1 className="brand-title">CubeRoll</h1>
        <p>3D platformová verzia CubeRoll v štýle pôvodného herného poľa.</p>
        <div className="hero-orbs">
          <span />
          <span />
          <span />
        </div>
      </header>

      <div className="home-single">
        <section className="card">
          <h2>Pravidlá</h2>
          <ul className="rules-list">
            <li>Ovládaš jednu kocku na dráhe z dlaždíc; medzi dlaždicami sú medzery.</li>
            <li>Šípkami alebo tlačidlami posúvaš kocku o jedno pole v danom smere.</li>
            <li>Skok do prázdna = pád, trestné body a návrat na začiatok levelu.</li>
            <li>Cieľ je žltá cieľová dlaždica; menej ťahov a menej trestov = vyššie skóre.</li>
            <li>Po výhre môžeš reštartovať level, ísť domov alebo na ďalší level.</li>
          </ul>
        </section>

        <section className="card">
          <h2>Ohodnoť hru</h2>
          <div className="rating-chip">
            <span className="rating-label">Priemerné hodnotenie</span>
            <strong>{averageRating === null ? '-' : averageRating.toFixed(2)}</strong>
          </div>
          <div className="stars" role="radiogroup" aria-label="Hodnotenie">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= ratingValue ? 'active' : ''}`}
                onClick={() => setRatingValue(star)}
                aria-label={`Hodnotenie ${star}`}
              >
                ★
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void submitRatingRequest()}
            disabled={!player || status.loading}
          >
            {status.loading ? 'Ukladám…' : 'Uložiť hodnotenie'}
          </button>
        </section>

        <section className="card home-actions">
          <h2>Začať</h2>
          <p className="muted">Hráč (meno): {player || '—'}</p>
          <div className="actions">
            <Link to="/game" className="button-link">
              Prejsť do hry
            </Link>
            <Link to="/leaderboard" className="button-link secondary">
              Rebríček Top 10
            </Link>
          </div>
        </section>
      </div>

      {status.error ? <p className="status error">{status.error}</p> : null}
      {status.success ? <p className="status ok">{status.success}</p> : null}
    </main>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Comment } from '../api';
import { useAuth } from '../auth/AuthContext';
import { GameScene } from '../game/GameScene';
import {
  FALL_PENALTY,
  GAME_NAME,
  LEVELS,
  cellKey,
  moveCell,
  todayIsoDateTime,
  type Cell,
  type Direction,
} from '../game/constants';

type Status = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('sk-SK');
}

export function GamePage() {
  const { username, email } = useAuth();
  /** Meno hráča: username z API; ak ešte nie je, dočasne e-mail z tokenu (aby šli komentáre / skóre). */
  const player = (username?.trim() || email?.trim() || '').trim();

  const [levelIndex, setLevelIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const [status, setStatus] = useState<Status>({
    loading: false,
    error: null,
    success: null,
  });
  const currentLevel = LEVELS[levelIndex];
  const [cube, setCube] = useState<Cell>(currentLevel.start);
  const [moves, setMoves] = useState(0);
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [won, setWon] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [savedGameScore, setSavedGameScore] = useState(false);
  const [rolling, setRolling] = useState(false);
  /** Zvýši sa pri novej hre / ďalšej úrovni — zruší „úspech“ z oneskoreného uložSkore po zmene stavu. */
  const scoreSessionRef = useRef(0);
  const canPlay = player.length > 0;
  const tileSet = useMemo(() => new Set(currentLevel.tiles.map(cellKey)), [currentLevel]);

  useEffect(() => {
    api
      .commentsByGame(GAME_NAME)
      .then((loadedComments) => setComments(loadedComments))
      .catch(() => undefined);
    const timer = window.setInterval(() => {
      api
        .commentsByGame(GAME_NAME)
        .then((loadedComments) => setComments(loadedComments))
        .catch(() => undefined);
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        pohni('up');
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        pohni('down');
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        pohni('left');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        pohni('right');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function bodyZaHru(pocetTahov: number) {
    return Math.max(100, 2000 - pocetTahov * 30 - penaltyPoints);
  }

  function starsByScore(score: number) {
    if (score >= 1400) return 3;
    if (score >= 900) return 2;
    return 1;
  }

  async function ulozSkore(points: number, totalMoves: number) {
    if (!canPlay || savedGameScore) {
      return;
    }

    const sessionAtStart = scoreSessionRef.current;

    try {
      await api.addScore({
        game: GAME_NAME,
        player,
        points,
        playedOn: todayIsoDateTime(),
      });
      if (scoreSessionRef.current !== sessionAtStart) {
        return;
      }
      setSavedGameScore(true);
      setStatus({
        loading: false,
        error: null,
        success: `Výhra! Skóre ${points} uložené za ${totalMoves} ťahov.`,
      });
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Chyba pri ukladaní skóre',
        success: null,
      });
    }
  }

  async function pohni(smer: Direction) {
    if (!canPlay || won || rolling) {
      return;
    }

    setRolling(true);
    const moved = moveCell(cube, smer);
    const noveTahy = moves + 1;
    const valid = tileSet.has(cellKey(moved));

    if (!valid) {
      setPenaltyPoints((prev) => prev + FALL_PENALTY);
      setMoves(noveTahy);
      setStatus({
        loading: false,
        error: `Spadol si z platformy. Trest −${FALL_PENALTY} bodov.`,
        success: null,
      });
      setTimeout(() => {
        setCube(currentLevel.start);
        setRolling(false);
      }, 240);
      return;
    }

    setCube(moved);
    setMoves(noveTahy);

    const jeVyhra = moved.x === currentLevel.goal.x && moved.y === currentLevel.goal.y;
    if (jeVyhra) {
      setWon(true);
      const vysledok = bodyZaHru(noveTahy);
      setLastScore(vysledok);
      await ulozSkore(vysledok, noveTahy);
    }
    setRolling(false);
  }

  function novaHra() {
    scoreSessionRef.current += 1;
    setCube(currentLevel.start);
    setMoves(0);
    setPenaltyPoints(0);
    setWon(false);
    setLastScore(0);
    setSavedGameScore(false);
  }

  function restartLevel() {
    novaHra();
  }

  function nextLevel() {
    scoreSessionRef.current += 1;
    const nextIndex = (levelIndex + 1) % LEVELS.length;
    setLevelIndex(nextIndex);
    setCube(LEVELS[nextIndex].start);
    setMoves(0);
    setPenaltyPoints(0);
    setWon(false);
    setLastScore(0);
    setSavedGameScore(false);
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!canPlay || !commentText.trim()) return;

    setStatus({ loading: true, error: null, success: null });

    try {
      await api.addComment({
        game: GAME_NAME,
        player,
        comment: commentText.trim(),
        datedOn: todayIsoDateTime(),
      });
      setCommentText('');
      const loadedComments = await api.commentsByGame(GAME_NAME);
      setComments(loadedComments);
      setStatus({ loading: false, error: null, success: 'Komentár odoslaný.' });
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Chyba pri odosielaní komentára',
        success: null,
      });
    }
  }

  return (
    <main className="container game-layout">
      <section className="game-main">
        <header className="card">
          <h1>CubeRoll: Hra</h1>
          <p>
            Hráč: {player || '—'}{' '}
            <Link to="/" className="inline-link">
              Domov
            </Link>
          </p>
          <div className="actions">
            <button type="button" onClick={novaHra}>
              Nová hra
            </button>
          </div>
        </header>

        <section className="card game-card">
          <h2>Hracie pole</h2>
          <p>Cieľ: dostať kocku na žltú cieľovú dlaždicu.</p>
          <div className="board block-board webgl-board">
            <GameScene cube={cube} tiles={currentLevel.tiles} goal={currentLevel.goal} />
          </div>
          <div className="stats stats-level">
            <span>
              Úroveň: {levelIndex + 1}/{LEVELS.length}
            </span>
          </div>
          <div className="actions">
            <button type="button" onClick={() => pohni('up')} disabled={rolling || won || !canPlay}>
              Hore
            </button>
            <button type="button" onClick={() => pohni('left')} disabled={rolling || won || !canPlay}>
              Vľavo
            </button>
            <button type="button" onClick={() => pohni('right')} disabled={rolling || won || !canPlay}>
              Vpravo
            </button>
            <button type="button" onClick={() => pohni('down')} disabled={rolling || won || !canPlay}>
              Dole
            </button>
            <button
              type="button"
              onClick={() =>
                pohni(['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Direction)
              }
              disabled={rolling || won || !canPlay}
            >
              {rolling ? 'Pohyb…' : 'Náhodný ťah'}
            </button>
          </div>
          <p className="legend">Použi šípky alebo tlačidlá. Ak je pred tebou prázdno, kocka spadne z platformy.</p>
        </section>
      </section>

      <aside className="card comments-side">
        <h2>Komentáre (live)</h2>
        <ul className="comments-list">
          {comments.length === 0 ? <li>Zatiaľ žiadne komentáre</li> : null}
          {comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.player}</strong>: {comment.comment}
              <small>{formatDate(comment.datedOn)}</small>
            </li>
          ))}
        </ul>
        <form onSubmit={submitComment}>
          <label>
            Text
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Napíš komentár k hre"
            />
          </label>
          <button type="submit" disabled={!canPlay || !commentText.trim() || status.loading}>
            Odoslať
          </button>
        </form>
        {status.error ? <p className="status error">{status.error}</p> : null}
        {status.success ? <p className="status ok">{status.success}</p> : null}
      </aside>
      {won ? (
        <div className="win-modal-backdrop">
          <div className="win-modal card color-pop">
            <h3>Vyhral si!</h3>
            <p>Skvelé, dokončil si úroveň za {moves} ťahov.</p>
            <p className="score-line">
              Skóre: <strong>{lastScore}</strong>
            </p>
            <div className="result-stars" aria-label="Získané hviezdy">
              {[1, 2, 3].map((star) => (
                <span key={star} className={star <= starsByScore(lastScore) ? 'on' : ''}>
                  ★
                </span>
              ))}
            </div>
            <div className="actions">
              <button type="button" onClick={restartLevel}>
                Reštart úrovne
              </button>
              <Link to="/" className="button-link">
                Na hlavnú stránku
              </Link>
              <button type="button" onClick={nextLevel}>
                Ďalšia úroveň
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

import { apiRequest } from './http';

export type Score = {
  id: number;
  game: string;
  player: string;
  points: number;
  playedOn: string;
};

export type Comment = {
  id: number;
  game: string;
  player: string;
  comment: string;
  datedOn: string;
};

export type Rating = {
  id: number;
  game: string;
  player: string;
  rating: number;
  ratedOn: string;
};

export type AverageRating = {
  averageRating: number | null;
};

/** GET /users/{email} — odpoveď z UserController (Jackson: camelCase). */
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  userRole?: string;
};

export async function fetchUserProfileByEmail(email: string): Promise<UserProfile> {
  const raw = await apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(email)}`);
  const u =
    (typeof raw.username === 'string' && raw.username.trim()) ||
    (typeof raw.userName === 'string' && raw.userName.trim()) ||
    '';
  const id = typeof raw.id === 'number' ? raw.id : Number(raw.id);
  const em = (typeof raw.email === 'string' && raw.email.trim()) || email;
  const userRole = typeof raw.userRole === 'string' ? raw.userRole : undefined;
  return { id, username: u, email: em, userRole };
}

export const api = {
  topScores: (game: string) =>
    apiRequest<Score[]>(`/scores/top/${encodeURIComponent(game)}`),
  addScore: (payload: Omit<Score, 'id'>) =>
    apiRequest<Score>('/scores/', { method: 'POST', body: JSON.stringify(payload) }),
  commentsByGame: (game: string) =>
    apiRequest<Comment[]>(`/comments/by-game/${encodeURIComponent(game)}`),
  addComment: (payload: Omit<Comment, 'id'>) =>
    apiRequest<Comment>('/comments/', { method: 'POST', body: JSON.stringify(payload) }),
  averageRating: (game: string) =>
    apiRequest<AverageRating>(`/ratings/avg/${encodeURIComponent(game)}`),
  upsertRating: (payload: Omit<Rating, 'id'>) =>
    apiRequest<Rating>('/ratings/', { method: 'POST', body: JSON.stringify(payload) }),
};

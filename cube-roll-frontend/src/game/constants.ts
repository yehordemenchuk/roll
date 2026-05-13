export const GAME_NAME = 'CubeRoll';
export const FALL_PENALTY = 120;

export type Direction = 'up' | 'down' | 'left' | 'right';
export type Cell = { x: number; y: number };
export type LevelConfig = {
  start: Cell;
  goal: Cell;
  tiles: Cell[];
};

export const LEVELS: LevelConfig[] = [
  {
    start: { x: 0, y: 0 },
    goal: { x: 6, y: 0 },
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
    ],
  },
  {
    start: { x: 0, y: 0 },
    goal: { x: 6, y: 1 },
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
      { x: 4, y: 0 },
    ],
  },
  {
    start: { x: 1, y: 0 },
    goal: { x: 6, y: 0 },
    tiles: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
    ],
  },
];

export function todayIsoDateTime() {
  return new Date().toISOString();
}

export function moveCell(cell: Cell, direction: Direction): Cell {
  if (direction === 'up') return { x: cell.x, y: cell.y - 1 };
  if (direction === 'down') return { x: cell.x, y: cell.y + 1 };
  if (direction === 'left') return { x: cell.x - 1, y: cell.y };
  return { x: cell.x + 1, y: cell.y };
}

export function cellKey(cell: Cell) {
  return `${cell.x},${cell.y}`;
}

export function toWorld(cell: Cell) {
  return {
    x: (cell.x - 3) * 1.12,
    z: (cell.y - 0.5) * 1.12,
  };
}

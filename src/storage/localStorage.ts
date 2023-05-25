import { Board } from '../mvr-board.js';

export async function loadBoard(key: string): Promise<Board | undefined> {
  const payload = localStorage.getItem(key);
  if (payload === null) {
    return undefined;
  }
  try {
    return JSON.parse(payload);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

export async function saveBoard(board: Board) {
  localStorage.setItem(board.id, JSON.stringify(board));
}

import { createClient } from '@supabase/supabase-js';
import type { Board } from '../mvr-board.js';

type ID = `${string}-${string}-${string}-${string}-${string}`;

const TABLE = 'boards';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function loadBoard(id: ID): Promise<Board | undefined> {
  const result = await supabase
    .from(TABLE)
    .select('id, preferences, items')
    .eq('id', id)
    .single<Board>();

  return result.data ?? undefined;
}

export async function saveBoard(board: Board) {
  return supabase.from(TABLE).upsert(board);
}

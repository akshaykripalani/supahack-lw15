import { supabase } from '../lib/supabase';

export interface ScoreRow {
  id?: number;
  username: string;
  score: number;
  time_ms: number;
  created_at?: string;
}

/**
 * Submit a score to the Supabase backend using the `upsert_score` Postgres function.
 * The backend function is expected to:
 *   – Insert a new row if the username does not exist.
 *   – Update the existing row ONLY if the new score is higher.
 */
export async function submitScore(
  username: string,
  score: number,
  time_ms: number,
): Promise<void> {
  const { error } = await supabase.rpc('upsert_score', {
    p_username: username,
    p_score: score,
    p_time_ms: time_ms,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to submit score', error);
  }
}

/**
 * Fetch the Top-N leaderboard entries ordered by descending score.
 * Defaults to top-10.
 */
export async function fetchTopScores(limit = 10): Promise<ScoreRow[]> {
  const { data, error } = await supabase
    .from('scores') // Table structure: id, username, score, time_ms, created_at
    .select('*')
    .order('score', { ascending: false })
    .order('time_ms', { ascending: true })
    .limit(limit);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch leaderboard', error);
    return [];
  }

  return data as ScoreRow[];
} 
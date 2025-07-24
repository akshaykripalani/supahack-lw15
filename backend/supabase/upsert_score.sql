-- SQL script to create (or replace) the Postgres function used by the frontend.
-- Execute this in your Supabase project's SQL editor.

create or replace function upsert_score(
  p_username text,
  p_score int,
  p_time_ms int
) returns void
language plpgsql
as $$
begin
  insert into scores (username, score, time_ms)
  values (p_username, p_score, p_time_ms)
  on conflict (username)
  do update
    set score      = p_score,
        time_ms    = p_time_ms,
        created_at = now()
  where scores.score < p_score
     or (scores.score = p_score and scores.time_ms > p_time_ms);
end;
$$; 
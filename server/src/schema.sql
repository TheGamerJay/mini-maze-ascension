CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id              BIGSERIAL PRIMARY KEY,
  username        TEXT NOT NULL,
  highest_level   INT  NOT NULL,
  score           BIGINT NOT NULL,
  time_survived_s INT NOT NULL,
  bosses_killed   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON leaderboard_entries (highest_level DESC, time_survived_s DESC, score DESC);

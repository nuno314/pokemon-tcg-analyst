export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_userId_idx ON session(user_id);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE INDEX IF NOT EXISTS account_userId_idx ON account(user_id);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  ptcgl_name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);

CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  raw_list TEXT NOT NULL,
  pokemon_count INTEGER NOT NULL DEFAULT 0,
  trainer_count INTEGER NOT NULL DEFAULT 0,
  energy_count INTEGER NOT NULL DEFAULT 0,
  total_cards INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE INDEX IF NOT EXISTS decks_userId_idx ON decks(user_id);

CREATE TABLE IF NOT EXISTS deck_cards (
  id TEXT PRIMARY KEY NOT NULL,
  deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  qty INTEGER NOT NULL,
  name TEXT NOT NULL,
  set_code TEXT NOT NULL,
  collector_number TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS deck_cards_deckId_idx ON deck_cards(deck_id);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  deck_id TEXT REFERENCES decks(id) ON DELETE SET NULL,
  raw_log TEXT NOT NULL,
  log_hash TEXT NOT NULL,
  opponent_name TEXT NOT NULL,
  went_first TEXT,
  winner TEXT,
  result TEXT NOT NULL,
  result_reason TEXT,
  user_note TEXT NOT NULL DEFAULT '',
  imported_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE INDEX IF NOT EXISTS matches_userId_importedAt_idx ON matches(user_id, imported_at);
CREATE INDEX IF NOT EXISTS matches_deckId_idx ON matches(deck_id);
CREATE UNIQUE INDEX IF NOT EXISTS matches_userId_logHash_uidx ON matches(user_id, log_hash);

CREATE TABLE IF NOT EXISTS match_turns (
  id TEXT PRIMARY KEY NOT NULL,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  player TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS match_turns_matchId_idx ON match_turns(match_id);

CREATE TABLE IF NOT EXISTS match_events (
  id TEXT PRIMARY KEY NOT NULL,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  turn_id TEXT REFERENCES match_turns(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  payload TEXT
);
CREATE INDEX IF NOT EXISTS match_events_matchId_idx ON match_events(match_id);
CREATE INDEX IF NOT EXISTS match_events_turnId_idx ON match_events(turn_id);

CREATE TABLE IF NOT EXISTS match_analyses (
  id TEXT PRIMARY KEY NOT NULL,
  match_id TEXT NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  good_plays TEXT NOT NULL,
  mistakes TEXT NOT NULL,
  tips TEXT NOT NULL,
  opponent_notes TEXT NOT NULL,
  raw_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE INDEX IF NOT EXISTS match_analyses_userId_idx ON match_analyses(user_id);

CREATE TABLE IF NOT EXISTS player_assessments (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
  match_count INTEGER NOT NULL,
  archetype TEXT NOT NULL,
  summary TEXT NOT NULL,
  strengths TEXT NOT NULL,
  weaknesses TEXT NOT NULL,
  focus TEXT NOT NULL,
  raw_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);

CREATE TABLE IF NOT EXISTS quest_completions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  day_key TEXT NOT NULL,
  completed_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE INDEX IF NOT EXISTS quest_completions_userId_dayKey_idx ON quest_completions(user_id, day_key);
CREATE UNIQUE INDEX IF NOT EXISTS quest_completions_userId_dayKey_questId_uidx ON quest_completions(user_id, day_key, quest_id);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY NOT NULL,
  requester_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  addressee_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
);
CREATE UNIQUE INDEX IF NOT EXISTS friendships_requester_addressee_uidx ON friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS friendships_addresseeId_idx ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS friendships_requesterId_idx ON friendships(requester_id);
`;

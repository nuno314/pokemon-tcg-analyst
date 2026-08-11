import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (t) => [index("account_userId_idx").on(t.userId)],
);

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export const profiles = sqliteTable("profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  ptcglName: text("ptcgl_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export const decks = sqliteTable(
  "decks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    rawList: text("raw_list").notNull(),
    pokemonCount: integer("pokemon_count").notNull().default(0),
    trainerCount: integer("trainer_count").notNull().default(0),
    energyCount: integer("energy_count").notNull().default(0),
    totalCards: integer("total_cards").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (t) => [index("decks_userId_idx").on(t.userId)],
);

export const deckCards = sqliteTable(
  "deck_cards",
  {
    id: text("id").primaryKey(),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    category: text("category", { enum: ["pokemon", "trainer", "energy"] }).notNull(),
    qty: integer("qty").notNull(),
    name: text("name").notNull(),
    setCode: text("set_code").notNull(),
    collectorNumber: text("collector_number").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("deck_cards_deckId_idx").on(t.deckId)],
);

export const matches = sqliteTable(
  "matches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    deckId: text("deck_id").references(() => decks.id, { onDelete: "set null" }),
    rawLog: text("raw_log").notNull(),
    logHash: text("log_hash").notNull(),
    opponentName: text("opponent_name").notNull(),
    wentFirst: text("went_first"),
    winner: text("winner"),
    result: text("result", { enum: ["win", "loss"] }).notNull(),
    resultReason: text("result_reason"),
    userNote: text("user_note").notNull().default(""),
    importedAt: integer("imported_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (t) => [
    index("matches_userId_importedAt_idx").on(t.userId, t.importedAt),
    index("matches_deckId_idx").on(t.deckId),
    uniqueIndex("matches_userId_logHash_uidx").on(t.userId, t.logHash),
  ],
);

export const matchTurns = sqliteTable(
  "match_turns",
  {
    id: text("id").primaryKey(),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    turnNumber: integer("turn_number").notNull(),
    player: text("player").notNull(),
  },
  (t) => [index("match_turns_matchId_idx").on(t.matchId)],
);

export const matchEvents = sqliteTable(
  "match_events",
  {
    id: text("id").primaryKey(),
    matchId: text("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    turnId: text("turn_id").references(() => matchTurns.id, { onDelete: "cascade" }),
    seq: integer("seq").notNull(),
    type: text("type").notNull(),
    text: text("text").notNull(),
    payload: text("payload"),
  },
  (t) => [
    index("match_events_matchId_idx").on(t.matchId),
    index("match_events_turnId_idx").on(t.turnId),
  ],
);

export const matchAnalyses = sqliteTable(
  "match_analyses",
  {
    id: text("id").primaryKey(),
    matchId: text("match_id")
      .notNull()
      .unique()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    goodPlays: text("good_plays").notNull(),
    mistakes: text("mistakes").notNull(),
    tips: text("tips").notNull(),
    opponentNotes: text("opponent_notes").notNull(),
    rawJson: text("raw_json"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (t) => [index("match_analyses_userId_idx").on(t.userId)],
);

export const playerAssessments = sqliteTable("player_assessments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  matchCount: integer("match_count").notNull(),
  archetype: text("archetype").notNull(),
  summary: text("summary").notNull(),
  strengths: text("strengths").notNull(),
  weaknesses: text("weaknesses").notNull(),
  focus: text("focus").notNull(),
  rawJson: text("raw_json"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
});

export const questCompletions = sqliteTable(
  "quest_completions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questId: text("quest_id").notNull(),
    dayKey: text("day_key").notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  },
  (t) => [
    index("quest_completions_userId_dayKey_idx").on(t.userId, t.dayKey),
    uniqueIndex("quest_completions_userId_dayKey_questId_uidx").on(t.userId, t.dayKey, t.questId),
  ],
);

export const decksRelations = relations(decks, ({ many, one }) => ({
  cards: many(deckCards),
  matches: many(matches),
  user: one(user, { fields: [decks.userId], references: [user.id] }),
}));

export const deckCardsRelations = relations(deckCards, ({ one }) => ({
  deck: one(decks, { fields: [deckCards.deckId], references: [decks.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  deck: one(decks, { fields: [matches.deckId], references: [decks.id] }),
  turns: many(matchTurns),
  events: many(matchEvents),
}));

export const matchTurnsRelations = relations(matchTurns, ({ one, many }) => ({
  match: one(matches, { fields: [matchTurns.matchId], references: [matches.id] }),
  events: many(matchEvents),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, { fields: [matchEvents.matchId], references: [matches.id] }),
  turn: one(matchTurns, { fields: [matchEvents.turnId], references: [matchTurns.id] }),
}));

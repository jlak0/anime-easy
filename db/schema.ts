import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const anime = sqliteTable("anime", {
  tmdb_id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  english_name: text("english_name"),
  chinese_name: text("chinese_name"),
});

export const group = sqliteTable("group", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  group: text("group").notNull().unique(),
  score: integer("score").notNull(),
});

export const subtitle = sqliteTable("subtitle", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lang: text("lang").unique(),
  score: integer("score").notNull(),
});

export const episode = sqliteTable("episode", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  group_id: integer("group_id")
    .notNull()
    .references(() => group.id),
  episode: integer("episode").notNull(),
  season: integer("season").notNull(),
  link: text("link").notNull().unique(),
  pub_date: text("pub_date").notNull(),
  status: text("status").notNull(),
  score: integer("score").notNull(),
  resolution: text("resolution"),
  source: text("source"),
  original_title: text("original_title").notNull(),
  hash: text("hash").notNull().unique(),
  subtitle_id: integer("subtitle_id").references(() => subtitle.id),
  tmdb_id: integer("tmdb_id")
    .notNull()
    .references(() => anime.tmdb_id),
});

export type InsertAnime = typeof anime.$inferInsert;
export type SelectAnime = typeof anime.$inferSelect;

export type InsertEpisode = typeof episode.$inferInsert;
export type SelectEpisode = typeof episode.$inferSelect;

export type InsertGroup = typeof group.$inferInsert;
export type SelectGroup = typeof group.$inferSelect;

export type InsertSubtitle = typeof subtitle.$inferInsert;
export type SelectSubtitle = typeof subtitle.$inferSelect;

import { db } from "./db/db";
import { anime, episode, subtitle, group } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { extractBtih } from "./utils";
export async function findSubtitle(sub: string) {
  const lang = await db.select().from(subtitle).where(eq(subtitle.lang, sub));
  if (lang.length === 0) {
    await db.insert(subtitle).values({
      lang: sub,
      score: 1,
    });
  }
  return lang;
}

export async function findGroup(name: string) {
  const group_db = await db.select().from(group).where(eq(group.group, name));
  if (group_db.length === 0) {
    await db.insert(group).values({
      group: name,
      score: 1,
    });
  }
  return group_db;
}

export async function findAnime(tmdb, chinese_name) {
  const id = await db.select().from(anime).where(eq(anime.tmdb_id, tmdb.id));
  if (id.length === 0) {
    await db.insert(anime).values({
      tmdb_id: tmdb.id,
      name: tmdb.original_name,
      english_name: tmdb.name,
      chinese_name: chinese_name,
    });
  }
  return id;
}

export async function findEpisode(ep, tmdb_id, season) {
  const id = await db
    .select()
    .from(episode)
    .where(
      and(
        eq(episode.tmdb_id, tmdb_id),
        eq(episode.episode, ep),
        eq(episode.season, season)
      )
    );
  return id;
}

export async function newEpisode(tmdb, ts, item, group_id, subtitle_id, score) {
  const hash = extractBtih(item.enclosure?.url);
  if (hash) {
    await db.insert(episode).values({
      tmdb_id: tmdb.id,
      group_id: group_id,
      episode: ts.episode,
      season: ts.season,
      original_title: item.title,
      link: item.link,
      pub_date: item.isoDate,
      score: score,
      source: ts.source,
      status: "pending",
      resolution: ts.resolution,
      subtitle_id: subtitle_id,
      hash: hash,
    });
  }
}

export async function deleteEpisode(id: number) {
  return await db.delete(episode).where(eq(episode.id, id));
}

export async function updateEpisode(id: number) {
  return await db
    .update(episode)
    .set({ status: "delete" })
    .where(eq(episode.id, id));
}

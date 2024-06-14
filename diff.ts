import { parse } from "./bgmParser";
import Parser from "rss-parser";
import { searchWithFallback } from "./tmdbOperations";
const parser = new Parser();
import { calculateScore } from "./utils";

const notInclude = ["合集", "BDRIP", "剧场版", "特别篇"];
const toInclude = ["Ani", "Lilith-Raws", "喵萌奶茶屋", "LoliHouse"];
import {
  findAnime,
  findEpisode,
  findGroup,
  findSubtitle,
  newEpisode,
  deleteEpisode,
  updateEpisode,
} from "./dbOperations";
// 创建正则表达式
const filter = new RegExp(notInclude.join("|"), "i");
const must_have = new RegExp(toInclude.join("|"), "i");

const feed = await parser.parseURL(
  "https://share.dmhy.org/topics/rss/sort_id/2/rss.xml"
);
let count = 0;
for (const item of feed.items) {
  if (
    item.title &&
    item.link &&
    item.isoDate &&
    !filter.test(item.title) &&
    must_have.test(item.title) &&
    !/\[\d{2}-\d{2}\]/.test(item.title)
  ) {
    try {
      // const py = await getPythonResult(item.title);
      const ts = parse(item.title);
      if (ts) {
        const tmdb = await searchWithFallback(ts, "en-US");
        // console.log(tmdb);
        if (!tmdb) continue;
        const chinese_name = (await searchWithFallback(ts, "zh-CN")).name;
        // console.log(chinese_name);
        // console.log(tmdb.name);
        const anime = await findAnime(tmdb, chinese_name);
        // console.log(anime);
        let group;
        let subtitle;
        if (ts.group) {
          group = await findGroup(ts.group);
        }
        if (ts.subtitle) {
          subtitle = await findSubtitle(ts.subtitle);
        }
        // console.log(group);
        if (tmdb.id && ts.group && ts.episode && ts.season) {
          const ep = await findEpisode(ts.episode, tmdb.id, ts.season);
          // console.log(ep.length);
          const score = calculateScore(group[0].score, subtitle[0].score || 1);

          if (ep.length === 0) {
            // console.log("创建新的");
            await newEpisode(
              tmdb,
              ts,
              item,
              group[0].id,
              subtitle[0].id,
              score
            );
          } else {
            for (let e of ep) {
              if (e.score < score) {
                if (e.status === "pending") {
                  await deleteEpisode(e.id);
                } else {
                  await updateEpisode(e.id);
                }
                await newEpisode(
                  tmdb,
                  ts,
                  item,
                  group[0].id,
                  subtitle[0].id,
                  score
                );
              } else {
                continue;
              }
            }
            // console.log("新函数");
          }
        }
      }
    } catch (e) {
      console.log(e.message);
      count++;
    }
  }
}
console.log(count);

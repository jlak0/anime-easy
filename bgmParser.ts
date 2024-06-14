interface episode {
  name_en?: string;
  name_zh?: string;
  name_jp?: string;
  season?: number;
  season_raw?: string;
  episode?: number;
  subtitle?: string;
  resolution?: string;
  source?: string;
  group?: string;
}
const PREFIX_RE = /[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff-]/g;

const EPISODE_RE = /\d+/;

const TITLE_RE =
  /(.*|\[.*])( -? \d+|\[\d+]|\[\d+.?[vV]\d]|第\d+[话話集]|\[第?\d+[话話集]]|\[\d+.?END]|[Ee][Pp]?\d+)(.*)/;

const RESOLUTION_RE = /1080|720|2160|4K/;
const SOURCE_RE = /B-Global|[Bb]aha|[Bb]ilibili|AT-X|Web/;
const SUB_RE = /[简繁日字幕]|CH|BIG5|GB/;

const CHINESE_NUMBER_MAP = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};
function preProcess(rawName: string): string {
  return rawName.replace(/【/g, "[").replace(/】/g, "]");
}

function getGroup(name: string): string {
  const parts = name.split(/\[|\]/);
  return parts[1];
}

function prefixProcess(raw: string, group: string): string {
  raw = raw.replace(new RegExp(`.${group}.`, "g"), "");
  let rawProcess = raw.replace(PREFIX_RE, "/");
  let argGroup = rawProcess.split("/");

  argGroup = argGroup.filter((arg) => arg !== "");

  if (argGroup.length === 1) {
    argGroup = argGroup[0].split(" ");
  }

  for (let arg of argGroup) {
    if (/新番|月?番/.test(arg) && arg.length <= 5) {
      raw = raw.replace(new RegExp(`.${arg}.`, "g"), "");
    } else if (/港澳台地区/.test(arg)) {
      raw = raw.replace(new RegExp(`.${arg}.`, "g"), "");
    }
  }

  return raw;
}

function processTitle(
  contentTitle: string
): { seasonInfo: string; episodeInfo: string; other: string } | null {
  const match = TITLE_RE.exec(contentTitle);
  if (match) {
    // 处理并返回分组结果
    const [seasonInfo, episodeInfo, other] = match
      .slice(1, 4)
      .map((x) => x.trim());
    return { seasonInfo, episodeInfo, other };
  } else {
    // 如果没有匹配项，则返回 null
    return null;
  }
}

function seasonProcess(seasonInfo: string): {
  name: string;
  season_raw: string;
  season_value: number;
} {
  let nameSeason = seasonInfo;
  const seasonRule = /S\d{1,2}|Season \d{1,2}|[第].?[季期]/g;
  // console.log("season_info" + seasonInfo);
  nameSeason = nameSeason.replace(/[\[\]]/g, " ");
  const seasons = nameSeason.match(seasonRule) || [];
  if (!seasons) {
    return { name: nameSeason, season_raw: "", season_value: 1 };
  }
  let season_raw = "";
  let seasonValue = 1;
  const name = nameSeason.replace(seasonRule, "");
  // console.log(nameSeason);
  for (const season of seasons) {
    season_raw = season;
    if (season.search(/Season|S/) !== -1) {
      seasonValue = parseInt(season.replace(/Season|S/, ""));
      break;
    } else if (season.search(/[第 ].*[季期(部分)]|部分/) !== -1) {
      const seasonPro = season.replace(/[第季期 ]/g, "");
      seasonValue = parseInt(seasonPro);
      if (!seasonValue) {
        seasonValue = CHINESE_NUMBER_MAP[seasonPro];
      }
    }
  }
  return { name: name, season_raw: season_raw, season_value: seasonValue };
}

function nameProcess(
  name: string
): [string | null, string | null, string | null] {
  let name_en: string | null = null,
    name_zh: string | null = null,
    name_jp: string | null = null;
  // console.log(name);
  name = name.trim();
  name = name.replace(/[(（]仅限港澳台地区[）)]/, "");

  let split = name.split(/\/|\s{2}|-\s{2}/);
  split = split.filter((item) => item !== "");

  if (split.length === 1) {
    if (/_{1}/.test(name)) {
      split = name.split("_");
    } else if (/ - {1}/.test(name)) {
      split = name.split("-");
    }
  }
  if (split.length === 1) {
    let split_space = split[0].split(" ");
    for (let idx of [0, split_space.length - 1]) {
      if (/^[\u4e00-\u9fa5]{2,}/.test(split_space[idx])) {
        let chs = split_space[idx];
        split_space.splice(idx, 1);
        split = [chs, split_space.join(" ")];
        break;
      }
    }
  }

  for (let item of split) {
    if (/[\u0800-\u4e00]{2,}/.test(item) && !name_jp) {
      name_jp = item.trim();
    } else if (/[\u4e00-\u9fa5]{2,}/.test(item) && !name_zh) {
      name_zh = item.trim();
    } else if (/[a-zA-Z]{3,}/.test(item) && !name_en) {
      name_en = item.trim();
    }
  }

  return [name_en, name_zh, name_jp];
}

function cleanSub(sub: string | null): string | null {
  if (sub === null) {
    return sub;
  }
  return sub.replace(/_MP4|_MKV/g, "");
}

// 找标签函数
function findTags(
  other: string
): [string | null, string | null, string | null] {
  const elements = other.replace(/[\[\]()（）]/g, " ").split(" ");
  let sub: string | null = null;
  let resolution: string | null = null;
  let source: string | null = null;

  for (const element of elements.filter((x) => x !== "")) {
    if (SUB_RE.test(element)) {
      sub = element;
    } else if (RESOLUTION_RE.test(element)) {
      resolution = element;
    } else if (SOURCE_RE.test(element)) {
      source = element;
    }
  }

  return [cleanSub(sub), resolution, source];
}

export function parse(raw_title: string): episode {
  raw_title = raw_title.trim().replace(/\n/g, "");
  const content_title = preProcess(raw_title);
  const group = getGroup(content_title);

  const { episodeInfo, other, seasonInfo } = processTitle(content_title) || {};

  if (episodeInfo && other && seasonInfo) {
    const process_raw = prefixProcess(seasonInfo, group);

    const { name, season_raw, season_value } = seasonProcess(process_raw);
    const [name_en, name_zh, name_jp] = nameProcess(name);
    const raw_episode = Number(EPISODE_RE.exec(episodeInfo));
    const [subtitle, resolution, source] = findTags(other);
    return {
      name_en: name_en || undefined,
      name_zh: name_zh || undefined,
      name_jp: name_jp || undefined,
      season: season_value,
      season_raw: season_raw,
      episode: raw_episode ? raw_episode : 0,
      subtitle: subtitle || undefined,
      resolution: resolution || undefined,
      source: source || undefined,
      group: group,
    };
  }
  throw new Error("匹配错误");
}

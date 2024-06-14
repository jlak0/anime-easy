const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1Nzg0Y2NmNmU1OTExM2UyNmM0N2EzMDNmYzZiY2EyOSIsInN1YiI6IjVmMzU1MzE3ZjZmZDE4MDAzNjJiOWFjZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.GUxQdi-bo1s0KzGuuWnBEV309vxFOCZx8PfEp1oO82s",
  },
};

export async function searchTV(query: string, lang: string) {
  const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
    query
  )}&include_adult=false&language=${lang}&page=1`;
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

export async function searchWithFallback(ts: any, lang: string) {
  const names = [ts.name_en, ts.name_jp, ts.name_zh];

  for (const name of names) {
    if (name) {
      const result = await searchTV(name, lang);
      if (result && result.results && result.results.length > 0) {
        for (let r of result.results) {
          if (
            r.genre_ids.includes(16) &&
            r.original_language === "ja" &&
            new Date(r.first_air_date) > new Date("2000-01-01")
          )
            return r; // 找到结果，返回
        }
      }
    }
  }
  return null; // 没有找到任何结果
}

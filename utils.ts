function base32Decode(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";

  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32.charAt(i).toUpperCase());
    bits += val.toString(2).padStart(5, "0");
  }

  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }

  return hex;
}

export function extractBtih(magnetURI: string) {
  // 使用正则表达式匹配btih值
  const btihMatch = magnetURI.match(/xt=urn:btih:([a-zA-Z0-9]+)/);

  // 如果匹配到，返回btih值，否则返回null
  return btihMatch ? base32Decode(btihMatch[1]) : null;
}

export function calculateScore(group, lang) {
  return group * lang;
}

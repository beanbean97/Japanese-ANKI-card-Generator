//助仮名
export const sukegana = new Set("ァィゥェォゃゅょャュョ");
//促音
export const sokuon = new Set("ッっ");
//長音
export const tyouon_map = new Map([
  ["e", "い"],
  ["o", "う"],
  ["e", "イ"],
  ["o", "ウ"],
]);
export const tyouon_set = new Set("いうイウ");
export const katakana = new Set(
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだづでどばびぶべぼぱぴぷぺぽ"
);
export const hiragana = new Set(
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂデドバビブベボパピプペポ"
);
export const kana = new Set([
  "ー",
  ...sokuon,
  ...sukegana,
  ...katakana,
  ...hiragana,
]);
export const pron_map = new Map([
  ["あ", "a"],
  ["い", "i"],
  ["う", "u"],
  ["え", "e"],
  ["お", "o"],
  ["か", "ka"],
  ["き", "ki"],
  ["く", "ku"],
  ["け", "ke"],
  ["こ", "ko"],
  ["さ", "sa"],
  ["し", "shi"],
  ["す", "su"],
  ["せ", "se"],
  ["そ", "so"],
  ["た", "ta"],
  ["ち", "chi"],
  ["つ", "tsu"],
  ["て", "te"],
  ["と", "to"],
  ["な", "na"],
  ["に", "ni"],
  ["ぬ", "nu"],
  ["ね", "ne"],
  ["の", "no"],
  ["は", "ha"],
  ["ひ", "hi"],
  ["ふ", "fu"],
  ["へ", "he"],
  ["ほ", "ho"],
  ["ま", "ma"],
  ["み", "mi"],
  ["む", "mu"],
  ["め", "me"],
  ["も", "mo"],
  ["や", "ya"],
  ["ゆ", "yu"],
  ["よ", "yo"],
  ["ら", "ra"],
  ["り", "ri"],
  ["る", "ru"],
  ["れ", "re"],
  ["ろ", "ro"],
  ["わ", "wa"],
  ["を", "wo"],
  ["ん", "nn"],
  ["きゃ", "kya"],
  ["きゅ", "kyu"],
  ["きょ", "kyo"],
  ["ぎゃ", "gya"],
  ["ぎゅ", "gyu"],
  ["ぎょ", "gyo"],
  ["しゃ", "sha"],
  ["しゅ", "shu"],
  ["しょ", "sho"],
  ["じゃ", "ja"],
  ["じゅ", "ju"],
  ["じょ", "jo"],
  ["ちゃ", "cha"],
  ["ちゅ", "chu"],
  ["ちょ", "cho"],
  ["ぢゃ", "dya"],
  ["ぢゅ", "dyu"],
  ["ぢょ", "dyo"],
  ["にゃ", "nya"],
  ["にゅ", "nyu"],
  ["にょ", "nyo"],
  ["ひゃ", "hya"],
  ["ひゅ", "hyu"],
  ["ひょ", "hyo"],
  ["びゃ", "bya"],
  ["びゅ", "byu"],
  ["びょ", "byo"],
  ["ぴゃ", "pya"],
  ["ぴゅ", "pyu"],
  ["ぴょ", "pyo"],
  ["みゃ", "mya"],
  ["みゅ", "myu"],
  ["みょ", "myo"],
  ["りゃ", "rya"],
  ["りゅ", "ryu"],
  ["りょ", "ryo"],
  ["が", "ga"],
  ["ぎ", "gi"],
  ["ぐ", "gu"],
  ["げ", "ge"],
  ["ご", "go"],
  ["ざ", "za"],
  ["じ", "ji"],
  ["ず", "zu"],
  ["ぜ", "ze"],
  ["ぞ", "zo"],
  ["だ", "da"],
  ["づ", "ji"],
  ["づ", "zu"],
  ["で", "de"],
  ["ど", "do"],
  ["ば", "ba"],
  ["び", "bi"],
  ["ぶ", "bu"],
  ["べ", "be"],
  ["ぼ", "bo"],
  ["ぱ", "pa"],
  ["ぴ", "pi"],
  ["ぷ", "pu"],
  ["ぺ", "pe"],
  ["ぽ", "po"],
  ["ア", "a"],
  ["イ", "i"],
  ["ウ", "u"],
  ["エ", "e"],
  ["オ", "o"],
  ["カ", "ka"],
  ["キ", "ki"],
  ["ク", "ku"],
  ["ケ", "ke"],
  ["コ", "ko"],
  ["サ", "sa"],
  ["シ", "shi"],
  ["ス", "su"],
  ["セ", "se"],
  ["ソ", "so"],
  ["タ", "ta"],
  ["チ", "chi"],
  ["ツ", "tsu"],
  ["テ", "te"],
  ["ト", "to"],
  ["ナ", "na"],
  ["ニ", "ni"],
  ["ヌ", "nu"],
  ["ネ", "ne"],
  ["ノ", "no"],
  ["ハ", "ha"],
  ["ヒ", "hi"],
  ["フ", "fu"],
  ["ヘ", "he"],
  ["ホ", "ho"],
  ["マ", "ma"],
  ["ミ", "mi"],
  ["ム", "mu"],
  ["メ", "me"],
  ["モ", "mo"],
  ["ヤ", "ya"],
  ["ユ", "yu"],
  ["ヨ", "yo"],
  ["ラ", "ra"],
  ["リ", "ri"],
  ["ル", "ru"],
  ["レ", "re"],
  ["ロ", "ro"],
  ["ワ", "wa"],
  ["ヲ", "wo"],
  ["ン", "nn"],
  ["キャ", "kya"],
  ["キュ", "kyu"],
  ["キョ", "kyo"],
  ["ギャ", "gya"],
  ["ギュ", "gyu"],
  ["ギョ", "gyo"],
  ["シャ", "sha"],
  ["チュ", "shu"],
  ["ショ", "sho"],
  ["ジャ", "ja"],
  ["ジュ", "ju"],
  ["ジョ", "jo"],
  ["チャ", "cha"],
  ["チュ", "chu"],
  ["チョ", "cho"],
  ["ヂャ", "dya"],
  ["ヂュ", "dyu"],
  ["ヂョ", "dyo"],
  ["ニャ", "nya"],
  ["ニュ", "nyu"],
  ["ニョ", "nyo"],
  ["ヒャ", "hya"],
  ["ヒュ", "hyu"],
  ["ヒョ", "hyo"],
  ["ビャ", "bya"],
  ["ビュ", "byu"],
  ["ビョ", "byo"],
  ["ピャ", "pya"],
  ["ピュ", "pyu"],
  ["ピョ", "pyo"],
  ["ミャ", "mya"],
  ["ミュ", "myu"],
  ["ミョ", "myo"],
  ["リャ", "rya"],
  ["リュ", "ryu"],
  ["リョ", "ryo"],
  ["ジェ", "je"],
  ["ファ", "fa"],
  ["フィ", "fi"],
  ["フォ", "fu"],
  ["フェ", "fe"],
  ["ウァ", "uxa"],
  ["ウィ", "uxi"],
  ["ウォ", "uxo"],
  ["ウェ", "uxe"],
  ["ディ", "dhi"],
  ["ガ", "ga"],
  ["ギ", "gi"],
  ["グ", "gu"],
  ["ゲ", "ge"],
  ["ゴ", "go"],
  ["ザ", "za"],
  ["ジ", "ji"],
  ["ズ", "zu"],
  ["ゼ", "ze"],
  ["ゾ", "zo"],
  ["ダ", "da"],
  ["ヂ", "ji"],
  ["ズ", "zu"],
  ["デ", "de"],
  ["ド", "do"],
  ["バ", "ba"],
  ["ビ", "bi"],
  ["ブ", "bu"],
  ["ベ", "be"],
  ["ボ", "bo"],
  ["パ", "pa"],
  ["ピ", "pi"],
  ["プ", "pu"],
  ["ペ", "pe"],
  ["ポ", "po"],
]);
const norm_map = new Map([
  ["syu", "shu"],
  ["sya", "sha"],
  ["syo", "sho"],
  ["tyo", "cho"],
  ["tya", "cha"],
  ["tyu", "chu"],
  ["jye", "je"],
  ["tu", "tsu"],
  ["wi", "uxi"],
  ["si", "shi"],
  ["jyu", "ju"],
  ["cyu", "chu"],
  ["cya", "cha"],
  ["cyo", "cho"],
]);
const norm_kana = (raw: string) => {
  while (true) {
    let long_idx = raw.indexOf("-");
    if (long_idx != -1) {
      raw = `${raw.substring(0, long_idx)}${raw[long_idx - 1]}${raw.substring(
        long_idx + 1
      )}`;
    } else {
      break;
    }
  }
  let ans = [...norm_map.entries()].reduce(
    (sum, [k, v]) => sum.replace(new RegExp(k, "g"), v),
    raw
  );
  if (ans.slice(-2) != "nn" && ans.slice(-1) == "n") {
    ans += "n";
  }
  return ans;
};

export const is_kana_eq = (norm: string, raw: string) => norm == norm_kana(raw);
export const is_kana = (c: string) => kana.has(c);

// console.log(is_kana_eq("gaishutsu", "gaisyutsu"));

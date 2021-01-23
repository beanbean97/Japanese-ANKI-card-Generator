import { writeFileSync, existsSync } from "fs";
import { stress_map } from "./compile";
import { NormWord } from "./trans";
import { is_kana_eq } from "./kana";
import Axios from "axios";
import { load } from "cheerio";
import dl from "download";

type HujiangWord = {
  word: string;
  sound: string;
  pron_value: number;
  kana: string;
  roman: string;
};

const dl_sound = async (word: NormWord): Promise<boolean> => {
  if (existsSync(`sound/${word.roman + (word.pron?.[0] ?? "")}.mp3`)) {
    // console.log(`cache ${word.word[0]}`);
    return false;
  }
  let html = ((
    await Axios.get(
      encodeURI(`https://dict.hjenglish.com/jp/jc/${word.word[0]}`),
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36",
          Cookie:
            "HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1",
        },
      }
    )
  ).data as string).replace(/\n+/g, "\n");
  const $ = load(html);
  let words: HujiangWord[] = $(".word-info")
    .map((i, el) => ({
      word: $(".word-text>h2", el).text(),
      sound: $(".pronounces>.word-audio", el).attr("data-src"),
      pron_value: stress_map.get(
        $(".pronounces>.pronounce-value-jp", el).text()
      )!,
      kana: $($(".pronounces>span", el).get(0)).text().slice(1, -1),
      roman: $($(".pronounces>span", el).get(1)).text().slice(1, -1),
    }))
    .get();
  let ans = words.find((w) => is_kana_eq(word.roman, w.roman));
  if (!ans) {
    throw new Error(`can't find word ${word.word[0]}, ${word.roman}`);
  }
  writeFileSync(
    `sound/${word.roman + (word.pron?.[0] ?? "")}.mp3`,
    await dl(ans.sound)
  );
  console.log(`download ${word.word[0]}`);
  return true;
};

export const dl_sounds = async (words: NormWord[]) => {
  for (const w of words) {
    try {
      if (await dl_sound(w)) {
        await new Promise((r) => setTimeout(() => r(undefined), 10000));
      }
    } catch (e) {
      console.log(e);
    }
  }
};

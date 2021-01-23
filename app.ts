import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "json5";
import { compile, PreCompile } from "./compile";
import { Word, trim_word } from "./trim";
import { word_with_ops, to_roman } from "./trans";
import { gen_trans_html, gen_pron_html } from "./template";
import hash from "object-hash";
import { dl_sounds } from "./sound";
import arrayShuffle from "array-shuffle";
import { chunk } from "lodash";

const src = readFileSync("pre_compile/1.23.json5");
writeFileSync(
  "gen.json5",
  stringify(
    (parse(src.toString()) as PreCompile[]).flatMap(compile).map(trim_word)
  )
);

const gen_anki = async (
  words: Word[],
  everyday = 100
): Promise<ReturnType<typeof word_with_ops>> => {
  const wd_set = word_with_ops(words.map(trim_word));
  await dl_sounds(wd_set.words);
  let table: [hash: string, ft: string, bk: string][] = [];
  for (const [k, v] of wd_set.roman_map.entries()) {
    for (const w of v.values()) {
      table.push([
        hash({ w: w.word, p: w.pron, r: w.roman }),
        w.trans[0].def,
        gen_trans_html(w, wd_set.get_link(w)),
      ]);
    }
    let sound = `<div class="sound">[sound:${k}.mp3]</div>`;
    if (v.size == 1) {
      let w = [...v][0];
      table.push(["", sound, gen_trans_html(w, wd_set.get_link(w))]);
    } else {
      table.push(["", sound, gen_pron_html([...v])]);
    }
  }

  writeFileSync(
    "gen_ht",
    chunk(table, everyday)
      .map(arrayShuffle)
      .flat(1)
      .map(([h, f, b]) => `${f}${h && `<span class="invis">${h}</span>`}\t${b}`)
      .join("\n")
  );
  return wd_set;
};

gen_anki(parse(readFileSync("n5_word.json5").toString()) as Word[]).then(
  (set) => {
    // console.log(set.get_by_ref({ word: "家", kana: "いえ" }));
  }
);

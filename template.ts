import { NormWord, Link, word_with_ops, gen_sound_key } from "./trans";
import { Ruby, is_range_ruby } from "./trim";
import { is_kana } from "./kana";
import { stress_map as rev_stress_map } from "./compile";

const ruby_html = (word: string, ruby?: Ruby[]): string => {
  if (!ruby) {
    return word;
  }
  let word_idx = 0;
  let ruby_idx = 0;
  let html = "";
  while (word_idx < word.length) {
    let c = word[word_idx];
    if (is_kana(c)) {
      html += c;
      word_idx++;
    } else {
      //c is a kanji
      let r = ruby[ruby_idx];
      if (is_range_ruby(r)) {
        html += `
        <ruby>
          ${word.substring(...r[1])}
          <rt>
            ${r[0]}
          </rt>
        </ruby>
        `;
        word_idx = r[1][1];
      } else {
        html += `<ruby>${c}<rt>${r}</rt></ruby>`;
        word_idx++;
      }
      ruby_idx++;
    }
  }
  return html;
};
const stress_map = new Map([...rev_stress_map].map((p) => [p[1], p[0]]));

const root_html = (word: NormWord) =>
  !word.from
    ? ""
    : `
  <div class="flex">
    <div class="label">词源</div>
    <ul class="root clear">
      <li>
        <span>[${word.from.lang}]</span>
        <span>${word.from.word}</span>
      </li>
    </ul>
  </div>
`;

const stress_html = (pron?: number[], type = "div") =>
  pron
    ? `<${type} class="stress">
        ${pron.map((p) => stress_map.get(p)!).join("")}
      </${type}>`
    : "";

const main_word_html = (word: NormWord) => `
  <div class="main flex">
    <div class="wscomb">
      <div class="word">
        ${word.word.map((w) => ruby_html(w, word.ruby)).join(" ・ ")}
      </div>
      ${stress_html(word.pron)}
    </div>
    <div class="sound">[sound:${gen_sound_key(word)}.mp3]</div>
  </div>
  <div class="flex">
    <div class="label">释义</div>
    <ul class="trans ${word.trans.length == 1 ? "clear" : ""}">
    ${word.trans.map(
      (t) =>
        `<li>
          <span class="type">[${t.type.join("・")}]</span>
          <span class="def">${t.def}</span>
        </li>`
    )}
    </ul>
  </div>
  ${root_html(word)}
`;

const sub_word_html = (word: NormWord) => `
  <div class="flex subword">
    <div>
      <span class="word">
        ${word.word.map((w) => ruby_html(w, word.ruby)).join(" / ")}
      </span>
      ${stress_html(word.pron, "span")}
    </div>
    <ul class="trans ${word.trans.length == 1 ? "clear" : ""}">
    ${word.trans.map(
      (t) =>
        `<li>
          <span class="type">
            [${t.type.join("・")}]
          </span>
          <span class="def">${t.def}</span>
        </li>`
    )}
    </ul>
  </div>
`;

const idiom_html = (word: NormWord) =>
  word.idiom
    ? `<div class="flex idiom">
        <div class="label">惯用</div>
        <ul class="${word.idiom.length == 1 ? "clear" : ""}">
          ${word.idiom
            .map(
              (i) => `<li>
                <div class="flex">
                  <div class="word"> 
                  ${ruby_html(i.word, i.ruby)}
                  </div>
                  <div class="def">${i.trans}</div>
                </div>
              </li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";

const link_html_helper = (
  lk: NormWord[] | undefined,
  label: string,
  class_name = ""
) =>
  lk
    ? `
<div class="flex ${class_name}">
  <div class="label">${label}</div>
  <ul class="${lk.length == 1 ? "clear" : ""}">
    ${lk.map((l) => `<li>${sub_word_html(l)}</li>`).join("")}
  </ul>
</div>`
    : "";

const link_html = (link: Link) => {
  let html = "";
  html += link_html_helper(link.anto, "反义", "anto");
  html += link_html_helper(link.simi, "近义", "simi");
  html += link_html_helper(link.rela, "关联", "rela");
  html += link_html_helper(link.same_pron, "同音", "pron");
  return html;
};

export const gen_pron_html = (words: NormWord[]) =>
  `
<ul >
  ${words.map((l) => `<li>${sub_word_html(l)}</li>`).join("")}
</ul>`
    .replace(/[\r\n]/g, "")
    .replace(/(?<![a-zA-Z])\s+(?![a-zA-Z])/g, "");

export const gen_trans_html = (word: NormWord, link: Link) =>
  `
<div class="body">
  ${main_word_html(word)}
  ${link_html(link)}
  ${idiom_html(word)}
</div>
`
    .replace(/[\r\n]/g, "")
    .replace(/(?<![a-zA-Z])\s+(?![a-zA-Z])/g, "");

// console.log(ruby_html("明後日", [["あさって", [0, 3]]]));

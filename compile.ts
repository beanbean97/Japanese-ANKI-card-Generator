import { is_kana, kana } from "./kana";
import { Ruby, trim_word, Word, MbArr, maybe_map, norm_map } from "./trim";

export type PreCompile =
  | {
      src: string;
      split?: MbArr<number>;
      anto?: MbArr<PreCompile>;
      rela?: MbArr<PreCompile>;
      simi?: MbArr<PreCompile>;
    }
  | string;
type TokenResult = {
  word: string[];
  kana?: string;
  pron?: number[];
  trans: { type: string[]; def: string };
};

export const is_preComp_undef = (src: PreCompile): boolean => {
  if (typeof src == "string") {
    return !src;
  } else {
    return !src.src;
  }
};

export let stress_map = new Map([
  ["⓪", 0],
  ["①", 1],
  ["②", 2],
  ["③", 3],
  ["④", 4],
  ["⑤", 5],
  ["⑥", 6],
  ["⑦", 7],
  ["⑧", 8],
  ["⑨", 9],
  ["⑩", 10],
  ["⑪", 11],
  ["⑫", 12],
  ["⑬", 13],
  ["⑭", 14],
]);
let stress_chars = [...stress_map.keys()].join("");

const tokenfy = (src: string): TokenResult => {
  let uncomsume_idx = 0;
  while (uncomsume_idx < src.length) {
    if (
      new RegExp(String.raw`[\(（${stress_chars}\d\[]`).test(src[uncomsume_idx])
    ) {
      break;
    }
    uncomsume_idx++;
  }
  let word = src
    .substring(0, uncomsume_idx)
    .replace(/\s+/g, "")
    .split(/[\/\\]/);
  let kana: string;
  if (/[\(（]/.test(src[uncomsume_idx])) {
    uncomsume_idx++;
    let kana_st = uncomsume_idx;
    while (uncomsume_idx < src.length) {
      if (/[\)）]/.test(src[uncomsume_idx])) {
        kana = src.substring(kana_st, uncomsume_idx).replace(/\s+/g, "");
        uncomsume_idx++;
        break;
      }
      uncomsume_idx++;
    }
  }
  let pron: number[];
  if (new RegExp(String.raw`[${stress_chars}\d]`).test(src[uncomsume_idx])) {
    let pron_st = uncomsume_idx;
    while (uncomsume_idx < src.length) {
      if (/[\[［]/.test(src[uncomsume_idx])) {
        pron = src
          .substring(pron_st, uncomsume_idx)
          .trim()
          .split(
            new RegExp(
              [
                String.raw`(?<=[${stress_chars}]|^)(?=[${stress_chars}\d])`,
                String.raw`(?<=\d)(?=[${stress_chars}])`,
                String.raw`\s+`,
              ].join("|")
            )
          )
          .map((p) => {
            if (/\d+/.test(p)) {
              return Number.parseInt(p);
            } else {
              return stress_map.get(p)!;
            }
          });
        break;
      }
      uncomsume_idx++;
    }
  }
  if (/[\[［]/.test(src[uncomsume_idx])) {
    uncomsume_idx++; //comsume [
    let type_st = uncomsume_idx;
    let type: string[];

    while (uncomsume_idx < src.length) {
      if (/[\]］」〕]/.test(src[uncomsume_idx])) {
        type = src
          .substring(type_st, uncomsume_idx)
          .split(/[•・]/)
          .map((t) => t.replace(/\s+/g, ""));
        uncomsume_idx++;
        break;
      }
      uncomsume_idx++;
    }
    return {
      word,
      kana,
      pron,
      trans: { type, def: src.substring(uncomsume_idx).replace(/\s+/g, "") },
    };
  } else {
    throw new Error(`can't compile ${word}`);
  }
};

let kana_chars = [...kana].join("");
let split_reg = new RegExp(
  String.raw`(?<=[${kana_chars}])(?=[^${kana_chars}])|(?<=[^${kana_chars}])(?=[${kana_chars}])`
);

const find_all_occurrences = (target: string, needle: string, start = 0) => {
  let result: number[] = [];
  while (start + needle.length < target.length) {
    let ans = target.indexOf(needle, start);
    if (ans == -1) {
      break;
    }
    start = ans + 1;
    result.push(ans);
  }
  return result;
};

const ruby_analyse = (word: string, kana: string, split: number[]): Ruby[] => {
  // if (split === undefined) {
  //   console.log(word);
  // }
  let parts = word.split(split_reg);
  let parts_uncomsume_idx = 0;
  let kana_uncomsume_idx = 0;
  let split_uncomsume_idx = 0;
  let recursive = (): Ruby[] | undefined => {
    if (
      parts_uncomsume_idx == parts.length &&
      kana_uncomsume_idx == kana.length
    ) {
      return [];
    }
    if (
      parts_uncomsume_idx == parts.length ||
      kana_uncomsume_idx == kana.length
    ) {
      return;
    }
    if (is_kana(parts[parts_uncomsume_idx][0])) {
      if (
        !kana
          .substring(kana_uncomsume_idx)
          .startsWith(parts[parts_uncomsume_idx])
      ) {
        return;
      }
      kana_uncomsume_idx += parts[parts_uncomsume_idx].length;
      parts_uncomsume_idx++;
      let ans = recursive();
      parts_uncomsume_idx--;
      kana_uncomsume_idx -= parts[parts_uncomsume_idx].length;
      return ans;
    } else {
      let tills: number[];
      if (parts_uncomsume_idx + 1 < parts.length) {
        let next = parts[parts_uncomsume_idx + 1];
        tills = find_all_occurrences(kana, next, kana_uncomsume_idx);
        if (tills.length == 0) {
          return;
        }
      } else {
        tills = [kana.length];
      }
      let result = tills
        .map((t): Ruby[] | undefined => {
          if (
            parts[parts_uncomsume_idx].length == 1 ||
            split_uncomsume_idx == (split?.length ?? 0)
          ) {
            let kana_record = kana_uncomsume_idx;
            kana_uncomsume_idx = t;
            parts_uncomsume_idx++;
            let ans = recursive();
            parts_uncomsume_idx--;
            kana_uncomsume_idx = kana_record;
            if (ans && parts[parts_uncomsume_idx].length == 1) {
              return [kana.substring(kana_record, t), ...ans];
            } else if (ans) {
              let st = parts
                .slice(0, parts_uncomsume_idx)
                .reduce((len_sum, pt) => len_sum + pt.length, 0);
              return [
                [
                  kana.substring(kana_record, t),
                  [st, st + parts[parts_uncomsume_idx].length],
                ],
                ...ans,
              ];
            }
          } else {
            let last_single_kanji_idx =
              split_uncomsume_idx +
              Math.min(
                parts[parts_uncomsume_idx].length,
                split.length - split_uncomsume_idx //at least 1
              ) -
              1;
            if (t <= split[last_single_kanji_idx]) {
              return;
            }
            let split_record = split_uncomsume_idx;
            let kana_record = kana_uncomsume_idx;
            split_uncomsume_idx = last_single_kanji_idx;
            kana_uncomsume_idx = t;
            parts_uncomsume_idx++;
            let ans = recursive();
            parts_uncomsume_idx--;
            kana_uncomsume_idx = kana_record;
            split_uncomsume_idx = split_record;
            if (ans) {
              let st = parts
                .slice(0, parts_uncomsume_idx)
                .reduce((len_sum, pt) => len_sum + pt.length, 0);
              let ed = st + parts[parts_uncomsume_idx].length;
              let rb_arr: Ruby[] = [];
              let kana_st = kana_uncomsume_idx;
              let sp_st = split_uncomsume_idx;
              let sp_ed = last_single_kanji_idx + 1;
              while (sp_st < sp_ed) {
                rb_arr.push(kana.substring(kana_st, split[sp_st]));
                kana_st = split[sp_st];
                sp_st++;
                st++;
              }
              if (
                sp_ed - split_uncomsume_idx !=
                parts[parts_uncomsume_idx].length
              ) {
                if (ed - st == 1) {
                  rb_arr.push(kana.substring(kana_st, t));
                } else rb_arr.push([kana.substring(kana_st, t), [st, ed]]);
              }
              return [...rb_arr, ...ans];
            }
          }
        })
        .filter((i) => !!i);
      if (result.length == 1) {
        return result[0];
      }
    }
  };
  let ans = recursive();
  if (!ans) {
    throw new Error(`can't analyse ${word}'s ruby`);
  }
  return ans;
};

const exclude_set = new Set(["src", "anto", "simi", "rela"]);
const helper = (src: PreCompile): Word => {
  if (typeof src == "string") {
    let tk = tokenfy(src);
    return {
      word: tk.word,
      pron: tk.pron,
      trans: tk.trans,
      ruby: tk.kana && ruby_analyse(tk.word[0], tk.kana, []),
    };
  } else {
    let tk = tokenfy(src.src);
    let wd = {
      word: tk.word,
      pron: tk.pron,
      trans: tk.trans,
      ruby:
        tk.kana &&
        ruby_analyse(
          tk.word[0],
          tk.kana,
          norm_map(src.split, (i) => i)
        ),
    };
    Object.entries(src)
      .filter((p) => !exclude_set.has(p[0]))
      .forEach((p) => {
        wd[p[0]] = p[1];
      });
    return wd;
  }
};

const get_src = (pre: PreCompile): string => {
  if (typeof pre == "string") {
    return pre;
  } else {
    return pre.src;
  }
};

const is_ref = (pre: PreCompile): boolean => get_src(pre).startsWith("!");

const link_helper = (arr?: MbArr<PreCompile>): [Word[], string[]] => {
  let ref: string[] = [];
  let res: Word[] = [];
  norm_map(
    arr,
    (p) => {
      if (is_ref(p)) {
        ref.push(get_src(p).substring(1));
      } else {
        let wd = helper(p);
        ref.push(wd.word[0]);
        res.push(wd);
      }
    },
    Array.isArray,
    is_preComp_undef
  );
  return [res, ref];
};

export const compile = (pre: PreCompile): Word[] => {
  if (typeof pre == "string") {
    return [helper(pre)];
  }
  let anto = link_helper(pre.anto);
  let rela = link_helper(pre.rela);
  let simi = link_helper(pre.simi);
  return [
    {
      ...helper(pre),
      anto: anto[1],
      rela: rela[1],
      simi: simi[1],
    },
    ...anto[0],
    ...rela[0],
    ...simi[0],
  ];
};

// console.log(
//   compile({
//     word: "覚 え る （おぼえる）③ ［他動2］记住;学会，掌握",
//     split: [],
//   })
// );

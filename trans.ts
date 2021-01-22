import {
  Word,
  Ruby,
  MbArr,
  trim_word,
  is_range_ruby,
  is_ruby_arr,
  Ref,
  is_detailed_ref,
} from "./trim";
import {
  is_kana,
  sokuon,
  sukegana,
  pron_map,
  tyouon_set,
  tyouon_map,
} from "./kana";

const to_kana = (word: string, ruby?: Ruby[]) => {
  let kana = "";
  let word_idx = 0;
  let ruby_idx = 0;
  if (ruby) {
    while (word_idx < word.length) {
      let c = word[word_idx];
      if (is_kana(c)) {
        kana += c;
        word_idx++;
      } else {
        //c is a kanji
        if (ruby_idx >= ruby.length) {
          throw new Error(`Can't convert ${word} to kana`);
        }
        let r = ruby[ruby_idx];
        if (is_range_ruby(r)) {
          kana += r[0];
          word_idx = r[1][1];
        } else {
          kana += r;
          word_idx++;
        }
        ruby_idx++;
      }
    }
  } else {
    kana = word;
  }
  return kana;
};
const kana_to_roman = (kana: string) => {
  let kana_idx = 0;
  let roman = "";
  while (kana_idx < kana.length) {
    if (kana_idx + 1 < kana.length && sukegana.has(kana[kana_idx + 1])) {
      let sub_kana = kana.substring(kana_idx, kana_idx + 2);
      if (!pron_map.has(sub_kana)) {
        throw new Error(`Can't convert ${kana} to roman`);
      }
      roman += pron_map.get(sub_kana)!;
      kana_idx += 2;
    } else if (roman.length != 0 && tyouon_set.has(kana[kana_idx])) {
      let last_roman = roman[roman.length - 1];
      if (kana[kana_idx] == tyouon_map.get(last_roman)!) {
        roman += last_roman;
      } else {
        roman += pron_map.get(kana[kana_idx])!;
      }
      kana_idx++;
    } else if (roman.length != 0 && kana[kana_idx] == "ー") {
      let last_roman = roman[roman.length - 1];
      roman += last_roman;
      kana_idx++;
    } else if (sokuon.has(kana[kana_idx])) {
      if (kana_idx + 1 >= kana.length || !pron_map.has(kana[kana_idx + 1])) {
        throw new Error(`Can't convert ${kana} to roman`);
      }
      roman += pron_map.get(kana[kana_idx + 1])![0];
      kana_idx++;
    } else {
      if (!pron_map.has(kana[kana_idx])) {
        throw new Error(`Can't convert ${kana} to roman`);
      }
      roman += pron_map.get(kana[kana_idx])!;
      kana_idx++;
    }
  }
  return roman;
};
const to_roman = (word: string, ruby?: Ruby[]) => {
  let kana = to_kana(word, ruby);
  return kana_to_roman(kana);
};
const to_arr = <T>(
  mb_arr: MbArr<T> | undefined,
  is_arr: (ori: MbArr<T>) => boolean = Array.isArray
): T[] | undefined => {
  if (mb_arr === undefined) {
    return undefined;
  } else if (!is_arr(mb_arr)) {
    return [mb_arr as T];
  }
  return mb_arr as T[];
};
const ref_to_key = (r: Ref) => {
  if (typeof r == "string") {
    return r;
  } else {
    return `${r.word}+${r.kana}`;
  }
};
const key_to_ref = (k: string): Ref => {
  if (k.includes("+")) {
    let res = k.split("+").map((s) => s.trim());
    return { word: res[0], kana: res[1] };
  } else {
    return k;
  }
};
const to_ref_set = (
  mb_arr: MbArr<Ref> | undefined
): Set<string> | undefined => {
  if (mb_arr === undefined) {
    return undefined;
  } else if (!Array.isArray(mb_arr)) {
    return new Set([mb_arr].map(ref_to_key));
  }
  return new Set(mb_arr.map(ref_to_key));
};
export type NormWord = {
  word: string[];
  roman: string;
  sound?: string;
  pron?: number[];
  ruby?: Ruby[];
  rela?: Set<string>;
  simi?: Set<string>;
  anto?: Set<string>;
  from?: { lang: string; word: string };
  idiom?: { word: string; ruby?: Ruby[]; trans: string }[];
  trans: { type: string[]; def: string }[];
};
const word_normalize = (w: Word): NormWord => {
  let word = to_arr(w.word);
  let ruby = to_arr(w.ruby, is_ruby_arr);
  return {
    word,
    ruby,
    from: w.from,
    roman: w.roman ?? to_roman(word[0], ruby),
    pron: to_arr(w.pron),
    rela: to_ref_set(w.rela),
    anto: to_ref_set(w.anto),
    simi: to_ref_set(w.simi),
    idiom: to_arr(w.idiom)?.map((i) => ({
      word: i.word,
      ruby: to_arr(i.ruby, is_ruby_arr),
      trans: i.trans,
    })),
    trans: to_arr(w.trans)!.map((t) => ({ type: to_arr(t.type), def: t.def })),
  };
};

export type Link = {
  anto?: NormWord[];
  rela?: NormWord[];
  simi?: NormWord[];
  same_pron?: NormWord[];
};

export type WordSet = {
  words: NormWord[];
  roman_map: Map<string, Set<NormWord>>;
  get_by_ref: (ref: Ref) => NormWord;
  get_link: (w: NormWord) => Link;
  get_by_pron: (w: NormWord) => NormWord[];
};

export const gen_sound_key = (w: NormWord) => w.roman + (w.pron?.[0] ?? "");

export const word_with_ops = (pre_wds: Word[]): WordSet => {
  let wds = pre_wds.map(word_normalize);
  const ref_map = new Map<string, Set<NormWord>>();
  const roman_map = new Map<string, Set<NormWord>>();
  for (const [wd, nwd] of wds.flatMap((w) =>
    w.word.map((ww) => [ww, w] as [string, NormWord])
  )) {
    if (!ref_map.has(wd)) {
      ref_map.set(wd, new Set());
    }
    if (ref_map.get(wd)!.size != 0) {
      let found = [...ref_map.get(wd)!].findIndex(
        (val) => val.roman == nwd.roman
      );
      if (found != -1) {
        throw new Error(`Same ${wd} word in arr`);
      }
      ref_map.get(wd)!.add(nwd);
    } else {
      ref_map.get(wd)!.add(nwd);
    }
  }
  for (const w of wds) {
    let key = gen_sound_key(w);
    if (!roman_map.has(key)) {
      roman_map.set(key, new Set());
    }
    roman_map.get(key)!.add(w);
  }
  const gen_ref = (word: NormWord): Ref => {
    if (ref_map.get(word.word[0]).size != 1) {
      return { word: word.word[0], kana: to_kana(word.word[0], word.ruby) };
    }
    return word.word[0];
  };
  const get_by_ref = (ref: Ref): NormWord => {
    if (is_detailed_ref(ref)) {
      let ans = [...ref_map.get(ref.word)!].find(
        (val) => val.roman == kana_to_roman(ref.kana)
      );
      if (!ans) {
        throw new Error(`can't find by ref ${ref}`);
      }
      return ans;
    } else {
      if ((ref_map.get(ref)?.size ?? 0) != 1) {
        throw new Error(`can't find by ref ${ref}`);
      }
      return [...ref_map.get(ref)!][0];
    }
  };
  const is_ref_eq = (ref: Ref, w: NormWord) => {
    if (is_detailed_ref(ref)) {
      return w.word.includes(ref.word) && w.roman == kana_to_roman(ref.kana);
    } else {
      return w.word.includes(ref);
    }
  };
  const get_link = (w: NormWord) => {
    let same_pron = [...roman_map.get(gen_sound_key(w))].filter(
      (r) => r.word[0] != w.word[0]
    );
    return {
      anto: w.anto && [...w.anto].map(key_to_ref).map(get_by_ref),
      rela:
        w.rela &&
        [...w.rela]
          .map(key_to_ref)
          .filter((s) => !is_ref_eq(s, w))
          .map(get_by_ref),
      simi:
        w.simi &&
        [...w.simi]
          .map(key_to_ref)
          .filter((s) => !is_ref_eq(s, w))
          .map(get_by_ref),
      same_pron: same_pron.length == 0 ? undefined : same_pron,
    };
  };

  for (const w of wds) {
    (["rela", "simi"] as const).forEach((prop) => {
      let rel = w[prop];
      if (rel === undefined) {
        return;
      }
      rel.add(ref_to_key(gen_ref(w)));
      for (const linked of [...rel].map(key_to_ref).map(get_by_ref)) {
        if (linked[prop] === rel) {
          continue;
        }
        if (linked[prop] === undefined) {
          linked[prop] = rel;
          continue;
        }
        linked[prop].forEach(rel.add.bind(rel));
        linked[prop] = rel;
      }
    });
    if (w.anto === undefined) {
      continue;
    }
    for (const anto of [...w.anto].map(key_to_ref).map(get_by_ref)) {
      if (anto.anto === undefined) {
        anto.anto = new Set();
      }
      anto.anto.add(ref_to_key(gen_ref(w)));
    }
  }
  return {
    words: wds,
    roman_map,
    get_link,
    get_by_ref,
    get_by_pron: (w) =>
      [...roman_map.get(w.roman + w.pron[0] ?? "")!].filter(
        (r) => r.word[0] != w.word[0]
      ),
  };
};

// console.log(to_roman("クライアント"));

export type MbArr<T> = T | T[];

export type Ruby = string | [string, [number, number]];
export type Ref = string | { word: string; kana: string };

export type Word = {
  word: MbArr<string>;
  pron?: MbArr<number>;
  ruby?: MbArr<Ruby>;
  rela?: MbArr<Ref>;
  simi?: MbArr<Ref>;
  anto?: MbArr<Ref>;
  roman?: string;
  from?: { lang: string; word: string };
  idiom?: MbArr<{ word: string; ruby?: MbArr<Ruby>; trans: string }>;
  trans: MbArr<{ type: MbArr<string>; def: string }>;
};

const defualt_is_undef = (ori: any) => {
  if (typeof ori == "number") {
    return false;
  } else return !ori;
};

export const maybe_map = <T, Q>(
  mb_arr: MbArr<T> | undefined,
  ops: (ori: T) => Q,
  is_arr: (ori: MbArr<T>) => boolean = Array.isArray,
  is_undef: (ori: T) => boolean = defualt_is_undef
): MbArr<Q> | undefined => {
  if (typeof mb_arr == "undefined") {
    return undefined;
  }
  if (is_arr(mb_arr)) {
    if ((mb_arr as T[]).length == 1) {
      if (is_undef((mb_arr as T[])[0])) {
        return undefined;
      }
      return ops((mb_arr as T[])[0]);
    } else if ((mb_arr as T[]).length == 0) {
      return undefined;
    }
    return (mb_arr as T[]).map(ops);
  } else {
    if (is_undef(mb_arr as T)) {
      return undefined;
    }
    return ops(mb_arr as T);
  }
};
export const is_ruby_arr = (ruby: MbArr<Ruby>): ruby is Ruby[] => {
  if (Array.isArray(ruby)) {
    if (ruby.length != 2) {
      return true;
    }
    if (typeof ruby[1] == "string") {
      return true;
    }
    //ruby[1] must arr here
    if (typeof ruby[1][0] == "string") {
      return true;
    }
  }
  return false;
};
export const is_range_ruby = (
  ruby: Ruby
): ruby is [string, [number, number]] => {
  return !(typeof ruby == "string");
};
export const is_detailed_ref = (
  ref: Ref
): ref is { word: string; kana: string } => {
  return typeof ref == "object";
};
const is_ruby_undef = (ruby: Ruby) => {
  if (typeof ruby == "string") {
    return !ruby;
  }
  return false;
};

const trim = (
  str: string,
  { trans, dele }: { trans?: Map<string, string>; dele?: Set<string> }
) => {
  let ans = "";
  for (const c of str) {
    if (trans && trans.has(c)) {
      ans += trans.get(c)!;
    } else if (dele && dele.has(c)) {
    } else {
      ans += c;
    }
  }
  return ans;
};
const trans_proto = {
  dele: new Set(["[", "]", "［", "］", " "]),
  trans: new Map([
    [".", ","],
    ["；", ";"],
    ["，", ","],
    ["・", ","],
    ["（", "("],
    ["）", ")"],
  ]),
};

const ruby_trim = (r: Ruby): Ruby => {
  if (Array.isArray(r)) {
    return [trim(r[0], { dele: new Set(["(", ")", "（", "）", " "]) }), r[1]];
  } else {
    return trim(r, { dele: new Set(["(", ")", "（", "）", " "]) });
  }
};

export const identity = <T>(ori: T) => ori;

const link_trim = (refs: MbArr<Ref>) => {
  return maybe_map(
    refs,
    (r): Ref => {
      if (is_detailed_ref(r)) {
        return {
          word: trim(r.word, { dele: new Set([" "]) }),
          kana: trim(r.kana, { dele: new Set([" "]) }),
        };
      } else {
        return trim(r, { dele: new Set([" "]) });
      }
    }
  );
};

export const trim_word = (w: Word): Word => {
  return {
    word: maybe_map(w.word, (o) => trim(o, { dele: new Set([" "]) }))!,
    pron: maybe_map(w.pron, identity),
    ruby: maybe_map(w.ruby, ruby_trim, is_ruby_arr, is_ruby_undef),
    rela: link_trim(w.rela),
    simi: link_trim(w.simi),
    anto: link_trim(w.anto),
    roman: w.roman,
    idiom: maybe_map(w.idiom, (i) => ({
      word: trim(i.word, { dele: new Set([" "]) }),
      ruby: maybe_map(i.ruby, ruby_trim, is_ruby_arr, is_ruby_undef),
      trans: trim(i.trans, trans_proto),
    })),
    from: w.from,
    trans: maybe_map(w.trans, (t) => ({
      type: maybe_map(t.type, (tt) =>
        trim(tt, { dele: new Set(["[", "]", "［", "］", " "]) })
      ),
      def: trim(t.def, trans_proto),
    }))!,
  };
};

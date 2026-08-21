/**
 * Notion の「進行ローマ数字」を、画面に並べられる形へ変換する。
 *
 * 元データの書式は曲によってバラバラで、少なくとも次の3種類がある。
 *   A) 小節табле:  | I | III7 | VIm  VIm/V |
 *   B) セクション付き: 【Verse A】 I | V/VII | VIm |
 *   C) ダッシュ区切り: I - I7 - IV - IVm6 - I
 * 解釈できないものは無理に図にせず、整形済みテキストとして返す（fallback）。
 */

export type ChordFunction =
  | "tonic"
  | "subdominant"
  | "dominant"
  | "secondary"
  | "subdominant-minor"
  | "diminished"
  | "repeat"
  | "other";

export interface ParsedChord {
  /** 元の表記そのまま（例: "VIm/V"） */
  raw: string;
  fn: ChordFunction;
}

export interface ParsedBar {
  chords: ParsedChord[];
}

export interface ParsedSection {
  /** 【Verse A】などのセクション名。無ければ undefined */
  name?: string;
  /** 原文の1行 = 1行分の小節。4小節ごとの区切りをそのまま活かす */
  rows: ParsedBar[][];
}

export interface ParsedProgression {
  sections: ParsedSection[];
  /** 図にできなかった残り。改行を保ったまま表示する */
  fallback?: string;
}

/** 半角・全角どちらのローマ数字も受ける */
const ROMAN_TO_DEGREE: Record<string, number> = {
  VII: 7, VI: 6, IV: 4, V: 5, III: 3, II: 2, I: 1,
  "Ⅶ": 7, "Ⅵ": 6, "Ⅳ": 4, "Ⅴ": 5, "Ⅲ": 3, "Ⅱ": 2, "Ⅰ": 1,
};
/** 長いものから試す必要がある（VII を VI + I と読まないため） */
const ROMAN_KEYS = Object.keys(ROMAN_TO_DEGREE).sort((a, b) => b.length - a.length);

interface ChordParts {
  degree: number;
  /** -1 = ♭, 0 = なし, 1 = ♯ */
  accidental: -1 | 0 | 1;
  isMinor: boolean;
  isDiminished: boolean;
  /** 7th や 9th など、何らかの付加音が付いているか */
  hasSeventh: boolean;
}

function parseChordParts(token: string): ChordParts | null {
  // スラッシュコードは分子（上に乗る和音）で機能が決まる
  let head = token.split("/")[0].trim();
  if (!head) return null;

  let accidental: -1 | 0 | 1 = 0;
  const acc = head[0];
  if (acc === "♯" || acc === "#") {
    accidental = 1;
    head = head.slice(1);
  } else if (acc === "♭" || acc === "b") {
    accidental = -1;
    head = head.slice(1);
  }

  const roman = ROMAN_KEYS.find((r) => head.toUpperCase().startsWith(r));
  if (!roman) return null;

  const wasLowercase = head.slice(0, roman.length) === head.slice(0, roman.length).toLowerCase()
    && /[a-zⅰ-ⅶ]/.test(head.slice(0, roman.length));
  const rest = head.slice(roman.length);

  const isDiminished = /dim|°|ø/i.test(rest);
  // "m" は小文字のときだけマイナー。"M7" や "maj" は長7度なのでマイナーではない
  const isMinor =
    wasLowercase || (/^m/.test(rest) && !/^maj/i.test(rest) && !/^M/.test(rest));
  const hasSeventh = /7|9|11|13|△|maj/i.test(rest);

  return {
    degree: ROMAN_TO_DEGREE[roman],
    accidental,
    isMinor,
    isDiminished,
    hasSeventh,
  };
}

/**
 * メジャーキーを基準に和音の機能を判定する。
 * マイナーキーの曲でも i / iv / V の関係はそのまま読めるので同じ規則で通す。
 */
export function classifyChord(token: string): ChordFunction {
  const t = token.trim();
  if (!t) return "other";
  // 「%」「〃」は前の小節の繰り返し
  if (/^[%〃]+$/.test(t)) return "repeat";

  const p = parseChordParts(t);
  if (!p) return "other";

  if (p.isDiminished) return "diminished";

  // ♭を伴う借用和音（♭III / ♭VI / ♭VII）はサブドミナントマイナー系の色で扱う
  if (p.accidental === -1 && [3, 6, 7].includes(p.degree)) return "subdominant-minor";
  // IVm, IVm6 も同じ
  if (p.degree === 4 && p.isMinor) return "subdominant-minor";

  if (p.degree === 5) return "dominant";
  if (p.degree === 7) return p.isMinor ? "dominant" : "secondary";

  // 本来マイナーであるべき度数がメジャーならセカンダリードミナント
  if ([2, 3, 6].includes(p.degree) && !p.isMinor) return "secondary";

  if (p.degree === 1 || p.degree === 3 || p.degree === 6) return "tonic";
  if (p.degree === 2 || p.degree === 4) return "subdominant";

  return "other";
}

/** 【Verse A】 / [A] / [Ending] は行の途中にも現れる */
const SECTION_MARKER = /【([^】]{1,20})】|\[([^\]]{1,20})\]/g;
/** Aメロ、サビ など日本語のセクション名（行頭のみ） */
const JP_SECTION = /^((?:[ABCＡＢＣ]メロ|サビ|イントロ|間奏|エンディング|アウトロ)[^|｜]{0,20}?)\s*(?:[|｜]|$)/;

/** 日本語の文字を含むか（解説文の混入判定に使う） */
const HAS_JP = /[ぁ-んァ-ヶ一-龠]/;

/**
 * 行を「セクション名」と「小節の並び」の断片に切り分ける。
 * 1行の中に複数のセクションが入っている曲があるため、行頭だけでは足りない。
 */
interface Segment {
  name?: string;
  body: string;
}

function segmentLine(line: string): Segment[] {
  const jp = line.match(JP_SECTION);
  if (jp) {
    return [{ name: jp[1].trim(), body: line.slice(jp[0].length).trim() }];
  }

  const segments: Segment[] = [];
  let lastIndex = 0;
  let pendingName: string | undefined;
  SECTION_MARKER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SECTION_MARKER.exec(line)) !== null) {
    const body = line.slice(lastIndex, m.index).trim();
    if (body || pendingName) segments.push({ name: pendingName, body });
    pendingName = (m[1] ?? m[2]).replace(/\s*Section\s*$/i, "").trim();
    lastIndex = m.index + m[0].length;
  }
  const tail = line.slice(lastIndex).trim();
  if (tail || pendingName) segments.push({ name: pendingName, body: tail });
  return segments.length > 0 ? segments : [{ body: line }];
}

/** その断片が新しいコードの始まりか（ローマ数字か繰り返し記号で始まるか） */
function startsChord(token: string): boolean {
  const t = token.replace(/^[（(\[]+/, "");
  if (/^[%〃]/.test(t)) return true;
  const head = t.replace(/^[♯♭#b]/, "");
  return ROMAN_KEYS.some((r) => head.toUpperCase().startsWith(r));
}

/** 区切り記号や注記ラベルなど、コードではない断片 */
function isNoiseToken(t: string): boolean {
  if (!t) return true;
  if (/^[-—–→>|｜:：,、。"'”“’‘]+$/.test(t)) return true; // 記号だけ
  if (/^[（(\[]?[A-Za-z]{2,12}[：:]$/.test(t)) return true; // "Last:" のような注記
  return false;
}

/** ローマ数字を1文字も含まない長い断片は、コードではなく解説文とみなす */
function looksLikeChord(raw: string): boolean {
  if (/^[%〃]+$/.test(raw)) return true;
  if (/[IVXivxⅠ-Ⅶ]/.test(raw)) return true;
  return raw.length <= 2;
}

/** コード表記の前後に付く注記を落とす */
function cleanChordToken(token: string): string {
  let t = token.trim();
  // 解説文が前に付いている場合は「。」「：」より後ろだけを見る
  if (HAS_JP.test(t)) {
    const cut = Math.max(t.lastIndexOf("。"), t.lastIndexOf("："), t.lastIndexOf(":"));
    if (cut >= 0) t = t.slice(cut + 1).trim();
  }
  t = t.replace(/^\(\s*\d+\.?\s*\)\s*/, ""); // (1.) (2.)
  t = t.replace(/^(?:Last|last)\s*[:：]\s*/, "");
  t = t.replace(/:\|+$/, ""); // 反復記号 :|| :|
  t = t.replace(/[\s:：,、。]+$/, ""); // 末尾に残った区切り
  // 対応する開き括弧が無い閉じ括弧を落とす（"I7)" → "I7"）
  while (/\)$/.test(t) && (t.match(/\(/g)?.length ?? 0) < (t.match(/\)/g)?.length ?? 0)) {
    t = t.slice(0, -1);
  }
  return t.trim();
}

/** 1行分を小節の配列にする。解釈できなければ null */
function parseRow(line: string): ParsedBar[] | null {
  const text = line.trim();
  if (!text) return null;

  let barTokens: string[];
  if (/[|｜]/.test(text)) {
    barTokens = text.split(/[|｜]/);
  } else if (/\s*[-—–→]\s*/.test(text) && /[IVivⅠ-Ⅶ]/.test(text)) {
    // ダッシュ・矢印区切りは1コード=1小節とみなす
    barTokens = text.split(/\s*[—–→]\s*|\s+-\s+/);
  } else {
    return null;
  }

  const bars: ParsedBar[] = [];
  for (const bt of barTokens) {
    const bar = bt.trim();
    if (!bar) continue;

    // 小節内はまず空白・ダッシュ・矢印で全部割る。
    // ただし「iv 7」「i △7」のように品質だけが離れている表記があるので、
    // ローマ数字で始まらない断片は直前のコードに戻す。
    const rawTokens = bar
      .split(/\s+|\s*[—–→]\s*/)
      .map((t) => t.trim())
      .filter((t) => t && !isNoiseToken(t));

    const merged: string[] = [];
    for (const tok of rawTokens) {
      if (merged.length > 0 && !startsChord(tok)) {
        merged[merged.length - 1] += ` ${tok}`;
      } else {
        merged.push(tok);
      }
    }

    const chordTokens = merged
      .map(cleanChordToken)
      .filter((t) => t && looksLikeChord(t));

    const chords = chordTokens.map((raw) => ({ raw, fn: classifyChord(raw) }));
    if (chords.length > 0) bars.push({ chords });
  }

  if (bars.length === 0) return null;

  const all = bars.flatMap((b) => b.chords);
  // 解説文が混ざったままの行は図にせず fallback へ回す
  if (all.some((c) => HAS_JP.test(c.raw) && c.raw.length > 8)) return null;
  // 半分以上が和音として読めないなら失敗扱い
  const unreadable = all.filter((c) => c.fn === "other").length;
  if (unreadable > all.length / 2) return null;

  return bars;
}

export function parseProgression(source: string | undefined): ParsedProgression {
  if (!source || !source.trim()) return { sections: [] };

  const lines = source.split(/\r?\n/);
  const sections: ParsedSection[] = [];
  const unparsed: string[] = [];
  let current: ParsedSection | null = null;

  const pushCurrent = () => {
    if (current && current.rows.length > 0) sections.push(current);
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    for (const seg of segmentLine(line)) {
      if (seg.name !== undefined) {
        pushCurrent();
        current = { name: seg.name, rows: [] };
      }
      if (!seg.body) continue;

      const bars = parseRow(seg.body);
      if (bars) {
        if (!current) current = { rows: [] };
        current.rows.push(bars);
      } else if (current?.name && current.rows.length === 0 && seg.body.length <= 30) {
        // 「【A】Verse 3/4拍子」のように見出しの続きが小節ではない場合は、
        // 別枠に落とさずセクション名に含める（タブが "A" だけでは中身が分からないため）
        current.name = `${current.name} ${seg.body}`.trim();
      } else {
        // 図にできない断片（解説文など）は fallback に回す
        unparsed.push(seg.body);
      }
    }
  }
  pushCurrent();

  return {
    sections,
    fallback: unparsed.length > 0 ? unparsed.join("\n") : undefined,
  };
}

/** 凡例の並び。出現順ではなく機能の並び（T→S→D→派生）で固定する */
const FUNCTION_ORDER: ChordFunction[] = [
  "tonic",
  "subdominant",
  "dominant",
  "secondary",
  "subdominant-minor",
  "diminished",
];

/** 図の下に出す凡例。表示中のセクションで実際に使われている機能だけ返す */
export function usedFunctions(sections: ParsedSection[]): ChordFunction[] {
  const set = new Set<ChordFunction>();
  for (const s of sections)
    for (const row of s.rows)
      for (const bar of row)
        for (const c of bar.chords)
          if (c.fn !== "other" && c.fn !== "repeat") set.add(c.fn);
  return FUNCTION_ORDER.filter((fn) => set.has(fn));
}

export const FUNCTION_LABEL: Record<ChordFunction, string> = {
  tonic: "トニック",
  subdominant: "サブドミナント",
  dominant: "ドミナント",
  secondary: "セカンダリードミナント",
  "subdominant-minor": "サブドミナントマイナー",
  diminished: "ディミニッシュ",
  repeat: "繰り返し",
  other: "その他",
};

/**
 * Notion の「AI要約（詳細）」を見出し付きのブロックに分解する。
 *
 * 元データは次の形で書かれている（曲によって見出しの有無は違う）。
 *   概要：...
 *   ハーモニー：...
 *   リズム：...
 *   教材ポイント：
 *   - 教材ポイント：IVm6 と IIm7♭5 の転回形の関係を比較させる
 *
 * 箇条書きの中に見出しが重複して入っているものがあるので、そこも落とす。
 */

export interface SummaryBlock {
  /** 「概要」「ハーモニー」など。見出しが無い本文は undefined */
  label?: string;
  paragraphs: string[];
  bullets: string[];
}

/** 教材ポイントに当たる見出し。UIで扱いを変えるため別に判定する */
export const PRACTICE_LABELS = ["教材ポイント", "練習ポイント", "教材"];

const LABEL_RE = /^([^\s：:]{2,10})\s*[：:]\s*(.*)$/;
const BULLET_RE = /^[-–—・•*]\s*(.+)$/;

export function parseSummary(source: string | undefined): SummaryBlock[] {
  if (!source || !source.trim()) return [];

  const blocks: SummaryBlock[] = [];
  let current: SummaryBlock | null = null;

  const push = () => {
    if (current && (current.paragraphs.length > 0 || current.bullets.length > 0)) {
      blocks.push(current);
    }
    current = null;
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const bullet = line.match(BULLET_RE);
    if (bullet) {
      let text = bullet[1].trim();
      // 「- 教材ポイント：〜」のように見出しが重複している分を落とす
      const dup = text.match(LABEL_RE);
      if (dup && current?.label && dup[1] === current.label) text = dup[2].trim();
      if (!current) current = { paragraphs: [], bullets: [] };
      if (text) current.bullets.push(text);
      continue;
    }

    const labeled = line.match(LABEL_RE);
    if (labeled) {
      push();
      current = { label: labeled[1], paragraphs: [], bullets: [] };
      const body = labeled[2].trim();
      if (body) current.paragraphs.push(body);
      continue;
    }

    if (!current) current = { paragraphs: [], bullets: [] };
    current.paragraphs.push(line);
  }
  push();

  return blocks;
}

export function isPracticeBlock(b: SummaryBlock): boolean {
  return !!b.label && PRACTICE_LABELS.includes(b.label);
}

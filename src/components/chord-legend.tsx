import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { FUNCTION_LABEL, type ChordFunction } from "@/lib/chord-analysis";
import { LEGEND_DOT } from "@/lib/chord-colors";
import { PIANO_BASICS_URL } from "@/lib/site-config";

/**
 * コード分析の表の「読み方」。
 *
 * 色分けだけあって意味がどこにも書かれていない状態だと、
 * 初めて見た人には記号の羅列にしか見えない。ここが鍵になる。
 * 平易な言い換えを添えるのは、用語を知らない人に用語で説明しても届かないため。
 */
const MEANING: Partial<Record<ChordFunction, string>> = {
  tonic: "帰ってくる場所",
  subdominant: "少し外に出る",
  dominant: "強く引き戻す",
  secondary: "一時的に引っぱる",
  "subdominant-minor": "切なくする",
  diminished: "次へのつなぎ",
};

const ORDER: ChordFunction[] = [
  "tonic",
  "subdominant",
  "dominant",
  "secondary",
  "subdominant-minor",
  "diminished",
];

export function ChordLegend() {
  return (
    <details className="group rounded-lg border border-border bg-muted/30 p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground marker:hidden">
        <span>表の色は「コードの役割」を表しています</span>
        <span
          aria-hidden
          className="shrink-0 text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45"
        >
          ＋
        </span>
      </summary>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {ORDER.map((fn) => (
          <li key={fn} className="flex items-start gap-2 text-xs leading-relaxed">
            <span
              aria-hidden
              className={`mt-1 size-2.5 shrink-0 rounded-full ${LEGEND_DOT[fn]}`}
            />
            <span>
              <span className="font-medium text-foreground">
                {FUNCTION_LABEL[fn]}
              </span>
              <span className="text-muted-foreground"> — {MEANING[fn]}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        ローマ数字は「キーの中で何番目の音か」を表しています。仕組みから知りたい方は
        <Link
          href={PIANO_BASICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-1 inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
        >
          コード入門（全8回）
          <ExternalLink className="size-3" />
        </Link>
        をどうぞ。
      </p>
    </details>
  );
}

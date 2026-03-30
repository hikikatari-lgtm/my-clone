import { HistoryLibrary } from "@/components/history-library";

export const metadata = {
  title: "Rock Legends — History",
};

const episodes = [
  { ep: 1, title: "シカゴ・ブルース", genre: "ブルース", url: "https://www.notion.so/f27f00644cb94f8986d6216d13fd702b" },
  { ep: 2, title: "ニュー・オリンズ ファッツ・ドミノ", genre: "ブルース", url: "https://www.notion.so/486ed80eed58467fbf620f65c66264f9" },
  { ep: 3, title: "ロカビリー エヴァリー・ブラザース", genre: "ロカビリー", url: "https://www.notion.so/29c74f886ba24733b653fa69567c4ef7" },
  { ep: 4, title: "ティーン・アイドル フランキー・アヴァロン", genre: "ポップ", url: "https://www.notion.so/c6ac770daa7149bf9961e132d8acde23" },
  { ep: 5, title: "ドゥーワップ ドリフターズ他", genre: "ソウルR&B", url: "https://www.notion.so/1516a3ac8d3a4a51a7c20ae7785b76ce" },
  { ep: 6, title: "モータウン テンプテーションズ他", genre: "ソウルR&B", url: "https://www.notion.so/0c38680f69b3413da24b04c6eacf854d" },
  { ep: 7, title: "アメリカン・フォーク ジョーン・バエズ他", genre: "フォーク", url: "https://www.notion.so/35bf3a83510844eea4c5571cc417adea" },
  { ep: 8, title: "世界のフォーク ピーター・ポール＆マリー", genre: "フォーク", url: "https://www.notion.so/1c49b8d74ac444d19a3f2008e91728f4" },
  { ep: 9, title: "フィル・スペクター・イヤーズ ライチャス・ブラザーズ他", genre: "ポップ", url: "https://www.notion.so/2e819a12f05c44bb93fa6c806889644f" },
  { ep: 10, title: "英国のリズム＆ブルース アニマルズ・ヤードバーズ他", genre: "ブルース", url: "https://www.notion.so/202a55d8756644a9bbbabec384d78d54" },
  { ep: 11, title: "ソウル/R&B フォー・トップス他", genre: "ソウルR&B", url: "https://www.notion.so/9c75c02d040f45a4b06cd3953e85ea56" },
  { ep: 12, title: "英国サイケデリック・ロック ムーディー・ブルース・ELP・トラフィック", genre: "サイケプログレ", url: "https://www.notion.so/7cfcc8dea1dd4ec3b409c7db43c267fd" },
  { ep: 13, title: "実験音楽 フランク・ザッパ・キング・クリムゾン他", genre: "サイケプログレ", url: "https://www.notion.so/d9865387ccab4586abb246f5dbaed596" },
  { ep: 14, title: "シンガー・ソングライター キャット・スティーヴンス・ジェームス・テイラー他", genre: "フォーク", url: "https://www.notion.so/ae70efc1abcf4a93a1215dde7a973376" },
  { ep: 15, title: "メタル誕生 ディープ・パープル・ブラック・サバス・ナザレス", genre: "メタルハード", url: "https://www.notion.so/62ea976afb974478a1370dbfe624aa60" },
  { ep: 16, title: "グラム・ロック T・レックス・モット・ザ・フープル・スウィート", genre: "グラムパンク", url: "https://www.notion.so/3160fc6bb9ff4a76837effc980362fb2" },
  { ep: 17, title: "USパンク ニューヨーク・ドールズ・ラモーンズ・デッド・ケネディーズ", genre: "グラムパンク", url: "https://www.notion.so/0ec436e8b64344119a654f3f856549dd" },
  { ep: 18, title: "アメリカン・プログレ・ハード ボストン・REOスピードワゴン・スティクス", genre: "メタルハード", url: "https://www.notion.so/2c57461e5a08432bb4df42d16096d914" },
  { ep: 19, title: "AOR スティーリー・ダン・ドゥービー・ブラザーズ・ボズ・スキャッグス", genre: "AORポップロック", url: "https://www.notion.so/99d445c1dfb34d319e55fb47b303291c" },
  { ep: 20, title: "ニューウェーヴ B-52's・ディーヴォ・プリテンダーズ", genre: "ニューウェーヴ", url: "https://www.notion.so/89ba657026da4614b3ecc553080dd093" },
  { ep: 21, title: "プログレッシヴ・ロック ラッシュ・イエス・アトミック・ルースター", genre: "サイケプログレ", url: "https://www.notion.so/1c134d2cd05f423ab6a72c11f1fde232" },
  { ep: 22, title: "英国プログレッシヴ・ロック スーパートランプ・ELO・バークレイ・ジェイムス・ハーヴェスト", genre: "サイケプログレ", url: "https://www.notion.so/bc239a1148eb48a0a512d02e6d358c06" },
  { ep: 23, title: "NWOBHM ジューダス・プリースト・サクソン・アイアン・メイデン", genre: "メタルハード", url: "https://www.notion.so/48082ef05ca54949a5939e4308579c55" },
  { ep: 24, title: "HR/HM モーターヘッド・テスタメント・AC/DC", genre: "メタルハード", url: "https://www.notion.so/244bedfda4744602a1619bc0130847b4" },
  { ep: 25, title: "ポップ・ロック ザ・カーズ・ヒューイ・ルイス＆ザ・ニュース・ゴーゴーズ", genre: "AORポップロック", url: "https://www.notion.so/359d5b9d48864e6cbf26462f19dcf348" },
  { ep: 26, title: "男性ソウル・ヴォーカリスト ライオネル・リッチー・マイケル・ボルトン", genre: "ソウルR&B", url: "https://www.notion.so/67e9c40face04e0ca0c3f7d1b93c4b7a" },
  { ep: 27, title: "女性ロック ハート・スージー・クアトロ・バングルス", genre: "メタルハード", url: "https://www.notion.so/493dfc06616d44a68039b5e76be39153" },
];

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Rock Legends
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          ロック歴史秘話 全27エピソード
        </p>
      </div>
      <HistoryLibrary episodes={episodes} />
    </main>
  );
}

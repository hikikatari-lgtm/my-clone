export interface Episode {
  ep: number;
  title: string;
  artists: string;
  genre: string;
  pageId: string;
  loomId?: string;
}

export const episodes: Episode[] = [
  { ep: 1, title: "シカゴ・ブルース", artists: "", genre: "ブルース", pageId: "f27f00644cb94f8986d6216d13fd702b", loomId: "3a77261b9ab4491698f54b08f2c77182" },
  { ep: 2, title: "ニュー・オリンズ", artists: "ファッツ・ドミノ", genre: "ブルース", pageId: "486ed80eed58467fbf620f65c66264f9", loomId: "27ed0b40ba934c11adf341112c8aac0e" },
  { ep: 3, title: "ロカビリー", artists: "エヴァリー・ブラザース", genre: "ロカビリー", pageId: "29c74f886ba24733b653fa69567c4ef7", loomId: "f52ac700e94446babb7eb3a55b17de95" },
  { ep: 4, title: "ティーン・アイドル", artists: "フランキー・アヴァロン", genre: "ポップ", pageId: "c6ac770daa7149bf9961e132d8acde23", loomId: "cd6b77af9bda49079397a883d55effa7" },
  { ep: 5, title: "ドゥーワップ", artists: "ドリフターズ他", genre: "ソウルR&B", pageId: "1516a3ac8d3a4a51a7c20ae7785b76ce", loomId: "57f94884c720444c93bd84554d5703d7" },
  { ep: 6, title: "モータウン", artists: "テンプテーションズ他", genre: "ソウルR&B", pageId: "0c38680f69b3413da24b04c6eacf854d", loomId: "8c02ee47143043a295763a4fe1105d26" },
  { ep: 7, title: "アメリカン・フォーク", artists: "ジョーン・バエズ他", genre: "フォーク", pageId: "35bf3a83510844eea4c5571cc417adea", loomId: "4d670b2438ec468a8f6cdf708cef8021" },
  { ep: 8, title: "世界のフォーク", artists: "ピーター・ポール＆マリー", genre: "フォーク", pageId: "1c49b8d74ac444d19a3f2008e91728f4", loomId: "a0e6f98dad2349ec8f9ddbebb20fc89f" },
  { ep: 9, title: "フィル・スペクター・イヤーズ", artists: "ライチャス・ブラザーズ、ザ・ロネッツ他", genre: "ポップ", pageId: "2e819a12f05c44bb93fa6c806889644f", loomId: "2efa191a0777499595b972613d7456c4" },
  { ep: 10, title: "英国のリズム＆ブルース", artists: "アニマルズ、ヤードバーズ他", genre: "ブルース", pageId: "202a55d8756644a9bbbabec384d78d54", loomId: "529326a6669044e9876292aefba7349d" },
  { ep: 11, title: "ソウル/R&B", artists: "フォー・トップス他", genre: "ソウルR&B", pageId: "9c75c02d040f45a4b06cd3953e85ea56", loomId: "758d5d70573f4215bc85d7aab3fdebcf" },
  { ep: 12, title: "英国サイケデリック・ロック", artists: "ムーディー・ブルース、ELP、トラフィック", genre: "サイケプログレ", pageId: "7cfcc8dea1dd4ec3b409c7db43c267fd", loomId: "ea7bcb9616f7435e8aecc021371ce26c" },
  { ep: 13, title: "実験音楽", artists: "フランク・ザッパ、キング・クリムゾン他", genre: "サイケプログレ", pageId: "d9865387ccab4586abb246f5dbaed596", loomId: "512b301cde504fdca11902d5ae77a230" },
  { ep: 14, title: "シンガー・ソングライター", artists: "キャット・スティーヴンス、ジェームス・テイラー他", genre: "フォーク", pageId: "ae70efc1abcf4a93a1215dde7a973376", loomId: "8d71b644e4864439827d2fccf6bc3c6d" },
  { ep: 15, title: "メタル誕生", artists: "ディープ・パープル、ブラック・サバス、ナザレス", genre: "メタルハード", pageId: "62ea976afb974478a1370dbfe624aa60", loomId: "3057d6625aec4147a73c956ba8131090" },
  { ep: 16, title: "グラム・ロック", artists: "T・レックス、モット・ザ・フープル、スウィート", genre: "グラムパンク", pageId: "3160fc6bb9ff4a76837effc980362fb2", loomId: "d6d245be71254c8989227dda032668f1" },
  { ep: 17, title: "USパンク", artists: "ニューヨーク・ドールズ、ラモーンズ、デッド・ケネディーズ", genre: "グラムパンク", pageId: "0ec436e8b64344119a654f3f856549dd", loomId: "a0bfcbb7b07844d0b1942d5b3ce8be76" },
  { ep: 18, title: "アメリカン・プログレ・ハード", artists: "ボストン、REOスピードワゴン、スティクス", genre: "メタルハード", pageId: "2c57461e5a08432bb4df42d16096d914", loomId: "344bd2ed21aa46089fb369a8e932259d" },
  { ep: 19, title: "AOR", artists: "スティーリー・ダン、ドゥービー・ブラザーズ、ボズ・スキャッグス", genre: "AORポップロック", pageId: "99d445c1dfb34d319e55fb47b303291c", loomId: "f45cdfe719334000babb54bca0e97cb7" },
  { ep: 20, title: "ニューウェーヴ", artists: "B-52's、ディーヴォ、プリテンダーズ", genre: "ニューウェーヴ", pageId: "89ba657026da4614b3ecc553080dd093", loomId: "8028ccb8a3a049239a4e194917ef4683" },
  { ep: 21, title: "プログレッシヴ・ロック", artists: "ラッシュ、イエス、アトミック・ルースター", genre: "サイケプログレ", pageId: "1c134d2cd05f423ab6a72c11f1fde232", loomId: "0a32fcb9b5f44095853ad3c0e4a96846" },
  { ep: 22, title: "英国プログレッシヴ・ロック", artists: "スーパートランプ、ELO、バークレイ・ジェイムス・ハーヴェスト", genre: "サイケプログレ", pageId: "bc239a1148eb48a0a512d02e6d358c06" },
  { ep: 23, title: "NWOBHM", artists: "ジューダス・プリースト、サクソン、アイアン・メイデン", genre: "メタルハード", pageId: "48082ef05ca54949a5939e4308579c55", loomId: "dbc963e5317b4380ba2ef0de15150c39" },
  { ep: 24, title: "HR/HM", artists: "モーターヘッド、テスタメント、AC/DC", genre: "メタルハード", pageId: "244bedfda4744602a1619bc0130847b4", loomId: "73df0792a07f4245b423b9f7e3b7aaed" },
  { ep: 25, title: "ポップ・ロック", artists: "ザ・カーズ、ヒューイ・ルイス&ザ・ニュース、ゴーゴーズ", genre: "AORポップロック", pageId: "359d5b9d48864e6cbf26462f19dcf348", loomId: "8653ac193fe2422499ae69cf8a4e06db" },
  { ep: 26, title: "男性ソウル・ヴォーカリスト", artists: "ライオネル・リッチー、マイケル・ボルトン", genre: "ソウルR&B", pageId: "67e9c40face04e0ca0c3f7d1b93c4b7a", loomId: "bf86df1ad45e4d40a207f0db2b76e38e" },
  { ep: 27, title: "女性ロック", artists: "ハート、スージー・クアトロ、バングルス", genre: "メタルハード", pageId: "493dfc06616d44a68039b5e76be39153", loomId: "5f640fe58a7f4ed59c2c70c3e971ae7c" },
];

export function getEpisodeByEp(ep: number): Episode | undefined {
  return episodes.find((e) => e.ep === ep);
}

/**
 * 全関映・過去映画アーカイブ 限定公開作品「認証ゲート」
 * =====================================================
 * 役割：アーカイブHTML内の限定公開作品（28作品）のリンクは、すべてこの
 * ウェブアプリを経由します。認証コードを知っている人だけが、実際の
 * YouTube動画URLへ進めます。動画URLそのものはHTMLには含まれません。
 *
 * 設置手順：
 *  1. https://script.google.com/ を開き「新しいプロジェクト」を作成
 *  2. このファイルの内容をすべて貼り付ける（既定の myFunction は消してよい）
 *  3. 下の AUTH_CODE を、メンバーだけに知らせる認証コードに書き換える
 *  4. 右上「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」を選択
 *       - 説明：（任意）全関映アーカイブ認証ゲート
 *       - 次のユーザーとして実行：自分
 *       - アクセスできるユーザー：全員   ← これが必須です
 *  5. 「デプロイ」を押すと ウェブアプリURL（https://script.google.com/macros/s/AKfyc.../exec）
 *     が発行される
 *  6. アーカイブHTML内の「YOUR_DEPLOYMENT_ID」という文字列を、上記URLの
 *     「AKfyc...」の部分（デプロイID）に一括置換すれば完成
 *
 * ※コードを変更した場合は「デプロイ」→「デプロイを管理」から新しい
 *   バージョンを発行してください（URLは変わりません）。
 */

// ★必ず変更してください：認証コード（同窓生メンバー限定で共有する合言葉）
const AUTH_CODE = 'zke2026';

// 限定公開作品の実URL（No. → YouTube）
const URLS = {
  '20': 'https://www.youtube.com/watch?v=0gRVgJ4GR40', // 空中楼閣
  '28': 'https://www.youtube.com/watch?v=1O_2ICHW6qk', // ひとこと多いぞ
  '37': 'https://www.youtube.com/watch?v=X7kkFh8cKYQ', // N極関係（2024年度）
  '38': 'https://www.youtube.com/watch?v=k7w70VJGbFA', // After and Before（2024年度）
  '39': 'https://www.youtube.com/watch?v=gSRMLmDp9WU', // Bobby1800（2024年度）
  '40': 'https://www.youtube.com/watch?v=JgU2DpGKhFM', // 持つべきものは、（2024年度）
  '41': 'https://www.youtube.com/watch?v=mr7sIA7q5p4', // ヒーロー参上（2024年度）
  '49': 'https://www.youtube.com/watch?v=vWQYA9zCqD4', // ぼくまだねむいよ
  '50': 'https://www.youtube.com/watch?v=WgFqZIG7eqY', // 還暦記念ムービー
  '51': 'https://www.youtube.com/watch?v=F-YQB4L0XB4', // ジャイアント ヒロ
  '52': 'https://www.youtube.com/watch?v=oEHcdwhDZd4', // ジャイアントヒロ２「海獣の逆襲」
  '53': 'https://www.youtube.com/watch?v=6iFM7Gw0Kw0', // ジャイアントヒロ３ 新たなる刺客
  '54': 'https://www.youtube.com/watch?v=5lAaqltOdFg', // ジャイアントヒロ ４〜恐怖のサメDAY〜
  '55': 'https://www.youtube.com/watch?v=t1aexrqFZ_E', // ジャイアントヒロ５「南半球の魔獣」
  '56': 'https://www.youtube.com/watch?v=-jpfVwApNVU', // ジャイアントヒロ最終回
  '57': 'https://www.youtube.com/watch?v=iQNTsbAYREk', // ３年Ｂ組ゲソヒコ先生
  '58': 'https://www.youtube.com/watch?v=PRjJbF2cQiA', // ミドルの早口言葉
  '59': 'https://www.youtube.com/watch?v=48VjnmqTrIA', // ＼ミドルだョ！／全員集合
  '60': 'https://www.youtube.com/watch?v=fDypR5RXE_Y', // 半ゾ人 本編
  '61': 'https://www.youtube.com/watch?v=1me27U6p2TY', // 半ゾ人 NG集
  '62': 'https://www.youtube.com/watch?v=wFgCQ_UtxlY', // U-1グランプリ 円谷町内会
  '63': 'https://www.youtube.com/watch?v=0hGSzUqC2O0', // 新春！名人寄席
  '64': 'https://www.youtube.com/watch?v=idqKtHPJhZU', // 秘宝戦隊ラブレンジャー
  '65': 'https://www.youtube.com/watch?v=PehDBcPJTkk', // 覆面お好み焼屋
  '66': 'https://www.youtube.com/watch?v=c8shxxEdFio', // 全員猪木
  '67': 'https://www.youtube.com/watch?v=B2rTimKnpbU', // HGVIRUS
  '68': 'https://www.youtube.com/watch?v=g5_n5ICdos8', // 新春！お笑いヒットパレード
  '69': 'https://www.youtube.com/watch?v=cajhmvebh1U'  // 全関映同窓会記念2017年6月
};

function doGet(e) {
  const p = (e && e.parameter) || {};
  const id = String(p.id || '').trim();
  const code = String(p.code || '').trim();
  const url = URLS[id];

  if (!url) {
    return page_('作品が見つかりません',
      '<p>リンクが正しくありません。アーカイブのページから開き直してください。</p>');
  }

  if (code === AUTH_CODE) {
    // 認証OK：動画ページへ自動で移動
    const html =
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta http-equiv="refresh" content="0;url=' + url + '">' +
      '<title>全関映アーカイブ</title></head>' +
      '<body style="font-family:sans-serif;padding:24px;line-height:1.8">' +
      '<p>認証できました。動画ページへ移動します…</p>' +
      '<p><a href="' + url + '">自動で移動しない場合はこちら</a></p>' +
      '<script>location.replace(' + JSON.stringify(url) + ');</' + 'script>' +
      '</body></html>';
    return HtmlService.createHtmlOutput(html).setTitle('全関映アーカイブ');
  }

  // コード未入力／不一致：入力フォームを表示
  const err = code
    ? '<p style="color:#c00;font-weight:700">認証コードが違います。もう一度お試しください。</p>'
    : '';
  const form =
    '<h2 style="font-size:19px;margin:0 0 10px">🔒 限定公開作品（No.' + id + '）</h2>' +
    '<p>この作品は同窓生向けの限定公開です。<br>お知らせした認証コードを入力してください。</p>' +
    err +
    '<form method="get" action="' + ScriptApp.getService().getUrl() + '">' +
    '<input type="hidden" name="id" value="' + id + '">' +
    '<input type="text" name="code" placeholder="認証コード" autocomplete="off" ' +
      'style="font-size:16px;padding:9px;width:220px;max-width:70%">' +
    ' <button type="submit" style="font-size:16px;padding:9px 18px;cursor:pointer">視聴する</button>' +
    '</form>' +
    '<p style="color:#666;font-size:13px;margin-top:22px">全関映・過去映画アーカイブ</p>';
  return page_('認証が必要です', form);
}

function page_(title, bodyHtml) {
  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + title + '｜全関映アーカイブ</title></head>' +
    '<body style="font-family:sans-serif;padding:24px;line-height:1.8;max-width:640px;margin:0 auto">' +
    bodyHtml + '</body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(title + '｜全関映アーカイブ');
}

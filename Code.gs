/**
 * 全関映・過去映画アーカイブ 統合版GAS（認証ゲート＋書いて帳）
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

// ★必ず変更してください：管理者パスワード（第7節＝人名リンク集を開く専用パスワード。認証コードとは別のものにしてください）
const ADMIN_CODE = 'admin2026';

// 限定公開作品の実URL（No. → YouTube）
const URLS = {
  '1-20': 'https://www.youtube.com/watch?v=0gRVgJ4GR40', // 空中楼閣
  '2-3': 'https://www.youtube.com/watch?v=1O_2ICHW6qk', // ひとこと多いぞ
  '4-1': 'https://www.youtube.com/watch?v=X7kkFh8cKYQ', // N極関係（2024年度）
  '4-2': 'https://www.youtube.com/watch?v=k7w70VJGbFA', // After and Before（2024年度）
  '4-3': 'https://www.youtube.com/watch?v=gSRMLmDp9WU', // Bobby1800（2024年度）
  '4-4': 'https://www.youtube.com/watch?v=JgU2DpGKhFM', // 持つべきものは、（2024年度）
  '4-5': 'https://www.youtube.com/watch?v=mr7sIA7q5p4', // ヒーロー参上（2024年度）
  '6-1': 'https://www.youtube.com/watch?v=vWQYA9zCqD4', // ぼくまだねむいよ
  '6-2': 'https://www.youtube.com/watch?v=WgFqZIG7eqY', // 還暦記念ムービー
  '6-3': 'https://www.youtube.com/watch?v=F-YQB4L0XB4', // ジャイアント ヒロ
  '6-4': 'https://www.youtube.com/watch?v=oEHcdwhDZd4', // ジャイアントヒロ２「海獣の逆襲」
  '6-5': 'https://www.youtube.com/watch?v=6iFM7Gw0Kw0', // ジャイアントヒロ３ 新たなる刺客
  '6-6': 'https://www.youtube.com/watch?v=5lAaqltOdFg', // ジャイアントヒロ ４〜恐怖のサメDAY〜
  '6-7': 'https://www.youtube.com/watch?v=t1aexrqFZ_E', // ジャイアントヒロ５「南半球の魔獣」
  '6-8': 'https://www.youtube.com/watch?v=-jpfVwApNVU', // ジャイアントヒロ最終回
  '6-9': 'https://www.youtube.com/watch?v=iQNTsbAYREk', // ３年Ｂ組ゲソヒコ先生
  '6-10': 'https://www.youtube.com/watch?v=PRjJbF2cQiA', // ミドルの早口言葉
  '6-11': 'https://www.youtube.com/watch?v=48VjnmqTrIA', // ＼ミドルだョ！／全員集合
  '6-12': 'https://www.youtube.com/watch?v=fDypR5RXE_Y', // 半ゾ人 本編
  '6-13': 'https://www.youtube.com/watch?v=1me27U6p2TY', // 半ゾ人 NG集
  '6-14': 'https://www.youtube.com/watch?v=wFgCQ_UtxlY', // U-1グランプリ 円谷町内会
  '6-15': 'https://www.youtube.com/watch?v=0hGSzUqC2O0', // 新春！名人寄席
  '6-16': 'https://www.youtube.com/watch?v=idqKtHPJhZU', // 秘宝戦隊ラブレンジャー
  '6-17': 'https://www.youtube.com/watch?v=PehDBcPJTkk', // 覆面お好み焼屋
  '6-18': 'https://www.youtube.com/watch?v=c8shxxEdFio', // 全員猪木
  '6-19': 'https://www.youtube.com/watch?v=B2rTimKnpbU', // HGVIRUS
  '6-20': 'https://www.youtube.com/watch?v=g5_n5ICdos8', // 新春！お笑いヒットパレード
  '6-21': 'https://www.youtube.com/watch?v=cajhmvebh1U',  // 全関映同窓会記念2017年6月
  // ===== 別巻「大同窓会2026」（2026-11-22追加） =====
  'B2': 'https://www.youtube.com/watch?v=Jrmi6v0ey7g', // 全関映大同窓会2026（プロモ動画）
  'B8': 'https://www.youtube.com/watch?v=G0wPY5EEwkY', // 全関映大同窓会へのお誘い
  'B9': 'https://www.youtube.com/watch?v=jWUM9uti7Bs', // おとな全関映 大同窓会2026（プロモ動画バージョン2）
  'B12': 'https://www.youtube.com/watch?v=QmfcmJBO0m4', // 大同窓会、西北、ふじや、やったっけ？（SP動画）
  'B13': 'https://www.youtube.com/watch?v=3LDsTj_TLlw', // おとな全関映大同窓会2026 Promotion #3（ニセ大當さんVer.）
  'B14': 'https://www.youtube.com/watch?v=AY2pPx64Zdk', // 流れ星落ちた場所で（カラオケ）
  'B15': 'https://www.youtube.com/watch?v=6XJGfbLyK0I', // 流れ星落ちた場所で（歌入り）
  'B17': 'https://www.youtube.com/watch?v=mnSCaWBUl8k', // 流れ星落ちた場所で（アコースティック版）
  'B25': 'https://www.youtube.com/watch?v=o44mjAy0hJg', // 全関映大同窓会案内5
  'B26': 'https://www.youtube.com/watch?v=YAfsihHjwiY', // ふじやにダイブイン
  'B30': 'https://www.youtube.com/watch?v=UnJP0JKzSR4', // ふじやにダイブイン2
  'B33': 'https://www.youtube.com/watch?v=Nijfgb1zrGw', // B grade horror
};

// 第7節（人名リンク集）の内容。個人情報のためHTMLには含めず、管理者パスワードが合ったときだけ返します。
const SEC7_HTML = `
<p>Facebookグループ「全関映に1980-90年代に在籍」のメンバー一覧です（2026年11月15日現在・49人、五十音順）。名前をクリックすると、その人のFacebookプロフィールが開きます。</p>
<table>
<tr><th>氏名（五十音順）</th></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002132071765" target="_blank" rel="noopener">池田 雅代</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100004072603373" target="_blank" rel="noopener">今村千穂</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100007763529628" target="_blank" rel="noopener">岩本 淳</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100014590846429" target="_blank" rel="noopener">植村武</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100006016690220" target="_blank" rel="noopener">Kimiko Di Utsumi</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100000468514397" target="_blank" rel="noopener">大内 幹男</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003568240602" target="_blank" rel="noopener">大野 穣一</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100001662512772" target="_blank" rel="noopener">尾端 剛</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100014762343829" target="_blank" rel="noopener">樫野佳訓</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100004182576594" target="_blank" rel="noopener">加勢 英二</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=61580687714309" target="_blank" rel="noopener">加藤健明</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=1265119155" target="_blank" rel="noopener">北田 博之</a>（グループ作成者）</td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003344397337" target="_blank" rel="noopener">Rika Kyakuno</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100000421716168" target="_blank" rel="noopener">久米由美</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100004231870619" target="_blank" rel="noopener">倉富 玲子</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100001807544454" target="_blank" rel="noopener">小島 一洋</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100001758285069" target="_blank" rel="noopener">小島史敬</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=681184754" target="_blank" rel="noopener">小谷 陽子</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=61583462015737" target="_blank" rel="noopener">児玉泰仁</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100000005353190" target="_blank" rel="noopener">小西 利幸</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003840445923" target="_blank" rel="noopener">Koyama Yuji</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003184160380" target="_blank" rel="noopener">近藤 啓二</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003312425677" target="_blank" rel="noopener">齋藤 誠</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002357139036" target="_blank" rel="noopener">里田 実彦</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002899596559" target="_blank" rel="noopener">清水 保宏</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=61570606899579" target="_blank" rel="noopener">Osamu Suehara</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100014811816844" target="_blank" rel="noopener">Takashi Suda</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002993719204" target="_blank" rel="noopener">住ノ江修</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002637244043" target="_blank" rel="noopener">高久保 浩</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003698094000" target="_blank" rel="noopener">武石 友規</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100008606346571" target="_blank" rel="noopener">竹村 元一郎</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002047789358" target="_blank" rel="noopener">高見 優子</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003392173650" target="_blank" rel="noopener">Syuuichi Tafu</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100009430428342" target="_blank" rel="noopener">千原 基晴</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=635142653" target="_blank" rel="noopener">Tomoko Naka</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100002126289857" target="_blank" rel="noopener">並川 実</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100010345721422" target="_blank" rel="noopener">Ken Ichi Nitta</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003289465975" target="_blank" rel="noopener">平山 圭</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100001945332195" target="_blank" rel="noopener">古城 雅彦</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100008262963298" target="_blank" rel="noopener">桝井 恵美</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=1452590997" target="_blank" rel="noopener">松岡 京子</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100001926239113" target="_blank" rel="noopener">三島 有紀子</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003630034156" target="_blank" rel="noopener">水越 美也</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003510582301" target="_blank" rel="noopener">光行 岳人</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100005792615416" target="_blank" rel="noopener">三輪徳昭</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100005132353918" target="_blank" rel="noopener">山荘 和順</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=61557391231452" target="_blank" rel="noopener">山手和郎</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=61557947709692" target="_blank" rel="noopener">吉田 あゆみ</a></td></tr>
<tr><td><a href="https://www.facebook.com/profile.php?id=100003039288037" target="_blank" rel="noopener">渡辺 慎也</a></td></tr>
</table>
<p class="small">招待中（まだ参加していない人）：<a href="https://www.facebook.com/profile.php?id=100010423906016" target="_blank" rel="noopener">角野晃平</a>、<a href="https://www.facebook.com/profile.php?id=100001863187774" target="_blank" rel="noopener">Ryoko Furuta</a>、<a href="https://www.facebook.com/profile.php?id=100003375046156" target="_blank" rel="noopener">貴志 健一</a>、<a href="https://www.facebook.com/profile.php?id=100000437826057" target="_blank" rel="noopener">Aki Tanei</a>、<a href="https://www.facebook.com/profile.php?id=1560240543" target="_blank" rel="noopener">Koyo Egawa</a>（末原さんからの招待）。</p>
<h3>作品関係者（グループメンバー以外）</h3>
<p>作品に名前のある人で、上記グループのメンバーでない人です。本人と同定できるアカウントは未確認のため、リンクではなく「Facebookで探す」ボタン（Facebookの人物検索）を付けています。検索結果には同姓同名の別人が含まれることがあります。</p>
<table>
<tr><th>人名</th><th>リンク</th><th>根拠</th></tr>
<tr><td>服部美也</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E6%9C%8D%E9%83%A8%E7%BE%8E%E4%B9%9F" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認（グループメンバーの水越美也さんと同一人物かどうかは未確認です）</td></tr>
<tr><td>和田のぞみ</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%92%8C%E7%94%B0%E3%81%AE%E3%81%9E%E3%81%BF" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>片山学</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E7%89%87%E5%B1%B1%E5%AD%A6" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>和賀健夫</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%92%8C%E8%B3%80%E5%81%A5%E5%A4%AB" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>大熊一成</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%A4%A7%E7%86%8A%E4%B8%80%E6%88%90" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>是枝寿栄</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E6%98%AF%E6%9E%9D%E5%AF%BF%E6%A0%84" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>中川智晶</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E4%B8%AD%E5%B7%9D%E6%99%BA%E6%99%B6" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>飯尾明弘</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E9%A3%AF%E5%B0%BE%E6%98%8E%E5%BC%98" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>川越理加</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%B7%9D%E8%B6%8A%E7%90%86%E5%8A%A0" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>大當貴美子</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%A4%A7%E7%95%B6%E8%B2%B4%E7%BE%8E%E5%AD%90" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>牧田浩平</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E7%89%A7%E7%94%B0%E6%B5%A9%E5%B9%B3" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>藤牧尚太</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E8%97%A4%E7%89%A7%E5%B0%9A%E5%A4%AA" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>中川裕太</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E4%B8%AD%E5%B7%9D%E8%A3%95%E5%A4%AA" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>島直哉</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%B3%B6%E7%9B%B4%E5%93%89" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>岡本光樹</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%B2%A1%E6%9C%AC%E5%85%89%E6%A8%B9" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>森田拓朗</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E6%A3%AE%E7%94%B0%E6%8B%93%E6%9C%97" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
<tr><td>川合裕之</td><td><a class="req-btn" href="https://www.facebook.com/search/people/?q=%E5%B7%9D%E5%90%88%E8%A3%95%E4%B9%8B" target="_blank" rel="noopener">Facebookで探す</a></td><td>本人と同定できるアカウントは未確認</td></tr>
</table>

`;

// 書いて帳の@メンション用メンバーマップ（同上：認証コードが合ったときだけ返します）
const MEMBERS = {"池田 雅代": "https://www.facebook.com/profile.php?id=100002132071765", "今村千穂": "https://www.facebook.com/profile.php?id=100004072603373", "岩本 淳": "https://www.facebook.com/profile.php?id=100007763529628", "植村武": "https://www.facebook.com/profile.php?id=100014590846429", "Kimiko Di Utsumi": "https://www.facebook.com/profile.php?id=100006016690220", "大内 幹男": "https://www.facebook.com/profile.php?id=100000468514397", "大野 穣一": "https://www.facebook.com/profile.php?id=100003568240602", "尾端 剛": "https://www.facebook.com/profile.php?id=100001662512772", "樫野佳訓": "https://www.facebook.com/profile.php?id=100014762343829", "加勢 英二": "https://www.facebook.com/profile.php?id=100004182576594", "加藤健明": "https://www.facebook.com/profile.php?id=61580687714309", "北田 博之": "https://www.facebook.com/profile.php?id=1265119155", "Rika Kyakuno": "https://www.facebook.com/profile.php?id=100003344397337", "久米由美": "https://www.facebook.com/profile.php?id=100000421716168", "倉富 玲子": "https://www.facebook.com/profile.php?id=100004231870619", "小島 一洋": "https://www.facebook.com/profile.php?id=100001807544454", "小島史敬": "https://www.facebook.com/profile.php?id=100001758285069", "小谷 陽子": "https://www.facebook.com/profile.php?id=681184754", "児玉泰仁": "https://www.facebook.com/profile.php?id=61583462015737", "小西 利幸": "https://www.facebook.com/profile.php?id=100000005353190", "Koyama Yuji": "https://www.facebook.com/profile.php?id=100003840445923", "近藤 啓二": "https://www.facebook.com/profile.php?id=100003184160380", "齋藤 誠": "https://www.facebook.com/profile.php?id=100003312425677", "里田 実彦": "https://www.facebook.com/profile.php?id=100002357139036", "清水 保宏": "https://www.facebook.com/profile.php?id=100002899596559", "Osamu Suehara": "https://www.facebook.com/profile.php?id=61570606899579", "Takashi Suda": "https://www.facebook.com/profile.php?id=100014811816844", "住ノ江修": "https://www.facebook.com/profile.php?id=100002993719204", "高久保 浩": "https://www.facebook.com/profile.php?id=100002637244043", "武石 友規": "https://www.facebook.com/profile.php?id=100003698094000", "竹村 元一郎": "https://www.facebook.com/profile.php?id=100008606346571", "高見 優子": "https://www.facebook.com/profile.php?id=100002047789358", "Syuuichi Tafu": "https://www.facebook.com/profile.php?id=100003392173650", "千原 基晴": "https://www.facebook.com/profile.php?id=100009430428342", "Tomoko Naka": "https://www.facebook.com/profile.php?id=635142653", "並川 実": "https://www.facebook.com/profile.php?id=100002126289857", "Ken Ichi Nitta": "https://www.facebook.com/profile.php?id=100010345721422", "平山 圭": "https://www.facebook.com/profile.php?id=100003289465975", "古城 雅彦": "https://www.facebook.com/profile.php?id=100001945332195", "桝井 恵美": "https://www.facebook.com/profile.php?id=100008262963298", "松岡 京子": "https://www.facebook.com/profile.php?id=1452590997", "三島 有紀子": "https://www.facebook.com/profile.php?id=100001926239113", "水越 美也": "https://www.facebook.com/profile.php?id=100003630034156", "光行 岳人": "https://www.facebook.com/profile.php?id=100003510582301", "三輪徳昭": "https://www.facebook.com/profile.php?id=100005792615416", "山荘 和順": "https://www.facebook.com/profile.php?id=100005132353918", "山手和郎": "https://www.facebook.com/profile.php?id=61557391231452", "吉田 あゆみ": "https://www.facebook.com/profile.php?id=61557947709692", "渡辺 慎也": "https://www.facebook.com/profile.php?id=100003039288037", "角野晃平": "https://www.facebook.com/profile.php?id=100010423906016", "Ryoko Furuta": "https://www.facebook.com/profile.php?id=100001863187774", "貴志 健一": "https://www.facebook.com/profile.php?id=100003375046156", "Aki Tanei": "https://www.facebook.com/profile.php?id=100000437826057", "Koyo Egawa": "https://www.facebook.com/profile.php?id=1560240543"};

function doGet(e) {
  const p = (e && e.parameter) || {};
  // ---- 書いて帳API（action指定がある場合はこちらを優先） ----
  // ---- 第7節（管理者パスワード） ----
  if (p.action === 'sec7') {
    const cb = String(p.callback || '');
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cb)) {
      const okAdmin = String(p.code || '') === String(ADMIN_CODE);
      return nbJsonp_(cb, okAdmin ? { ok: true, html: SEC7_HTML } : { ok: false, error: 'admin_auth' });
    }
    return page_('第7節', '<p>パラメータが正しくありません。</p>');
  }
  if (p.action === 'check' || p.action === 'list' || p.action === 'all' || p.action === 'members') {
    const cb = String(p.callback || '');
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cb)) {
      const okCode = String(p.code || '').toUpperCase() === String(AUTH_CODE).toUpperCase();
      if (p.action === 'check') return nbJsonp_(cb, { ok: okCode });
      if (!okCode) return nbJsonp_(cb, { ok: false, error: 'auth' });
      if (p.action === 'members') return nbJsonp_(cb, { ok: true, members: MEMBERS });
      const notes = nbList_(p.action === 'list' ? String(p.item || '') : null);
      return nbJsonp_(cb, { ok: true, notes: notes });
    }
    return page_('書いて帳', '<p>パラメータが正しくありません。</p>');
  }
  const id = String(p.id || '').trim();
  const code = String(p.code || '').trim();
  const url = URLS[id];

  if (!url) {
    return page_('作品が見つかりません',
      '<p>リンクが正しくありません。アーカイブのページから開き直してください。</p>');
  }

  // アーカイブ側からの問い合わせ（JSONP）：コードが合えば実URLだけを返す。
  // ページ側が自分の画面から直接動画を開くので、自動遷移が可能になる。
  const cb = String(p.callback || '');
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cb)) {
    const ok = code.toUpperCase() === String(AUTH_CODE).toUpperCase();
    const payload = ok ? { ok: true, url: url } : { ok: false };
    return ContentService
      .createTextOutput(cb + '(' + JSON.stringify(payload) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  if (code.toUpperCase() === String(AUTH_CODE).toUpperCase()) {
    // 認証OK：動画へのボタンを表示する。
    // ※GASの画面はiframe内で表示されるため、自動リダイレクトはYouTube側に
    //   ブロックされる（「接続が拒否されました」になる）。必ず target="_top" の
    //   リンクをクリックしてもらう形にする。
    const body =
      '<h2 style="font-size:19px;margin:0 0 10px">✅ 認証できました</h2>' +
      '<p>下のボタンを押すと動画ページが開きます。</p>' +
      '<p style="margin:26px 0"><a href="' + url + '" target="_top" ' +
      'style="display:inline-block;background:#c00;color:#fff;font-size:17px;font-weight:700;' +
      'padding:13px 30px;border-radius:8px;text-decoration:none">▶ 動画を開く</a></p>' +
      '<p style="color:#666;font-size:13px">全関映・過去映画アーカイブ</p>';
    return page_('認証できました', body);
  }

  // コード未入力／不一致：入力フォームを表示
  const err = code
    ? '<p style="color:#c00;font-weight:700">認証コードが違います。もう一度お試しください。</p>'
    : '';
  const form =
    '<h2 style="font-size:19px;margin:0 0 10px">🔒 限定公開コンテンツ（No.' + id + '）</h2>' +
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

// =====================================================================
// 書いて帳（Googleスプレッドシートをデータベースにした寄せ書き）
// =====================================================================
// 仕組み：このウェブアプリが「全関映アーカイブ 書いて帳」という名前の
// スプレッドシートを自動で作り（初回のみ）、そこへ書き込みを貯めます。
// スプレッドシートIDはスクリプトプロパティに保存されるので、再デプロイ
// しても同じシートを使い続けます。
//  読み取り： GET  ?action=list&item=<項目ID>&code=<認証コード>&callback=<関数名>（JSONP）※読み取りも認証必須
//            GET  ?action=all&callback=<関数名>（全件・横断表示用）
//  書き込み： POST {"action":"add","code":"<認証コード>","item":"<項目ID>",
//                  "itemName":"<項目名>","name":"<名前>","text":"<本文>"}
//            ※書き込みには認証コード（AUTH_CODE）が必須です。

function nbSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('NOTEBOOK_SHEET_ID');
  let ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('全関映アーカイブ 書いて帳');
    props.setProperty('NOTEBOOK_SHEET_ID', ss.getId());
  }
  let sh = ss.getSheetByName('書いて帳');
  if (!sh) {
    sh = ss.insertSheet('書いて帳');
    sh.appendRow(['日時', '項目ID', '項目名', '名前', '本文']);
  }
  return sh;
}

function nbList_(item) {
  const sh = nbSheet_();
  const values = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (item && String(row[1]) !== String(item)) continue;
    out.push({
      ts: row[0] ? new Date(row[0]).getTime() : 0,
      item: String(row[1] || ''),
      itemName: String(row[2] || ''),
      name: String(row[3] || ''),
      text: String(row[4] || '')
    });
    if (out.length > 2000) break;
  }
  return out;
}

function nbJsonp_(cb, obj) {
  return ContentService
    .createTextOutput(cb + '(' + JSON.stringify(obj) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(e) {
  let req = {};
  try { req = JSON.parse(e.postData.contents); } catch (err) { req = {}; }
  const out = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
  if (req.action !== 'add') { out.setContent(JSON.stringify({ ok: false, error: 'unknown action' })); return out; }
  if (String(req.code || '').toUpperCase() !== String(AUTH_CODE).toUpperCase()) {
    out.setContent(JSON.stringify({ ok: false, error: 'bad code' })); return out;
  }
  const text = String(req.text || '').trim().slice(0, 2000);
  if (!text) { out.setContent(JSON.stringify({ ok: false, error: 'empty' })); return out; }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    nbSheet_().appendRow([new Date(), String(req.item || ''), String(req.itemName || '').slice(0, 200), String(req.name || '').slice(0, 50), text]);
  } finally {
    lock.releaseLock();
  }
  out.setContent(JSON.stringify({ ok: true }));
  return out;
}

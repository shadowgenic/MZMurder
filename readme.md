<img src="title_A.png">

RPGツクールMZ をベースにした、オンライン向けのマーダーミステリー製作テンプレート / デモプロジェクトです。
Firebase Realtime Database を使って複数プレイヤーがデータを同期し、RPGツクールMZの強みである表示系、プログラム処理、自動動作を使って簡単にマダミスを制作することができます。
全てのプラグインは改変・再配布自由で、クレジット表記は不要です。

現時点では正式版ではありません。

## 概要

- 対応基盤: RPGツクールMZ
- 通信基盤: Firebase Realtime Database
- 主要要素:
  - ルーム参加
  - PC選択
  - キャラクター移動・シーン遷移
  - 資料表示
  - 投票処理
  - カード・トークン管理
  - タイマー同期

## 参照マニュアル

- [制作マニュアル]
- [プラグイン一覧]
- [ContentRenderer HTMLガイド]

## 事前準備

- RPGツクールMZ をインストールしていること
- インターネット接続ができる環境があること
- 使用できるGoogleアカウントがあること

## 使い方の流れ

1. Firebase でプロジェクトを作成する
2. Authentication で匿名認証を有効化する
3. Realtime Database を作成し、必要な設定を入れる
4. RPGツクールMZ にプラグイン群を導入する
5. ルーム・参加者・マップ・イベントを作成する
6. 画像・資料・カード・トークンを配置する
7. 実機またはブラウザで動作確認する
8. 配布用データとして書き出しを行う

## 主要プラグイン

以下のようなプラグインが含まれています。

- FirebaseSync
- CharacterSelection
- SideMenu
- TabUI
- ContentRenderer
- CardPicture
- EnhancedPicture
- CulpritVote
- TimerEx
- SyncMapTransfer
- GMSceneManager
- FloatingMessageLog
- SequenceController
- LogicProcessor

詳細はプラグイン一覧を参照してください。

## 重要な注意事項

- Firebase の設定値（`apiKey` や `authDomain` など）は、ゲーム側の設定に反映させる必要があります。
- 画像や HTML 資料を使う場合は、出力先にも同じファイルが含まれているか確認してください。
- コンテンツの表示制御やイベント制御は、ツクールのマップイベントとプラグインのコマンド連携が中心になります。
- 表示用の HTML/CSS は、ContentRenderer が対応する範囲で記述するのが安全です。

## 開発・実行時メモ

- 開発時はローカルでのテストと複数端末での同期確認を行うと安全です。
- 実運用前に、ルーム作成・参加・タイマー・投票・終了処理の一通りを確認してください。
- 配布時は、RPGツクールMZ の「ファイル」→「デプロイメント」で出力したファイル一式をそのまま配布対象とするのが基本です。

## ライセンス

本リポジトリのライセンス情報は明記されていません。利用時は、配布元の作品方針や利用規約を確認してください。

## 参考

- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [RPGツクールMZ](https://www.rpgmakerweb.com/products/rpg-maker-mz)
- [NW.js](https://nwjs.io/)

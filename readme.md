# MZ Murder

RPGツクールMZ をベースにした、オンライン向けのマーダーミステリー製作テンプレート / デモプロジェクトです。

この作品は、Firebase Realtime Database と匿名認証を使って複数プレイヤーが同じルームに入り、役割分担・調査・投票・タイマー・資料共有を行える構成を目指しています。

## 概要

- 対応基盤: RPGツクールMZ
- 通信基盤: Firebase Realtime Database
- 認証: Firebase Anonymous Authentication
- 主要要素:
  - ルーム参加
  - PC選択
  - キャラクター移動・シーン遷移
  - 資料表示
  - 投票処理
  - カード・トークン管理
  - タイマー同期

## 参照マニュアル

- [制作マニュアル](./マニュアル/MZ_Murder_制作マニュアル.html)
- [プラグイン一覧](./マニュアル/プラグイン一覧.html)
- [ContentRenderer HTMLガイド](./マニュアル/ContentRenderer_HTMLガイド.html)

## ディレクトリ構成

```text
MZMurder20261115/
├─ js/
│  └─ plugins/            # プラグイン本体
├─ img/
│  ├─ pictures/           # 画像素材
│  ├─ icon/               # UIアイコン
│  └─ system/             # システム画像
├─ マニュアル/
│  ├─ MZ_Murder_制作マニュアル.html
│  ├─ プラグイン一覧.html
│  └─ plugins/
├─ MZMurder20261006.zip   # 配布/バックアップ用アーカイブ
├─ kirisame.jpg
├─ README.md
└─ ...
```

## 事前準備

- RPGツクールMZ をインストールしていること
- Firebase の Google アカウントを用意していること
- インターネット接続ができる環境があること

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

詳細は [プラグイン一覧](./マニュアル/プラグイン一覧.html) を参照してください。

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

必要なら次に、

- この README をもう少しゲーム紹介向けにする
- 制作手順の日本語をさらに詳しくする
- もっと見た目の良い構成にする

といった調整もできます。

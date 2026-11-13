/*:
 * @target MZ
 * @plugindesc ピクチャを表裏付きカードとして表示し、閲覧者限定表示やキャプションを管理します。
 * @author Shadowgenic & Google Gemini & ChatGPT
 *
 * @help
 * 通常のピクチャを裏面にし、表面画像、表裏切替、表示・非表示、拡大表示、キャプションを追加します。
 * 閲覧者PC番号を指定したカードは、対象のプレイヤーだけが表面を閲覧できます。
 * 閲覧者のPC番号はFirebaseSyncの「PCのIDを格納する変数」から取得します。
 * 閲覧者が設定されているカードには、対象PC番号のアクターに設定された顔グラフィックを重ねて表示します。
 *
 * 【使い方】
 * 1. イベントで「ピクチャの表示」を実行し、カードにしたい画像を表示します。
 * 2. 「ピクチャのカード化」でピクチャ番号、表面画像、初期状態を指定します。
 * 3. 必要に応じて「カードを隠す」「カードを表示」「カード画像変更」を実行します。これはプラグインコマンドによりゲームの途中で実行可能です。
 * 4. 自分だけ見るを実行したカードは、対象PC番号のプレイヤーだけが表面を確認できます。
 * 5. 閲覧操作でONにするスイッチを指定できます。自分だけ見る、全体公開、その両方(そのPLが表面を確認した時)の3種類です。各スイッチは0で無効です。
 * 6. 閲覧者アイコンのサイズや位置はプラグインパラメータで調整します。表示されるアイコンはPCの顔グラフィックです。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 * 
 * @param viewerIconSingle
 * @text 閲覧者アイコン全体表示
 * @desc ONにすると、顔グラフィックを分割せず画像全体を1つのアイコンとして表示します。
 * @type boolean
 * @default false
 *
 * @param viewerIconSize
 * @text 閲覧者アイコンサイズ
 * @desc 閲覧者アイコンの縦横サイズ（px）です。
 * @type number
 * @min 1
 * @default 100
 *
 * @param viewerIconAnchor
 * @text 閲覧者アイコン基準位置
 * @desc 閲覧者アイコンの位置を計算するカード上の基準位置です。
 * @type select
 * @option 左上
 * @value topLeft
 * @option 右上
 * @value topRight
 * @option 左下
 * @value bottomLeft
 * @option 右下
 * @value bottomRight
 * @option 中央
 * @value center
 * @default topLeft
 *
 * @param viewerIconX
 * @text 閲覧者アイコン位置X
 * @desc 基準位置からの横方向オフセット（px）です。負の値も指定できます。
 * @type number
 * @min -1920
 * @default 0
 *
 * @param viewerIconY
 * @text 閲覧者アイコン位置Y
 * @desc 基準位置からの縦方向オフセット（px）です。負の値も指定できます。
 * @type number
 * @min -1080
 * @default 0
 * 
 * @param gridSnap
 * @text グリッドに沿って配置
 * @desc 有効にすると、カードをドラッグアンドドロップした時にグリッド上の座標へ調整します。
 * @type boolean
 * @default false
 *
 * @param gridWidth
 * @text グリッドの幅
 * @desc カード配置グリッドの間隔（px）です。
 * @type number
 * @min 1
 * @default 16
 *
 * @param captionHoverDelay
 * @text キャプション表示までの時間
 * @desc キャプションを表示するまでマウスを重ね続ける時間（フレーム）です。60フレームで約1秒です。
 * @type number
 * @min 0
 * @default 60
 *
 * @param captionHoverMoveTolerance
 * @text キャプション表示時の移動許容量
 * @desc キャプション表示までの待機を継続できる、マウス座標の移動量（px）です。超えると待機をやり直します。
 * @type number
 * @min 0
 * @default 10
 *
 * @param menuOutsideClickSe
 * @text メニュー外クリックで閉じるSE
 * @desc カードの右クリックメニュー外をクリックして閉じた時に再生する効果音です。未指定なら無音です。
 * @type file
 * @dir audio/se
 * @default
 *
 * @param prohibitNewCardInvestigationSwitchId
 * @text 新たなカードの調査禁止スイッチ
 * @desc ONの間、まだ誰も表面を見ていないカードを右クリックまたはダブルクリックで表面にできません。0で無効です。
 * @type switch
 * @default 0
 *
 * @param newCardInvestigationSwitchId
 * @text 未調査カードを調査した時のスイッチ
 * @desc 未調査のカードが右クリックメニューで初めて表面を見られた時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @param newCardInvestigationPictureVariableId
 * @text 未調査カードを調査した時のピクチャID変数
 * @desc 未調査のカードが右クリックメニューで初めて表面を見られた時に、そのピクチャ番号を代入する変数です。0で無効です。
 * @type variable
 * @default 0
 *
 * @command makeCard
 * @text ピクチャのカード化
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc カード化する対象のピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg frontImage
 * @text 表面の画像
 * @desc カードの表面に表示する画像です。
 * @type file
 * @dir img/pictures
 *
 * @arg initialVisibility
 * @text 初期表示状態
 * @desc カード化した直後にカードを表示するか指定します。
 * @type select
 * @option visible
 * @option hidden
 * @default visible
 *
 * @arg positionFixed
 * @text 座標を固定する
 * @desc ONにすると、カードをドラッグして移動できなくなります。
 * @type boolean
 * @default false
 *
 * @arg transparentPixelsNoHit
 * @text 不透明度0のピクセルを当たり判定にしない
 * @desc ONにすると、カード画像の不透明度が0のピクセルをクリックやマウス操作の対象外にします。
 * @type boolean
 * @default false
 *
 * @arg rotationLocked
 * @text 回転不可にする
 * @desc ONにすると、右クリックメニューからカードを回転できなくなります。
 * @type boolean
 * @default true
 *
 * @arg flipLocked
 * @text 裏返すを無効にする
 * @desc ONにすると、表面の右クリックメニューからカードを裏返す操作を非表示にします。
 * @type boolean
 * @default true
 *
 * @arg operableCharacterId
 * @text 操作できるキャラクターの指定
 * @desc 0以外を指定すると、そのPC番号の人だけが通常の右クリック操作を行えます。
 * @type number
 * @min 0
 * @default 0
 *
 * @arg prohibitPublicView
 * @text 全体公開禁止にする
 * @desc ONにすると、右クリックメニューに全体公開する操作を表示しません。
 * @type boolean
 * @default false
 *
 * @arg fontSize
 * @text 文字サイズ
 * @desc キャプションとメニューのフォントサイズを指定します。
 * @type number
 * @default 26
 *
 * @arg removePermission
 * @text 削除の可否
 * @desc カードを盤面から取り除ける向きを指定します。
 * @type select
 * @option 削除不可
 * @value none
 * @option 表向きの時は削除可
 * @value front
 * @option 裏向きの時は削除可
 * @value back
 * @option 常に削除可
 * @value both
 * @default none
 *
 * @arg frontCaption
 * @text 表面のキャプション
 * @desc 表面に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。
 * @type string
 * 
 * @arg backCaption
 * @text 裏面のキャプション
 * @desc 裏面に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。
 * @type string
 *
 * @arg seToFront
 * @text 表面にする時のSE
 * @desc カードを表面に切り替えたときに再生する効果音です。
 * @type struct<SE>
 * @default {"name":"","volume":"90","pitch":"100","pan":"0"}
 *
 * @arg seToBack
 * @text 裏面にする時のSE
 * @desc カードを裏面に切り替えたときに再生する効果音です。
 * @type struct<SE>
 * @default {"name":"","volume":"90","pitch":"100","pan":"0"}
 *
 * @arg maxLineChars
 * @text 一行の最大文字数
 * @desc キャプションを折り返す1行あたりの最大文字数です。
 * @type number
 * @default 20
 *
 * @arg privateViewSwitch
 * @text 自分だけ見る時のスイッチ
 * @desc 「自分だけ見る」を実行した時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg publicViewSwitch
 * @text 全体公開時のスイッチ
 * @desc カードを全体公開した時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg frontViewSwitch
 * @text 表面を見た時のスイッチ
 * @desc 自分だけ見る、または全体公開して表面を見た時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg specialActionText
 * @text 特殊な操作
 * @desc 表面の右クリックメニューに表示する操作名です。\V[n]や\N[n]などの制御文字を使用できます。空欄で無効です。
 * @type string
 *
 * @arg specialActionSwitch
 * @text 特殊な操作実行時にONにするスイッチ
 * @desc 特殊な操作を選んだ時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg specialActionVariable
 * @text 特殊な操作実行時にPC番号を代入する変数
 * @desc 特殊な操作を選んだPC番号を代入する変数です。0で無効です。
 * @type variable
 * @default 0
 *
 * @command changeCardVisibility
 * @text カードの表示状態を変更
 * @desc カードの表示状態と所持状態を変更します。
 *
 * @arg pictureIdStart
 * @text ピクチャ番号の開始
 * @desc 操作対象の先頭ピクチャ番号です。終了が0ならこの1枚だけを処理します。
 * @type number
 * @min 0
 * @default 1
 *
 * @arg pictureIdEnd
 * @text ピクチャ番号の終了
 * @desc 操作対象の末尾ピクチャ番号です。開始が0ならこの1枚だけを処理します。
 * @type number
 * @min 0
 * @default 0
 *
 * @arg visibility
 * @text 表示状態
 * @desc カードの表示状態を指定します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 表示する
 * @value visible
 * @option 非表示にする
 * @value hidden
 * @default unchanged
 *
 * @arg possessionState
 * @text 所持状態
 * @desc カードの閲覧・公開状態を指定します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 裏返す
 * @value flipped
 * @option 全体公開する
 * @value public
 * @option 自分だけ見るにする
 * @value private
 * @default unchanged
 *
 * @arg privateViewer
 * @text 自分だけ見る閲覧者PC番号
 * @desc 所持状態が「自分だけ見るにする」の場合に表面を見られるPC番号です。0なら閲覧者を変更しません。
 * @type number
 * @min 0
 * @default 0
 *
 * @command changeCardViewSwitches
 * @text カードの属性を変更
 * @desc カードの閲覧時スイッチ、全体公開設定、特殊な操作、座標固定を変更します。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc 操作対象のカードのピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg changeViewSwitches
 * @text スイッチ類を変更する
 * @desc 自分だけ見る、全体公開、表面閲覧時のスイッチを変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off そのままにする
 * @default false
 *
 * @arg privateViewSwitch
 * @text 自分だけ見る時のスイッチ
 * @desc 「自分だけ見る」を実行した時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg publicViewSwitch
 * @text 全体公開時のスイッチ
 * @desc カードを全体公開した時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg frontViewSwitch
 * @text 表面を見た時のスイッチ
 * @desc 自分だけ見る、または全体公開して表面を見た時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg changeSpecialAction
 * @text 特殊な操作を変更する
 * @desc 特殊な操作名、その実行時スイッチ、代入変数を変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off そのままにする
 * @default false
 *
 * @arg specialActionText
 * @text 特殊な操作
 * @desc 表面の右クリックメニューに表示する操作名です。空欄で無効です。
 * @type string
 *
 * @arg specialActionSwitch
 * @text 特殊な操作実行時にONにするスイッチ
 * @desc 特殊な操作を選んだ時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg specialActionVariable
 * @text 特殊な操作実行時にPC番号を代入する変数
 * @desc 特殊な操作を選んだPC番号を代入する変数です。0で無効です。
 * @type variable
 * @default 0
 *
 * @arg changeOtherAttributes
 * @text その他の項目を変更する
 * @desc 全体公開設定、座標固定、操作キャラクターを変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off そのままにする
 * @default false
 *
 * @arg viewedState
 * @text 調査状態
 * @desc カードが一度でも表面を見られた状態を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 調査済みにする
 * @value viewed
 * @option 未調査にする
 * @value unviewed
 * @default unchanged
 *
 * @arg publicViewRestriction
 * @text 全体公開の可否の設定
 * @desc 全体公開の禁止または禁止解除を指定します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 全体公開を禁止する
 * @value prohibit
 * @option 全体公開禁止を解除する
 * @value allow
 * @default unchanged
 *
 * @arg positionFixed
 * @text 座標を固定する
 * @desc カードの座標固定状態を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 固定する
 * @value true
 * @option 固定を解除する
 * @value false
 * @default unchanged
 *
 * @arg rotationLocked
 * @text 回転不可にする
 * @desc カードの回転可否を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 回転不可にする
 * @value true
 * @option 回転可能にする
 * @value false
 * @default unchanged
 *
 * @arg flipLocked
 * @text 裏返すを無効にする
 * @desc 表面での裏返す操作の可否を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 裏返すを無効にする
 * @value true
 * @option 裏返すを有効にする
 * @value false
 * @default unchanged
 *
 * @arg changeOperableCharacterId
 * @text 操作できるキャラクターを変更する
 * @desc 操作できるキャラクターの指定を変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off 変更しない
 * @default false
 *
 * @arg operableCharacterId
 * @text 操作できるキャラクターの指定
 * @desc 0を指定すると、誰でも通常の右クリック操作を行えます。
 * @type number
 * @min 0
 * @default 0
 *
 * @command changeCardImage
 * @text カード画像を変更
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc 画像を変更するカードのピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg frontImage
 * @text 表面画像
 * @desc 変更後に表面へ表示する画像です。
 * @type file
 * @dir img/pictures
 *
 * @arg backImage
 * @text 裏面画像
 * @type file
 * @dir img/pictures
 *
 * @command previewCard
 * @text カードを拡大表示
 * @desc 指定したピクチャ番号のカードを、右クリックメニューの拡大表示と同じ動作で表示します。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc 拡大表示するカードのピクチャ番号です。
 * @type number
 * @min 1
 * @default 1
 *
 * @command changeCardCaption
 * @text カードのキャプションを変更
 * @desc 指定したカードの表面・裏面のキャプションを変更します。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc キャプションを変更するカードのピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg frontCaption
 * @text 表面のキャプション
 * @desc 表面に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。空欄で消去します。
 * @type string
 * @default
 *
 * @arg backCaption
 * @text 裏面のキャプション
 * @desc 裏面に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。空欄で消去します。
 * @type string
 * @default
 *
 * @arg maxLineChars
 * @text 一行の最大文字数
 * @desc キャプションを折り返す1行あたりの最大文字数です。
 * @type number
 * @min 1
 * @default 20
 *
 * @command changeCardViewSwitchesByVariable
 * @text 指定した変数のカードの属性を変更
 * @desc 指定したゲーム変数に入っているピクチャ番号のカード属性を変更します。
 *
 * @arg pictureVariableId
 * @text ピクチャ番号を格納した変数
 * @desc 操作対象のカードのピクチャ番号を格納したゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg changeViewSwitches
 * @text スイッチ類を変更する
 * @desc 自分だけ見る、全体公開、表面閲覧時のスイッチを変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off そのままにする
 * @default false
 *
 * @arg privateViewSwitch
 * @text 自分だけ見る時のスイッチ
 * @desc 「自分だけ見る」を実行した時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg publicViewSwitch
 * @text 全体公開時のスイッチ
 * @desc カードを全体公開した時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg frontViewSwitch
 * @text 表面を見た時のスイッチ
 * @desc 自分だけ見る、または全体公開して表面を見た時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg changeSpecialAction
 * @text 特殊な操作を変更する
 * @desc 特殊な操作名、その実行時スイッチ、代入変数を変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off そのままにする
 * @default false
 *
 * @arg specialActionText
 * @text 特殊な操作
 * @desc 表面の右クリックメニューに表示する操作名です。空欄で無効です。
 * @type string
 *
 * @arg specialActionSwitch
 * @text 特殊な操作実行時にONにするスイッチ
 * @desc 特殊な操作を選んだ時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @arg specialActionVariable
 * @text 特殊な操作実行時にPC番号を代入する変数
 * @desc 特殊な操作を選んだPC番号を代入する変数です。0で無効です。
 * @type variable
 * @default 0
 *
 * @arg changeOtherAttributes
 * @text その他の項目を変更する
 * @desc 全体公開設定、座標固定、操作キャラクターを変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off そのままにする
 * @default false
 *
 * @arg viewedState
 * @text 調査状態
 * @desc カードが一度でも表面を見られた状態を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 調査済みにする
 * @value viewed
 * @option 未調査にする
 * @value unviewed
 * @default unchanged
 *
 * @arg publicViewRestriction
 * @text 全体公開の可否の設定
 * @desc 全体公開の禁止または禁止解除を指定します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 全体公開を禁止する
 * @value prohibit
 * @option 全体公開禁止を解除する
 * @value allow
 * @default unchanged
 *
 * @arg positionFixed
 * @text 座標を固定する
 * @desc カードの座標固定状態を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 固定する
 * @value true
 * @option 固定を解除する
 * @value false
 * @default unchanged
 *
 * @arg rotationLocked
 * @text 回転不可にする
 * @desc カードの回転可否を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 回転不可にする
 * @value true
 * @option 回転可能にする
 * @value false
 * @default unchanged
 *
 * @arg flipLocked
 * @text 裏返すを無効にする
 * @desc 表面での裏返す操作の可否を変更します。
 * @type select
 * @option 変更しない
 * @value unchanged
 * @option 裏返すを無効にする
 * @value true
 * @option 裏返すを有効にする
 * @value false
 * @default unchanged
 *
 * @arg changeOperableCharacterId
 * @text 操作できるキャラクターを変更する
 * @desc 操作できるキャラクターの指定を変更するか指定します。
 * @type boolean
 * @on 変更する
 * @off 変更しない
 * @default false
 *
 * @arg operableCharacterId
 * @text 操作できるキャラクターの指定
 * @desc 0を指定すると、誰でも通常の右クリック操作を行えます。
 * @type number
 * @min 0
 * @default 0
 *
 * @command changeCardImageByVariable
 * @text 指定した変数のカード画像を変更
 * @desc 指定したゲーム変数に入っているピクチャ番号のカード画像を変更します。
 *
 * @arg pictureVariableId
 * @text ピクチャ番号を格納した変数
 * @desc 画像を変更するカードのピクチャ番号を格納したゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg frontImage
 * @text 表面画像
 * @desc 変更後に表面へ表示する画像です。
 * @type file
 * @dir img/pictures
 *
 * @arg backImage
 * @text 裏面画像
 * @type file
 * @dir img/pictures
 *
 * @command changeCardCaptionByVariable
 * @text 指定した変数のカードのキャプションを変更
 * @desc 指定したゲーム変数に入っているピクチャ番号のカードキャプションを変更します。
 *
 * @arg pictureVariableId
 * @text ピクチャ番号を格納した変数
 * @desc キャプションを変更するカードのピクチャ番号を格納したゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg frontCaption
 * @text 表面のキャプション
 * @desc 表面に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。空欄で消去します。
 * @type string
 * @default
 *
 * @arg backCaption
 * @text 裏面のキャプション
 * @desc 裏面に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。空欄で消去します。
 * @type string
 * @default
 *
 * @arg maxLineChars
 * @text 一行の最大文字数
 * @desc キャプションを折り返す1行あたりの最大文字数です。
 * @type number
 * @min 1
 * @default 20
 *
 * @command saveAllCardStates
 * @text 全てのカードの状態を保存する
 * @desc 現在の全カードの状態をFirebaseへ指定IDで保存します。同じIDの保存データは置き換えます。
 *
 * @arg saveId
 * @text 保存ID
 * @desc カード状態を保存するIDです。
 * @type string
 *
 * @command restoreAllCardStates
 * @text 全てのカードの状態を復元する
 * @desc Firebaseの指定IDで保存した全カードの状態を、全プレイヤーで復元します。
 *
 * @arg saveId
 * @text 保存ID
 * @desc 復元するカード状態の保存IDです。
 * @type string
 *
 * @command countCardsInRectangle
 * @text 矩形内のカード数を取得
 * @desc 中心座標が指定範囲内にあるカード数を、指定したゲーム変数へ代入します。
 *
 * @arg x
 * @text 矩形の左端X
 * @desc 判定する矩形範囲の左端X座標です。
 * @type number
 * @default 0
 *
 * @arg y
 * @text 矩形の上端Y
 * @desc 判定する矩形範囲の上端Y座標です。
 * @type number
 * @default 0
 *
 * @arg width
 * @text 矩形の幅
 * @desc 判定する矩形範囲の幅です。
 * @type number
 * @min 0
 * @default 100
 *
 * @arg height
 * @text 矩形の高さ
 * @desc 判定する矩形範囲の高さです。
 * @type number
 * @min 0
 * @default 100
 *
 * @arg variableId
 * @text 代入先のゲーム変数
 * @desc カウント結果を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @command storeCardPosition
 * @text カード座標を取得
 * @desc 指定したカードの座標をゲーム変数へ代入します。
 *
 * @arg xVariableId
 * @text 代入先の変数X
 * @desc カードのX座標を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg yVariableId
 * @text 代入先の変数Y
 * @desc カードのY座標を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg pictureId
 * @text ピクチャID
 * @desc 座標を取得するカードのピクチャ番号です。
 * @type number
 * @min 1
 * @default 1
 *
 * @command isCardInvestigated
 * @text 調査済みかどうかを取得
 * @desc 指定したカードが調査済みなら、代入先のスイッチをONにします。
 *
 * @arg switchId
 * @text 代入先スイッチ
 * @desc 調査済みかどうかを代入するゲームスイッチです。
 * @type switch
 * @default 1
 *
 * @arg pictureId
 * @text ピクチャID
 * @desc 判定するカードのピクチャ番号です。
 * @type number
 * @min 1
 * @default 1
 *
 * @command changeViewerIconSize
 * @text 閲覧者アイコンサイズ変更
 * @desc ゲーム中の閲覧者アイコンサイズを変更します。
 *
 * @arg size
 * @text サイズ
 * @desc アイコンの縦横サイズ（px）です。
 * @type number
 * @min 1
 * @default 50
 *
 * @arg x
 * @text 位置X
 * @desc 基準位置からの横方向オフセット（px）です。負の値も指定できます。空欄の場合は現在値を維持します。
 * @type number
 * @default
 *
 * @arg y
 * @text 位置Y
 * @desc 基準位置からの縦方向オフセット（px）です。負の値も指定できます。空欄の場合は現在値を維持します。
 * @type number
 * @default
 *
 * @arg anchor
 * @text 基準位置
 * @desc 位置X・位置Yを計算するカード上の基準位置です。空欄の場合は現在値を維持します。
 * @type select
 * @option 左上
 * @value topLeft
 * @option 右上
 * @value topRight
 * @option 左下
 * @value bottomLeft
 * @option 右下
 * @value bottomRight
 * @option 中央
 * @value center
 * @default
 */

/*~struct~SE:
 * @arg name
 * @text SEファイル名
 * @type file
 * @dir audio/se
 * @arg volume
 * @type number
 * @default 90
 * @arg pitch
 * @type number
 * @default 100
 * @arg pan
 * @type number
 * @default 0
 */

(() => {
    'use strict';

    const pluginName = "CardPicture";
    const pluginParameters = PluginManager.parameters(pluginName);
    const firebaseParameters = PluginManager.parameters("FirebaseSync");
    const gmOnlySwitchId = Number(firebaseParameters.gmOnlySwitchId || 0);
    const viewerIconSingle = pluginParameters.viewerIconSingle === 'true';
    let viewerIconSize = Math.max(1, Number(pluginParameters.viewerIconSize || 50));
    let viewerIconAnchor = pluginParameters.viewerIconAnchor || 'topLeft';
    let viewerIconX = Number(pluginParameters.viewerIconX || 0);
    let viewerIconY = Number(pluginParameters.viewerIconY || 0);
    const gridSnap = pluginParameters.gridSnap === 'true';
    const gridWidth = Math.max(1, Number(pluginParameters.gridWidth || 16));
    const captionHoverDelay = Math.max(0, Number(pluginParameters.captionHoverDelay || 60));
    const captionHoverMoveTolerance = Math.max(0, Number(pluginParameters.captionHoverMoveTolerance || 10));
    const prohibitNewCardInvestigationSwitchId = Number(
        pluginParameters.prohibitNewCardInvestigationSwitchId || 0
    );
    const newCardInvestigationSwitchId = Number(
        pluginParameters.newCardInvestigationSwitchId || 0
    );
    const newCardInvestigationPictureVariableId = Number(
        pluginParameters.newCardInvestigationPictureVariableId || 0
    );
    const menuOutsideClickSe = {
        name: pluginParameters.menuOutsideClickSe || '',
        volume: 90,
        pitch: 100,
        pan: 0
    };
    const cardDoubleClickInterval = 300;
    const cardDoubleClickMoveTolerance = 12;
    Input.keyMapper[79] = "cardPublic";
    Input.keyMapper[84] = "cardPrivate";
    Input.keyMapper[69] = "cardPreview";
    Input.keyMapper[82] = "cardRotate";
    let _draggingSprite = null;
    let _previewSprite = null;
    let _tooltipWindow = null;
    let _tooltipOwner = null;
    let _cardSyncRoomRef = null;
    let _cardSyncListenerAttached = false;
    let _cardSyncListener = null;
    let _floatingSyncListener = null;
    let _cardRestoreListener = null;
    let _lastCardRestoreAt = 0;
    let _nextCardZOrder = 1;
    let _isRestoringCardData = false;
    let _cardRestoreQueue = Promise.resolve();
    const _syncedCardIds = [];
    const _pendingCardVisibility = {};

    function applyPendingCardVisibility(picture) {
        const pictureId = String(picture._pictureId);
        if (!Object.prototype.hasOwnProperty.call(_pendingCardVisibility, pictureId)) return false;
        picture._cardVisible = _pendingCardVisibility[pictureId];
        delete _pendingCardVisibility[pictureId];
        return true;
    }

    function isGm() {
        return gmOnlySwitchId > 0 && $gameSwitches && $gameSwitches.value(gmOnlySwitchId);
    }

    function isMainTabActive() {
        return !$gameSystem || !$gameSystem._activeTabId || $gameSystem._activeTabId === 'main';
    }

    function isCardInteractionBlocked() {
        return ($gameMap && $gameMap.isEventRunning()) ||
            ($gameMessage && $gameMessage.isBusy());
    }

    function isNewCardInvestigationProhibited(picture) {
        return prohibitNewCardInvestigationSwitchId > 0 &&
            $gameSwitches &&
            $gameSwitches.value(prohibitNewCardInvestigationSwitchId) &&
            !picture._hasBeenViewed;
    }

    function cardSyncRef(picture) {
        if (typeof OnlineManager === "undefined" || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child("cards").child(picture._pictureId);
    }

    function cardSaveRef(saveId) {
        if (typeof OnlineManager === "undefined" || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child("card_state_saves").child(saveId);
    }

    function tokenSaveRef(saveId) {
        if (typeof OnlineManager === "undefined" || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child("token_state_saves").child(saveId);
    }

    function floatingSyncRef(picture) {
        if (typeof OnlineManager === "undefined" || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child("floating_pictures").child(picture._pictureId);
    }

    function syncFloating(picture, force) {
        const ref = floatingSyncRef(picture);
        if (!ref) return;
        const now = Date.now();
        if (!force && now - (picture._lastFloatingSyncAt || 0) < 50) return;
        picture._lastFloatingSyncAt = now;
        const x = picture.x();
        const y = picture.y();
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        safeFirebaseWrite("フローティング座標の同期", () => ref.set({ x: x, y: y }));
    }

    function initializeFloatingSync(picture) {
        const ref = floatingSyncRef(picture);
        if (ref) {
            safeFirebaseWrite("フローティング座標の初期化", () =>
                ref.transaction(current => current || { x: picture.x(), y: picture.y() })
            );
        }
    }

    function syncFloatingRemoval(picture) {
        const ref = floatingSyncRef(picture);
        if (ref) safeFirebaseWrite("フローティング座標の削除", () => ref.remove());
    }

    function cardData(picture) {
        return {
            x: picture.x(),
            y: picture.y(),
            isToken: !!picture._isToken,
            tokenImage: picture._tokenImage || "",
            tokenUsedImage: picture._tokenUsedImage || "",
            tokenUsed: !!picture._tokenUsed,
            tokenRightClickEnabled: !!picture._tokenRightClickEnabled,
            tokenOwnerPcId: Number(picture._tokenOwnerPcId) || 0,
            tokenUnusedCaption: picture._tokenUnusedCaption || "",
            tokenUsedCaption: picture._tokenUsedCaption || "",
            hasBeenViewed: !!picture._hasBeenViewed,
            isFlipped: !!picture._isFlipped,
            visible: picture._cardVisible !== false,
            positionFixed: !!picture._positionFixed,
            transparentPixelsNoHit: !!picture._transparentPixelsNoHit,
            rotationLocked: !!picture._rotationLocked,
            flipLocked: picture._flipLocked !== false,
            operableCharacterId: Number(picture._operableCharacterId) || 0,
            frontImage: picture._frontImage || "",
            backImage: picture._backImage || "",
            viewer: Number(picture._viewer) || "",
            prohibitPublicView: !!picture._prohibitPublicView,
            privateViewSwitch: Number(picture._privateViewSwitch) || 0,
            publicViewSwitch: Number(picture._publicViewSwitch) || 0,
            publicViewAt: Number(picture._publicViewAt) || 0,
            frontViewSwitch: Number(picture._frontViewSwitch) || 0,
            specialActionText: picture._specialActionText || "",
            specialActionSwitch: Number(picture._specialActionSwitch) || 0,
            specialActionVariable: Number(picture._specialActionVariable) || 0,
            zOrder: Number(picture._cardZOrder || 0),
            origin: picture.origin(),
            scaleX: picture.scaleX(),
            scaleY: picture.scaleY(),
            opacity: picture.opacity(),
            blendMode: picture.blendMode(),
            angle: Number(picture.angle()) || 0,
            fontSize: Number(picture._fontSize) || 26,
            showRemoveFront: !!picture._showRemoveFront,
            showRemoveBack: !!picture._showRemoveBack,
            frontCaption: picture._frontCaption || "",
            backCaption: picture._backCaption || "",
            seToFront: Object.assign({}, picture._seToFront),
            seToBack: Object.assign({}, picture._seToBack)
        };
    }

    function savedCardData(picture) {
        return Object.assign(cardData(picture), {
            pictureId: picture._pictureId,
            origin: picture.origin(),
            scaleX: picture.scaleX(),
            scaleY: picture.scaleY(),
            opacity: picture.opacity(),
            blendMode: picture.blendMode(),
            fontSize: Number(picture._fontSize) || 26,
            showRemoveFront: !!picture._showRemoveFront,
            showRemoveBack: !!picture._showRemoveBack,
            frontCaption: picture._frontCaption || "",
            backCaption: picture._backCaption || "",
            seToFront: Object.assign({}, picture._seToFront),
            seToBack: Object.assign({}, picture._seToBack)
        });
    }

    function restoreCardData(data) {
        const pictureId = Number(data.pictureId);
        if (!Number.isInteger(pictureId) || pictureId < 1) return;
        _isRestoringCardData = true;
        try {
            $gameScreen.showPicture(
                pictureId, data.backImage || "", Number(data.origin) || 0,
                Number(data.x) || 0, Number(data.y) || 0,
                Number(data.scaleX) || 100, Number(data.scaleY) || 100,
                Number(data.opacity) || 255, Number(data.blendMode) || 0
            );
        } finally {
            _isRestoringCardData = false;
        }
        const picture = $gameScreen.picture(pictureId);
        if (!picture) return;
        picture._pictureId = pictureId;
        picture._isCard = true;
        picture._isFloating = false;
        picture._isToken = !!data.isToken;
        picture._tokenImage = data.tokenImage || data.backImage || "";
        picture._tokenUsedImage = data.tokenUsedImage || "";
        picture._tokenUsed = !!data.tokenUsed;
        picture._tokenRightClickEnabled = !!data.tokenRightClickEnabled;
        picture._tokenOwnerPcId = Math.max(0, Number(data.tokenOwnerPcId) || 0);
        picture._tokenUnusedCaption = data.tokenUnusedCaption || "";
        picture._tokenUsedCaption = data.tokenUsedCaption || "";
        picture._hasBeenViewed = !!data.hasBeenViewed;
        picture._frontImage = data.frontImage || "";
        picture._backImage = data.backImage || "";
        picture._isFlipped = !!data.isFlipped;
        picture._cardVisible = data.visible !== false;
        picture._transparentPixelsNoHit = !!data.transparentPixelsNoHit;
        picture._angle = Number.isFinite(Number(data.angle)) ? Number(data.angle) : 0;
        picture._rotationSpeed = 0;
        picture._positionFixed = !!data.positionFixed;
        picture._rotationLocked = !!data.rotationLocked;
        picture._flipLocked = data.flipLocked !== false;
        picture._operableCharacterId = Math.max(0, Number(data.operableCharacterId) || 0);
        picture._viewer = Number(data.viewer) || "";
        picture._prohibitPublicView = !!data.prohibitPublicView;
        picture._privateViewSwitch = switchId(data.privateViewSwitch);
        picture._publicViewSwitch = switchId(data.publicViewSwitch);
        picture._publicViewAt = Number(data.publicViewAt) || 0;
        picture._frontViewSwitch = switchId(data.frontViewSwitch);
        picture._specialActionText = data.specialActionText || "";
        picture._specialActionSwitch = switchId(data.specialActionSwitch);
        picture._specialActionVariable = switchId(data.specialActionVariable);
        picture._fontSize = Number(data.fontSize) || 26;
        picture._showRemoveFront = !!data.showRemoveFront;
        picture._showRemoveBack = !!data.showRemoveBack;
        picture._frontCaption = data.frontCaption || "";
        picture._backCaption = data.backCaption || "";
        picture._seToFront = Object.assign({}, data.seToFront);
        picture._seToBack = Object.assign({}, data.seToBack);
        picture._cardZOrder = Number(data.zOrder) || pictureId;
        applyPendingCardVisibility(picture);
        picture._name = cardImageName(picture);
        _nextCardZOrder = Math.max(_nextCardZOrder, picture._cardZOrder + 1);
        refreshCardBitmap(pictureId);
    }

    function restoreAllCardData(cards) {
        Object.keys(cards || {}).forEach(pictureId => {
            restoreCardData(cards[pictureId]);
        });
        refreshCardOrder();
    }

    function switchId(value) {
        const id = Number(value || 0);
        return Number.isInteger(id) && id > 0 ? id : 0;
    }

    function turnOnCardSwitch(picture, propertyName) {
        const id = switchId(picture[propertyName]);
        if (id > 0) $gameSwitches.setValue(id, true);
    }

    function reportCardView(picture, viewType) {
        picture._hasBeenViewed = true;
        if (viewType === "private") turnOnCardSwitch(picture, "_privateViewSwitch");
        if (viewType === "public") turnOnCardSwitch(picture, "_publicViewSwitch");
        turnOnCardSwitch(picture, "_frontViewSwitch");
    }

    function reportNewCardInvestigation(picture) {
        if (picture._hasBeenViewed) return;
        if (newCardInvestigationSwitchId > 0) {
            $gameSwitches.setValue(newCardInvestigationSwitchId, true);
        }
        if (newCardInvestigationPictureVariableId > 0) {
            $gameVariables.setValue(newCardInvestigationPictureVariableId, picture._pictureId);
        }
    }

    function publishCard(picture) {
        picture._viewer = "";
        picture._isFlipped = false;
        picture._publicViewAt = Date.now();
        picture._name = cardImageName(picture);
        refreshCardBitmap(picture._pictureId);
        reportNewCardInvestigation(picture);
        reportCardView(picture, "public");
        syncCard(picture, true);
    }

    function snapCardPosition(picture) {
        if (!gridSnap) return;
        picture._x = Math.round(picture.x() / gridWidth) * gridWidth;
        picture._y = Math.round(picture.y() / gridWidth) * gridWidth;
    }

    function constrainPicturePosition(sprite, x, y) {
        if (!sprite || !sprite.bitmap) return { x: x, y: y };
        const width = Math.abs(sprite.bitmap.width * sprite.scale.x);
        const height = Math.abs(sprite.bitmap.height * sprite.scale.y);
        const minX = width * sprite.anchor.x;
        const maxX = Graphics.boxWidth - width * (1 - sprite.anchor.x);
        const minY = height * sprite.anchor.y;
        const maxY = Graphics.boxHeight - height * (1 - sprite.anchor.y);
        return {
            x: minX <= maxX ? Math.min(Math.max(x, minX), maxX) : Graphics.boxWidth / 2,
            y: minY <= maxY ? Math.min(Math.max(y, minY), maxY) : Graphics.boxHeight / 2
        };
    }

    function currentViewerPcNumber() {
        const firebaseParameters = PluginManager.parameters("FirebaseSync");
        const pcIdVariable = Number(firebaseParameters.pcIdVar || 101);
        const value = $gameVariables ? Number($gameVariables.value(pcIdVariable)) : 0;
        return Number.isInteger(value) && value > 0 ? value : 0;
    }

    function canSeeCardFront(picture) {
        return picture._viewer
            ? Number(picture._viewer) === currentViewerPcNumber()
            : !picture._isFlipped;
    }

    function cardImageName(picture) {
        if (picture._isToken) {
            return picture._tokenUsed ? picture._tokenUsedImage : picture._tokenImage;
        }
        return canSeeCardFront(picture) ? picture._frontImage : picture._backImage;
    }

    function cardViewerIconData(picture) {
        const actor = $gameActors && $gameActors.actor(Number(picture._viewer));
        if (!actor || !actor.faceName()) return null;
        return {
            name: actor.faceName(),
            index: Number(actor.faceIndex()) || 0
        };
    }

    function reportSyncError(operation, error) {
        console.warn("CardPicture: " + operation + "に失敗しました。", error);
    }

    function safeFirebaseWrite(operation, writer) {
        try {
            const result = writer();
            if (result && typeof result.catch === "function") {
                result.catch(error => reportSyncError(operation, error));
            }
        } catch (error) {
            reportSyncError(operation, error);
        }
    }

    function queueCardRestore(operation, restore) {
        _cardRestoreQueue = _cardRestoreQueue
            .then(restore)
            .catch(error => reportSyncError(operation, error));
        return _cardRestoreQueue;
    }

    function waitForCardRestore(interpreter, promise) {
        if (!interpreter || !promise || typeof promise.then !== "function") return;
        interpreter._cardRestorePending = true;
        promise.then(() => {
            interpreter._cardRestorePending = false;
        });
        interpreter.setWaitMode("cardPictureRestore");
    }

    const _Game_Interpreter_updateWaitMode_CardPicture = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === "cardPictureRestore") {
            if (this._cardRestorePending) return true;
            this._waitMode = "";
            return false;
        }
        return _Game_Interpreter_updateWaitMode_CardPicture.call(this);
    };

    function syncCard(picture, force) {
        const ref = cardSyncRef(picture);
        if (!ref) {
            console.warn("CardPicture: カード状態を同期できません。Firebaseのルーム接続が未初期化です。", picture._pictureId);
            return;
        }
        const now = Date.now();
        if (!force && now - (picture._lastCardSyncAt || 0) < 50) return;
        picture._lastCardSyncAt = now;
        const data = cardData(picture);
        if (!Number.isFinite(data.x) || !Number.isFinite(data.y) || !Number.isFinite(data.zOrder)) return;
        safeFirebaseWrite("カード状態の同期", () => ref.set(data));
    }

    const _Game_Picture_updateMove_Card = Game_Picture.prototype.updateMove;
    Game_Picture.prototype.updateMove = function() {
        const wasMoving = this._duration > 0;
        _Game_Picture_updateMove_Card.call(this);
        if (wasMoving && this._duration === 0) {
            if (this._isCard) syncCard(this, true);
            if (this._isFloating) syncFloating(this, true);
        }
    };

    function initializeCardSync(picture) {
        const ref = cardSyncRef(picture);
        if (!ref) {
            console.warn("CardPicture: カード状態を初期化できません。Firebaseのルーム接続が未初期化です。", picture._pictureId);
            return;
        }
        console.log("CardPicture: カード状態を初期化します。", picture._pictureId);
        safeFirebaseWrite("カード状態の初期化", () => ref.transaction(current => current || cardData(picture)).then(result => {
            if (!result.committed) {
                console.log("CardPicture: 既存のカード状態を使用します。", picture._pictureId);
            }
        }));
    }

    function syncCardRemoval(picture) {
        const ref = cardSyncRef(picture);
        if (ref) {
            safeFirebaseWrite("カード削除の同期", () => ref.remove());
        }
    }

    const _Game_Screen_showPicture_Card = Game_Screen.prototype.showPicture;
    Game_Screen.prototype.showPicture = function(
        pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode
    ) {
        const oldPicture = this.picture(pictureId);
        if (oldPicture && oldPicture._isCard && !_isRestoringCardData) {
            if (!isGm()) {
                return;
            }
            syncCardRemoval(oldPicture);
        }
        if (oldPicture && oldPicture._isFloating) {
            syncFloatingRemoval(oldPicture);
        }
        _Game_Screen_showPicture_Card.call(
            this, pictureId, name, origin, x, y, scaleX, scaleY, opacity, blendMode
        );
    };

    function nextCardZOrder() {
        let maxZOrder = 0;
        for (const picture of $gameScreen._pictures) {
            if (picture && picture._isCard) {
                maxZOrder = Math.max(maxZOrder, Number(picture._cardZOrder || picture._pictureId));
            }
        }
        _nextCardZOrder = Math.max(_nextCardZOrder, maxZOrder + 1);
        return _nextCardZOrder++;
    }

    function applyCardSyncData(mapData) {
        const currentIds = Object.keys(mapData || {});
        _syncedCardIds.slice().forEach(id => {
            if (!currentIds.includes(id)) {
                const picture = $gameScreen.picture(Number(id));
                if (picture && picture._isCard) $gameScreen.erasePicture(Number(id));
                _syncedCardIds.splice(_syncedCardIds.indexOf(id), 1);
            }
        });
        currentIds.forEach(id => {
            const picture = $gameScreen.picture(Number(id));
            const data = mapData[id];
            if (!data) return;
            if (!picture || !picture._isCard) {
                restoreCardData(Object.assign({ pictureId: Number(id) }, data));
                if (!_syncedCardIds.includes(id)) _syncedCardIds.push(id);
                return;
            }
            const publicViewAt = Number(data.publicViewAt) || 0;
            const hasNewPublicView = publicViewAt > (Number(picture._publicViewAt) || 0);
            picture._x = Number(data.x);
            picture._y = Number(data.y);
            picture._isFlipped = !!data.isFlipped;
            picture._cardVisible = data.visible !== false;
            if (data.isToken !== undefined) picture._isToken = !!data.isToken;
            if (typeof data.tokenImage === "string") picture._tokenImage = data.tokenImage;
            if (typeof data.tokenUsedImage === "string") picture._tokenUsedImage = data.tokenUsedImage;
            if (data.tokenUsed !== undefined) picture._tokenUsed = !!data.tokenUsed;
            if (data.tokenRightClickEnabled !== undefined) {
                picture._tokenRightClickEnabled = !!data.tokenRightClickEnabled;
            }
            if (data.tokenOwnerPcId !== undefined) {
                picture._tokenOwnerPcId = Math.max(0, Number(data.tokenOwnerPcId) || 0);
            }
            if (typeof data.tokenUnusedCaption === "string") {
                picture._tokenUnusedCaption = data.tokenUnusedCaption;
            }
            if (typeof data.tokenUsedCaption === "string") {
                picture._tokenUsedCaption = data.tokenUsedCaption;
            }
            if (data.hasBeenViewed !== undefined) {
                picture._hasBeenViewed = !!data.hasBeenViewed;
            }
            if (Number.isFinite(Number(data.angle))) {
                picture._angle = Number(data.angle);
                picture._rotationSpeed = 0;
            }
            picture._positionFixed = !!data.positionFixed;
            picture._rotationLocked = !!data.rotationLocked;
            picture._flipLocked = data.flipLocked !== false;
            if (data.operableCharacterId !== undefined) {
                picture._operableCharacterId = Math.max(0, Number(data.operableCharacterId) || 0);
            }
            if (typeof data.frontImage === "string" && data.frontImage) {
                picture._frontImage = data.frontImage;
            }
            if (typeof data.backImage === "string" && data.backImage) {
                picture._backImage = data.backImage;
            }
            if (data.viewer !== undefined) {
                const viewer = Number(data.viewer);
                picture._viewer = Number.isInteger(viewer) && viewer >= 1 ? viewer : "";
            }
            picture._prohibitPublicView = data.prohibitPublicView === true;
            if (data.privateViewSwitch !== undefined) {
                picture._privateViewSwitch = switchId(data.privateViewSwitch);
            }
            if (data.publicViewSwitch !== undefined) {
                picture._publicViewSwitch = switchId(data.publicViewSwitch);
            }
            picture._publicViewAt = publicViewAt;
            if (data.frontViewSwitch !== undefined) {
                picture._frontViewSwitch = switchId(data.frontViewSwitch);
            }
            if (typeof data.specialActionText === "string") {
                picture._specialActionText = data.specialActionText;
            }
            if (typeof data.frontCaption === "string") {
                picture._frontCaption = data.frontCaption;
            }
            if (typeof data.backCaption === "string") {
                picture._backCaption = data.backCaption;
            }
            if (data.specialActionSwitch !== undefined) {
                picture._specialActionSwitch = switchId(data.specialActionSwitch);
            }
            if (data.specialActionVariable !== undefined) {
                picture._specialActionVariable = switchId(data.specialActionVariable);
            }
            if (hasNewPublicView) reportCardView(picture, "public");
            const appliedPendingVisibility = applyPendingCardVisibility(picture);
            picture._name = cardImageName(picture);
            refreshCardBitmap(picture._pictureId);
            picture._cardZOrder = Number(data.zOrder || picture._pictureId);
            _nextCardZOrder = Math.max(_nextCardZOrder, picture._cardZOrder + 1);
            if (!_syncedCardIds.includes(id)) _syncedCardIds.push(id);
            if (appliedPendingVisibility) syncCard(picture, true);
        });
        refreshCardOrder();
    }

    function ensureCardSync() {
        if (typeof OnlineManager === "undefined" || !OnlineManager.roomRef) return;
        if (_cardSyncRoomRef === OnlineManager.roomRef && _cardSyncListenerAttached) return;
        if (_cardSyncRoomRef && _cardSyncListener) {
            _cardSyncRoomRef.child("cards").off("value", _cardSyncListener);
        }
        if (_cardSyncRoomRef && _floatingSyncListener) {
            _cardSyncRoomRef.child("floating_pictures").off("value", _floatingSyncListener);
        }
        if (_cardSyncRoomRef && _cardRestoreListener) {
            _cardSyncRoomRef.child("card_state_restore").off("value", _cardRestoreListener);
        }
        _cardSyncRoomRef = OnlineManager.roomRef;
        _lastCardRestoreAt = 0;
        _cardSyncListener = snapshot => {
            applyCardSyncData(snapshot.val() || {});
        };
        _cardSyncRoomRef.child("cards").on("value", _cardSyncListener);
        _floatingSyncListener = snapshot => {
            const positions = snapshot.val() || {};
            Object.keys(positions).forEach(id => {
                const picture = $gameScreen.picture(Number(id));
                const position = positions[id];
                if (!picture || !picture._isFloating || !position) return;
                if (Number.isFinite(Number(position.x))) picture._x = Number(position.x);
                if (Number.isFinite(Number(position.y))) picture._y = Number(position.y);
            });
        };
        _cardSyncRoomRef.child("floating_pictures").on("value", _floatingSyncListener);
        _cardRestoreListener = snapshot => {
            const restoreData = snapshot.val();
            if (!restoreData || !restoreData.at || restoreData.at <= _lastCardRestoreAt) return;
            _lastCardRestoreAt = restoreData.at;
            restoreAllCardData(restoreData.cards);
        };
        _cardSyncRoomRef.child("card_state_restore").on("value", _cardRestoreListener);
        _cardSyncListenerAttached = true;
    }

    function refreshCardBitmap(pictureId) {
        const scene = SceneManager._scene;
        const container = scene && scene._spriteset && scene._spriteset._pictureContainer;
        if (!container || !container.children) return;
        container.children.forEach(sprite => {
            if (sprite._pictureId === pictureId) sprite._pictureName = "";
        });
    }

    function refreshCardOrder() {
        const scene = SceneManager._scene;
        const container = scene && scene._spriteset && scene._spriteset._pictureContainer;
        if (!container || !container.children) return;
        const cardSprites = container.children.filter(sprite => {
            const picture = sprite.picture && sprite.picture();
            return picture && picture._isCard && !picture._isToken;
        });
        const lastCardPictureId = cardSprites.reduce((lastId, sprite) => {
            return Math.max(lastId, Number(sprite._pictureId) || 0);
        }, 0);
        const orderedSprites = container.children.slice().sort((left, right) => {
            const leftPicture = left.picture && left.picture();
            const rightPicture = right.picture && right.picture();
            const leftIsCard = leftPicture && leftPicture._isCard && !leftPicture._isToken;
            const rightIsCard = rightPicture && rightPicture._isCard && !rightPicture._isToken;
            const leftPictureId = Number(left._pictureId) || 0;
            const rightPictureId = Number(right._pictureId) || 0;
            const leftGroup = leftIsCard ? 1 : leftPictureId > lastCardPictureId ? 2 : 0;
            const rightGroup = rightIsCard ? 1 : rightPictureId > lastCardPictureId ? 2 : 0;
            if (leftGroup !== rightGroup) return leftGroup - rightGroup;
            if (leftIsCard && rightIsCard) {
                const leftZ = Number(leftPicture._cardZOrder || leftPictureId);
                const rightZ = Number(rightPicture._cardZOrder || rightPictureId);
                return leftZ - rightZ || leftPictureId - rightPictureId;
            }
            return leftPictureId - rightPictureId;
        });
        orderedSprites.forEach((sprite, index) => {
            if (container.getChildIndex(sprite) !== index) {
                container.setChildIndex(sprite, index);
            }
        });
    }

    function formatCaption(text, maxChars) {
        if (!text) return "";
        const lineLength = Math.max(1, Number(maxChars) || 20);
        const formatted = text.replace(/[￥¥](?=[A-Z]+\[|[{}])/gi, "\\").replace(/<br>/g, '\n');
        const escapePattern = /\\[A-Z]+\[(?:\\[A-Z]+\[\d+\]|[^\]])*\]|\\[{}]/gi;
        return formatted.split('\n').map(line => {
            let result = "";
            let length = 0;
            let position = 0;
            const appendText = value => {
                for (const character of value) {
                    if (length >= lineLength) {
                        result += '\n';
                        length = 0;
                    }
                    result += character;
                    length++;
                }
            };
            line.replace(escapePattern, (escapeCode, offset) => {
                appendText(line.slice(position, offset));
                result += escapeCode;
                position = offset + escapeCode.length;
                return escapeCode;
            });
            appendText(line.slice(position));
            return result;
        }).join('\n');
    }

    function playCardSE(seData) {
        if (!seData || !seData.name) return;
        AudioManager.playSe(seData);
    }

    function isLeftTriggered() {
        if (typeof Einput_l_trig === "function") return Einput_l_trig();
        return TouchInput.isTriggered();
    }

    function cardCenter(picture) {
        const scene = SceneManager._scene;
        const container = scene && scene._spriteset && scene._spriteset._pictureContainer;
        const sprite = container && container.children.find(child =>
            child._pictureId === picture._pictureId
        );
        if (!sprite || !sprite.bitmap) return { x: picture.x(), y: picture.y() };
        return {
            x: sprite.x + sprite.bitmap.width * sprite.scale.x * (0.5 - sprite.anchor.x),
            y: sprite.y + sprite.bitmap.height * sprite.scale.y * (0.5 - sprite.anchor.y)
        };
    }

    Sprite_Picture.prototype.updateCaptionHover = function(canShow) {
        const hasPreviousPointer = this._hoverLastPointerX !== undefined &&
            this._hoverLastPointerY !== undefined;
        const cursorMoved = hasPreviousPointer && (
            this._hoverLastPointerX !== TouchInput.x || this._hoverLastPointerY !== TouchInput.y
        );
        const wasHovering = !!this._wasHovering;
        this._hoverLastPointerX = TouchInput.x;
        this._hoverLastPointerY = TouchInput.y;
        if (!canShow) {
            this._hoverCount = 0;
            this._hoverStartX = null;
            this._hoverStartY = null;
            this._hoverArmed = false;
            this._wasHovering = false;
            this.hideTooltip();
            return;
        }
        this._wasHovering = true;
        if (!wasHovering) {
            if (!cursorMoved) return;
            this._hoverArmed = true;
            this._hoverCount = 0;
            this._hoverStartX = TouchInput.x;
            this._hoverStartY = TouchInput.y;
        }
        if (this._hoverStartX === null || this._hoverStartX === undefined) {
            this._hoverStartX = TouchInput.x;
            this._hoverStartY = TouchInput.y;
        }
        const movedX = TouchInput.x - this._hoverStartX;
        const movedY = TouchInput.y - this._hoverStartY;
        if (Math.hypot(movedX, movedY) > captionHoverMoveTolerance) {
            this._hoverCount = 0;
            this._hoverStartX = TouchInput.x;
            this._hoverStartY = TouchInput.y;
            this.hideTooltip();
        }
        this._hoverCount = (this._hoverCount || 0) + 1;
        if (this._hoverCount >= captionHoverDelay) this.showTooltip();
    };

    PluginManager.registerCommand(pluginName, "makeCard", args => {
        const picture = $gameScreen.picture(Number(args.pictureId));
        if (picture) {
            if (picture._isFloating) syncFloatingRemoval(picture);
            picture._pictureId = Number(args.pictureId);
            picture._isCard = true;
            picture._isFloating = false;
            picture._frontImage = args.frontImage;
            picture._backImage = picture.name();
            picture._viewer = "";
            picture._prohibitPublicView = args.prohibitPublicView === 'true';
            picture._fontSize = Number(args.fontSize || 26);
            picture._showRemoveFront = args.removePermission === "front" || args.removePermission === "both";
            picture._showRemoveBack = args.removePermission === "back" || args.removePermission === "both";
            const maxChars = Number(args.maxLineChars || 20);
            picture._frontCaption = formatCaption(args.frontCaption || "", maxChars);
            picture._backCaption = formatCaption(args.backCaption || "", maxChars);
            picture._seToFront = JSON.parse(args.seToFront || '{}');
            picture._seToBack = JSON.parse(args.seToBack || '{}');
            picture._privateViewSwitch = switchId(args.privateViewSwitch);
            picture._publicViewSwitch = switchId(args.publicViewSwitch);
            picture._frontViewSwitch = switchId(args.frontViewSwitch);
            picture._specialActionText = String(args.specialActionText || "");
            picture._specialActionSwitch = switchId(args.specialActionSwitch);
            picture._specialActionVariable = switchId(args.specialActionVariable);
            picture._isFlipped = true;
            picture._cardVisible = args.initialVisibility !== 'hidden';
            picture._positionFixed = args.positionFixed === 'true';
            picture._transparentPixelsNoHit = args.transparentPixelsNoHit === 'true';
            picture._rotationLocked = args.rotationLocked === 'true';
            picture._flipLocked = args.flipLocked !== 'false';
            picture._operableCharacterId = Math.max(0, Number(args.operableCharacterId) || 0);
            applyPendingCardVisibility(picture);
            picture._name = cardImageName(picture);
            picture._cardZOrder = picture._cardZOrder || picture._pictureId;
            refreshCardOrder();
            initializeCardSync(picture);
        }
    });

    PluginManager.registerCommand(pluginName, "changeCardVisibility", args => {
        const startId = Number(args.pictureIdStart || 0);
        const endId = Number(args.pictureIdEnd || 0);
        const firstId = startId || endId;
        const lastId = startId && endId ? endId : firstId;
        for (let pictureId = Math.min(firstId, lastId); pictureId <= Math.max(firstId, lastId); pictureId++) {
            const picture = $gameScreen.picture(pictureId);
            if (picture && picture._isCard) {
                changeCardVisibilityAndPossession(picture, args);
            } else if (args.visibility === "visible" || args.visibility === "hidden") {
                _pendingCardVisibility[String(pictureId)] = args.visibility === "visible";
            }
        }
    });

    function changeCardVisibilityAndPossession(picture, args) {
        const visibility = args.visibility || "unchanged";
        const possessionState = args.possessionState || "unchanged";
        if (visibility === "visible") picture._cardVisible = true;
        if (visibility === "hidden") picture._cardVisible = false;

        if (possessionState === "public") {
            publishCard(picture);
            return;
        }
        if (possessionState === "private") {
            const viewer = Number(args.privateViewer || 0);
            if (!Number.isInteger(viewer) || viewer < 1) return;
            picture._viewer = viewer;
            picture._isFlipped = true;
            picture._name = cardImageName(picture);
            refreshCardBitmap(picture._pictureId);
            reportCardView(picture, "private");
            syncCard(picture, true);
            return;
        }
        if (possessionState === "flipped") {
            picture._viewer = "";
            picture._isFlipped = true;
            picture._name = cardImageName(picture);
            refreshCardBitmap(picture._pictureId);
        }
        if (visibility !== "unchanged" || possessionState === "flipped") syncCard(picture, true);
    }

    PluginManager.registerCommand(pluginName, "saveAllCardStates", args => {
        const saveId = String(args.saveId || "").trim();
        const ref = cardSaveRef(saveId);
        if (!saveId || !ref) return;
        const cards = {};
        $gameScreen._pictures.forEach(picture => {
            if (picture && picture._isCard) {
                cards[picture._pictureId] = savedCardData(picture);
            }
        });
        safeFirebaseWrite("カード状態の保存", () => ref.set(cards));
    });

    function restoreAllCardStates(args) {
        const saveId = String(args.saveId || "").trim();
        const ref = cardSaveRef(saveId);
        if (!saveId || !ref) return Promise.resolve();
        return queueCardRestore("カード状態の復元", () => ref.once("value").then(snapshot => {
            const cards = snapshot.val();
            if (!cards) return;
            return OnlineManager.roomRef.child("cards").set(cards).then(() =>
                OnlineManager.roomRef.child("card_state_restore").set({
                    at: Date.now(),
                    cards: cards
                })
            );
        }));
    }

    PluginManager.registerCommand(pluginName, "restoreAllCardStates", function(args) {
        waitForCardRestore(this, restoreAllCardStates(args));
    });

    function saveAllTokenStates(args) {
        const saveId = String(args.saveId || "").trim();
        const ref = tokenSaveRef(saveId);
        if (!saveId || !ref) return;
        const tokens = {};
        $gameScreen._pictures.forEach(picture => {
            if (picture && picture._isToken) {
                tokens[picture._pictureId] = savedCardData(picture);
            }
        });
        safeFirebaseWrite("トークン状態の保存", () => ref.set(tokens));
    }

    function restoreAllTokenStates(args) {
        const saveId = String(args.saveId || "").trim();
        const ref = tokenSaveRef(saveId);
        if (!saveId || !ref) return Promise.resolve();
        return queueCardRestore("トークン状態の復元", () => ref.once("value").then(snapshot => {
            const tokens = snapshot.val();
            if (!tokens) return;
            return OnlineManager.roomRef.child("cards").once("value").then(cardSnapshot => {
                const cards = cardSnapshot.val() || {};
                Object.keys(cards).forEach(pictureId => {
                    if (cards[pictureId].isToken) delete cards[pictureId];
                });
                Object.keys(tokens).forEach(pictureId => {
                    cards[pictureId] = Object.assign({ isToken: true }, tokens[pictureId]);
                });
                return OnlineManager.roomRef.child("cards").set(cards).then(() =>
                    OnlineManager.roomRef.child("card_state_restore").set({
                        at: Date.now(),
                        cards: cards
                    })
                );
            });
        }));
    }

    function makeFloatingPicture(args) {
        const picture = $gameScreen.picture(Number(args.pictureId));
        if (!picture) return;
        if (picture._isCard) syncCardRemoval(picture);
        picture._pictureId = Number(args.pictureId);
        picture._isCard = false;
        picture._isFloating = true;
        picture._transparentPixelsNoHit = args.transparentPixelsNoHit === "true";
        picture._floatingCaption = formatCaption(
            args.caption || "", Number(args.maxLineChars || 20)
        );
        picture._floatingFontSize = Number(args.fontSize || 26);
        initializeFloatingSync(picture);
    }

    function makePictureToken(args) {
        const picture = $gameScreen.picture(Number(args.pictureId));
        if (!picture) return;
        if (picture._isCard) syncCardRemoval(picture);
        if (picture._isFloating) syncFloatingRemoval(picture);
        picture._pictureId = Number(args.pictureId);
        picture._isCard = true;
        picture._isFloating = false;
        picture._isToken = true;
        picture._tokenImage = picture.name();
        picture._tokenUsedImage = String(args.usedImage || "");
        picture._tokenUsed = false;
        picture._tokenRightClickEnabled = args.rightClickEnabled === "true";
        picture._tokenOwnerPcId = Math.max(0, Number(args.ownerPcId) || 0);
        picture._tokenUnusedCaption = formatCaption(args.unusedCaption || "", 20);
        picture._tokenUsedCaption = formatCaption(args.usedCaption || "", 20);
        picture._cardVisible = true;
        picture._positionFixed = args.movable === "false";
        picture._cardZOrder = picture._cardZOrder || picture._pictureId;
        picture._name = cardImageName(picture);
        refreshCardBitmap(picture._pictureId);
        refreshCardOrder();
        initializeCardSync(picture);
    }

    function canUsePictureToken(picture) {
        return picture && picture._isToken && !picture._tokenUsed &&
            (Number(picture._tokenOwnerPcId) === 0 ||
                Number(picture._tokenOwnerPcId) === currentViewerPcNumber());
    }

    function usePictureToken(args) {
        const picture = $gameScreen.picture(Number(args.pictureId));
        if (!picture || !picture._isToken || picture._tokenUsed) return;
        picture._tokenUsed = true;
        picture._name = cardImageName(picture);
        refreshCardBitmap(picture._pictureId);
        syncCard(picture, true);
    }

    function countUnusedPictureTokens(args) {
        const variableId = switchId(args.variableId);
        if (!variableId) return;
        const ownerPcId = Math.max(0, Number(args.ownerPcId) || 0);
        const count = $gameScreen._pictures.filter(picture => {
            return picture && picture._isToken && !picture._tokenUsed &&
                Number(picture._tokenOwnerPcId) === ownerPcId;
        }).length;
        $gameVariables.setValue(variableId, count);
    }

    function countUnusedPictureTokensByVariable(args) {
        const ownerPcVariableId = switchId(args.ownerPcVariableId);
        if (!ownerPcVariableId) return;
        countUnusedPictureTokens({
            variableId: args.variableId,
            ownerPcId: $gameVariables.value(ownerPcVariableId)
        });
    }

    function countAllUnusedPictureTokens(args) {
        const firstVariableId = switchId(args.firstVariableId);
        const firstOwnerPcId = Math.max(0, Number(args.firstOwnerPcId) || 0);
        const lastOwnerPcId = Math.max(0, Number(args.lastOwnerPcId) || 0);
        if (!firstVariableId || firstOwnerPcId > lastOwnerPcId) return;
        for (let ownerPcId = firstOwnerPcId; ownerPcId <= lastOwnerPcId; ownerPcId++) {
            const count = $gameScreen._pictures.filter(picture => {
                return picture && picture._isToken && !picture._tokenUsed &&
                    Number(picture._tokenOwnerPcId) === ownerPcId;
            }).length;
            $gameVariables.setValue(firstVariableId + ownerPcId - firstOwnerPcId, count);
        }
    }

    function useOnePictureToken(args) {
        const ownerPcId = Math.max(0, Number(args.ownerPcId) || 0);
        const priority = String(args.priority || "idDescending");
        const tokens = $gameScreen._pictures.filter(picture => {
            return picture && picture._isToken && !picture._tokenUsed &&
                Number(picture._tokenOwnerPcId) === ownerPcId;
        });
        const comparisons = {
            idDescending: (left, right) => right._pictureId - left._pictureId,
            idAscending: (left, right) => left._pictureId - right._pictureId,
            xAscending: (left, right) => left.x() - right.x(),
            xDescending: (left, right) => right.x() - left.x(),
            yAscending: (left, right) => left.y() - right.y(),
            yDescending: (left, right) => right.y() - left.y()
        };
        const compare = comparisons[priority] || comparisons.idDescending;
        tokens.sort(compare);
        if (tokens[0]) usePictureToken({ pictureId: tokens[0]._pictureId });
    }

    function useOnePictureTokenByVariable(args) {
        const variableId = switchId(args.ownerPcVariableId);
        if (!variableId) return;
        useOnePictureToken({
            ownerPcId: $gameVariables.value(variableId),
            priority: args.priority
        });
    }

    PluginManager.registerCommand(pluginName, "countCardsInRectangle", args => {
        const x = Number(args.x) || 0;
        const y = Number(args.y) || 0;
        const width = Math.max(0, Number(args.width) || 0);
        const height = Math.max(0, Number(args.height) || 0);
        const variableId = switchId(args.variableId);
        if (!variableId) return;
        const count = $gameScreen._pictures.filter(picture => {
            if (!picture || !picture._isCard || picture._cardVisible === false) return false;
            const center = cardCenter(picture);
            return center.x >= x && center.x <= x + width &&
                center.y >= y && center.y <= y + height;
        }).length;
        $gameVariables.setValue(variableId, count);
    });

    function storePicturePosition(args) {
        const picture = $gameScreen.picture(Number(args.pictureId));
        if (!picture) return;
        const xVariableId = switchId(args.xVariableId);
        const yVariableId = switchId(args.yVariableId);
        if (xVariableId) $gameVariables.setValue(xVariableId, picture.x());
        if (yVariableId) $gameVariables.setValue(yVariableId, picture.y());
    }

    PluginManager.registerCommand(pluginName, "storeCardPosition", storePicturePosition);

    PluginManager.registerCommand(pluginName, "isCardInvestigated", args => {
        const targetSwitchId = switchId(args.switchId);
        if (!targetSwitchId) return;
        const picture = $gameScreen.picture(Number(args.pictureId));
        $gameSwitches.setValue(targetSwitchId, !!picture && picture._isCard && !!picture._hasBeenViewed);
    });

    window.CardPictureFloating = {
        makeFloating: makeFloatingPicture,
        storePosition: storePicturePosition,
        makeToken: makePictureToken,
        useToken: usePictureToken,
        saveAllTokens: saveAllTokenStates,
        restoreAllTokens: restoreAllTokenStates,
        waitForRestore: waitForCardRestore,
        countUnusedTokens: countUnusedPictureTokens,
        countUnusedTokensByVariable: countUnusedPictureTokensByVariable,
        countAllUnusedTokens: countAllUnusedPictureTokens,
        useOneToken: useOnePictureToken,
        useOneTokenByVariable: useOnePictureTokenByVariable
    };

    function changeCardCaption(picture, args) {
        if (!picture || !picture._isCard) return;
        const maxChars = Math.max(1, Number(args.maxLineChars) || 20);
        picture._frontCaption = formatCaption(args.frontCaption || "", maxChars);
        picture._backCaption = formatCaption(args.backCaption || "", maxChars);
        syncCard(picture, true);
    }

    PluginManager.registerCommand(pluginName, "changeCardCaption", args => {
        changeCardCaption($gameScreen.picture(Number(args.pictureId)), args);
    });

    PluginManager.registerCommand(pluginName, "changeCardCaptionByVariable", args => {
        const variableId = switchId(args.pictureVariableId);
        if (!variableId) return;
        changeCardCaption($gameScreen.picture(Number($gameVariables.value(variableId))), args);
    });

    function changeCardImage(picture, args) {
        if (!picture || !picture._isCard) return;
        if (args.frontImage) picture._frontImage = args.frontImage;
        if (args.backImage) picture._backImage = args.backImage;
        picture._name = cardImageName(picture);
        refreshCardBitmap(picture._pictureId);
        syncCard(picture, true);
    }

    PluginManager.registerCommand(pluginName, "changeCardImage", args => {
        changeCardImage($gameScreen.picture(Number(args.pictureId)), args);
    });

    PluginManager.registerCommand(pluginName, "changeCardImageByVariable", args => {
        const variableId = switchId(args.pictureVariableId);
        if (!variableId) return;
        changeCardImage($gameScreen.picture(Number($gameVariables.value(variableId))), args);
    });

    PluginManager.registerCommand(pluginName, "previewCard", args => {
        const pictureId = Number(args.pictureId);
        const picture = $gameScreen.picture(pictureId);
        const scene = SceneManager._scene;
        const container = scene && scene._spriteset && scene._spriteset._pictureContainer;
        const sprite = container && container.children.find(child => child._pictureId === pictureId);
        if (!picture || !picture._isCard || picture._cardVisible === false || !sprite) return;
        sprite.showPreview(cardImageName(picture));
    });

    function changeCardAttributes(picture, args) {
        if (!picture || !picture._isCard) return;
        if (args.changeViewSwitches === "true") {
            picture._privateViewSwitch = switchId(args.privateViewSwitch);
            picture._publicViewSwitch = switchId(args.publicViewSwitch);
            picture._frontViewSwitch = switchId(args.frontViewSwitch);
        }
        if (args.changeSpecialAction === "true") {
            picture._specialActionText = String(args.specialActionText || "");
            picture._specialActionSwitch = switchId(args.specialActionSwitch);
            picture._specialActionVariable = switchId(args.specialActionVariable);
        }
        if (args.changeOtherAttributes === "true") {
            if (args.viewedState === "viewed") picture._hasBeenViewed = true;
            if (args.viewedState === "unviewed") picture._hasBeenViewed = false;
            if (args.positionFixed !== "unchanged") {
                picture._positionFixed = args.positionFixed === "true";
            }
            if (args.rotationLocked !== "unchanged") {
                picture._rotationLocked = args.rotationLocked === "true";
            }
            if (args.flipLocked !== "unchanged") {
                picture._flipLocked = args.flipLocked === "true";
            }
            if (args.changeOperableCharacterId === "true") {
                picture._operableCharacterId = Math.max(0, Number(args.operableCharacterId) || 0);
            }
            if (args.publicViewRestriction === "prohibit") {
                picture._prohibitPublicView = true;
            } else if (args.publicViewRestriction === "allow") {
                picture._prohibitPublicView = false;
            }
        }
        syncCard(picture, true);
    }

    PluginManager.registerCommand(pluginName, "changeCardViewSwitches", args => {
        changeCardAttributes($gameScreen.picture(Number(args.pictureId)), args);
    });

    PluginManager.registerCommand(pluginName, "changeCardViewSwitchesByVariable", args => {
        const variableId = switchId(args.pictureVariableId);
        if (!variableId) return;
        changeCardAttributes($gameScreen.picture(Number($gameVariables.value(variableId))), args);
    });

    PluginManager.registerCommand(pluginName, "changeViewerIconSize", args => {
        const size = Number(args.size);
        if (Number.isFinite(size) && size >= 1) {
            viewerIconSize = size;
        }
        if (args.x !== undefined && args.x !== "") {
            const x = Number(args.x);
            if (Number.isFinite(x)) viewerIconX = x;
        }
        if (args.y !== undefined && args.y !== "") {
            const y = Number(args.y);
            if (Number.isFinite(y)) viewerIconY = y;
        }
        if (args.anchor) {
            viewerIconAnchor = args.anchor;
        }
    });

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        _tooltipWindow = new Window_Base(new Rectangle(0, 0, 100, 100));
        _tooltipWindow.hide();
        this.addWindow(_tooltipWindow);
    };

    function Window_CardSimpleMenu() { this.initialize(...arguments); }
    Window_CardSimpleMenu.prototype = Object.create(Window_Command.prototype);
    Window_CardSimpleMenu.prototype.constructor = Window_CardSimpleMenu;
    Window_CardSimpleMenu.prototype.initialize = function(rect, picture) {
        this._picture = picture;
        Window_Command.prototype.initialize.call(this, rect);
        this.openness = 255;
    };

    Window_CardSimpleMenu.prototype.resetFontSettings = function() {
        Window_Command.prototype.resetFontSettings.call(this);
        if (this._picture && this._picture._fontSize) {
            this.contents.fontSize = this._picture._fontSize;
        }
    };

    Window_CardSimpleMenu.prototype.itemHeight = function() {
        return (this._picture ? this._picture._fontSize : 26) + 12;
    };

    Window_CardSimpleMenu.prototype.drawItem = function(index) {
        const rect = this.itemLineRect(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawTextEx(this.commandName(index), rect.x, rect.y, rect.width);
    };

    Window_CardSimpleMenu.prototype.processHandling = function() {
        if (isCardInteractionBlocked()) return;
        Window_Command.prototype.processHandling.call(this);
        if (!this.isOpenAndActive()) return;
        if (Input.isTriggered("cardPublic")) this.processCardShortcut(["publicView", "flip"]);
        if (Input.isTriggered("cardPrivate")) this.processCardShortcut(["privateView", "flip"]);
        if (Input.isTriggered("cardPreview")) this.processCardShortcut(["preview"]);
        if (Input.isTriggered("cardRotate")) this.processCardShortcut(["rotate"]);
    };

    Window_CardSimpleMenu.prototype.processCardShortcut = function(symbols) {
        const index = symbols.map(symbol => this.findSymbol(symbol)).find(index => index >= 0);
        if (index === undefined || !this.isCommandEnabled(index)) return;
        this.select(index);
        this.processOk();
    };

    Window_CardSimpleMenu.prototype.makeCommandList = function() {
        const p = this._picture;
        if (!p) return;
        if (p._isToken) {
            if (p._tokenRightClickEnabled && canUsePictureToken(p)) {
                this.addCommand("使う", "useToken");
            }
            return;
        }
        if (!isGm() && Number(p._operableCharacterId) !== 0 &&
            Number(p._operableCharacterId) !== currentViewerPcNumber()) {
            this.addCommand("拡大表示(E)", "preview");
            return;
        }
        if (canSeeCardFront(p)) {
            if (isGm() || !p._flipLocked) this.addCommand("裏返す(T)", "flip");
            if (!p._prohibitPublicView && p._viewer && Number(p._viewer) === currentViewerPcNumber()) {
                this.addCommand("全体公開(O)", "publicView");
            }
            if (p._specialActionText) this.addCommand(p._specialActionText, "specialAction");
            this.addCommand("拡大表示(E)", "preview");
            if (!p._rotationLocked) this.addCommand("カードの回転(R)", "rotate");
            if (p._showRemoveFront) this.addCommand("削除", "remove");
        } else {
            const investigationProhibited = isNewCardInvestigationProhibited(p);
            if (!investigationProhibited && !p._prohibitPublicView && !(isGm() && p._viewer)) {
                this.addCommand("全体公開(O)", "flip");
            }
            if (!investigationProhibited) this.addCommand("自分だけ見る(T)", "privateView");
            this.addCommand("拡大表示(E)", "preview");
            if (!p._rotationLocked) this.addCommand("カードの回転(R)", "rotate");
            if (p._showRemoveBack) this.addCommand("削除", "remove");
            if (isGm() && p._viewer) this.addCommand("裏返す(T)", "flip");
        }
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        ensureCardSync();
        if (isCardInteractionBlocked()) {
            if (_draggingSprite) {
                const picture = _draggingSprite.picture();
                if (picture && picture._isCard) {
                    snapCardPosition(picture);
                    syncCard(picture, true);
                } else if (picture && picture._isFloating) {
                    syncFloating(picture, true);
                }
                _draggingSprite = null;
            }
            if (_tooltipWindow) _tooltipWindow.hide();
            if (this._cardMenuWindow) {
                this.removeChild(this._cardMenuWindow);
                this._cardMenuWindow = null;
            }
        }
        if (!isMainTabActive()) {
            _draggingSprite = null;
            if (_previewSprite) _previewSprite.visible = false;
            if (_tooltipWindow) _tooltipWindow.hide();
            if (this._cardMenuWindow) {
                this._cardMenuWindow.deactivate();
                this._cardMenuWindow.hide();
            }
        }
        if (_previewSprite && _previewSprite.visible) {
            if (isLeftTriggered() || TouchInput.isCancelled()) {
                _previewSprite.visible = false;
                TouchInput.clear();
            }
            Scene_Base.prototype.update.call(this);
            return;
        }
        if (this._cardMenuWindow && this._cardMenuWindow.active) {
            if (isLeftTriggered() || TouchInput.isCancelled()) {
                if (!this.isInsideWindow(this._cardMenuWindow)) {
                    playCardSE(menuOutsideClickSe);
                    this._cardMenuWindow.callHandler("cancel");
                    TouchInput.clear();
                }
            }
            Scene_Base.prototype.update.call(this);
            return;
        }
        _Scene_Map_update.call(this);
    };

    Scene_Map.prototype.isInsideWindow = function(window) {
        if (!window) return false;
        const x = TouchInput.x; const y = TouchInput.y;
        return x >= window.x && x < window.x + window.width &&
               y >= window.y && y < window.y + window.height;
    };

    const _Sprite_Picture_loadBitmap_Card = Sprite_Picture.prototype.loadBitmap;
    Sprite_Picture.prototype.loadBitmap = function() {
        const picture = this.picture();
        if (!picture || !picture._isCard || picture._isToken ||
            !canSeeCardFront(picture) || picture._frontImage) {
            _Sprite_Picture_loadBitmap_Card.call(this);
            return;
        }
        const backBitmap = ImageManager.loadPicture(picture._backImage);
        backBitmap.addLoadListener(() => {
            if (this.picture() !== picture || this._pictureName !== "" ||
                !canSeeCardFront(picture) || picture._frontImage) return;
            const bitmap = new Bitmap(backBitmap.width, backBitmap.height);
            bitmap.fillAll("#ffffff");
            this.bitmap = bitmap;
        });
    };

    const _Sprite_Picture_update = Sprite_Picture.prototype.update;
    Sprite_Picture.prototype.update = function() {
        _Sprite_Picture_update.call(this);
        const picture = this.picture();
        if (picture && picture._isCard) {
            this.visible = picture._cardVisible !== false;
            const imageName = cardImageName(picture);
            if (picture._name !== imageName) {
                picture._name = imageName;
                this._pictureName = "";
            }
            this.updateCardViewerIcon();
            this.updateCardInteraction();
        } else if (picture && picture._isFloating) {
            this.updateFloatingInteraction();
        }
    };

    Sprite_Picture.prototype.updateCardViewerIcon = function() {
        const picture = this.picture();
        const iconData = cardViewerIconData(picture);
        if (!this._cardViewerIcon && iconData) {
            this._cardViewerIcon = new Sprite();
            this._cardViewerIcon.anchor.set(0, 0);
            this.addChild(this._cardViewerIcon);
        }
        if (!this._cardViewerIcon) return;
        const iconKey = iconData ? iconData.name + ":" + iconData.index : "";
        if (this._cardViewerIcon._pictureName !== iconKey && iconData) {
            this._cardViewerIcon._pictureName = iconKey;
            this._cardViewerIcon.bitmap = ImageManager.loadFace(iconData.name);
            this._cardViewerIcon.bitmap.addLoadListener(() => {
                const bitmap = this._cardViewerIcon.bitmap;
                const isFaceSheet = bitmap.width === 576 && bitmap.height === 288;
                const useFullImage = viewerIconSingle || !isFaceSheet;
                const frameWidth = useFullImage ? bitmap.width : 144;
                const frameHeight = useFullImage ? bitmap.height : 144;
                const frameX = useFullImage ? 0 : (iconData.index % 4) * 144;
                const frameY = useFullImage ? 0 : Math.floor(iconData.index / 4) * 144;
                this._cardViewerIcon.setFrame(frameX, frameY, frameWidth, frameHeight);
            });
        }
        const bitmap = this._cardViewerIcon.bitmap;
        if (bitmap && bitmap.isReady()) {
            const isFaceSheet = bitmap.width === 576 && bitmap.height === 288;
            const useFullImage = viewerIconSingle || !isFaceSheet;
            const frameWidth = useFullImage ? bitmap.width : 144;
            const frameHeight = useFullImage ? bitmap.height : 144;
            this._cardViewerIcon.scale.set(
                viewerIconSize / frameWidth / Math.abs(this.scale.x || 1),
                viewerIconSize / frameHeight / Math.abs(this.scale.y || 1)
            );
            const cardWidth = this.bitmap ? this.bitmap.width : 0;
            const cardHeight = this.bitmap ? this.bitmap.height : 0;
            const scaleX = Math.abs(this.scale.x || 1);
            const scaleY = Math.abs(this.scale.y || 1);
            const iconWidth = viewerIconSize / scaleX;
            const iconHeight = viewerIconSize / scaleY;
            const left = -this.anchor.x * cardWidth;
            const top = -this.anchor.y * cardHeight;
            const right = left + cardWidth - iconWidth;
            const bottom = top + cardHeight - iconHeight;
            const centerX = left + (cardWidth - iconWidth) / 2;
            const centerY = top + (cardHeight - iconHeight) / 2;
            const iconPosition = {
                topLeft: [left, top],
                topRight: [right, top],
                bottomLeft: [left, bottom],
                bottomRight: [right, bottom],
                center: [centerX, centerY]
            }[viewerIconAnchor] || [left, top];
            this._cardViewerIcon.x = iconPosition[0] + viewerIconX / scaleX;
            this._cardViewerIcon.y = iconPosition[1] + viewerIconY / scaleY;
        }
        this._cardViewerIcon.visible = this.visible && !!iconData;
    };

    Sprite_Picture.prototype.updateCardInteraction = function() {
        const picture = this.picture();
        if (!isMainTabActive() || picture._cardVisible === false || isCardInteractionBlocked()) {
            this._hoverCount = 0;
            this.hideTooltip();
            return;
        }
        const isTouched = this.isBeingTouched();
        const isPreviewing = _previewSprite && _previewSprite.visible;

        if (isTouched && TouchInput.isCancelled() && this.isTopCardAtPointer()) {
            this.showCardMenu();
            TouchInput.clear();
            return;
        }

        if (isLeftTriggered() && isTouched && this.isTopCardAtPointer() && this.handleCardDoubleClick()) {
            return;
        }

        if (!picture._positionFixed && isLeftTriggered() && isTouched &&
            (this.isTopCardAtPointer() || _draggingSprite === this)) {
            _draggingSprite = this;
            this._dragOffsetX = TouchInput.x - picture.x();
            this._dragOffsetY = TouchInput.y - picture.y();
            this.hideTooltip();
            this.moveToFront();
            picture._cardZOrder = nextCardZOrder();
            refreshCardOrder();
            syncCard(picture, true);
        }

        if (_draggingSprite === this) {
            if (TouchInput.isPressed()) {
                const position = constrainPicturePosition(
                    this, TouchInput.x - this._dragOffsetX, TouchInput.y - this._dragOffsetY
                );
                picture._x = position.x;
                picture._y = position.y;
                syncCard(picture, false);
            } else {
                snapCardPosition(picture);
                const position = constrainPicturePosition(this, picture.x(), picture.y());
                picture._x = position.x;
                picture._y = position.y;
                _draggingSprite = null;
                syncCard(picture, true);
            }
        }

        this.updateCaptionHover(
            isTouched && !_draggingSprite && !isPreviewing && !SceneManager._scene._cardMenuWindow
        );
    };

    Sprite_Picture.prototype.handleCardDoubleClick = function() {
        const now = Date.now();
        const lastClickAt = this._lastCardClickAt;
        const lastClickFrame = this._lastCardClickFrame;
        const moved = Math.hypot(
            TouchInput.x - (this._lastCardClickX || 0),
            TouchInput.y - (this._lastCardClickY || 0)
        );
        const hasPreviousClick = Number.isFinite(lastClickAt) && lastClickAt > 0 &&
            lastClickFrame !== Graphics.frameCount;
        const isDoubleClick = hasPreviousClick &&
            now - lastClickAt <= cardDoubleClickInterval &&
            moved <= cardDoubleClickMoveTolerance;
        this._lastCardClickAt = now;
        this._lastCardClickFrame = Graphics.frameCount;
        this._lastCardClickX = TouchInput.x;
        this._lastCardClickY = TouchInput.y;
        if (!isDoubleClick) return false;

        this._lastCardClickAt = 0;
        this._lastCardClickFrame = -1;
        const picture = this.picture();
        const isOperable = Number(picture._operableCharacterId) === 0 ||
            Number(picture._operableCharacterId) === currentViewerPcNumber();
        if (canSeeCardFront(picture) || !isOperable) {
            this.showPreview(cardImageName(picture));
            return true;
        }
        if (isNewCardInvestigationProhibited(picture)) return true;

        const myPcNumber = currentViewerPcNumber();
        if (!myPcNumber) return true;
        picture._viewer = myPcNumber;
        picture._name = cardImageName(picture);
        this._pictureName = "";
        reportNewCardInvestigation(picture);
        reportCardView(picture, "private");
        syncCard(picture, true);
        return true;
    };

    Sprite_Picture.prototype.updateFloatingInteraction = function() {
        const picture = this.picture();
        const isTouched = this.isBeingTouched();

        if (isLeftTriggered() && isTouched &&
            (this.isTopCardAtPointer() || _draggingSprite === this)) {
            _draggingSprite = this;
            this._dragOffsetX = TouchInput.x - picture.x();
            this._dragOffsetY = TouchInput.y - picture.y();
            this.hideTooltip();
        }

        if (_draggingSprite === this) {
            if (TouchInput.isPressed()) {
                const position = constrainPicturePosition(
                    this, TouchInput.x - this._dragOffsetX, TouchInput.y - this._dragOffsetY
                );
                picture._x = position.x;
                picture._y = position.y;
                syncFloating(picture, false);
            } else {
                _draggingSprite = null;
                syncFloating(picture, true);
            }
        }

        this.updateCaptionHover(
            isTouched && !_draggingSprite && !(_previewSprite && _previewSprite.visible)
        );
    };

    Sprite_Picture.prototype.isTopCardAtPointer = function() {
        const scene = SceneManager._scene;
        const container = scene && scene._spriteset && scene._spriteset._pictureContainer;
        if (!container || !container.children) return true;
        return !container.children.some(sprite => {
            if (sprite === this || !sprite.picture || !sprite.picture()) return false;
            const otherPicture = sprite.picture();
            return (otherPicture._isCard || otherPicture._isFloating) &&
                otherPicture._cardVisible !== false &&
                sprite.isBeingTouched() &&
                container.getChildIndex(sprite) > container.getChildIndex(this);
        });
    };

    Sprite_Picture.prototype.showCardMenu = function() {
        const picture = this.picture();
        const scene = SceneManager._scene;
        if (!(scene instanceof Scene_Map)) return;
        if (picture._isToken &&
            (!picture._tokenRightClickEnabled || !canUsePictureToken(picture))) return;
        if (scene._cardMenuWindow) scene.removeChild(scene._cardMenuWindow);

        const tempRect = new Rectangle(0, 0, 1, 400);
        const menu = new Window_CardSimpleMenu(tempRect, picture);

        const widestCommand = menu._list.reduce((width, command) => {
            return Math.max(width, menu.textSizeEx(command.name).width);
        }, 0);
        const width = Math.min(
            Graphics.boxWidth,
            Math.ceil(widestCommand) + menu.padding * 2 + menu.itemPadding() * 2
        );
        const height = (menu.maxItems() * menu.itemHeight()) + menu.padding * 2;

        let x = TouchInput.x; let y = TouchInput.y;
        if (x + width > Graphics.boxWidth) x -= width;
        if (y + height > Graphics.boxHeight) y -= height;
        menu.move(Math.max(0, x), Math.max(0, y), width, height);
        menu.createContents();
        menu.refresh();

        scene._cardMenuWindow = menu;
        menu.setHandler("useToken", () => {
            usePictureToken({ pictureId: picture._pictureId });
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("flip", () => {
            const wasBack = !canSeeCardFront(picture);
            if (picture._viewer &&
                (Number(picture._viewer) === currentViewerPcNumber() || isGm())) {
                picture._viewer = "";
                picture._isFlipped = true;
            } else {
                picture._isFlipped = !picture._isFlipped;
                if (wasBack) picture._publicViewAt = Date.now();
            }
            picture._name = cardImageName(picture);
            this._pictureName = "";
            if (wasBack) {
                reportNewCardInvestigation(picture);
                reportCardView(picture, "public");
            }
            syncCard(picture, true);
            playCardSE(picture._isFlipped ? picture._seToBack : picture._seToFront);
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("preview", () => {
            this.showPreview(cardImageName(picture));
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("rotate", () => {
            picture._angle = ((Number(picture.angle()) || 0) + 45) % 360;
            picture._rotationSpeed = 0;
            syncCard(picture, true);
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("publicView", () => {
            publishCard(picture);
            this._pictureName = "";
            playCardSE(picture._seToFront);
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("specialAction", () => {
            turnOnCardSwitch(picture, "_specialActionSwitch");
            const variableId = switchId(picture._specialActionVariable);
            if (variableId > 0) {
                $gameVariables.setValue(variableId, currentViewerPcNumber());
            }
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("privateView", () => {
            if (isNewCardInvestigationProhibited(picture)) {
                scene.removeChild(menu);
                scene._cardMenuWindow = null;
                return;
            }
            const myPcNumber = currentViewerPcNumber();
            if (myPcNumber) {
                picture._viewer = Number(myPcNumber);
                picture._name = cardImageName(picture);
                this._pictureName = "";
                reportNewCardInvestigation(picture);
                reportCardView(picture, "private");
                syncCard(picture, true);
            }
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("remove", () => {
            syncCardRemoval(picture);
            $gameScreen.erasePicture(picture._pictureId);
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        menu.setHandler("cancel", () => {
            scene.removeChild(menu);
            scene._cardMenuWindow = null;
        });
        scene.addChild(menu);
        menu.activate();
    };

    Sprite_Picture.prototype.showPreview = function(imageName) {
        const scene = SceneManager._scene;
        if (!_previewSprite) {
            _previewSprite = new Sprite();
            _previewSprite.anchor.set(0.5);
            scene.addChild(_previewSprite);
        }
        _previewSprite.bitmap = ImageManager.loadPicture(imageName);
        _previewSprite.bitmap.addLoadListener(() => {
            const bw = _previewSprite.bitmap.width; const bh = _previewSprite.bitmap.height;
            const maxWidth = Graphics.boxWidth * 0.9; const maxHeight = Graphics.boxHeight * 0.9;
            let scale = 1.0;
            if (bw > maxWidth || bh > maxHeight) scale = Math.min(maxWidth / bw, maxHeight / bh);
            _previewSprite.scale.set(scale);
            _previewSprite.move(Graphics.boxWidth / 2, Graphics.boxHeight / 2);
            _previewSprite.visible = true;
            if (_previewSprite.parent) _previewSprite.parent.removeChild(_previewSprite);
            scene.addChild(_previewSprite);
        });
    };

    Sprite_Picture.prototype.showTooltip = function() {
        if (!_tooltipWindow) return;
        const picture = this.picture();
        const rawText = picture._isFloating
            ? picture._floatingCaption
            : picture._isToken
                ? picture._tokenUsed ? picture._tokenUsedCaption : picture._tokenUnusedCaption
                : canSeeCardFront(picture) ? picture._frontCaption : picture._backCaption;
        const text = String(rawText || "").replace(/[￥¥](?=[A-Z]+\[|[{}])/gi, "\\");
        if (!text) {
            this.hideTooltip();
            return;
        }

        const fSize = picture._isFloating
            ? picture._floatingFontSize || 26
            : picture._fontSize || 26;

        // 元々の正常動作していた「介入処理」
        const originalReset = _tooltipWindow.resetFontSettings;
        _tooltipWindow.resetFontSettings = function() {
            originalReset.call(this);
            this.contents.fontSize = fSize;
        };

        const renderedText = _tooltipWindow.convertEscapeCharacters(text);
        if (_tooltipWindow._lastText !== renderedText) {
            _tooltipWindow.contents.clear();
            _tooltipWindow.contents.fontSize = fSize;
            const textSize = _tooltipWindow.textSizeEx(text);
            
            _tooltipWindow.width = textSize.width + _tooltipWindow.padding * 2 + 24;
            _tooltipWindow.height = textSize.height + _tooltipWindow.padding * 2 + 12;
            _tooltipWindow.createContents();
            
            const tx = (_tooltipWindow.contentsWidth() - textSize.width) / 2;
            const ty = (_tooltipWindow.contentsHeight() - textSize.height) / 2;
            
            _tooltipWindow.drawTextEx(text, tx, ty);
            _tooltipWindow._lastText = renderedText;
        }
        
        _tooltipWindow.resetFontSettings = originalReset;

        // 【修正の核心】位置計算：元々の動きを維持しつつ、左端・上端ガードを追加
        let tx = TouchInput.x + 16; 
        let ty = TouchInput.y + 16;

        if (tx + _tooltipWindow.width > Graphics.boxWidth) tx = TouchInput.x - _tooltipWindow.width - 16;
        if (tx < 0) tx = 0; // 左端防止
        if (ty + _tooltipWindow.height > Graphics.boxHeight) ty = TouchInput.y - _tooltipWindow.height - 16;
        if (ty < 0) ty = 0; // 上端防止

        _tooltipWindow.x = tx;
        _tooltipWindow.y = ty;
        _tooltipOwner = this;
        _tooltipWindow.show();
    };

    Sprite_Picture.prototype.hideTooltip = function() {
        if (_tooltipWindow && _tooltipWindow.visible && _tooltipOwner === this) {
            _tooltipWindow.hide();
            _tooltipWindow._lastText = "";
            _tooltipOwner = null;
        }
    };

    Sprite_Picture.prototype.moveToFront = function() {
        refreshCardOrder();
    };

    Sprite_Picture.prototype.isBeingTouched = function() {
        if (!this.bitmap) return false;
        const width = this.bitmap.width * this.scale.x;
        const height = this.bitmap.height * this.scale.y;
        const x = TouchInput.x - this.x; const y = TouchInput.y - this.y;
        const isInside = x >= -width * this.anchor.x && x < width * (1 - this.anchor.x) &&
            y >= -height * this.anchor.y && y < height * (1 - this.anchor.y);
        if (!isInside) return false;
        const picture = this.picture();
        if (!picture || !picture._transparentPixelsNoHit ||
            typeof this.bitmap.getAlphaPixel !== "function") return true;
        const scaleX = this.scale.x || 1;
        const scaleY = this.scale.y || 1;
        const bitmapX = Math.floor(x / scaleX + this.anchor.x * this.bitmap.width);
        const bitmapY = Math.floor(y / scaleY + this.anchor.y * this.bitmap.height);
        return this.bitmap.getAlphaPixel(bitmapX, bitmapY) > 0;
    };

})();

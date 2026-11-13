/*:
 * @target MZ
 * @plugindesc ピクチャのフローティング化と座標取得を追加します。
 * @author Shadowgenic & GitHub Copilot
 *
 * @command makeFloating
 * @text ピクチャをフローティングにする
 * @desc ピクチャをドラッグアンドドロップで移動できるフローティングピクチャにします。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc フローティングにするピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg transparentPixelsNoHit
 * @text 不透明度0のピクセルを当たり判定にしない
 * @desc ONにすると、画像の不透明度が0のピクセルをクリックやマウス操作の対象外にします。
 * @type boolean
 * @default false
 *
 * @arg caption
 * @text キャプション
 * @desc ピクチャにマウスを重ねた時に表示する説明文です。\V[n]や\N[n]などの制御文字を使用できます。
 * @type string
 *
 * @arg fontSize
 * @text 文字サイズ
 * @desc キャプションの文字サイズを指定します。
 * @type number
 * @default 26
 *
 * @arg maxLineChars
 * @text 一行の最大文字数
 * @desc キャプションを折り返す1行あたりの最大文字数です。
 * @type number
 * @min 1
 * @default 20
 *
 * @command getPicturePosition
 * @text ピクチャ座標を変数に代入
 * @desc 指定したピクチャの現在座標をゲーム変数に代入します。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc 座標を取得するピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg xVariableId
 * @text X座標の代入先変数
 * @desc ピクチャのX座標を代入するゲーム変数です。0で無効です。
 * @type variable
 * @default 1
 *
 * @arg yVariableId
 * @text Y座標の代入先変数
 * @desc ピクチャのY座標を代入するゲーム変数です。0で無効です。
 * @type variable
 * @default 2
 *
 * @command movePictureWithSkip
 * @text ピクチャを移動（入力で完了）
 * @desc ピクチャを移動し、ウェイト中に有効な入力があれば移動先まで即座に完了します。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @type number
 * @min 1
 * @default 1
 *
 * @arg origin
 * @text 原点
 * @type select
 * @option 左上
 * @value 0
 * @option 中央
 * @value 1
 * @default 0
 *
 * @arg coordinateType
 * @text 座標の指定方法
 * @type select
 * @option 直接指定
 * @value direct
 * @option 変数で指定
 * @value variable
 * @default direct
 *
 * @arg x
 * @text X座標
 * @type number
 * @min -9999
 * @default 0
 *
 * @arg y
 * @text Y座標
 * @type number
 * @min -9999
 * @default 0
 *
 * @arg xVariableId
 * @text X座標の変数
 * @type variable
 * @default 1
 *
 * @arg yVariableId
 * @text Y座標の変数
 * @type variable
 * @default 2
 *
 * @arg scaleX
 * @text 拡大率X
 * @desc 100で等倍です。
 * @type number
 * @min -2000
 * @default 100
 *
 * @arg scaleY
 * @text 拡大率Y
 * @desc 100で等倍です。
 * @type number
 * @min -2000
 * @default 100
 *
 * @arg opacity
 * @text 不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @arg blendMode
 * @text 合成方法
 * @type select
 * @option 通常
 * @value 0
 * @option 加算
 * @value 1
 * @option 乗算
 * @value 2
 * @option スクリーン
 * @value 3
 * @default 0
 *
 * @arg duration
 * @text 移動時間
 * @desc フレーム数です（60で約1秒）。
 * @type number
 * @min 1
 * @default 60
 *
 * @arg wait
 * @text 完了までウェイト
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @arg skipSwitchId
 * @text スキップ許可スイッチ
 * @desc 0なら常にスキップ可能です。1以上なら、指定スイッチがONのときだけスキップできます。
 * @type switch
 * @default 0
 *
 * @arg enableOk
 * @text OK入力を有効
 * @desc ONのとき、Enterまたは左クリックで移動を完了します。
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @arg enableCancel
 * @text Cancel入力を有効
 * @desc ONのとき、Escまたは右クリックで移動を完了します。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @arg easingType
 * @text イージング
 * @type select
 * @option 一定速度
 * @value 0
 * @option ゆっくり始まる
 * @value 1
 * @option ゆっくり終わる
 * @value 2
 * @option ゆっくり始まり終わる
 * @value 3
 * @default 0
 *
 * @command makeToken
 * @text ピクチャをトークンにする
 * @desc ピクチャを使用可能なトークンにします。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc トークンにするピクチャ番号です。
 * @type number
 * @default 1
 *
 * @arg usedImage
 * @text 使用後の画像
 * @desc トークンを使用した後に表示する画像です。
 * @type file
 * @dir img/pictures
 *
 * @arg unusedCaption
 * @text 使用前のキャプション
 * @desc 未使用時にトークンへマウスを重ねた時の説明です。空欄なら表示しません。
 * @type string
 * @default
 *
 * @arg usedCaption
 * @text 使用後のキャプション
 * @desc 使用後にトークンへマウスを重ねた時の説明です。空欄なら表示しません。
 * @type string
 * @default
 *
 * @arg rightClickEnabled
 * @text 右クリックメニューの使用可否
 * @desc ONにすると、所有PCが右クリックメニューからトークンを使用できます。
 * @type boolean
 * @on 使用可
 * @off 使用不可
 * @default true
 *
 * @arg ownerPcId
 * @text 所有PCの番号
 * @desc このトークンを使用できるPC番号です。0を指定すると全PCが使用できます。
 * @type number
 * @min 0
 * @default 0
 *
 * @arg movable
 * @text 移動可否
 * @desc ONにすると、トークンをドラッグアンドドロップで移動できます。
 * @type boolean
 * @on 移動可
 * @off 移動不可
 * @default true
 *
 * @command useToken
 * @text トークンを使う
 * @desc 指定した未使用トークンを使用し、使用後の画像へ変更します。
 *
 * @arg pictureId
 * @text ピクチャ番号
 * @desc 使用するトークンのピクチャ番号です。
 * @type number
 * @default 1
 *
 * @command countUnusedTokens
 * @text 未使用トークンの個数を数える
 * @desc 指定したPCが所有する未使用トークンの個数を変数へ代入します。
 *
 * @arg variableId
 * @text 代入先の変数
 * @desc 未使用トークン数を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg ownerPcId
 * @text PCのID
 * @desc 数える対象となるトークンの所有PC番号です。
 * @type number
 * @min 0
 * @default 0
 *
 * @command countUnusedTokensByVariable
 * @text 変数で指定したPCの未使用トークンの数を数える
 * @desc 指定変数に入っているPC IDが所有する未使用トークン数を変数へ代入します。
 *
 * @arg variableId
 * @text 代入先の変数
 * @desc 未使用トークン数を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg ownerPcVariableId
 * @text PCのIDを格納した変数
 * @desc 数える対象となるトークンの所有PC番号が入っているゲーム変数です。
 * @type variable
 * @default 1
 *
 * @command countAllUnusedTokens
 * @text 全員のトークンを数える
 * @desc 指定範囲の各PCが所有する未使用トークン数を、連番の変数へ代入します。
 *
 * @arg firstVariableId
 * @text 1人目の代入先の変数
 * @desc 初めのIDに対応する未使用トークン数を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg firstOwnerPcId
 * @text 初めのID
 * @desc 数えるPC ID範囲の先頭です。
 * @type number
 * @min 0
 * @default 1
 *
 * @arg lastOwnerPcId
 * @text 終わりのID
 * @desc 数えるPC ID範囲の末尾です。
 * @type number
 * @min 0
 * @default 1
 *
 * @command useOneToken
 * @text PCのトークンを1個使う
 * @desc 指定したPCが所有する未使用トークンから、優先順序に従って1個を使用します。
 *
 * @arg ownerPcId
 * @text PCのID
 * @desc 使用するトークンの所有PC番号です。
 * @type number
 * @min 0
 * @default 1
 *
 * @arg priority
 * @text 優先順序
 * @desc 使用するトークンの選択順序です。
 * @type select
 * @option IDの大きい方から
 * @value idDescending
 * @option IDの小さい方から
 * @value idAscending
 * @option 座標のX軸左から
 * @value xAscending
 * @option 座標のX軸右から
 * @value xDescending
 * @option 座標のY軸上から
 * @value yAscending
 * @option 座標のY軸下から
 * @value yDescending
 * @default idDescending
 *
 * @command useOneTokenByVariable
 * @text 変数で指定したPCのトークンを1個使う
 * @desc 指定変数に入っているPC IDの未使用トークンから、優先順序に従って1個を使用します。
 *
 * @arg ownerPcVariableId
 * @text PCのIDを格納した変数
 * @desc 使用するトークンの所有PC番号が入っているゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg priority
 * @text 優先順序
 * @desc 使用するトークンの選択順序です。
 * @type select
 * @option IDの大きい方から
 * @value idDescending
 * @option IDの小さい方から
 * @value idAscending
 * @option 座標のX軸左から
 * @value xAscending
 * @option 座標のX軸右から
 * @value xDescending
 * @option 座標のY軸上から
 * @value yAscending
 * @option 座標のY軸下から
 * @value yDescending
 * @default idDescending
 *
 * @command saveAllTokens
 * @text 全てのトークンを保存する
 * @desc 現在の全トークンの画像、使用状態、座標、設定を保存します。
 *
 * @arg saveId
 * @text 保存ID
 * @desc 保存データを識別するIDです。
 * @type string
 *
 * @command restoreAllTokens
 * @text 全てのトークンを復元する
 * @desc 指定した保存IDの全トークン状態を復元します。
 *
 * @arg saveId
 * @text 保存ID
 * @desc 復元する保存データのIDです。
 * @type string
 *
 * @help
 * 【使い方】対象ピクチャを表示後、「ピクチャをフローティングにする」でドラッグ可能にします。
 * 座標取得、トークン化・使用、未使用トークン数の取得は、それぞれ対応するプラグインコマンドを使用します。
 * ピクチャにドラッグ操作とキャプションを追加し、現在の座標を
 * ゲーム変数へ保存できるようにするプラグインです。
 *
 * ■ フローティングピクチャとは
 * イベントで表示したピクチャを、プレイヤーがゲーム画面上で
 * ドラッグアンドドロップして好きな位置へ移動できる状態にしたものです。
 * 盤面上のコマ、メモ、手がかりなどを参加者が動かす用途に使えます。
 *
 * ■ 必要なプラグイン
 * CardPicture.jsを有効にしてください。
 * プラグイン管理画面での配置順は問いません。
 *
 * ■ フローティングピクチャの作り方
 * 1. イベントコマンド「ピクチャの表示」で、対象のピクチャを表示します。
 * 2. 続けてプラグインコマンド「ピクチャをフローティングにする」を実行し、
 *    表示したピクチャ番号を指定します。
 * 3. ゲーム中、そのピクチャをドラッグアンドドロップで移動できます。
 *
 * キャプションには、ピクチャにマウスを重ねたときに表示する文章を設定します。
 * \V[n]（変数）や\N[n]（アクター名）などの制御文字も使用できます。
 * 「一行の最大文字数」で、キャプションのおおよその折り返し位置を指定します。
 *
 * フローティングピクチャの座標は、同じルームの参加者間で同期されます。
 * 通常の「ピクチャの消去」または同じ番号での「ピクチャの表示」を行うと、
 * フローティング状態は解除されます。
 *
 * ■ ピクチャ座標を変数に代入
 * プラグインコマンド「ピクチャ座標を変数に代入」を実行すると、指定した
 * ピクチャの現在のX座標・Y座標を、それぞれ指定したゲーム変数に保存します。
 *
 * フローティングピクチャ、カード、通常のピクチャのすべてで使用できます。
 * X座標またはY座標の代入先を0にすると、その座標は保存しません。
 * 指定した番号にピクチャが存在しない場合は、変数を変更しません。
 *
 * ■ ピクチャを移動（入力で完了）
 * 標準の「ピクチャの移動」と同じように移動します。
 * 完了までウェイトをONにすると、有効にしたOKまたはCancel入力で移動先まで即座に移動します。
 * スキップ許可スイッチを指定した場合、そのスイッチがONのときだけ入力で完了できます。
 */

(() => {
    'use strict';

    const pluginName = 'EnhancedPicture';

    function callCardPicture(method, args) {
        if (!window.CardPictureFloating || typeof window.CardPictureFloating[method] !== 'function') {
            console.warn('FloatingPicture: CardPicture.jsを有効にしてください。');
            return;
        }
        window.CardPictureFloating[method](args);
    }

    PluginManager.registerCommand(pluginName, 'makeFloating', args => {
        callCardPicture('makeFloating', args);
    });

    PluginManager.registerCommand(pluginName, 'getPicturePosition', args => {
        callCardPicture('storePosition', args);
    });

    function finishPictureMove(picture) {
        while (picture._duration > 0) {
            picture.updateMove();
        }
    }

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === 'enhancedPictureMove') {
            const picture = $gameScreen.picture(this._enhancedPictureMoveId);
            const skipEnabled = this._enhancedPictureMoveSkipSwitchId === 0 ||
                $gameSwitches.value(this._enhancedPictureMoveSkipSwitchId);
            const canFinishWithOk = skipEnabled && this._enhancedPictureMoveEnableOk && (
                Input.isTriggered('ok') || (typeof Einput_l_trig === 'function' && Einput_l_trig())
            );
            const canFinishWithCancel = skipEnabled && this._enhancedPictureMoveEnableCancel && (
                Input.isTriggered('cancel') || (typeof Einput_r_trig === 'function' && Einput_r_trig())
            );
            if (picture && picture._duration > 0 && (canFinishWithOk || canFinishWithCancel)) {
                finishPictureMove(picture);
            }
            if (picture && picture._duration > 0) return true;
            this._enhancedPictureMoveId = 0;
            this._enhancedPictureMoveSkipSwitchId = 0;
            this._waitMode = '';
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    PluginManager.registerCommand(pluginName, 'movePictureWithSkip', function(args) {
        const pictureId = Math.max(1, Number(args.pictureId || 1));
        const usesVariables = args.coordinateType === 'variable';
        const x = usesVariables ? $gameVariables.value(Number(args.xVariableId || 0)) : Number(args.x || 0);
        const y = usesVariables ? $gameVariables.value(Number(args.yVariableId || 0)) : Number(args.y || 0);
        $gameScreen.movePicture(
            pictureId, Number(args.origin || 0), x, y,
            Number(args.scaleX || 100), Number(args.scaleY || 100), Number(args.opacity || 255),
            Number(args.blendMode || 0), Math.max(1, Number(args.duration || 60)), Number(args.easingType || 0)
        );
        if (args.wait === 'true') {
            this._enhancedPictureMoveId = pictureId;
            this._enhancedPictureMoveSkipSwitchId = Math.max(0, Number(args.skipSwitchId || 0));
            this._enhancedPictureMoveEnableOk = args.enableOk !== 'false';
            this._enhancedPictureMoveEnableCancel = args.enableCancel === 'true';
            this.setWaitMode('enhancedPictureMove');
        }
    });

    PluginManager.registerCommand(pluginName, 'makeToken', args => {
        callCardPicture('makeToken', args);
    });

    PluginManager.registerCommand(pluginName, 'useToken', args => {
        callCardPicture('useToken', args);
    });

    PluginManager.registerCommand(pluginName, 'countUnusedTokens', args => {
        callCardPicture('countUnusedTokens', args);
    });

    PluginManager.registerCommand(pluginName, 'countUnusedTokensByVariable', args => {
        callCardPicture('countUnusedTokensByVariable', args);
    });

    PluginManager.registerCommand(pluginName, 'countAllUnusedTokens', args => {
        callCardPicture('countAllUnusedTokens', args);
    });

    PluginManager.registerCommand(pluginName, 'useOneToken', args => {
        callCardPicture('useOneToken', args);
    });

    PluginManager.registerCommand(pluginName, 'useOneTokenByVariable', args => {
        callCardPicture('useOneTokenByVariable', args);
    });

    PluginManager.registerCommand(pluginName, 'saveAllTokens', args => {
        callCardPicture('saveAllTokens', args);
    });

    PluginManager.registerCommand(pluginName, 'restoreAllTokens', function(args) {
        const restore = window.CardPictureFloating && window.CardPictureFloating.restoreAllTokens;
        const waitForRestore = window.CardPictureFloating && window.CardPictureFloating.waitForRestore;
        if (typeof restore !== 'function') {
            callCardPicture('restoreAllTokens', args);
            return;
        }
        const promise = restore(args);
        if (typeof waitForRestore === 'function') waitForRestore(this, promise);
    });
})();

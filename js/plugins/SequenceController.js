/*:
 * @target MZ
 * @plugindesc 連番画像をピクチャアニメーションとして再生します。
 * @author Shadowgenic & Google Gemini
 *
 * @help 連番の画像をアニメーションとして扱います。
 * 【使い方】連番画像を img/pictures/ に配置し、「連番アニメの再生」で先頭ファイル名・ピクチャ番号・座標・待機時間を指定します。
 * ブラウザ版では最大枚数を明示し、PC版では連番終端を自動検出できます。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 * PC版（テストプレイ）では自動で連番の終わりを検知します。
 *
 * 【使い方】
 * 1. `img/pictures/` に同じ名前と連番を持つ画像を配置します（例: `effect_001.png`）。
 * 2. 「連番アニメの再生」で先頭画像、ピクチャ番号、座標、ウェイト、ループ回数を指定します。
 * 3. `customWaits` はフレームごとの待ち時間を指定する場合に使用します。
 * 4. ブラウザ公開時に枚数を自動検知できない場合は `maxFrames` を指定します。
 * 5. `loopCount` は0で無限ループ、1で1周、2で2周です。有限回で終了した後の表示は `endDisplay` で指定します。
 *
 * @command play
 * @text 連番アニメの再生
 *
 * @arg pictureId
 * @type number @min 1 @max 100 @default 1
 * @text ピクチャ番号
 * @desc アニメーションを表示するピクチャ番号です。
 *
 * @arg file
 * @type file @dir img/pictures
 * @text 最初の画像を選択
 * @desc 連番画像の先頭ファイルです。ファイル名の番号部分から後続画像を検出します。
 *
 * @arg origin
 * @type select
 * @option 左上 @value 0 @option 中央 @value 1
 * @default 0
 * @text 原点
 * @desc ピクチャ座標を画像の左上基準と中央基準のどちらで扱うか指定します。
 *
 * @arg x
 * @type number @min -9999 @max 9999 @default 0
 * @text X座標
 * @desc アニメーションの表示X座標です。
 *
 * @arg y
 * @type number @min -9999 @max 9999 @default 0
 * @text Y座標
 * @desc アニメーションの表示Y座標です。
 *
 * @arg scaleX
 * @type number @min -2000 @max 2000 @default 100
 * @text 幅拡大率
 * @desc 画像の横方向の表示倍率をパーセントで指定します。
 *
 * @arg scaleY
 * @type number @min -2000 @max 2000 @default 100
 * @text 高さ拡大率
 * @desc 画像の縦方向の表示倍率をパーセントで指定します。
 *
 * @arg opacity
 * @type number @min 0 @max 255 @default 255
 * @text 不透明度
 * @desc アニメーションの不透明度を0から255で指定します。
 *
 * @arg blendMode
 * @type select
 * @option 通常 @value 0 @option 加算 @value 1 @option 乗算 @value 2 @option スクリーン @value 3
 * @default 0
 * @text 合成方法
 * @desc 画像を画面へ合成する方法を指定します。
 *
 * @arg defaultWait
 * @type number @min 1 @default 1
 * @text 基本ウェイト
 * @desc 各フレームを表示する基本待機フレーム数です。
 *
 * @arg customWaits
 * @type string
 * @text 個別ウェイト設定
 * @desc フレームごとの待機時間を指定する設定文字列です。空欄なら基本ウェイトを使います。
 *
 * @arg loopCount
 * @type number @min 0 @default 0
 * @text ループ回数
 * @desc 連番アニメーションを再生する周回数です。0なら無限ループ、1なら1周で終了します。
 *
 * @arg endDisplay
 * @type select
 * @option 消去 @value erase
 * @option 最初の画像 @value first
 * @option 最後の画像 @value last
 * @default last
 * @text 終了後の表示
 * @desc 指定した回数の再生後、ピクチャを消すか、最初または最後の画像を表示したままにするか選びます。
 *
 * @arg maxFrames
 * @type number @min 0 @default 0
 * @text 【ブラウザ用】最大枚数
 * @desc 0なら自動検知。Web公開時に止まる場合は枚数を入れてください。
 */

(() => {
    'use strict';

    const pluginName = "SequenceController";

    // PC環境（NW.js）でのみ動作する物理ファイルチェック
    const checkFile = function(baseName, index, digits) {
        if (!Utils.isNwjs()) return true; // ブラウザ版は判定不能のためスルー
        const fs = require('fs');
        const path = require('path');
        const dir = path.join(path.dirname(process.mainModule.filename), 'img/pictures/');
        const fileName = baseName + index.toString().padStart(digits, '0') + ".png";
        return fs.existsSync(dir + fileName);
    };

    PluginManager.registerCommand(pluginName, "play", args => {
        const picId = Number(args.pictureId);
        const fileName = args.file;
        if (!fileName) return;

        const match = fileName.match(/(.*?)(\d+)$/);
        if (!match) return;

        const baseName = match[1];
        const startIndex = parseInt(match[2]);
        const digits = match[2].length;

        let waitsArray = null;
        if (args.customWaits && args.customWaits.trim() !== "" && args.customWaits !== "[]") {
            const cleanStr = args.customWaits.replace(/[\[\]\s]/g, "");
            if (cleanStr) waitsArray = cleanStr.split(',').map(Number).filter(n => !isNaN(n));
        }

        // 初期表示（元のロジックのまま）
        $gameScreen.showPicture(
            picId, fileName, Number(args.origin), Number(args.x), Number(args.y),
            Number(args.scaleX), Number(args.scaleY), Number(args.opacity), Number(args.blendMode)
        );

        const picture = $gameScreen.picture(picId);
        if (picture) {
            picture._isSequence = true;
            picture._seqData = {
                baseName, startIndex, digits,
                defWait: Number(args.defaultWait),
                waitsArray,
                loopCount: Math.max(0, Math.floor(Number(args.loopCount || 0) || 0)),
                completedLoops: 0,
                endDisplay: ['erase', 'first', 'last'].includes(args.endDisplay) ? args.endDisplay : 'last',
                pictureId: picId,
                currentFrame: 0,
                tick: 0,
                maxFrames: Number(args.maxFrames || 0),
                finished: false
            };
        }
    });

    const _Game_Picture_update = Game_Picture.prototype.update;
    Game_Picture.prototype.update = function() {
        _Game_Picture_update.call(this);
        if (this._isSequence && this._seqData && !this._seqData.finished) {
            const d = this._seqData;
            if (d.pendingBitmap) {
                if (d.pendingBitmap.isError()) {
                    d.pendingBitmap = null;
                    d.pendingFrameName = '';
                    this.seqLoop(d);
                } else if (d.pendingBitmap.isReady()) {
                    this._name = d.pendingFrameName;
                    d.pendingBitmap = null;
                    d.pendingFrameName = '';
                }
                return;
            }
            const targetWait = (d.waitsArray && d.waitsArray[d.currentFrame] !== undefined) 
                               ? d.waitsArray[d.currentFrame] : d.defWait;

            d.tick++;
            if (d.tick >= targetWait) {
                d.tick = 0;
                const nextIdx = d.currentFrame + 1;

                // 1. 手動設定がある場合は、その枚数を超えたらループ
                if (d.maxFrames > 0 && nextIdx >= d.maxFrames) {
                    this.seqLoop(d);
                    return;
                }

                // 2. PC版なら次のファイルがあるか物理チェック（ここで暴走を止める）
                if (Utils.isNwjs() && !checkFile(d.baseName, d.startIndex + nextIdx, d.digits)) {
                    this.seqLoop(d);
                    return;
                }

                // 3. 次へ（通常の描画処理）
                d.currentFrame = nextIdx;
                const nextName = d.baseName + (d.startIndex + d.currentFrame).toString().padStart(d.digits, '0');
                
                // ブラウザ版のみ、存在確認できないのでロードしてエラーならループ
                if (!Utils.isNwjs()) {
                    const bitmap = ImageManager.loadPicture(nextName);
                    if (bitmap.isError()) {
                        this.seqLoop(d);
                        return;
                    }
                    if (!bitmap.isReady()) {
                        d.pendingBitmap = bitmap;
                        d.pendingFrameName = nextName;
                        return;
                    }
                }
                this._name = nextName;
            }
        }
    };

    Game_Picture.prototype.seqLoop = function(d) {
        d.completedLoops++;
        if (d.loopCount === 0 || d.completedLoops < d.loopCount) {
            d.currentFrame = 0;
            this._name = d.baseName + d.startIndex.toString().padStart(d.digits, '0');
        } else {
            d.finished = true;
            if (d.endDisplay === 'erase') {
                if ($gameScreen.picture(d.pictureId) === this) {
                    $gameScreen.erasePicture(d.pictureId);
                }
            } else if (d.endDisplay === 'first') {
                this._name = d.baseName + d.startIndex.toString().padStart(d.digits, '0');
            }
        }
    };
})();

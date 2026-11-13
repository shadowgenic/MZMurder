/*:
 * @target MZ
 * @plugindesc 指定した番号範囲のピクチャを一括消去します。
 * @author Shadowgenic & Google Gemini
 * 
 * @help 連番のピクチャを一括で消去するプラグインです。
 * 【使い方】イベントから「ピクチャ範囲消去」を実行し、消去するピクチャ番号の開始と終了を指定します。
 * 開始番号から終了番号までを含む範囲のピクチャを順番に消去します。
 *
 * 【使い方】
 * イベントのプラグインコマンド「ピクチャ範囲消去」で開始番号と終了番号を指定します。
 * 例: 1から10を指定すると、ピクチャ1～10をすべて消去します。開始番号が終了番号より大きい場合は何もしません。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @command eraseRange
 * @text ピクチャ範囲消去
 * @desc 指定した範囲の番号のピクチャをすべて消去します。
 *

 * @arg startId
 * @text 開始番号
 * @desc 消去するピクチャの開始番号（半角数字）
 * @type number
 * @min 1
 * @max 100
 * @default 1
 *
 * @arg endId
 * @text 終了番号
 * @desc 消去するピクチャの終了番号（半角数字）
 * @type number
 * @min 1
 * @max 100
 * @default 10
 */

(() => {
    'use strict';
    const pluginName = 'ErasePictures';

    PluginManager.registerCommand(pluginName, 'eraseRange', args => {
        const startId = parseInt(args.startId, 10);
        const endId = parseInt(args.endId, 10);

        // 不正な値のチェック（開始が終了より大きい場合は処理しない）
        if (isNaN(startId) || isNaN(endId) || startId > endId) {
            return;
        }

        // 指定された範囲のピクチャを消去
        for (let i = startId; i <= endId; i++) {
            $gameScreen.erasePicture(i);
        }
    });
})();
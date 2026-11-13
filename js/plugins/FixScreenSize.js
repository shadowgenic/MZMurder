/*:
 * @target MZ
 * @plugindesc 画面のアスペクト比を保った自動拡縮と入力座標の補正を行います。
 * @author Shadowgenic & Google Gemini
 * 
 * @help
 * 【使い方】プラグイン管理で有効化するだけで、画面をアスペクト比を維持して自動拡縮し、入力座標も補正します。
 * プラグインコマンドや設定項目はありません。
 * ゲーム画面をブラウザまたはウィンドウのサイズに合わせて拡大・縮小します。
 * 基準画面のアスペクト比を維持し、余った領域がある場合はゲームを中央に配置します。
 * 同時にマウスとタッチ入力の座標を実画面の倍率からゲーム座標へ補正します。
 * プラグインコマンドと設定項目はありません。
 *
 * 【使い方】
 * プラグイン管理画面で有効にしてください。画面サイズを変更すると次の描画更新で倍率が再計算されます。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 */

(() => {
    'use strict';

    // 画面要素全体の更新処理を拡張
    const _Graphics_updateAllElements = Graphics._updateAllElements;
    Graphics._updateAllElements = function() {
        _Graphics_updateAllElements.call(this);
        this._updateRealScale(); // スケールをウィンドウに合わせる
    };

    // マウス・タッチ座標計算の基準となるスケール値を書き換え
    Graphics._updateRealScale = function() {
        if (this._canvas) {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const gameWidth = this._width;
            const gameHeight = this._height;

            // アスペクト比を維持した拡大率を計算
            const scale = Math.min(screenWidth / gameWidth, screenHeight / gameHeight);

            // 表示上のサイズを変更
            this._canvas.style.width = (gameWidth * scale) + "px";
            this._canvas.style.height = (gameHeight * scale) + "px";

            // ★重要：MZ内部のスケール変数（_realScale）を更新
            // これによりマウス座標のズレが修正されます
            this._realScale = scale;

            // 中央寄せ
            this._canvas.style.margin = "auto";
            this._canvas.style.position = "absolute";
            this._canvas.style.top = "0";
            this._canvas.style.left = "0";
            this._canvas.style.right = "0";
            this._canvas.style.bottom = "0";
        }
    };
})();
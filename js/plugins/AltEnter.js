/*:
 * @target MZ
 * @plugindesc Alt+EnterまたはF4でゲーム画面をフルスクリーン表示に切り替えます。
 * @author Shadowgenic & Google Gemini
 * 
 * @help
 * 【使い方】プラグイン管理で有効化した後、ゲーム中にAlt+EnterまたはF4を押してフルスクリーンを切り替えます。
 * プラグインコマンドや設定項目はありません。
 * Alt+Enterを押すと、RPG Maker MZ標準のフルスクリーン切替を実行します。
 * F4による切替は標準動作のまま利用できます。プラグインコマンドはありません。
 * ブラウザの仕様により、最初の切替時にユーザー操作の許可が必要になる場合があります。
 *
 * 【使い方】
 * 1. プラグインを有効にしてゲームを起動します。
 * 2. ゲーム中にAlt+Enterを押して、ウィンドウ表示と全画面表示を切り替えます。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 */


(() => {
    'use strict';

    // 1. 低レベルの入力判定で Alt+Enter を無視させる
    const _Input_onKeyDown = Input._onKeyDown;
    Input._onKeyDown = function(event) {
        // Alt + Enter の場合は Input クラスにキー入力を記録させない
        if (event.altKey && event.key === "Enter") {
            return; 
        }
        _Input_onKeyDown.call(this, event);
    };

    // 2. SceneManager側でフルスクリーン切り替えだけを実行する
    const _SceneManager_onKeyDown = SceneManager.onKeyDown;
    SceneManager.onKeyDown = function(event) {
        if (event.altKey && event.key === "Enter") {
            Graphics._switchFullScreen();
            event.preventDefault();
            return;
        }
        _SceneManager_onKeyDown.call(this, event);
    };
})();
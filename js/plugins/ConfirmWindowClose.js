/*:
 * @target MZ
 * @plugindesc PC版でウィンドウを閉じるとき、終了確認を表示します。
 * @author Shadowgenic
 *
 * @param confirmMessage
 * @text 終了確認の文章
 * @desc ウィンドウの閉じるボタンを押したときに表示する確認文です。
 * @type string
 * @default ゲームを終了しますか？
 *
 * @help
 * PC版（NW.js）のウィンドウで閉じるボタンを押すと、終了確認を表示します。
 * 「キャンセル」ならゲームを続け、「OK」なら終了します。
 * ツクールMZ標準の強制終了処理を置き換えるため、プラグイン管理で有効化してください。
 * ブラウザ版のページ終了確認はDisableFunctionが担当します。
 */

(() => {
    "use strict";

    if (!Utils.isNwjs() || typeof nw === "undefined") return;

    const pluginName = "ConfirmWindowClose";
    const params = PluginManager.parameters(pluginName);
    const message = params.confirmMessage || "ゲームを終了しますか？";
    const gameWindow = nw.Window.get();

    // MZ標準のcloseリスナーは確認なしでnw.App.quit()を呼ぶため、ここで置き換えます。
    gameWindow.removeAllListeners("close");
    gameWindow.on("close", () => {
        if (window.confirm(message)) {
            nw.App.quit();
        }
    });
})();

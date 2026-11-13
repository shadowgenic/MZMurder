/*:
 * @target MZ
 * @plugindesc F5キーによるリロードを禁止し、ブラウザ版の終了時に確認を表示します。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】プラグイン管理で有効化するとF5キーの再読み込みを無効化します。
 * 誤操作によるセッション切断を防ぐ用途です。プラグインコマンドはありません。
 * F5キーの既定動作であるブラウザの再読み込みを抑止します。
 * 誤操作によるゲーム状態の初期化や、オンラインルームからの切断を防ぐためのプラグインです。
 * ブラウザ版でページを閉じる、または再読み込みする際は、ブラウザ標準の確認ダイアログを表示します。
 * PC版のウィンドウを閉じる際の確認にはConfirmWindowCloseを使用します。
 * プラグインコマンドと設定項目はありません。
 *
 * 【使い方】
 * プラグイン管理画面で有効にしてください。ページの再読み込みが必要な場合はブラウザのメニューを使用します。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 */

(() => {
    SceneManager.reloadGame = function() {};

    document.addEventListener('keydown', (event) => {
        if (event.key === 'F5' || event.keyCode === 116) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    if (!Utils.isNwjs()) {
        window.addEventListener('beforeunload', event => {
            event.preventDefault();
            event.returnValue = '';
        });
    }
})();

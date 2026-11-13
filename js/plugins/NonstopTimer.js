/*:
 * @target MZ
 * @plugindesc メニュー画面を開いている間もタイマーを更新するか制御します。
 * @author Shadowgenic & Google Gemini
 * 
 * @param defaultEnabled
 * @text 初期状態でメニュー内更新
 * @desc ONにするとゲーム開始時からメニュー画面でもタイマーが動きます。
 * @type boolean
 * @default true
 * 
 * @help
 * 【使い方】defaultEnabledで開始時の動作を設定し、ゲーム中は「メニュー内タイマー更新の許可/禁止」で切り替えます。
 * メニュー画面を開いている間のタイマーの挙動を制御します。
 * 初期状態は `defaultEnabled` で指定し、イベント中は「メニュー内タイマーの更新の許可/禁止」で切り替えます。
 *
 * 【使い方】
 * 1. メニュー中もタイマーを進めたい場合は `defaultEnabled` をONにします。
 * 2. 特定の場面だけ停止する場合は、イベントでコマンドをOFFにします。
 * 3. 再開するときは同じコマンドにONを指定します。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 * 
 * @command setMenuTimer
 * @text メニュー内タイマー更新の許可/禁止
 * @desc メニュー画面でタイマーを動かすかどうかを切り替えます。
 * @arg enabled
 * @text タイマー更新
 * @desc ONならメニュー内でも動く、OFFならメニュー内では停止します。
 * @type boolean
 * @default true
 * 
 */

(() => {
    'use strict';
    const pluginName = "NonstopTimer";
    const legacyPluginName = "MenuTimerControl";
    const parameters = Object.assign({}, PluginManager.parameters(legacyPluginName), PluginManager.parameters(pluginName));
    const defaultEnabled = parameters['defaultEnabled'] === 'true';

    // セーブデータに状態を保持
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._menuTimerEnabled = defaultEnabled;
    };

    // 更新有効フラグのゲッター
    Game_System.prototype.isMenuTimerEnabled = function() {
        if (this._menuTimerEnabled === undefined) return defaultEnabled;
        return this._menuTimerEnabled;
    };

    // メニューシーンの更新処理を拡張
    const _Scene_Menu_update = Scene_Menu.prototype.update;
    Scene_Menu.prototype.update = function() {
        _Scene_Menu_update.call(this);

        // 機能が有効かつタイマーが作動中の場合
        if ($gameSystem.isMenuTimerEnabled() && $gameTimer.isWorking()) {
            $gameTimer.update(true); 

            // 0秒になった瞬間にメニューを強制的に閉じてマップへ戻る
            if ($gameTimer._frames <= 0) {
                SceneManager.pop(); 
            }
        }
    };

    // プラグインコマンドの登録
    const setMenuTimer = args => {
        $gameSystem._menuTimerEnabled = (args.enabled === 'true');
    };
    PluginManager.registerCommand(pluginName, "setMenuTimer", setMenuTimer);
    PluginManager.registerCommand(legacyPluginName, "setMenuTimer", setMenuTimer);

})();

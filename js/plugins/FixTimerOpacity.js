/*:
 * @target MZ
 * @plugindesc 画面タイマーの初期透明度と実行中の透明度を制御します。
 * @author Shadowgenic & Google Gemini
 * 
 * @param defaultOpacity
 * @text デフォルト透明度
 * @desc 起動時のタイマーの透明度を指定します（0〜255）。0で完全透明。
 * @type number
 * @min 0
 * @max 255
 * @default 0
 * 
 * @help
 * 【使い方】defaultOpacityで開始時の透明度を設定し、ゲーム中は「タイマー透明度変更」で数値を指定して変更します。
 * 画面右上などに表示されるRPG Maker MZのタイマーの不透明度を変更します。
 * `defaultOpacity` はゲーム開始時およびタイマー表示時の透明度です。0は完全透明、255は完全不透明です。
 *
 * 【使い方】
 * 1. `defaultOpacity` をプラグインパラメータで設定します。
 * 2. 実行中に「タイマー透明度変更」コマンドを呼び出し、0～255の値を指定します。
 * 3. タイマーを再表示した場合も、最後に設定した透明度が適用されます。
  
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 * 
 * @command setOpacity
 * @text タイマー透明度変更
 * @desc タイマーの透明度を即座に変更します。
 * 
 * @arg opacity
 * @text 透明度
 * @desc 変更後の透明度（0〜255）
 * @type number
 * @min 0
 * @max 255
 * @default 255
 */

(() => {
    'use strict';
    const pluginName = "FixTimerOpacity";
    const legacyPluginName = "TimerOpacityControl";
    const parameters = Object.assign({}, PluginManager.parameters(legacyPluginName), PluginManager.parameters(pluginName));
    const defaultOpacity = Number(parameters['defaultOpacity'] || 0);

    // セーブデータに透明度を保持させるための拡張
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._timerOpacity = defaultOpacity;
    };

    Game_System.prototype.timerOpacity = function() {
        if (this._timerOpacity === undefined) return defaultOpacity;
        return this._timerOpacity;
    };

    Game_System.prototype.setTimerOpacity = function(value) {
        this._timerOpacity = value.clamp(0, 255);
    };

    // スプライトへの反映
    const _Sprite_Timer_update = Sprite_Timer.prototype.update;
    Sprite_Timer.prototype.update = function() {
        _Sprite_Timer_update.call(this);
        this.opacity = $gameSystem.timerOpacity();
    };

    // プラグインコマンドの登録
    const setOpacity = args => {
        const opacity = Number(args.opacity);
        $gameSystem.setTimerOpacity(opacity);
    };
    PluginManager.registerCommand(pluginName, "setOpacity", setOpacity);
    PluginManager.registerCommand(legacyPluginName, "setOpacity", setOpacity);

})();

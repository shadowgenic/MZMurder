/*:
 * @target MZ
 * @plugindesc ButtonSet画像からメニューボタンを切り出し、幅と倍率を調整します。
 * @author Shadowgenic & Google Gemini
 * 
 * @help
 * 【使い方】ボタン画像を img/system/ButtonSet.png に用意し、開始位置・切り出し幅・拡大倍率をパラメータで設定します。
 * 有効化するとメニューのボタンに設定が反映されます。プラグインコマンドはありません。
 * `img/system/ButtonSet.png` の指定位置からメニューボタンを切り出して表示します。
 * 標準の1枚分だけでなく、横方向に複数枚分を連結したボタンにも対応します。
 * `buttonIndex` は画像内の開始位置、`buttonWidthCount` は切り出す枚数、`buttonScale` は表示倍率です。
 * 
 * 【設定の目安】
 * ・ボタンのインデックス: 0から数えて何番目から開始するか（10枚目なら9）
 * ・ボタンの切り出し幅: 何枚分のアイコンを1つのボタンにするか（2枚分なら2）
 *
 * 【使い方】
 * 1. `img/system/ButtonSet.png` に使用するボタン画像を48px単位で配置します。
 * 2. プラグインパラメータで開始位置と幅を指定します。インデックスは0から数えます。
 * 3. ゲーム画面右上のメニューボタンをクリックして、表示と当たり判定を確認します。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 * 
 * @param buttonScale
 * @text ボタン拡大倍率
 * @desc メニューボタンの大きさを倍率で指定します（1.0 = 等倍）。
 * @type number
 * @decimals 1
 * @default 1.0
 * 
 * @param buttonIndex
 * @text ボタンの開始インデックス
 * @desc ButtonSet内の何番目から使うか（0から数えて10番目なら9）。
 * @type number
 * @default 9
 * 
 * @param buttonWidthCount
 * @text ボタンの切り出し幅
 * @desc 何枚分のアイコン（48px単位）を1つのボタンとして使うか。
 * @type number
 * @default 2
 */

(() => {
    'use strict';

    const pluginName = "CustomMenuButton";
    const parameters = PluginManager.parameters(pluginName);
    const buttonScale = Number(parameters['buttonScale'] || 1.0);
    const buttonIndex = Number(parameters['buttonIndex'] || 9);
    const buttonWidthCount = Number(parameters['buttonWidthCount'] || 2);

    // 1. ボタンの開始位置(x)と、使用する枚数(w)をパラメータから反映
    const _Sprite_Button_buttonData = Sprite_Button.prototype.buttonData;
    Sprite_Button.prototype.buttonData = function() {
        const data = _Sprite_Button_buttonData.call(this);
        if (this._buttonType === "menu") {
            return { x: buttonIndex, w: buttonWidthCount };
        }
        return data;
    };

    // 2. 当たり判定（クリック範囲）のサイズを幅に合わせて計算
    const _Scene_Map_menuButtonRect = Scene_Map.prototype.menuButtonRect;
    Scene_Map.prototype.menuButtonRect = function() {
        const rect = _Scene_Map_menuButtonRect.call(this);
        const baseSize = 48; // ツクールの標準サイズ
        
        // 横幅 = (48px × 使用枚数) × 拡大倍率
        rect.width = Math.floor(baseSize * buttonWidthCount * buttonScale);
        // 縦幅 = 48px × 拡大倍率
        rect.height = Math.floor(baseSize * buttonScale);
        
        // 右端からの位置を調整
        rect.x = Graphics.boxWidth - rect.width - 4;
        return rect;
    };

    // 3. 表示グラフィックの拡大とボケ防止
    const _Sprite_Button_setupFrame = Sprite_Button.prototype.setupFrame;
    Sprite_Button.prototype.setupFrame = function() {
        _Sprite_Button_setupFrame.call(this);
        if (this._buttonType === "menu") {
            this.scale.x = buttonScale;
            this.scale.y = buttonScale;
            if (this.bitmap) this.bitmap.smooth = false;
        }
    };

})();

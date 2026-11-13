/*:
 * @target MZ
 * @plugindesc マップクリックによる目的地移動と標準メニュー呼び出しを無効化します。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】プラグイン管理で有効化するだけで、マップのクリック移動と標準メニュー呼び出しを無効化します。
 * 独自の操作UIを使うゲームで有効にします。プラグインコマンドはありません。
 * RPGツクールの標準機能であるマップ上の左クリックによる目的地設定を無効化し、クリックでプレイヤーが歩かないようにします。
 * 右クリック由来の標準メニュー呼び出しも停止します。独自UIで操作するゲーム向けです。
 * プラグインコマンドと設定項目はありません。
 *
 * 【使い方】
 * プラグイン管理画面で有効にしてください。クリック入力を利用する独自UIは、このプラグインより後に読み込むか、UI側で処理します。
 * 【開発指示書 要件：クリック移動無効 への対応】
 *  マップ上での左クリックによる移動（目的地設定）を完全に遮断します。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 */

(() => {
    'use strict';

    window.Madamis_NoClickMove = true;

    // 1. 移動関連の完全遮断
    // 目的地設定のエフェクト（白いひし形）を物理的に消す
    Game_Temp.prototype.setDestination = function(x, y) {
        return;
    };

    // 2. マップタッチ処理の上書き
    // Madamis側と競合しないよう、中身を空にして移動を完全に阻止する
    const noClickMoveProcessMapTouch = function() {
        // 右クリックを検知した瞬間にクリアすることで、暗転（メニュー準備）を阻止
        if (Einput_r_trig()) {
            TouchInput.clear();
        }
        // ここで何も処理しない（callもしない）ことで、クリック移動が完全に止まります
    };
    window.Madamis_NoClickMoveProcessMapTouch = noClickMoveProcessMapTouch;
    Scene_Map.prototype.processMapTouch = function() {
        if (typeof window.Madamis_CoreUIProcessMapTouch === 'function') {
            window.Madamis_CoreUIProcessMapTouch(this);
            return;
        }
        noClickMoveProcessMapTouch.call(this);
    };

    // 3. 標準メニュー呼び出しを常に禁止（暗転防止のダメ押し）
    Scene_Map.prototype.isMenuCalled = function() {
        return false;
    };

    Scene_Map.prototype.isMenuEnabled = function() {
        return false;
    };

})();
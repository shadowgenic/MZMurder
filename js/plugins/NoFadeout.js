/*:
 * @target MZ
 * @plugindesc 場所移動時の暗転フェードを無効化し、マップを即時切り替えます。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】プラグイン管理で有効化するだけで、場所移動時のフェードを省略します。
 * 移動演出に標準フェードが必要な場合は無効化してください。プラグインコマンドはありません。
 * 場所移動時に実行されるフェードアウトとフェードインをスキップします。
 * マップ切替時の暗転をなくし、オンラインゲームや盤面型UIで画面を連続表示したい場合に使用します。
 * プラグインコマンドと設定項目はありません。
 *
 * 【使い方】
 * プラグイン管理画面で有効にしてください。移動演出としてフェードを使う場合は、このプラグインを無効にします。
 * 場所移動（Scene_MapからScene_Mapへの遷移）に伴う
 * 画面のフェードアウトおよびフェードイン処理をスキップし、
 * マップを即座に切り替えます。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 */

(() => {
    'use strict';

    // 1. 場所移動開始時のフェードアウト演出をスキップ
    Scene_Map.prototype.fadeOutForTransfer = function() {
        // 標準ではここで画面を暗くする処理が走りますが、
        // 何もせずに終了（terminate）へ移行させます。
        this.terminate(); 
    };

    // 2. 場所移動完了後のフェードイン演出をスキップ
    Scene_Map.prototype.fadeInForTransfer = function() {
        // 移動後の暗転解除待ちをスキップします。
    };

    // 3. 移動実行時のフェードタイプを強制的に「なし」に固定
    // （イベントコマンドで「フェード：黒/白」が指定されていても無視します）
    const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        if (this.isTransferring()) {
            this._fadeType = 2; // 0:黒, 1:白, 2:なし
        }
        _Game_Player_performTransfer.call(this);
    };

})();
/*:
 * @target MZ
 * @plugindesc PC登録者の完了報告を待ち、観戦者も含めて全員を予約したマップへ移動させます。
 * @author Shadowgenic & Gemini
 *
 * @help MZ_Murderでは各マップを1シーンとして扱います。
 * 【使い方】GM側で「一斉移動の予約」を実行して移動先を設定し、各参加者のイベントで「完了報告」を実行します。
 * membersの中でPC番号が登録されている参加者の報告が揃うと、観戦者も含めて自動移動します。FirebaseSync.jsを有効にしてください。
 * 全員の処理が完了した後、次のマップへ飛ぶためのプラグインです。
 * GMがあらかじめ移動先を予約し、各プレイヤーのイベント処理完了をFirebase上で集計してから全員を移動させます。
 * 動作には `FirebaseSync.js` が必要で、GM権限スイッチを正しく設定してください。
 *
 * 【使い方】
 * 1. GM側で「一斉移動先の予約」を実行し、移動先マップを指定します。
 *    これは次のシーンが決まったらできるだけ早めに実行します。
 *    2.までに必ず数秒以上の時間を確保し、先に2.が行われることがないようにしてください。
 * 2. 各プレイヤーのイベント処理が終わったら「完了報告」を実行します。
 * 3. 全員の報告後、保存済みのマップへ移動します。
 * 4. 必要な場合は「保存されたマップへ移動」で自分だけ移動します。
 * 動作にはFirebaseSync.jsが必要です。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @command SetTransferReservation
 * @text 一斉移動の予約
 * @arg mapId
 * @text 移動先マップ
 * @desc 全員が完了した後に移動するマップ番号です。
 * @type map
 *
 * @command CompleteEvent
 * @text 完了報告
 *
 * @command FixCurrentMemberCount
 * @text 現在のPC参加者数を固定する
 * @desc 現在のmembersのうちPC番号が登録された人数を、以後の完了待ち人数として固定します。GMのみ実行できます。
 *
 * @command TransferToLastSystemMap
 * @text 保存されたマップへ移動（自分のみ）
 * @desc system/lastMapId に保存されているマップへ自分だけ移動します。
 */
(() => {
    'use strict';
    const script = "SyncMapTransfer";
    const firebaseParams = PluginManager.parameters('FirebaseSync');
    const GM_SW = Number(firebaseParams.gmOnlySwitchId || 0);

    function activePcMemberUids(room) {
        const members = Object.keys(room?.members || {});
        const pcData = Object.entries(room?.pc_data || {});
        return members.filter(uid => pcData.some(([pcId, pc]) =>
            Number(pcId) > 0 && pc?.uid === uid));
    }

    // 一斉移動の予約（タイムスタンプ付き）
    PluginManager.registerCommand(script, "SetTransferReservation", args => {
        if (!$gameSwitches.value(GM_SW)) return;
        const targetId = Number(args.mapId);
        if (typeof OnlineManager !== 'undefined' && OnlineManager.reserveTransfer && OnlineManager.roomRef) {
            OnlineManager.roomRef.child('pc_data').once('value').then(snapshot => {
                const pcData = snapshot.val();
                const resetTasks = [];
                if (pcData) {
                    Object.keys(pcData).forEach(pcId => {
                        resetTasks.push(OnlineManager.roomRef.child(`pc_data/${pcId}/completed`).remove());
                    });
                }
                return Promise.all(resetTasks).then(() => {
                    OnlineManager.reserveTransfer({
                        targetMapId: targetId,
                        sourceMapId: $gameMap.mapId(),
                        at: Date.now()
                    });
                });
            }).catch(error => console.warn('SyncMapTransfer: 移動予約の準備に失敗しました。', error));
        }
    });

    PluginManager.registerCommand(script, "CompleteEvent", () => {
        if (typeof OnlineManager !== 'undefined' && OnlineManager.setCompleteMap) {
            OnlineManager.setCompleteMap($gameMap.mapId()).catch(error =>
                console.warn('SyncMapTransfer: 完了報告に失敗しました。', error));
        }
    });

    PluginManager.registerCommand(script, "FixCurrentMemberCount", () => {
        if (!$gameSwitches.value(GM_SW)) return;
        if (typeof OnlineManager === 'undefined' || !OnlineManager.roomRef) return;

        OnlineManager.roomRef.once('value').then(snapshot => {
            const room = snapshot.val();
            const fixedMemberCount = activePcMemberUids(room).length;
            OnlineManager.roomRef.child('system/fixedMemberCount').set(fixedMemberCount);
        }).catch(error => console.warn('SyncMapTransfer: 人数の固定に失敗しました。', error));
    });

    PluginManager.registerCommand(script, "TransferToLastSystemMap", () => {
        if (typeof OnlineManager !== 'undefined' && OnlineManager.systemRef) {
            OnlineManager.systemRef.child('lastMapId').once('value').then(snapshot => {
                const lastMapId = snapshot.val();
                if (lastMapId) {
                    $gamePlayer.reserveTransfer(Number(lastMapId), 0, 0, 0, 0);
                }
            });
        }
    });

    // 監視ロジック
    let _localExecutedTransferAt = 0; // 自分が処理済みの移動予約タイムスタンプ

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (Graphics.frameCount % 30 === 0 && typeof OnlineManager !== 'undefined' && OnlineManager.roomRef) {
            OnlineManager.roomRef.once('value').then(snapshot => {
                const room = snapshot.val();
                if (!room || !room.system) return;

                const system = room.system;
                const res = system.transfer;

                // -----------------------------------------------------------
                // 【A】GM（親機）の処理：接続中のPC登録者の完了報告を集計する
                // -----------------------------------------------------------
                if ($gameSwitches.value(GM_SW)) {
                    if (res && res.sourceMapId === $gameMap.mapId() && res.at !== _localExecutedTransferAt) {
                        const pcMemberUids = activePcMemberUids(room);
                        const requiredPlayers = Number.isInteger(system.fixedMemberCount)
                            ? system.fixedMemberCount
                            : pcMemberUids.length;
                        const pcData = Object.values(room.pc_data || {});
                        const readyCount = pcMemberUids.filter(uid => pcData.some(pc =>
                            pc?.uid === uid && pc.completed === $gameMap.mapId()
                        )).length;

                        // 全員揃ったら、GMが「確定移動先」をFirebaseの共有領域に書き込む
                        if (requiredPlayers > 0 && readyCount >= requiredPlayers) {
                            _localExecutedTransferAt = res.at; // GM自身の実行済みマーク
                            
                            if (OnlineManager.systemRef) {
                                // 1. 移動先マップIDを保存（これが全員への合図になる）
                                OnlineManager.systemRef.child('lastMapId').set(res.targetMapId);
                                // 2. 現在の移動世代(at)を共有トリガーとして書き込む
                                OnlineManager.systemRef.child('moveTriggerAt').set(res.at);
                            }
                            // GM自身も移動
                            $gamePlayer.reserveTransfer(res.targetMapId, 0, 0, 0, 0);
                        }
                    }
                } 
                // -----------------------------------------------------------
                // 【B】一般プレイヤー（子機）の処理：GMが立てたフラグ（合図）だけを見る
                // -----------------------------------------------------------
                else {
                    // GMが発行した移動トリガーが存在し、かつ自分がまだ未処理の世代の場合
                    if (system.moveTriggerAt && system.moveTriggerAt !== _localExecutedTransferAt) {
                        const destinationMapId = Number(system.lastMapId);
                        
                        if (destinationMapId && destinationMapId !== $gameMap.mapId()) {
                            _localExecutedTransferAt = system.moveTriggerAt; // 自分も実行済みマーク
                            
                            // GMが用意した lastMapId へジャンプする
                            $gamePlayer.reserveTransfer(destinationMapId, 0, 0, 0, 0);
                        }
                    }
                }

            });
        }
    };
})();

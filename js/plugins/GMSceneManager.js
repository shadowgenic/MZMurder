/*:
 * @target MZ
 * @plugindesc GMがマップツリーから全プレイヤーを同じマップへ強制移動させます。
 * @author Shadowgenic & Google Gemini
 *
 * @param SceneVarId
 * @text 遷移先マップID変数
 * @desc GMが選択した移動先マップIDを一時保存する変数番号です。
 * @type variable
 * @default 0
 *
 * @param ForceMoveSwitchId
 * @text 強制移動トリガースイッチ
 * @desc 全員を強制移動させる処理中であることを示すスイッチ番号です。
 * @type switch
 * @default 0
 *
 * @param GmSceneIcon
 * @text GM用画面アイコン
 * @desc GM用画面を開くボタンに表示する画像です。
 * @type file
 * @dir img/icon/
 * @default Scene
 *
 * @command moveAllPlayers
 * @text 全員を指定マップへ移動
 * @arg mapId
 * @text 移動先マップID
 * @desc 全プレイヤーを移動させる対象のマップ番号です。
 * @type number
 * @default 1
 *
 * @help
 * 【使い方】GM権限を持つPCでGM画面を開き、マップツリーから移動先を選びます。
 * イベントで移動させる場合は「全員を指定マップへ移動」を実行します。オンライン利用にはFirebaseSync.jsが必要です。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 * GM権限を持つプレイヤーだけにGM用画面ボタンを表示し、登録済みマップのツリーを開きます。
 * マップを選ぶと確認後、Firebaseの共有領域へ移動先を通知し、GM自身も同じマップへ移動します。
 * 強制移動中は通常のイベント処理とメッセージを抑制し、移動完了後に通常状態へ戻します。
 * `FirebaseSync` と同じルームID変数を使用するため、オンラインゲームでは同時に有効化してください。
 *
 * 【使い方】
 * 1. FirebaseSyncの「GM専用スイッチ」をGM権限スイッチに設定します。
 * 2. GM用画面ボタンを押し、マップツリーから移動先を選びます。
 * 3. 全員を指定マップへ移動する場合は、イベントの「全員を指定マップへ移動」コマンドを使用します。
 * 4. `SceneVarId` と `ForceMoveSwitchId` は他の同期処理と重複しない番号を指定します。
 */

(() => {
    'use strict';
    const pluginName = "GMSceneManager";
    const params = PluginManager.parameters(pluginName);
    const firebaseParams = PluginManager.parameters("FirebaseSync");
    
    const GM_ONLY_SWITCH_ID = Number(firebaseParams['gmOnlySwitchId'] || 101);
    const GM_ONLY_SCENE_VAR_ID = Number(params['SceneVarId'] || 20);
    const GM_ONLY_FORCE_MOVE_SW_ID = Number(params['ForceMoveSwitchId'] || 21);
    const GM_SCENE_ICON = params['GmSceneIcon'] || 'Scene';

    const getGmExclusivePath = () => {
        const fsParams = PluginManager.parameters("FirebaseSync");
        const roomIdVarId = Number(fsParams['roomIdVariable'] || 118);
        return `active_rooms/${$gameVariables.value(roomIdVarId)}/system/gm_exclusive_transfer`;
    };

    const getSystemPath = () => {
        const fsParams = PluginManager.parameters("FirebaseSync");
        const roomIdVarId = Number(fsParams['roomIdVariable'] || 118);
        return `active_rooms/${$gameVariables.value(roomIdVarId)}/system`;
    };

    // PC ID 0番を禁止するヘルパー関数
    const getPcDataPath = (pcId) => {
        if (Number(pcId) === 0) return null; // 0番の場合はパス生成を無効化
        const fsParams = PluginManager.parameters("FirebaseSync");
        const roomIdVarId = Number(fsParams['roomIdVariable'] || 118);
        return `active_rooms/${$gameVariables.value(roomIdVarId)}/pc_data/${pcId}`;
    };

    if (typeof window._gm_lastProcessedAt === 'undefined') window._gm_lastProcessedAt = 0;
    if (typeof window._gm_remoteListener === 'undefined') window._gm_remoteListener = null;
    if (typeof window._gm_remoteRef === 'undefined') window._gm_remoteRef = null;
    if (typeof window._gm_remoteOwner === 'undefined') window._gm_remoteOwner = null;

    const detachGmRemoteListener = function() {
        if (window._gm_remoteRef && window._gm_remoteListener) {
            window._gm_remoteRef.off('value', window._gm_remoteListener);
        }
        window._gm_remoteRef = null;
        window._gm_remoteListener = null;
        window._gm_remoteOwner = null;
    };

    // --- 1. インタープリターの制御 ---
    const _Game_Interpreter_update = Game_Interpreter.prototype.update;
    Game_Interpreter.prototype.update = function() {
        if ($gameSwitches.value(GM_ONLY_FORCE_MOVE_SW_ID)) {
            const command = this._list ? this._list[this._index] : null;
            if (command && command.code !== 201 && command.code !== 0) return;
        }
        _Game_Interpreter_update.call(this);
    };

    const _Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        if ($gameSwitches.value(GM_ONLY_FORCE_MOVE_SW_ID)) $gameSwitches.setValue(GM_ONLY_FORCE_MOVE_SW_ID, false);
        _Game_Player_performTransfer.call(this);
    };

    // --- 2. UIの監視とボタン制御 ---
    const _Scene_Map_create = Scene_Map.prototype.create;
    Scene_Map.prototype.create = function() {
        _Scene_Map_create.call(this);
        detachGmRemoteListener();
        const path = getGmExclusivePath();
        window._gm_remoteRef = firebase.database().ref(path);
        window._gm_remoteListener = (snapshot) => {
            const data = snapshot.val();
            if (data && data.at && data.at > window._gm_lastProcessedAt) {
                window._gm_lastProcessedAt = data.at;
                this.executeGmForcedMove(data.targetMapId);
            }
        };
        window._gm_remoteOwner = this;
        window._gm_remoteRef.on('value', window._gm_remoteListener);
    };

    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        if (window._gm_remoteOwner === this) {
            detachGmRemoteListener();
        }
        _Scene_Map_terminate.call(this);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        if ($gameSwitches.value(GM_ONLY_FORCE_MOVE_SW_ID)) {
            if ($gameSystem) $gameSystem._messageStack = [];
            $gameMessage.clear();
        }
        _Scene_Map_update.call(this);

        if ($gameSystem._activeTabId === 'gm_scene' && Einput_r_trig()) {
            if (this._tabGroup) this._tabGroup.removeTab('gm_scene');
        }

        if ($gameSystem._activeTabId === 'gm_scene') {
            if (!this._gmOverlay) this.drawGmMapTree();
        } else if (this._gmOverlay) {
            this.removeGmMapTree();
        }

        const isGm = $gameSwitches.value(GM_ONLY_SWITCH_ID);
        if (isGm && !this._gmSceneButton) {
            this._gmSceneButton = new Sprite_Clickable();
            this._gmSceneButton.bitmap = ImageManager.loadBitmap("img/icon/", GM_SCENE_ICON);
            this._gmSceneButton.x = 1610; this._gmSceneButton.y = 12;
            this._gmSceneButton.onClick = () => {
                this.openTab({ id: "gm_scene", name: "GM用画面" });
                SoundManager.playOk();
            };
            this.addChild(this._gmSceneButton);
        } else if (!isGm && this._gmSceneButton) {
            this.removeChild(this._gmSceneButton);
            this._gmSceneButton = null;
        }
    };

    // --- 3. マップツリー描画 ---
    Scene_Map.prototype.drawGmMapTree = function() {
        this.removeGmMapTree();
        this._gmOverlay = new Sprite(new Bitmap(1920, 1080));
        this._gmOverlay.bitmap.fillRect(0, 55, 1920, 1025, "rgba(0,0,0,0.85)");
        const tabIndex = this.children.indexOf(this._tabGroup);
        if (tabIndex >= 0) this.addChildAt(this._gmOverlay, tabIndex);
        else this.addChild(this._gmOverlay);

        const tree = $dataMapInfos.filter(m => m !== null).map(m => {
            let indent = 0;
            let parent = $dataMapInfos.find(info => info && info.id === m.parentId);
            while (parent) {
                indent++;
                parent = $dataMapInfos.find(info => info && info.id === parent.parentId);
            }
            return { id: m.id, name: m.name, indent: indent };
        });

        this._gmViewport = new Sprite();
        this._gmViewport.x = 80; this._gmViewport.y = 100;
        this._gmContent = new Sprite();
        this._gmViewport.addChild(this._gmContent);
        this._gmOverlay.addChild(this._gmViewport);

        let col = 0, row = 0;
        tree.forEach(data => {
            if (row * 44 + 40 > 920) { col++; row = 0; }
            const btn = new Sprite(new Bitmap(430, 40));
            btn.x = col * 450; btn.y = row * 44;
            const ix = data.indent * 24;
            btn.bitmap.fillRect(ix, 0, 430 - ix, 38, "rgba(80,80,80,1)");
            btn.bitmap.fillRect(ix, 36, 430 - ix, 2, "rgba(120,120,120,1)");
            btn.bitmap.fontSize = 18;
            btn.bitmap.drawText((data.indent > 0 ? "└ " : "") + data.name, ix + 8, 0, 430 - ix - 10, 38, "left");
            
            btn.update = function() {
                if ($gameSystem._activeTabId !== 'gm_scene') return;
                if (Einput_l_trig() && this.isClicked()) {
                    if (confirm(`${data.name} へ強制移動させますか？`)) {
                        window._gm_lastProcessedAt = Date.now();
                        firebase.database().ref(getGmExclusivePath()).set({
                            at: window._gm_lastProcessedAt,
                            targetMapId: data.id
                        });
                        firebase.database().ref(getSystemPath()).child('lastMapId').set(data.id);
                        SceneManager._scene.executeGmForcedMove(data.id);
                    }
                }
            };
            btn.isClicked = function() {
                const tx = TouchInput.x - 80 - SceneManager._scene._gmContent.x;
                const ty = TouchInput.y - 100;
                return tx >= this.x && tx <= this.x + 430 && ty >= this.y && ty <= this.y + 40;
            };
            this._gmContent.addChild(btn);
            row++;
        });
    };

    Scene_Map.prototype.removeGmMapTree = function() {
        if (this._gmOverlay) {
            this.removeChild(this._gmOverlay);
            this._gmOverlay = null;
        }
    };

    // --- 4. 移動実行ロジック ---
    Scene_Map.prototype.executeGmForcedMove = function(targetMapId) {
        $gameVariables.setValue(GM_ONLY_SCENE_VAR_ID, targetMapId);
        $gameSwitches.setValue(GM_ONLY_FORCE_MOVE_SW_ID, true);
        if ($gameMap._interpreter) $gameMap._interpreter.clear();
        $gameMessage.clear();
        $gamePlayer.reserveTransfer(targetMapId, 0, 0, 0, 0);
        $gameTemp.clearDestination();
        SceneManager.goto(Scene_Map);
    };

    // --- 5. シーンフックとプラグインコマンド ---
    const _Scene_Map_onTabChanged = Scene_Map.prototype.onTabChanged;
    Scene_Map.prototype.onTabChanged = function() {
        if (_Scene_Map_onTabChanged) _Scene_Map_onTabChanged.call(this);
        if ($gameSystem._activeTabId === 'gm_scene') {
            this.drawGmMapTree();
        } else {
            this.removeGmMapTree();
        }
    };

    PluginManager.registerCommand(pluginName, "moveAllPlayers", args => {
        const mapId = Number(args.mapId);
        firebase.database().ref(getSystemPath()).child('lastMapId').set(mapId);
        SceneManager._scene.executeGmForcedMove(mapId);
    });
})();
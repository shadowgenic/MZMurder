/*:
 * @target MZ
 * @plugindesc Firebase Realtime Databaseでルーム、参加者、スイッチ、変数を同期します。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】FirebaseプロジェクトとRealtime Databaseを準備し、接続情報とルームID・PC番号用の変数をパラメータへ設定します。
 * タイトル画面からルームを作成または参加し、「PCデータの復元」「メンバー数取得」でオンライン状態をイベントから扱えます。
 * 【Firebaseとは】
 * Firebaseは、Googleが提供するオンラインサービス基盤です。
 * 本プラグインでは、その中のRealtime Databaseを利用して、複数のPCから同じルームのデータを読み書きします。
 * ルーム情報、参加者、指定したスイッチ・変数、PCごとの復元データがオンラインに保存されます。
 * Firebaseのアカウントやプロジェクトがない場合は、まずFirebaseコンソールで無料のプロジェクトを作成してください。
 *
 * 本プラグインは起動時にFirebase JavaScript SDKを読み込み、Firebase Authenticationの匿名ログインを行います。
 * そのため、ゲームをオンライン公開する環境では、プレイヤーが通信できることと、Firebase側で匿名認証を有効にすることが必要です。
 * `GMSceneManager`、`Madamis_SyncMapTransfer`、`MadamisTimerEx` が利用するオンライン基盤でもあります。
 *
 * 【Firebaseを初めて使う時の準備】
 * 1. Firebaseコンソール（https://console.firebase.google.com/）でプロジェクトを作成します。
 * 2. プロジェクトの「Authentication」→「Sign-in method」で「匿名」を有効にします。
 * 3. 「Realtime Database」を作成し、利用するリージョンを選びます。
 * 4. Databaseのセキュリティルールを確認し、匿名ログイン済みユーザーが必要な `active_rooms` のデータを読み書きできるようにします。
 *    公開前にテスト用の全公開ルールを残さないでください。最低限、認証済みユーザーだけを許可するルールから始めます。
 * 5. Firebaseプロジェクトのウェブアプリ設定から、次の3値をコピーします。
 *    `apiKey`、`authDomain`（通常は xxx.firebaseapp.com）、`databaseURL`（通常は https://xxx.firebaseio.com）。
 * 6. その3値を本プラグインの同名パラメータへ入力します。APIキーはパスワードではありませんが、秘密鍵やサービスアカウントJSONはゲームへ入れないでください。
 *
 * 【ゲームを使い始めるまで】
 * 1. `roomIdVariable`、`pcIdVar`、`userUidVar`、`creatorSwitchId` に未使用の番号を設定し、`maxMembers` に入室上限を入力します。
 * 2. 共有したいスイッチを `syncSwitchStart`～`syncSwitchEnd`、変数を `syncVariableStart`～`syncVariableEnd` に指定します。
 * 3. `lockSwitchesId` と `lockVariablesId` には、同期中の書き込み制御に使う未使用のスイッチ・変数を指定します。
 * 4. テストプレーを起動し、タイトル画面に「ルームを作成する」と「ルームに参加する」が表示されることを確認します。
 * 5. 1台目でルームを作成し、表示されたルームIDを2台目で入力して参加します。両方が同じルームに入れば接続成功です。
 * 6. 共有対象のスイッチや変数を変更し、もう一方の画面へ反映されることを確認します。
 * 7. PC番号が確定した後に「PCデータの復元」を実行すると、そのPC用に保存されたデータを読み戻せます。
 *
 * 【関連コマンド】
 * ・「PCデータの復元」: `pcIdVar` のPC番号に保存された個別データを復元します。
 * ・「メンバー数取得」: 現在のルーム参加人数を指定した変数へ保存します。
 *
 * 【トラブルシューティング】
 * ・タイトル画面にルーム項目が出ない場合は、API設定、Firebase SDKの通信、ブラウザの開発者コンソールを確認します。
 * ・参加できない場合は、Realtime Databaseが作成済みか、匿名認証とDatabaseルールが有効かを確認します。
 * ・同期しない場合は、2台の `databaseURL`、ルームID変数、同期範囲が一致しているかを確認します。
 *
 * 【使い方】
 * 1. Firebaseプロジェクトを作成し、`apiKey`、`authDomain`、`databaseURL` を設定します。
 * 2. ルームID、PC番号、UID、作成者判定に使う変数・スイッチ番号を他のプラグインと合わせます。
 * 3. `syncSwitchStart`～`syncSwitchEnd` と `syncVariableStart`～`syncVariableEnd` に同期範囲を指定します。
 * 4. タイトル画面でルームを作成または参加し、必要に応じて「PCデータの復元」を実行します。
 * 5. 「メンバー数取得」で現在の入室人数を指定変数へ保存できます。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @param apiKey
 * @text Firebase APIキー
 * @desc FirebaseウェブアプリのAPIキーです。Firebaseコンソールのウェブアプリ設定から取得します。
 * @default *******************
 * 
 * @param authDomain
 * @text Firebase認証ドメイン
 * @desc Firebase Authenticationで使用するドメインです。
 * @default **********.firebaseapp.com
 * 
 * @param databaseURL
 * @text Realtime Database URL
 * @desc 接続するFirebase Realtime DatabaseのURLです。
 * @default https://**********.firebaseio.com
 * 
 * @param syncSwitchStart
 * @text 同期スイッチ開始番号
 * @desc 全プレイヤーで共有するスイッチ番号の範囲の開始値です。
 * @type number
 * @default 1
 * 
 * @param syncSwitchEnd
 * @text 同期スイッチ終了番号
 * @desc 全プレイヤーで共有するスイッチ番号の範囲の終了値です。
 * syncSwitchStartからsyncSwitchEndまでのスイッチは全員が同じ値になります。
 * 誰かが書き込みを行うと他のPLにも反映されます。
 * @type number
 * @default 100
 * 
 * @param syncVariableStart
 * @text 同期変数開始番号
 * @desc 全プレイヤーで共有する変数番号の範囲の開始値です。
 * @type number
 * @default 1
 * 
 * @param syncVariableEnd
 * @text 同期変数終了番号
 * @desc 全プレイヤーで共有する変数番号の範囲の終了値です。
 * syncVariableStartからsyncVariableEndまでの変数は全員が同じ値になります。
 * 誰かが書き込みを行うと他のPLにも反映されます。
 * @type number
 * @default 100
 * 
 * @param roomIdVariable
 * @text ルームID変数
 * @desc 接続中のルームIDを格納する変数です。
 * @type variable
 * @default 118
 * 
 * @param lockSwitchesId
 * @text スイッチ書き込みロック
 * @desc 同期中のスイッチ書き込み制御に使う番号です。
 * @type variable
 * @default 122
 * 
 * @param lockVariablesId
 * @text 変数書き込みロック
 * @desc 同期中の変数書き込み制御に使う番号です。
 * @type variable
 * @default 123
 * 
 * @param maxMembers
 * @text 最大入室人数
 * @desc 1ルームに同時入室できる人数の上限です。GMも数えます。キャラクター選択の表示枠数・開始条件には使用しません。
 * @type number
 * @min 1
 * @default 7
 * 
 * @param NewGameName
 * @text ルーム作成の名称
 * @desc タイトル画面の「ルームを作成する」にあたる表示名です。
 * @default ルームを作成する
 *
 * @param JoinRoomName
 * @text ルーム参加の名称
 * @desc タイトル画面の「ルームに参加する」にあたる表示名です。
 * @default ルームに参加する
 *
 * @param OptionsName
 * @text オプションの名称
 * @desc タイトル画面の「オプション」にあたる表示名です。
 * @default オプション
 *
 * @param CommandWindowY
 * @text コマンドウィンドウY座標
 * @desc タイトルコマンドの縦位置です。
 * @type number
 * @default 700
 *
 * @param CommandWindowWidth
 * @text コマンドウィンドウ幅
 * @desc タイトルコマンドの横幅（数値が大きいほど横長になります）
 * @type number
 * @default 300
 *
 * @param creatorSwitchId
 * @text ルーム作成者判定スイッチ
 * @desc 自分がルームを作成した場合にON(true)、参加した場合にOFF(false)になるスイッチIDです。
 * @type switch
 * @default 101
 *
 * @param gmOnlySwitchId
 * @text GM専用スイッチ
 * @desc 現在のGMのときだけONになるスイッチIDです。0で無効ですがそのままではSyncMapTransferなどの動作に支障が出ます。GMレス作品の場合でも便宜上GMを置いてください。
 * @type switch
 * @default 101
 *
 * @param defaultGmPcId
 * @text GMPC番号
 * @desc GMとして使用されるPC番号です。
 * @type number
 * @default 7
 * 
 * @param pcIdVar
 * @text PCのIDを格納する変数
 * @desc PCが確定したらここに書き込んでください。
 * @type variable
 * @default 101
 *
 * @param userUidVar
 * @text ユーザーUID格納変数
 * @desc 自分のFirebase UID(文字列)を格納する変数の番号です。
 * @type variable
 * @default 102
 * 
 * @command RestorePcData
 * @text PCデータの復元
 * @desc PC番号変数(pcIdVar)に基づき、Firebaseから個別の変数を復元します。
 *
 * @command GetMemberCount
 * @text メンバー数取得
 * @desc 現在のルームのメンバー数を指定した変数に格納します。
 * 
 * @arg variableId
 * @text 代入先変数ID
 * @desc 現在のルーム参加人数を書き込む変数です。
 * @type variable
 * @default 1
 */
function OnlineManager() {
    throw new Error('Static class');
}

OnlineManager._tempRoomId = 0;
OnlineManager._isListening = false;
OnlineManager._isCreatorFlag = false;
OnlineManager._tempUserId = ""; // UID退避用
OnlineManager._tempPcId = 0;    // PC番号退避用
OnlineManager._isTransferring = true;
OnlineManager._authReady = null;
OnlineManager._pcRestoreReady = Promise.resolve();
OnlineManager._listeningRoomRef = null;
OnlineManager._roomValueListener = null;

(() => {
    'use strict';
    const ps = PluginManager.parameters("FirebaseSync");
    const ROOM_ID_VAR = Number(ps['roomIdVariable'] || 118);
    const TEXT_CREATE = ps['NewGameName'] || "ルームを作成する";
    const TEXT_JOIN   = ps['JoinRoomName'] || "ルームに参加する";
    const TEXT_OPTION = ps['OptionsName']  || "オプション";
    const CMD_Y = Number(ps['CommandWindowY'] || 444);
    const CMD_W = Number(ps['CommandWindowWidth'] || 400);
    const CREATOR_SW_ID = Number(ps['creatorSwitchId'] || 124);
    const PC_ID_VAR = Number(ps['pcIdVar'] || 101);
    const USER_UID_VAR = Number(ps['userUidVar'] || 102);
    const DEFAULT_GM_PC_ID = Number(ps['defaultGmPcId'] || 7);
    const MAX_MEMBERS = Math.max(1, Number(ps['maxMembers'] || 7));
    const RESTORE_TIMEOUT_MS = 15000;

    function withTimeout(promise, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Firebase data restore timed out.')), timeoutMs);
            Promise.resolve(promise).then(value => {
                clearTimeout(timer);
                resolve(value);
            }, error => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    
    const _Scene_Map_create = Scene_Map.prototype.create;
    Scene_Map.prototype.create = function() {
        $gameSwitches.setValue(CREATOR_SW_ID, OnlineManager._isCreatorFlag);
        _Scene_Map_create.call(this);
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        OnlineManager._isTransferring = true;
        $gameSwitches.setValue(CREATOR_SW_ID, OnlineManager._isCreatorFlag);

        if (OnlineManager._tempUserId) {
            $gameVariables.setValue(USER_UID_VAR, OnlineManager._tempUserId);
        }
        
        if (OnlineManager.setRoomID()) {
            OnlineManager.startAutoListener();
            
            if (!OnlineManager._isCreatorFlag) {
                if ($gameMap._interpreter) {
                    $gameMap._interpreter.clear();
                }
                OnlineManager._pcRestoreReady.then(() => {
                    OnlineManager._isTransferring = false;
                }).catch(error => {
                    console.error(error);
                    OnlineManager._isTransferring = false;
                    alert("ゲームデータの復元に失敗しました。通信状態を確認してください。");
                });
            }

            const pcRef = OnlineManager.getPcRef();
            const currentUid = $gameVariables.value(USER_UID_VAR);
            if (pcRef && currentUid) {
                pcRef.child('uid').set(String(currentUid));
            }
        } else {
            OnlineManager._isTransferring = false;
        }

        _Scene_Map_start.call(this);
        if (OnlineManager._isCreatorFlag) {
            OnlineManager._isTransferring = false;
        }
    };
    
    // --- Firebase初期化 ---
    OnlineManager.initialize = function() {
        const authenticate = () => {
            if (!firebase.apps.length) {
                firebase.initializeApp({
                    apiKey: ps['apiKey'],
                    authDomain: ps['authDomain'],
                    databaseURL: ps['databaseURL']
                });
            }

            const auth = firebase.auth();
            this._authReady = new Promise((resolve, reject) => {
                const unsubscribe = auth.onAuthStateChanged(user => {
                    if (!user) return;
                    this.user = user;
                    unsubscribe();
                    resolve(user);
                }, reject);

                if (!auth.currentUser) {
                    auth.signInAnonymously().catch(reject);
                }
            });
        };

        if (typeof firebase !== 'undefined') {
            authenticate();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/live/3.0/firebase.js';
        script.onload = authenticate;
        script.onerror = () => this._authReady = Promise.reject(new Error("Firebase SDK could not be loaded."));
        document.body.appendChild(script);
    };

    OnlineManager.waitForAuth = function() {
        return this._authReady || Promise.reject(new Error("Firebase authentication has not started."));
    };

    // --- 入室制限 & 再入室許可ロジック ---
    OnlineManager.checkCanJoin = async function(roomId) {
        const myUser = firebase.auth().currentUser;
        if (!myUser) return false;

        const snapshot = await firebase.database().ref('active_rooms/' + roomId).once('value');
        const data = snapshot.val();

        // 部屋が存在しない場合は理由を表示して入室を拒否する
        if (!data) {
            alert("指定されたルームIDは存在しません。");
            return false;
        }

        const currentMembers = data.members ? Object.keys(data.members) : [];
        const currentCount = currentMembers.length;
        if (currentCount >= MAX_MEMBERS && !currentMembers.includes(myUser.uid)) {
            alert("ルームが満員です。");
            return false;
        }
        const pcData = data.pc_data || {};
        const hasOwnPcData = Object.keys(pcData).some(slotId =>
            pcData[slotId] && pcData[slotId].uid === myUser.uid
        );

        // 過去の入室記録または自分のPCデータがあれば再入室として許可
        if ((data.members_once && data.members_once[myUser.uid]) || hasOwnPcData) {
            console.log("再入室を許可しました。");
            return true;
        }

        // PCデータのUIDがmembersにいなければ、そのPCの退出による欠員がある。
        const hasVacantPcSlot = Object.keys(pcData).some(slotId => {
            const pc = pcData[slotId];
            return pc && pc.uid && !currentMembers.includes(pc.uid);
        });
        if (hasVacantPcSlot) {
            return true;
        }

        // 実際の移動が確定したルームに、新規参加者は入れない。
        const system = data.system || {};
        if (system.lastMapId || system.moveTriggerAt) {
            alert("このルームはすでにゲームが開始されているため、参加できません。");
            return false;
        }

        return true;
    };

    // --- 同期用リファレンスの取得 ---
    OnlineManager.setRoomID = function() {
        const roomId = $gameVariables.value(ROOM_ID_VAR);
        if (roomId && roomId !== 0) {
            const roomIdStr = String(roomId).replace(/,/g, "");
            this.roomRef = firebase.database().ref('active_rooms/' + roomIdStr);
            this.variableRef = this.roomRef.child('variables');
            this.switchRef = this.roomRef.child('switches');
            this.systemRef = this.roomRef.child('system');
            this.systemRef.child('initialized').set(true);
            return true;
        }
        return false;
    };
    
    // PC個別領域のリファレンス取得（全書き込み処理の基点）
    OnlineManager.getPcRef = function() {
        const pcId = $gameVariables.value(PC_ID_VAR);
        // pcId が 0 または無効な場合は null を返すことで、
        // 呼び出し側での書き込みを物理的に不可能にします。
        if (this.roomRef && pcId > 0) {
            return this.roomRef.child('pc_data').child(pcId);
        }
        return null;
    };

    OnlineManager.claimPcSlot = function(slotId, expectedUid, newUid) {
        const uidRef = this.roomRef.child('pc_data').child(slotId).child('uid');
        return uidRef.transaction(currentUid => {
            return currentUid === expectedUid ? newUid : undefined;
        }).then(result => result.committed);
    };

    // メンバー登録・同期をすべて実行
    OnlineManager.startAutoListener = function() {
        if (this._isListening) return;
        if (!this.roomRef) return;
    
        const currentUser = firebase.auth().currentUser; // this.userより確実に現在値を取得
        const PC_ID_VAR = Number(ps['pcIdVar'] || 101);
        const USER_UID_VAR = Number(ps['userUidVar'] || 102);

        if (currentUser) {
            const myId = currentUser.uid;
            const myStatusRef = this.roomRef.child('members').child(myId);
            const myOnceRef = this.roomRef.child('members_once').child(myId);
            
            
            // 1. 自分のオンライン状態を登録
            myStatusRef.set(true);
            // 2. 切断時に自動削除する予約 (これが「いなくなったら削除」の核)
            myStatusRef.onDisconnect().remove();
            // 3. 入室済み記録（再入室判定用）
            myOnceRef.set(true);
            
            this._pcRestoreReady = withTimeout(this.roomRef.once('value').then(async (snapshot) => {
                const data = snapshot.val();
                if (!data) return;
                

                const currentMembers = data.members ? Object.keys(data.members) : [];

                
                let targetPcId = null;

                // 自分のUIDが既に pc_data にあるかチェック（再入室対応）
                if (data.pc_data) {
                    targetPcId = Object.keys(data.pc_data).find(slotId => 
                        data.pc_data[slotId].uid === myId
                    );
                }

                let expectedUid = targetPcId ? data.pc_data[targetPcId].uid : null;

                // UIDが変わった再入室者向けに、現在使われていないPC枠を引き継ぐ
                if (!targetPcId) {
                    const abandonedSlots = Object.keys(data.pc_data || {}).filter(slotId => {
                        const slotUid = data.pc_data[slotId] && data.pc_data[slotId].uid;
                        return slotUid && !currentMembers.includes(slotUid);
                    });

                    if (abandonedSlots.length === 1) {
                        targetPcId = abandonedSlots[0];
                        expectedUid = data.pc_data[targetPcId].uid;
                        console.log("空き枠を自動復旧: PC " + targetPcId);
                    } else if (abandonedSlots.length > 1) {
                        const enteredPcId = window.prompt(
                            "PCのID番号を数値で入力してください。\n復元候補: " + abandonedSlots.join(", ")
                        );
                        const selectedPcId = Number(enteredPcId);

                        if (Number.isInteger(selectedPcId) && abandonedSlots.includes(String(selectedPcId))) {
                            targetPcId = String(selectedPcId);
                            expectedUid = data.pc_data[targetPcId].uid;
                        } else {
                            targetPcId = null;
                            alert("復元できるPCのID番号を入力してください。");
                        }
                    }
                }

                // 復旧対象がある場合のみ変数を上書き
                if (targetPcId && targetPcId > 0) {
                    if (!expectedUid || await OnlineManager.claimPcSlot(targetPcId, expectedUid, myId)) {
                        $gameVariables.setValue(PC_ID_VAR, Number(targetPcId));
                    } else {
                        targetPcId = null;
                        alert("PCデータの復元に失敗しました。もう一度お試しください。");
                    }
                }

                if (!this._isCreatorFlag) {
                    await OnlineManager.restoreAllData();
                }
            }), RESTORE_TIMEOUT_MS);
        }
    
        // リアルタイムリスナー
        this._roomValueListener = (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            
            let needsRefresh = false; // 更新があったかフラグ

            // スイッチ同期
            // スイッチ同期
            if (data.switches) {
                Object.keys(data.switches).forEach(id => {
                    const sid = Number(id);
                    if ($gameSwitches.value(sid) !== data.switches[id]) {
                        $gameSwitches.setValue(sid, data.switches[id], true);
                        needsRefresh = true; // 変更があった
                    }
                });
            }

            // 変数同期
            if (data.variables) {
                Object.keys(data.variables).forEach(id => {
                    const vid = Number(id);
                    const remoteVal = data.variables[id];
                    if (JSON.stringify($gameVariables.value(vid)) !== JSON.stringify(remoteVal)) {
                        $gameVariables.setValue(vid, remoteVal, true); 
                        needsRefresh = true; // 変更があった
                    }
                });
            }
            // 【重要】変更があった場合、イベント条件を再判定させるために強制リフレッシュ
            if (needsRefresh) {
                $gameMap.requestRefresh();
            }
        };
        this.roomRef.on('value', this._roomValueListener);
        this._listeningRoomRef = this.roomRef;
    
        this._isListening = true;
    };

    OnlineManager.stopAutoListener = function() {
        if (this._listeningRoomRef && this._roomValueListener) {
            this._listeningRoomRef.off('value', this._roomValueListener);
        }
        this._listeningRoomRef = null;
        this._roomValueListener = null;
        this._isListening = false;
    };

    const _DataManager_createGameObjects_Online = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects_Online.call(this);

        if (OnlineManager._tempRoomId > 0) {
            $gameVariables.setValue(ROOM_ID_VAR, OnlineManager._tempRoomId);
        }
        if (OnlineManager._tempUserId) {
            $gameVariables.setValue(USER_UID_VAR, OnlineManager._tempUserId);
        }
        $gameSwitches.setValue(CREATOR_SW_ID, OnlineManager._isCreatorFlag);
        if (OnlineManager._isCreatorFlag) {
            $gameVariables.setValue(PC_ID_VAR, DEFAULT_GM_PC_ID);
        }
    };

    // --- ルーム掃除 ---
    OnlineManager.cleanupRooms = function() {
        const db = firebase.database().ref('active_rooms');
        db.once('value').then(s => {
            if (!s.exists()) return;
            s.forEach(rs => {
                const d = rs.val();
                if (!d.members || Object.keys(d.members).length === 0 || d.cleared === true) {
                    db.child(rs.key).remove();
                }
            });
        });
    };

    // --- ニューゲーム時のIDセットアップ（衝突回避済み） ---
    const _DataManager_setupNewGame_Online = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        OnlineManager.stopAutoListener();
        _DataManager_setupNewGame_Online.call(this);
    };

    // --- タイトルコマンド ---
    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand(TEXT_CREATE, "createRoom");
        this.addCommand(TEXT_JOIN, "joinRoom");
        this.addCommand(TEXT_OPTION, "options");
    };
    // --- 初期選択位置の制御 ---
    const _Window_TitleCommand_initialize = Window_TitleCommand.prototype.initialize;
    Window_TitleCommand.prototype.initialize = function(rect) {
        _Window_TitleCommand_initialize.call(this, rect);
        
        // テストプレイ時は0（ルーム作成）、それ以外は1（ルームに参加）を選択
        const targetIndex = Utils.isOptionValid('test') ? 0 : 1;
        this.select(targetIndex);
    };

    const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        const rect = this.commandWindowRect();
        
        // 横幅をパラメータから適用
        rect.width = CMD_W; 
        
        // X座標を自動計算（(画面の幅 - ウィンドウの幅) / 2 で中央揃え）
        rect.x = (Graphics.boxWidth - rect.width) / 2;
        
        // Y座標をパラメータから適用
        rect.y = CMD_Y; 

        this._commandWindow = new Window_TitleCommand(rect);
        this._commandWindow.setHandler("createRoom", this.commandCreateRoom.bind(this));
        this._commandWindow.setHandler("joinRoom", this.commandJoinRoom.bind(this));
        this._commandWindow.setHandler("options", this.commandOptions.bind(this));
        this.addWindow(this._commandWindow);
    };

    // ルーム作成
    Scene_Title.prototype.commandCreateRoom = async function() {
        this._commandWindow.deactivate();
        SoundManager.playOk();
        try {
            await OnlineManager.waitForAuth();
        } catch (error) {
            console.error(error);
            alert("Firebaseに接続できませんでした。");
            this._commandWindow.activate();
            return;
        }
        OnlineManager.cleanupRooms();
        let newId = 0, isUnique = false, retry = 10;
        OnlineManager._isCreatorFlag = true;
        while (!isUnique && retry > 0) {
            newId = Math.floor(1000 + Math.random() * 9000);
            const snapshot = await firebase.database().ref('active_rooms/' + newId).once('value');
            if (!snapshot.exists()) isUnique = true;
            retry--;
        }
        if (isUnique) {
            OnlineManager._tempRoomId = newId;
            
            const currentUser = firebase.auth().currentUser;
            if (currentUser) OnlineManager._tempUserId = currentUser.uid;
            OnlineManager.updateTitle(newId);
            this.proceedToGame();
        } else {
            alert("ルーム作成失敗。");
            this._commandWindow.activate();
        }
    };
    

    // ルーム参加
    Scene_Title.prototype.commandJoinRoom = async function() {
        if (this._isJoiningRoom || this._isProceedingToGame) return;

        this._isJoiningRoom = true;
        if (this._commandWindow) {
            this._commandWindow.deactivate();
        }

        const roomId = window.prompt("ルームID4桁を入力してください:");
        if (!roomId) {
            this._isJoiningRoom = false;
            if (this._commandWindow) {
                this._commandWindow.activate();
            }
            return;
        }

        try {
            await OnlineManager.waitForAuth();
            if (!await OnlineManager.checkCanJoin(roomId)) {
                this._isJoiningRoom = false;
                if (this._commandWindow) {
                    this._commandWindow.activate();
                }
                return;
            }

            const tempRef = firebase.database().ref('active_rooms/' + roomId);
            const snap = await tempRef.once('value');
            const data = snap.val();
            if (!data) {
                alert("ルームが存在しません。");
                this._isJoiningRoom = false;
                if (this._commandWindow) {
                    this._commandWindow.activate();
                }
                return;
            }

            OnlineManager._isCreatorFlag = false;
            OnlineManager._tempRoomId = Number(roomId);
            const currentUser = firebase.auth().currentUser;
            if (currentUser) OnlineManager._tempUserId = currentUser.uid;

            // 途中参加者は、ルームで最後に確定したマップから開始する
            if (data.system && data.system.lastMapId) {
                $dataSystem.startMapId = Number(data.system.lastMapId);
                $dataSystem.startX = 0;
                $dataSystem.startY = 0;
            }
            OnlineManager.updateTitle(roomId);
            this._isJoiningRoom = false;
            this.proceedToGame();
        } catch (error) {
            console.error(error);
            alert("Firebaseに接続できませんでした。");
            this._isJoiningRoom = false;
            if (this._commandWindow) {
                this._commandWindow.activate();
            }
        }
    };

    OnlineManager.prepareGameStart = async function() {
        this._isTransferring = true;
        DataManager.setupNewGame();

        if (!this.setRoomID()) {
            throw new Error('Room ID is not available before entering the game.');
        }
        this.startAutoListener();
        await withTimeout(this._pcRestoreReady, RESTORE_TIMEOUT_MS);
    };

    // Firebaseの初期接続とデータ復元が完了してから初期マップへ遷移する
    Scene_Title.prototype.proceedToGame = async function() {
        if (this._isProceedingToGame) return;
        this._isProceedingToGame = true;
        if (this._commandWindow) {
            this._commandWindow.close();
        }
        try {
            await OnlineManager.prepareGameStart();
            SceneManager.goto(Scene_Map);
        } catch (error) {
            console.error(error);
            OnlineManager.stopAutoListener();
            OnlineManager._isTransferring = false;
            alert('Firebaseへの接続またはゲームデータの復元に失敗しました。通信状態を確認してください。');
            this._isProceedingToGame = false;
            if (this._commandWindow) {
                this._commandWindow.activate();
            }
        }
    };

    // 標準の遷移処理をラップ（2重音防止）
    Scene_Title.prototype.playStartSoundAndProceed = function() {
        this.proceedToGame();
    };

    // --- 送信ロジック（書き込み禁止リスト対応） ---
    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function(id, val, online) {
        _Game_Switches_setValue.call(this, id, val);
        if (online) return;

        const syncStart = Number(ps['syncSwitchStart']);
        const syncEnd = Number(ps['syncSwitchEnd']);
        const isShared = (id >= syncStart && id <= syncEnd);

        if (isShared) {
            if (OnlineManager.switchRef) {
                OnlineManager.switchRef.child(id).set(val);
            }
        } else {
            const pcId = $gameVariables.value(PC_ID_VAR);
            // PC番号 0 の場合は書き込まない
            if (pcId > 0 && id !== CREATOR_SW_ID) {
                const pcRef = OnlineManager.roomRef ? OnlineManager.roomRef.child('pc_data').child(pcId) : null;
                if (pcRef) {
                    pcRef.child('switches').child(id).set(val);
                }
            }
        }
    };
    const _Game_Variables_setValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function(id, val, online) {
        const oldVal = this._data[id];
        _Game_Variables_setValue.call(this, id, val);
        
        if (online) return;
        if (JSON.stringify(oldVal) === JSON.stringify(val)) return;

        if (id === PC_ID_VAR && OnlineManager.roomRef) {
            const oldPcId = Number(oldVal || 0);
            const newPcId = Number(val || 0);
            const myUid = this.value(USER_UID_VAR);

            if (newPcId > 0) {
                const newRef = OnlineManager.roomRef.child('pc_data').child(newPcId);
                newRef.child('uid').set(String(myUid));
                
                // --- ここから追加・修正 ---
                const syncStartVar = Number(ps['syncVariableStart']);
                const syncEndVar = Number(ps['syncVariableEnd']);
                const syncStartSw = Number(ps['syncSwitchStart']);
                const syncEndSw = Number(ps['syncSwitchEnd']);
                
                // 全変数をスキャンして個別領域へ流し込む
                const allVars = {};
                for (let i = 1; i < this._data.length; i++) {
                    const v = this._data[i];
                    // 共有範囲外かつシステム用変数以外を対象とする
                    if (v !== undefined && (i < syncStartVar || i > syncEndVar) && 
                        i !== PC_ID_VAR && i !== ROOM_ID_VAR) { 
                        allVars[i] = v;
                    }
                }
                newRef.child('variables').set(allVars);
           
                // 全スイッチをスキャンして個別領域へ流し込む
                const allSwitches = {};
                for (let i = 1; i < $gameSwitches._data.length; i++) {
                    const s = $gameSwitches._data[i];
                    if (s !== undefined && (i < syncStartSw || i > syncEndSw) && i !== CREATOR_SW_ID) {
                        allSwitches[i] = s;
                    }
                }
                newRef.child('switches').set(allSwitches);
                // --- ここまで追加 ---
            }
            return;
        }

        // 通常同期ロジック
        const syncStart = Number(ps['syncVariableStart']);
        const syncEnd = Number(ps['syncVariableEnd']);
        const isShared = (id >= syncStart && id <= syncEnd);

        if (isShared) {
            if (OnlineManager.variableRef) {
                OnlineManager.variableRef.child(id).set(val);
            }
        } else {
            const pcId = this.value(PC_ID_VAR);
            // 修正：個別の同期時も USER_UID_VAR なら同期を許可する
            if (pcId > 0 && id !== PC_ID_VAR && id !== ROOM_ID_VAR) {
                const pcRef = OnlineManager.roomRef ? OnlineManager.roomRef.child('pc_data').child(pcId) : null;
                if (pcRef) {
                    pcRef.child('variables').child(id).set(val);
                }
            }
        }
    };
    
    // GMが移動先を「予約」
    OnlineManager.reserveTransfer = function(data) {
        if (this.systemRef) {
            this.systemRef.child('transfer').set(data);
        }
    };
    
    OnlineManager.clearTransfer = function() {
        if (this.systemRef) {
            this.systemRef.child('transfer').remove();
        }
    };
    
    OnlineManager.setCompleteMap = function(mapId) {
        const pcRef = this.getPcRef();
        if (!pcRef) return Promise.resolve(false);
        return pcRef.child('completed').set(mapId).then(() => true);
    };

    // プラグインコマンドの登録
    PluginManager.registerCommand("FirebaseSync", "RestorePcData", () => {
        OnlineManager.restorePcData();
    });
    
    PluginManager.registerCommand("FirebaseSync", "GetMemberCount", args => {
        const varId = Number(args.variableId);
        if (OnlineManager.roomRef) {
            OnlineManager.roomRef.child('members').once('value').then(snapshot => {
                const members = snapshot.val();
                const count = members ? Object.keys(members).length : 0;
                $gameVariables.setValue(varId, count);
                console.log("現在のメンバー数: " + count);
            });
        } else {
            console.warn("ルームに接続されていません。");
        }
    });

    // PC個別領域のリファレンス取得
    OnlineManager.getPcRef = function() {
        const pcId = $gameVariables.value(PC_ID_VAR);
        if (this.roomRef && pcId > 0) {
            return this.roomRef.child('pc_data').child(pcId);
        }
        return null;
    };

    // 一括復元処理
    OnlineManager.restoreAllData = async function() {
        if (!this.roomRef) return;
    
        const snapshot = await this.roomRef.once('value');
        const data = snapshot.val();
        if (!data) return;
    
        // 1. 共通変数の復元
        if (data.variables) {
            Object.keys(data.variables).forEach(id => {
                $gameVariables.setValue(Number(id), data.variables[id], true);
            });
        }
    
        // 2. 共通スイッチの復元
        if (data.switches) {
            Object.keys(data.switches).forEach(id => {
                $gameSwitches.setValue(Number(id), data.switches[id], true);
            });
        }
    
        // 3. 個別データ（変数・マップ情報）の復元
        await this.restorePcData();

    };
    
    OnlineManager.restorePcData = function() {
        const currentUser = firebase.auth().currentUser;
        if (!currentUser || !this.roomRef) return Promise.resolve();
    
        return this.roomRef.child('pc_data').once('value').then((snapshot) => {
            const pcData = snapshot.val();
            if (!pcData) return;
            
            const myPcNumber = Object.keys(pcData).find(id => pcData[id].uid === currentUser.uid);
    
            if (myPcNumber && pcData[myPcNumber]) {
                const myData = pcData[myPcNumber];
    
                // 1. 個別変数の復元
                if (myData.variables) {
                    Object.keys(myData.variables).forEach(varId => {
                        $gameVariables.setValue(Number(varId), myData.variables[varId], true);
                    });
                }

                // 2. 個別スイッチの復元
                if (myData.switches) {
                    Object.keys(myData.switches).forEach(swId => {
                        $gameSwitches.setValue(Number(swId), myData.switches[swId], true);
                    });
                }
            }
        });
    };
    
    const _Game_Interpreter_update = Game_Interpreter.prototype.update;
    Game_Interpreter.prototype.update = function() {
        // 部屋に入室しており、かつデータ同期が完了していない場合は処理をスキップ
        if (OnlineManager.roomRef && OnlineManager._isTransferring) {
            return; // イベント処理を一切行わない
        }
        _Game_Interpreter_update.call(this);
    };
    
    OnlineManager.updateTitle = function(roomId) {
       if (roomId) {
            document.title = $dataSystem.gameTitle + " - RoomID : " + roomId;
        }
    };
    
    const _SceneManager_initialize = SceneManager.initialize;
    SceneManager.initialize = function() {
        _SceneManager_initialize.call(this);
        OnlineManager.initialize();
    };
    
})();

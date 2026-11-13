/*:
 * @target MZ
 * @plugindesc GM操作とFirebase同期に対応したスプライト式カウントダウンタイマーです。
 * @author Shadowgenic & Google Gemini
 *
 * @command setTimer
 * @text タイマーセット
 * @desc 秒数、表示座標、終了時SE、自動消去フラグを指定して開始します。
 * タイマーの終了時に終了時スイッチをONにします(自動消去フラグが立っている場合は✕で閉じたあと)。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @arg seconds @type number @text 秒数 @desc カウントダウンする秒数です。 @default 600
 * @arg switchId @type switch @text 終了時スイッチ @desc 0でスイッチ操作なし
 * @arg x @type number @text X座標 @desc タイマーを表示するX座標です。 @default 1600
 * @arg y @type number @text Y座標 @desc タイマーを表示するY座標です。 @default 50
 * @arg seName
 * @text 終了時SE名
 * @type file
 * @dir audio/se
 * @desc 0:00になったときに再生するSEファイル名（空欄で無効化）
 * @arg seVolume
 * @text 終了時SE音量
 * @type number
 * @min 0
 * @max 100
 * @desc 終了時に鳴らすSEの音量です。空欄で90。
 * @default 90
 * @arg sePitch
 * @text 終了時SEピッチ
 * @type number
 * @min 50
 * @max 150
 * @desc 終了時に鳴らすSEのピッチです。空欄で100。
 * @default 100
 * @arg sePan
 * @text 終了時SEパン
 * @type number
 * @min -100
 * @max 100
 * @desc 終了時に鳴らすSEの定位です。空欄で0。
 * @default 0
 * @arg autoHide
 * @text 終了時に自動消去
 * @desc 0秒到達後にタイマー表示を自動で消去するか指定します。
 * @type select
 * @option 自動で消去する
 * @value true
 * @option 消去しない（✕ 00:00で残す）
 * @value false
 * @default false
 *
 * @command moveTimer
 * @text タイマー座標変更
 * @desc 表示中のタイマーの座標を変更します。
 *
 * @arg x @type number @text X座標
 * @desc 変更後のタイマー表示X座標です。
 * @arg y @type number @text Y座標
 * @desc 変更後のタイマー表示Y座標です。
 *
 * @command stopTimer
 * @text タイマー停止・消去
 *
 * @param syncPathState
 * @text タイマー状態同期パス名
 * @desc Firebase上のタイマー状態キー名（例: timer_state）
 * @default timer_state
 *
 * @param expireImage
 * @text 終了時画像
 * @type file
 * @dir img/pictures
 * @desc 0秒時に✕の代わりに表示する画像です。未指定で✕を表示します。
 * @default
 *
 * @param closeButtonBlink
 * @text 終了時閉じるボタンを明滅
 * @type boolean
 * @on 明滅する
 * @off 明滅しない
 * @desc 0秒時に表示される閉じるボタンを白く明滅させます。
 * @default true
 *
 * @help
 * 【使い方】FirebaseSync.jsを有効にしたうえで、GMが「タイマーセット」を実行して秒数・位置・終了時の処理を指定します。
 * 実行中は「タイマー移動」または「タイマー停止」で制御でき、残り時間は参加者間で同期されます。
 * 画面上にスプライト式のカウントダウンタイマーを表示します。GMだけが開始、停止、位置変更を行えます。
 * 残り時間と一時停止状態はFirebaseへ同期され、参加者の画面にも同じタイマーが表示されます。
 * 0秒到達時のSE、スイッチ操作、自動消去を設定できます。
 *
 * 【使い方】
 * 1. FirebaseSyncの「GM専用スイッチ」をGM権限スイッチに設定します。
 * 2. 「タイマーセット」で秒数、終了時スイッチ、座標、SE、自動消去を指定します。
 * 3. 必要に応じて「タイマー座標変更」を実行し、「タイマー停止・消去」で終了します。
 * 4. GM以外がコマンドを実行しても操作は受け付けません。
 */

(() => {
    'use strict';

    const pluginName = "TimerEx";
    const params = PluginManager.parameters(pluginName);
    const firebaseParams = PluginManager.parameters("FirebaseSync");
    const GM_SWITCH_ID = Number(firebaseParams.gmOnlySwitchId || 101);
    const PATH_STATE = params.syncPathState || "timer_state";
    const EXPIRE_IMAGE = params.expireImage || "";
    const CLOSE_BUTTON_BLINK = params.closeButtonBlink === "true";
    const MINIMUM_TIMER_FRAMES = 59;

    // --- 管理変数 ---
    let _isActive = false;         // タイマーがカウントダウン中か（0秒で即falseになる）
    let _isPaused = false;         
    let _totalFrames = 0;
    let _resultCounter = 0;
    let _expireCommonEventId = 0; // ここに設定値を代入してください          
    
    let _targetSwitchId = 0;
    let _timerX = 1600;
    let _timerY = 50;
    let _isListening = false;
    let _autoHide = false;
    let _currentExpireSe = null;
    let _lastIndependentTimerAt = 0;
    let _serverTimeOffset = 0;

    // タイマー終了後、画面に「00:00（✕）」の死体を残してエディットさせるためのUI専用フラグ
    let _showResultUI = false;

    const isGm = function() {
        return $gameSwitches.value(GM_SWITCH_ID);
    };

    const synchronizedNow = function() {
        return Date.now() + _serverTimeOffset;
    };

    const applyTimerState = function(state) {
        if (!state || state.active === false) {
            clearAllTimerState(false);
            return;
        }

        const elapsedFrames = state.paused
            ? 0
            : Math.max(0, Math.floor((synchronizedNow() - Number(state.startedAt || synchronizedNow())) * 60 / 1000));
        _totalFrames = Math.max(0, Number(state.frames) - elapsedFrames);
        _isPaused = !!state.paused;
        _targetSwitchId = Number(state.switchId) || 0;
        _timerX = Number(state.x) || 0;
        _timerY = Number(state.y) || 0;
        _autoHide = !!state.autoHide;
        _currentExpireSe = state.se || null;
        _lastIndependentTimerAt = Date.now();
        _showResultUI = false;
        _isActive = _totalFrames > 0;
        if (_totalFrames === 0) triggerTimeUp();
    };

    const syncTimerState = function() {
        if (!isGm() || !window.OnlineManager || !OnlineManager.roomRef) return;
        OnlineManager.roomRef.child(PATH_STATE).set({
            active: _isActive,
            frames: _totalFrames,
            paused: _isPaused,
            startedAt: firebase.database.ServerValue.TIMESTAMP,
            switchId: _targetSwitchId,
            x: _timerX,
            y: _timerY,
            autoHide: _autoHide,
            se: _currentExpireSe
        });
    };

    // --- Firebase監視ロジック ---
    const setupFirebaseListeners = function() {
        if (_isListening || !window.OnlineManager || !OnlineManager.roomRef) return;

        firebase.database().ref(".info/serverTimeOffset").on('value', snapshot => {
            _serverTimeOffset = Number(snapshot.val()) || 0;
        });

        OnlineManager.roomRef.child(PATH_STATE).on('value', (snapshot) => {
            if (isGm()) return;
            const state = snapshot.val();
            if (state !== null) applyTimerState(state);
        });

        _isListening = true;
    };

    // タイマーとしての状態を完全にリセットする（画面からも消去）
    const clearAllTimerState = function(syncRemote = true) {
    
        // 終了時スイッチON
        if (_targetSwitchId > 0) {
            $gameSwitches.setValue(_targetSwitchId, true);
        }
        _isActive = false;
        _isPaused = false;
        _totalFrames = -1;
        _targetSwitchId = 0;
        _showResultUI = false; 
        if (syncRemote) syncTimerState();
    };

    // 0秒になった関数
    const triggerTimeUp = function() {
        _resultCounter = 0;
        const wasShowingResult = _showResultUI;

        // SE再生（AudioManagerの同期を外す手段がなければ、
        // 描画更新をスキップしている間に鳴らす）
        if (_currentExpireSe && _currentExpireSe.name && !wasShowingResult) {
            AudioManager.playSe(_currentExpireSe);
        }
        _showResultUI = true;
    }
    
    const resultCount = function() {
        _resultCounter += 1;
        // 120フレーム（2秒）経過したら終了
        if (_autoHide && _resultCounter >= 120) {
            clearAllTimerState();
            // Firebase側にも終了を通知して全クライアントで同期させる
        }
    };

    // --- コアアップデート ---
    const _Scene_Base_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        _Scene_Base_update.call(this);
        if (this instanceof Scene_Map || this instanceof Scene_Battle) {
            updateIndependentTimer();
        }
    };

    // ロジック層：動いている時だけカウントダウンする。0秒になったら即死。
    const updateIndependentTimer = function() {
        setupFirebaseListeners();
        const now = Date.now();
        if (!_lastIndependentTimerAt) {
            _lastIndependentTimerAt = now;
            return;
        }
        const elapsedFrames = _lastIndependentTimerAt
            ? Math.floor((now - _lastIndependentTimerAt) * 60 / 1000)
            : 0;
        if (elapsedFrames < 1) return;
        _lastIndependentTimerAt += elapsedFrames * 1000 / 60;

        if (_isPaused) {
            _lastIndependentTimerAt = now;
            return;
        }

        // 【ここが重要】タイマーが稼働中か、または表示中（終了済み）であれば更新を続ける
        if (_isActive || _showResultUI) {
            if (_totalFrames > 0) {
                _totalFrames -= elapsedFrames;
                // (GM同期処理は現状維持)
                if (_totalFrames <= 0) {
                    _totalFrames = 0;
                    triggerTimeUp();
                }
            } else if (_showResultUI && _resultCounter < 120) {
                // 0秒になったあとのカウント（120フレームまで継続）
                _resultCounter += elapsedFrames - 1;
                resultCount();
            }
        }
    };
    window.updateIndependentTimer = updateIndependentTimer;

    // --- UI部 (Sprite) ：タイマーの生死に関わらず、フラグを見てただ絵を描くだけ ---
    function Sprite_MadamisTimer() { this.initialize(...arguments); }
    Sprite_MadamisTimer.prototype = Object.create(Sprite.prototype);
    Sprite_MadamisTimer.prototype.constructor = Sprite_MadamisTimer;

    Sprite_MadamisTimer.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(400, 150);
        this._lastFrames = -1;
        this._lastPaused = null;
        this._lastSymbol = "";
        this._lastShowResult = null;
        this._lastResultImageReady = null;
        this._lastCloseButtonFlash = null;
    };

    Sprite_MadamisTimer.prototype.update = function() {
        Sprite.prototype.update.call(this);
        // 全員に「カウントダウン中」か「終了状態」を見せる
        this.visible = (_isActive || _showResultUI);
        
        if (this.visible) {
            this.x = _timerX;
            this.y = _timerY;
            this.updateBitmap();
            this.processInput(); // 操作権限は関数内で管理
        }
    };

    Sprite_MadamisTimer.prototype.updateBitmap = function() {
        const frames = _totalFrames;
        const paused = _isPaused;
        const showResult = _showResultUI;
        const currentSec = Math.ceil(frames / 60);
        const isGm = $gameSwitches.value(GM_SWITCH_ID);
        const resultImage = EXPIRE_IMAGE ? ImageManager.loadPicture(EXPIRE_IMAGE) : null;
        const resultImageReady = resultImage && resultImage.isReady();
        const closeButtonFlash = CLOSE_BUTTON_BLINK && (showResult || frames === 0) && isGm && !_autoHide
            && Math.floor(Graphics.frameCount / 30) % 2 === 0;

        // 時間表示用の文字列を作成
        const min = Math.floor(currentSec / 60);
        const sec = currentSec % 60;
        const timeText = `${min.padZero(2)}:${sec.padZero(2)}`;

        // 現在のタイマー状態を判定
        let state = "";
        if (showResult || frames === 0) {
            state = "result";
        } else if (paused) {
            state = "paused";
        } else {
            state = "playing";
        }

        // 描画更新の判定（変更がある場合のみ実行）
        if (this._lastFrames !== frames || this._lastPaused !== paused || this._lastSymbol !== state || this._lastShowResult !== showResult || this._lastResultImageReady !== resultImageReady || this._lastCloseButtonFlash !== closeButtonFlash) {
            this.bitmap.clear();
            this.bitmap.fontSize = 48;
            this.bitmap.outlineColor = "rgba(0,0,0,0.8)";
            this.bitmap.outlineWidth = 5;

            // 1. 状態に応じたボタン・記号の描画 (X=0〜50のエリア)
            if (state === "paused") {
                // 一時停止ボタン
                this.bitmap.fillRect(10, 45, 12, 40, "#000000");
                this.bitmap.fillRect(28, 45, 12, 40, "#000000");
                this.bitmap.fillRect(12, 47, 8, 36, "#ffffff");
                this.bitmap.fillRect(30, 47, 8, 36, "#ffffff");
            } else if (state === "playing") {
                // 再生ボタン
                this.bitmap.drawText("▶", 0, 40, 50, 50, "center");
            } else if (state === "result" && isGm && !_autoHide) {
                if (resultImageReady) {
                    const scale = Math.min(40 / resultImage.width, 40 / resultImage.height);
                    const width = resultImage.width * scale;
                    const height = resultImage.height * scale;
                    this.bitmap.blt(resultImage, 0, 0, resultImage.width, resultImage.height, (50 - width) / 2, 45 + (40 - height) / 2, width, height);
                    if (closeButtonFlash) {
                        const context = this.bitmap._context;
                        context.save();
                        context.globalCompositeOperation = "source-atop";
                        context.fillStyle = "rgba(255, 255, 255, 0.75)";
                        context.fillRect(0, 40, 50, 50);
                        context.restore();
                        this.bitmap._baseTexture.update();
                    }
                } else if (!EXPIRE_IMAGE) {
                    if (closeButtonFlash) this.bitmap.outlineColor = "#ffffff";
                    this.bitmap.drawText("✕", 0, 40, 50, 50, "center");
                    this.bitmap.outlineColor = "rgba(0,0,0,0.8)";
                }
            }

            // 2. 時間の描画 (X=60から開始して位置ズレを防止)
            this.bitmap.drawText(timeText, 60, 40, 340, 50, "left");

            // 3. GM専用：編集用UI (▲▼) の描画
            if (isGm && (paused || showResult || frames === 0)) {
                this.drawEditorUI();
            }

            // 状態の保存
            this._lastFrames = frames;
            this._lastPaused = paused;
            this._lastSymbol = state;
            this._lastShowResult = showResult;
            this._lastResultImageReady = resultImageReady;
            this._lastCloseButtonFlash = closeButtonFlash;
        }
    };

    Sprite_MadamisTimer.prototype.drawEditorUI = function() {
        this.bitmap.fontSize = 20;
        [55, 85, 135, 165].forEach(x => {
            this.bitmap.drawText("▲", x, 10, 40, 30, "center");
            this.bitmap.drawText("▼", x, 90, 40, 30, "center");
        });
    };

    // 完全独立したUI入力イベント（タイマーのコアロジックとは完全に無関係）
    Sprite_MadamisTimer.prototype.processInput = function() {
        if (!$gameSwitches.value(GM_SWITCH_ID) || !Einput_l_trig()) return;
        const tx = TouchInput.x - this.x;
        const ty = TouchInput.y - this.y;

        // 左端のアイコンクリック（再生・一時停止・✕ボタン）
        if (tx > 0 && tx < 50 && ty > 40 && ty < 90) {
            if (_showResultUI || _totalFrames === 0) {
                // ★【0秒表示中の✕ボタン押下】
                // すでにタイマーは0秒の瞬間に「終了（SE再生・スイッチONも完了）」しているので、
                // ここでは単に画面上のUIを消し去り、Firebaseへ終了を投げるだけ。
                clearAllTimerState();
            } else {
                _isPaused = !_isPaused;
                _lastIndependentTimerAt = Date.now();
                syncTimerState();
            }
            return;
        }
        
        // 時間調整（▲▼）
        if (_isPaused || _showResultUI || _totalFrames === 0) {
            let change = (ty > 10 && ty < 40) ? 1 : (ty > 90 && ty < 120) ? -1 : 0;
            if (change !== 0) {
                _isPaused = true;

                // 調整されたら、死体状態から「タイマー活動状態」へと復活させる
                const adjustment = [
                    { start: 60, end: 90, frames: 36000 }, // 分の十の位
                    { start: 90, end: 120, frames: 3600 },  // 分の一の位
                    { start: 140, end: 170, frames: 600 },  // 秒の十の位
                    { start: 170, end: 200, frames: 60 }    // 秒の一の位
                ].find(column => tx > column.start && tx < column.end);
                _totalFrames += adjustment ? adjustment.frames * change : 0;
                _totalFrames = Math.max(0, _totalFrames);
                if (_totalFrames === 0) _totalFrames = MINIMUM_TIMER_FRAMES;

                if (_totalFrames > 0) {
                    _isActive = true;       // タイマー脈動再開
                    _showResultUI = false;  // リザルト状態解除
                }

                _lastIndependentTimerAt = Date.now();
                syncTimerState();
            }
        }
    };

    // --- プラグインコマンド ---
    PluginManager.registerCommand(pluginName, "setTimer", args => {
        if (!isGm()) return;
        _timerX = Number(args.x);
        _timerY = Number(args.y);
        _targetSwitchId = Number(args.switchId);
        _autoHide = args.autoHide === "true";

        // SEの設定を強制的に「数値型」にキャストして保存
        if (args.seName && args.seName.trim() !== "") {
            // 関数化して安全に数値を取得するヘルパー
            const val = (arg, def) => {
                const num = Number(arg);
                return !isNaN(num) ? num : def;
            };
    
            _currentExpireSe = {
                name: String(args.seName),
                volume: val(args.seVolume, 90),
                pitch: val(args.sePitch, 100),
                pan: val(args.sePan, 0)
            };
        } else {
            _currentExpireSe = null;
        }

        _totalFrames = Number(args.seconds) * 60;
        if (_totalFrames === 0) _totalFrames = MINIMUM_TIMER_FRAMES;
        _lastIndependentTimerAt = Date.now();
        _isPaused = false;
        _showResultUI = false;
        _isActive = true;
        syncTimerState();
    });

    PluginManager.registerCommand(pluginName, "moveTimer", args => {
        if (!isGm()) return;
        _timerX = Number(args.x);
        _timerY = Number(args.y);
        syncTimerState();
    });

    PluginManager.registerCommand(pluginName, "stopTimer", () => {
        if (!isGm()) return;
        clearAllTimerState();
    });

    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (!this._madamisTimer) {
            this._madamisTimer = new Sprite_MadamisTimer();
            this.addChild(this._madamisTimer);
        }
    };

    const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        if (!this._madamisTimer) {
            this._madamisTimer = new Sprite_MadamisTimer();
            this.addChild(this._madamisTimer);
        }
    };

})();
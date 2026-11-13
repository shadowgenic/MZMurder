/*:
 * @target MZ
 * @plugindesc マウス・長押しタッチの押下・解放を正規化し、スイッチと座標変数へ確実に通知します。
 * @author Shadowgenic & Google Gemini
 *
 * @help 取りこぼしのないマウスクリック入力処理とスイッチへの代入を可能にします。
 * 【使い方】パラメータで左右クリックの押下・解放を受け取るスイッチと、座標を保存する変数を指定します。
 * マウス・タッチ環境では、指定秒数以上かつ開始位置から指定距離以内の長押しを右クリックとして扱います。
 * イベントごとに指定する場合は「入力状態と座標を代入」を使用します。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 * TouchInputの状態を「押した瞬間(trig)」「離した瞬間(rel)」として正規化します。
 * 外部からは Einput_l_trig() 等でアクセス可能です。
 * プラグインコマンドを並列処理することで、イベントの取得とその瞬間のマウス座標(X, Y)を指定した変数に代入できます。
 *
 * 【使い方】
 * 1. 押下・解放を自動反映するスイッチ番号と、座標保存用の変数番号を設定します。
 * 2. イベント条件を設定したスイッチで左・右クリックの瞬間を検出します。
 * 3. 同じフレームの入力を別処理で消費しないよう、入力を扱う並列イベントは整理して配置してください。
 *
 * @param --- 自動更新スイッチ ---
 * @param LeftTriggeredSwitch
 * @text 左：押した瞬間
 * @desc 左クリックを押した瞬間にONにするスイッチ番号です。0で自動更新を無効にします。
 * @type switch
 * @default 0
 *
 * @param LeftReleasedSwitch
 * @text 左：離した瞬間
 * @desc 左クリックを離した瞬間にONにするスイッチ番号です。0で自動更新を無効にします。
 * @type switch
 * @default 0
 *
 * @param RightTriggeredSwitch
 * @text 右：押した瞬間
 * @desc 右クリックを押した瞬間にONにするスイッチ番号です。0で自動更新を無効にします。
 * @type switch
 * @default 0
 *
 * @param RightReleasedSwitch
 * @text 右：離した瞬間
 * @desc 右クリックを離した瞬間にONにするスイッチ番号です。0で自動更新を無効にします。
 * @type switch
 * @default 0
 *
 * @param --- 長押し判定 ---
 *
 * @param LongPressSeconds
 * @text 長押し判定秒数
 * @desc この秒数以上押し続けると、右クリックとして扱います。
 * @type number
 * @decimals 2
 * @min 0
 * @default 2
 *
 * @param LongPressMoveTolerance
 * @text 長押し中の移動許容距離
 * @desc 開始位置からこの距離より大きく動くと、長押しではなくドラッグとして扱います（px）。
 * @type number
 * @min 0
 * @default 8
 *
 * @param --- 座標取得変数 ---
 * @param TargetXVariable
 * @text X座標 格納変数
 * @desc 入力が発生したときのマウスX座標を書き込む変数番号です。0で無効にします。
 * @type variable
 * @default 0
 *
 * @param TargetYVariable
 * @text Y座標 格納変数
 * @desc 入力が発生したときのマウスY座標を書き込む変数番号です。0で無効にします。
 * @type variable
 * @default 0
 *
 * @param CommandTabMode
 * @text プラグインコマンドの受付タブ
 * @desc 「入力状態と座標を代入」コマンドをメインタブでのみ受け付けるか、全タブで受け付けるかを選択します。
 * @type select
 * @option メインタブのみ
 * @value mainOnly
 * @option 全タブで受け付ける
 * @value allTabs
 * @default mainOnly
 *
 * @command assignSwitches
 * @text 入力状態と座標を代入
 * @desc 指定したスイッチに入力状態を、変数にマウス座標を代入します。
 *
 * @arg leftTrigId
 * @text 左：押した瞬間
 * @desc 左クリックを押した瞬間の状態を書き込むスイッチ番号です。
 * @type switch
 * @default 0
 *
 * @arg leftRelId
 * @text 左：離した瞬間
 * @desc 左クリックを離した瞬間の状態を書き込むスイッチ番号です。
 * @type switch
 * @default 0
 *
 * @arg rightTrigId
 * @text 右：押した瞬間
 * @desc 右クリックを押した瞬間の状態を書き込むスイッチ番号です。
 * @type switch
 * @default 0
 *
 * @arg rightRelId
 * @text 右：離した瞬間
 * @desc 右クリックを離した瞬間の状態を書き込むスイッチ番号です。
 * @type switch
 * @default 0
 * @arg varXId
 * @text X座標 格納変数
 * @desc 入力時のマウスX座標を書き込む変数番号です。
 * @type variable
 * @default 0
 *
 * @arg varYId
 * @text Y座標 格納変数
 * @desc 入力時のマウスY座標を書き込む変数番号です。
 * @type variable
 * @default 0
 */

(() => {
    'use strict';

    const pluginName = "InputTriggerRelease";
    const parameters = PluginManager.parameters(pluginName);

    const autoSw = {
        lTrig: Number(parameters['LeftTriggeredSwitch'] || 0),
        lRel:  Number(parameters['LeftReleasedSwitch'] || 0),
        rTrig: Number(parameters['RightTriggeredSwitch'] || 0),
        rRel:  Number(parameters['RightReleasedSwitch'] || 0)
    };

    const targetXVar = Number(parameters['TargetXVariable'] || 0);
    const targetYVar = Number(parameters['TargetYVariable'] || 0);
    const longPressFrames = Math.max(0, Number(parameters['LongPressSeconds'] || 3) * 60);
    const longPressMoveTolerance = Math.max(0, Number(parameters['LongPressMoveTolerance'] || 4));
    const commandTabMode = String(parameters['CommandTabMode'] || 'mainOnly');

    const isPluginCommandAllowed = function() {
        if (commandTabMode !== 'mainOnly') return true;
        return !$gameSystem || !$gameSystem._activeTabId || $gameSystem._activeTabId === 'main';
    };

    // 内部状態
    let _physL = false;
    let _physR = false;
    let _isLTrig = false;
    let _isLRel  = false;
    let _isRTrig = false;
    let _isRRel  = false;
    let _isLongPress = false;
    let _pressStartX = 0;
    let _pressStartY = 0;
    let _pressMoved = false;
    let _mousePressStartFrame = 0;

    const setPressStart = function(x, y) {
        _pressStartX = x;
        _pressStartY = y;
        _pressMoved = false;
        _isLongPress = false;
    };

    const _TouchInput_onTouchStart = TouchInput._onTouchStart;
    TouchInput._onTouchStart = function(event) {
        setPressStart(
            Graphics.pageToCanvasX(event.changedTouches[0].pageX),
            Graphics.pageToCanvasY(event.changedTouches[0].pageY)
        );
        _mousePressStartFrame = 0;
        _TouchInput_onTouchStart.call(this, event);
    };

    const _TouchInput_onTouchEnd = TouchInput._onTouchEnd;
    TouchInput._onTouchEnd = function(event) {
        _isLongPress = false;
        _pressMoved = false;
        _mousePressStartFrame = 0;
        _TouchInput_onTouchEnd.call(this, event);
    };

    const _TouchInput_onTouchCancel = TouchInput._onTouchCancel;
    TouchInput._onTouchCancel = function(event) {
        _isLongPress = false;
        _pressMoved = false;
        _mousePressStartFrame = 0;
        _TouchInput_onTouchCancel.call(this, event);
    };

    // --- 公開関数 ---
    window.Einput_l_trig = function() {
        return _isLTrig && !window._madamisInputConsumed;
    };
    window.Einput_l_rel  = function() {
        return _isLRel  && !window._madamisInputConsumed;
    };
    window.Einput_r_trig = function() {
       return _isRTrig && !window._madamisInputConsumed;
    };
    window.Einput_r_rel  = function() {
       return _isRRel  && !window._madamisInputConsumed;
    };

    // --- コアロジック ---
    // タイトル・メニューなど Scene_Map 以外でも Einput_* を正しく使えるように、
    // 入力状態の正規化は全シーン共通の Scene_Base.update で毎フレーム1回行う。
    const updateNormalizedInput = function() {
        const isScreenPressed = TouchInput._screenPressed;
        const isMousePressed = TouchInput._mousePressed;
        const isPressed = isScreenPressed || isMousePressed;

        if (isMousePressed && !_mousePressStartFrame) {
            setPressStart(TouchInput.x, TouchInput.y);
            _mousePressStartFrame = Graphics.frameCount || 1;
        }
        if (!isPressed) {
            _isLongPress = false;
            _pressMoved = false;
            _mousePressStartFrame = 0;
        } else if (!_pressMoved && Math.hypot(TouchInput.x - _pressStartX, TouchInput.y - _pressStartY) > longPressMoveTolerance) {
            _pressMoved = true;
        }

        const heldFrames = isMousePressed && _mousePressStartFrame
            ? (Graphics.frameCount - _mousePressStartFrame + 1)
            : TouchInput._pressedTime;
        const isLongPressed = isPressed && !_pressMoved && heldFrames >= longPressFrames;
        if (isLongPressed && !_isLongPress) {
            _isLongPress = true;
            TouchInput._newState.cancelled = true;
        }
        const currL = TouchInput.isPressed() && !_isLongPress;
        const currR = TouchInput.isCancelled() || _isLongPress;

        _isLTrig = !_physL && currL;
        _isLRel  = _physL && !currL;
        _isRTrig = !_physR && currR;
        _isRRel  = _physR && !currR;

        if ($gameSwitches) {
            if (autoSw.lTrig > 0) $gameSwitches.setValue(autoSw.lTrig, _isLTrig);
            if (autoSw.lRel > 0)  $gameSwitches.setValue(autoSw.lRel,  _isLRel);
            if (autoSw.rTrig > 0) $gameSwitches.setValue(autoSw.rTrig, _isRTrig);
            if (autoSw.rRel > 0)  $gameSwitches.setValue(autoSw.rRel,  _isRRel);
        }

        // 自動更新設定がある場合、左クリックトリガー時のみ座標を更新
        if ($gameVariables && window.Einput_l_trig()) {
            if (targetXVar > 0) $gameVariables.setValue(targetXVar, TouchInput.x);
            if (targetYVar > 0) $gameVariables.setValue(targetYVar, TouchInput.y);
        }

        _physL = currL;
        _physR = currR;
    };

    const _Scene_Base_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        updateNormalizedInput();
        _Scene_Base_update.call(this);
    };

    // --- プラグインコマンドの実装 ---
    PluginManager.registerCommand(pluginName, "assignSwitches", args => {
        if (!isPluginCommandAllowed()) return;

        // スイッチの更新
        if ($gameSwitches) {
            const lT = Number(args.leftTrigId);
            const lR = Number(args.leftRelId);
            const rT = Number(args.rightTrigId);
            const rR = Number(args.rightRelId);
            if (lT > 0) $gameSwitches.setValue(lT, _isLTrig);
            if (lR > 0) $gameSwitches.setValue(lR, _isLRel);
            if (rT > 0) $gameSwitches.setValue(rT, _isRTrig);
            if (rR > 0) $gameSwitches.setValue(rR, _isRRel);
        }
        
        // 座標変数の更新（コマンド呼び出し時の座標を取得）
        if ($gameVariables) {
            const vX = Number(args.varXId);
            const vY = Number(args.varYId);
            if (vX > 0) $gameVariables.setValue(vX, TouchInput.x);
            if (vY > 0) $gameVariables.setValue(vY, TouchInput.y);
        }
    });

})();

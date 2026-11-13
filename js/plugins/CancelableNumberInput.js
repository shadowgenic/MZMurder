/*:
 * @target MZ
 * @plugindesc 数値入力をキャンセル可能にします。キャンセル時は変数を変更しません。
 * @author Shadowgenic & Github Copilot
 * 
 * @help
 * 数値入力中にキャンセルボタン、Escキー、右クリックで入力を中止できます。
 * キャンセルした場合、入力先の変数は元の値のままです。
 * 「キャンセル禁止スイッチ」がONの間は、ボタン、Escキー、右クリックで
 * キャンセルできません。スイッチ番号が0なら常にキャンセル可能です。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @param disableCancelSwitchId
 * @text キャンセル禁止スイッチ
 * @desc このスイッチがONの間は数値入力をキャンセルできません。0で無効です。
 * @type switch
 * @default 0
 */

(() => {
    "use strict";

    const pluginName = "CancelableNumberInput";
    const disableCancelSwitchId = Number(
        PluginManager.parameters(pluginName).disableCancelSwitchId || 0
    );

    function isCancelDisabled() {
        return disableCancelSwitchId > 0 && $gameSwitches &&
            $gameSwitches.value(disableCancelSwitchId);
    }

    Window_NumberInput.prototype.isCancelEnabled = function() {
        return !isCancelDisabled();
    };

    Window_NumberInput.prototype.processCancel = function() {
        if (!this.isCancelEnabled()) return;
        SoundManager.playCancel();
        this._messageWindow.terminateMessage();
        this.updateInputData();
        this.deactivate();
        this.close();
    };

    Window_NumberInput.prototype.windowHeight = function() {
        return this.fittingHeight(1) + this.buttonSpacing() + 48;
    };

    Window_NumberInput.prototype.totalButtonWidth = function() {
        const buttons = this.isCancelEnabled() ? this._buttons : this._buttons.slice(0, -1);
        const spacing = this.buttonSpacing();
        return buttons.reduce((width, button) => width + button.width + spacing, -spacing);
    };

    Window_NumberInput.prototype.createButtons = function() {
        this._buttons = [];
        for (const type of ["down", "up", "ok", "cancel"]) {
            const button = new Sprite_Button(type);
            this._buttons.push(button);
            this.addInnerChild(button);
        }
        this._buttons[0].setClickHandler(this.onButtonDown.bind(this));
        this._buttons[1].setClickHandler(this.onButtonUp.bind(this));
        this._buttons[2].setClickHandler(this.onButtonOk.bind(this));
        this._buttons[3].setClickHandler(this.onButtonCancel.bind(this));
    };

    Window_NumberInput.prototype.onButtonCancel = function() {
        if (this.isOpenAndActive() && this.isCancelEnabled()) this.processCancel();
    };

    const _Window_NumberInput_start = Window_NumberInput.prototype.start;
    Window_NumberInput.prototype.start = function() {
        this._cancelDisabled = isCancelDisabled();
        this._buttons[3].visible = !this._cancelDisabled;
        _Window_NumberInput_start.call(this);
    };

    const _Window_NumberInput_update = Window_NumberInput.prototype.update;
    Window_NumberInput.prototype.update = function() {
        _Window_NumberInput_update.call(this);
        const cancelDisabled = isCancelDisabled();
        if (this.active && this._cancelDisabled !== cancelDisabled) {
            this._cancelDisabled = cancelDisabled;
            this._buttons[3].visible = !cancelDisabled;
            this.updatePlacement();
            this.placeButtons();
            this.createContents();
            this.refresh();
        }
    };
})();

/*:
 * @target MZ
 * @plugindesc 選択肢ごとに有効化スイッチを設定できる選択肢表示を追加します。
 * @author Shadowgenic & GitHub Copilot
 *
 * @help
 * 【使い方】各選択肢の表示条件にするスイッチを用意し、「スイッチ条件付き選択肢を表示」で選択肢と結果保存先変数を指定します。
 * 条件スイッチがONの選択肢だけが表示され、選択結果はコマンドで指定した変数に保存されます。
 * 「スイッチ条件付き選択肢を表示」を実行すると、設定した選択肢を表示します。
 * 各選択肢は、有効化スイッチが0またはONの時だけ表示されます。
 *
 * 選択結果は指定したゲーム変数へ代入されます。
 * 1番目の選択肢は1、2番目は2、キャンセルは0です。
 * 「一行目を見出しとして表示」をONにすると、先頭の登録項目を選べない文字列として表示します。
 * この場合、2行目以降の選択肢が1番目から数えられます。
 * キャンセル時にONにするスイッチを指定すると、条件分岐でキャンセル処理を作れます。
 * キャンセルは右クリックまたは選択肢ウィンドウ外のクリックで行います。
 * 全選択肢が無効な場合は、操作不能を防ぐためキャンセルを許可します。
 *
 * @command showChoices
 * @text スイッチ条件付き選択肢を表示
 * @desc 選択肢を表示し、結果をゲーム変数へ代入します。
 *
 * @arg choices
 * @text 選択肢
 * @desc 表示する選択肢と、それぞれの有効化スイッチです。
 * @type struct<SwitchChoice>[]
 * @default []

 * @arg firstLineIsLabel
 * @text 一行目を見出しとして表示
 * @desc ONにすると、先頭の登録項目を選択できない文字列として表示します。
 * @type boolean
 * @default false
 *
 * @arg resultVariableId
 * @text 結果を代入するゲーム変数
 * @desc 選択肢の番号（1から開始）、またはキャンセル時の0を代入します。
 * @type variable
 * @default 1
 *
 * @arg cancelEnabled
 * @text キャンセルを許可
 * @desc ONにすると、キャンセル操作を行えます。
 * @type boolean
 * @default true
 *
 * @arg cancelSwitchId
 * @text キャンセル時にONにするスイッチ
 * @desc キャンセル時にONにするスイッチです。0で無効です。表示開始時にOFFになります。
 * @type switch
 * @default 0
 *
 * @arg defaultChoice
 * @text 初期選択位置
 * @desc 最初に選択する選択肢の番号です。0を指定すると未選択で開始します。見出しは数えません。非表示の項目を指定した場合は最初の表示項目になります。
 * @type number
 * @min 0
 * @default 1
 *
 * @arg windowPosition
 * @text ウィンドウ位置
 * @desc 位置指定が有効な場合に使用する、選択肢ウィンドウの配置です。
 * @type select
 * @option 中央
 * @value 0
 * @option 左上
 * @value 1
 * @option 中央上
 * @value 2
 * @default 0
 *
 * @arg background
 * @text 背景
 * @type select
 * @option ウィンドウ
 * @value 0
 * @option 暗くする
 * @value 1
 * @option 透明
 * @value 2
 * @default 0
 *
 * @arg positionEnabled
 * @text ウィンドウ位置指定を有効
 * @desc OFFにすると、選択肢ウィンドウをマウスカーソル付近へ表示します。
 * @type boolean
 * @default true
 *
 * @arg textAlignment
 * @text 選択肢の文字揃え
 * @desc 選択肢の文章をウィンドウ内で左詰めまたは中央寄せにします。
 * @type select
 * @option 左詰め
 * @value left
 * @option 中央寄せ
 * @value center
 * @default left
 */

/*~struct~SwitchChoice:
 * @param text
 * @text 選択肢の文章
 * @type string
 *
 * @param enabledSwitchId
 * @text 有効化スイッチ
 * @desc このスイッチがONの時だけ表示されます。0で常に表示します。
 * @type switch
 * @default 0
 */

(() => {
    "use strict";

    const pluginName = "SwitchChoices";

    function normalizeEscapeCharacters(text) {
        return String(text).replace(/[￥¥](?=[A-Z]+\[|[{}])/gi, "\\");
    }

    function validId(value) {
        const id = Number(value) || 0;
        return Number.isInteger(id) && id > 0 ? id : 0;
    }

    function parseChoices(value) {
        try {
            return JSON.parse(value || "[]").map((entry, index) => {
                const choice = JSON.parse(entry);
                const enabledSwitchId = validId(choice.enabledSwitchId);
                return {
                    text: normalizeEscapeCharacters(choice.text || ""),
                    enabled: !enabledSwitchId || $gameSwitches.value(enabledSwitchId),
                    result: index + 1
                };
            });
        } catch (error) {
            console.warn("SwitchChoices: 選択肢の設定を読み取れませんでした。", error);
            return [];
        }
    }

    const _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        _Window_ChoiceList_updatePlacement.call(this);
        if ($gameMessage._switchChoicesAtCursor) {
            this.x = Math.max(0, Math.min(TouchInput.x + 16, Graphics.boxWidth - this.width));
            this.y = Math.max(0, Math.min(TouchInput.y + 16, Graphics.boxHeight - this.height));
            return;
        }
        switch ($gameMessage._switchChoicesWindowPosition) {
            case 1:
                this.x = 0;
                this.y = 0;
                break;
            case 2:
                this.x = (Graphics.boxWidth - this.width) / 2;
                this.y = 0;
                break;
            default:
                this.x = (Graphics.boxWidth - this.width) / 2;
                this.y = (Graphics.boxHeight - this.height) / 2;
                break;
        }
    };

    const _Window_ChoiceList_drawItem = Window_ChoiceList.prototype.drawItem;
    Window_ChoiceList.prototype.drawItem = function(index) {
        if ($gameMessage._switchChoicesTextAlignment !== "center") {
            _Window_ChoiceList_drawItem.call(this, index);
            return;
        }
        const rect = this.itemLineRect(index);
        const text = this.commandName(index);
        const textWidth = this.textSizeEx(text).width;
        this.drawTextEx(text, rect.x + (rect.width - textWidth) / 2, rect.y, rect.width);
    };

    const _Window_ChoiceList_makeCommandList = Window_ChoiceList.prototype.makeCommandList;
    Window_ChoiceList.prototype.makeCommandList = function() {
        if (!$gameMessage._switchChoicesFirstLineLabel) {
            _Window_ChoiceList_makeCommandList.call(this);
            return;
        }
        this.addCommand($gameMessage._switchChoicesFirstLineLabel, "label", false);
        for (const choice of $gameMessage.choices()) {
            this.addCommand(choice, "choice");
        }
    };

    const _Window_ChoiceList_cursorUp = Window_ChoiceList.prototype.cursorUp;
    Window_ChoiceList.prototype.cursorUp = function(wrap) {
        if ($gameMessage._switchChoicesFirstLineLabel && this.index() === 1) {
            this.select(this.maxItems() - 1);
            return;
        }
        _Window_ChoiceList_cursorUp.call(this, wrap);
    };

    const _Window_ChoiceList_hitTest = Window_ChoiceList.prototype.hitTest;
    Window_ChoiceList.prototype.hitTest = function(x, y) {
        const index = _Window_ChoiceList_hitTest.call(this, x, y);
        return $gameMessage._switchChoicesFirstLineLabel && index === 0 ? -1 : index;
    };

    const _Window_ChoiceList_updateCancelButton = Window_ChoiceList.prototype.updateCancelButton;
    Window_ChoiceList.prototype.updateCancelButton = function() {
        _Window_ChoiceList_updateCancelButton.call(this);
        if ($gameMessage._switchChoicesOutsideCancel && this._cancelButton) {
            this._cancelButton.visible = false;
        }
    };

    const _Window_ChoiceList_processTouch = Window_ChoiceList.prototype.processTouch;
    Window_ChoiceList.prototype.processTouch = function() {
        _Window_ChoiceList_processTouch.call(this);
        if ($gameMessage._switchChoicesOutsideCancel && this.isOpenAndActive() &&
            TouchInput.isClicked() && !this.isTouchedInsideFrame() && this.isCancelEnabled()) {
            this.processCancel();
        }
    };

    PluginManager.registerCommand(pluginName, "showChoices", function(args) {
        const choices = parseChoices(args.choices);
        const resultVariableId = validId(args.resultVariableId);
        const cancelSwitchId = validId(args.cancelSwitchId);
        const firstLineIsLabel = args.firstLineIsLabel === "true";
        const firstLineLabel = firstLineIsLabel ? choices.shift() : null;
        if (firstLineLabel) {
            choices.forEach((choice, index) => {
                choice.result = index + 1;
            });
        }
        if (!choices.length) {
            console.warn("SwitchChoices: 選択肢を1つ以上設定してください。");
            return;
        }

        if (cancelSwitchId) $gameSwitches.setValue(cancelSwitchId, false);
        const visibleChoices = choices.filter(choice => choice.enabled);
        const canCancel = args.cancelEnabled === "true" || !visibleChoices.length;
        const defaultResult = Number(args.defaultChoice);
        const defaultChoice = defaultResult === 0 ? -1 : Math.max(0,
            visibleChoices.findIndex(choice => choice.result === defaultResult ||
                (!Number.isFinite(defaultResult) && choice.result === 1))
        );
        const choiceDefaultIndex = firstLineLabel && visibleChoices.length && defaultChoice >= 0 ?
            defaultChoice + 1 : defaultChoice;

        $gameMessage.setChoices(
            visibleChoices.map(choice => choice.text),
            choiceDefaultIndex,
            canCancel ? -2 : -1
        );
        $gameMessage.setChoiceBackground(Number(args.background) || 0);
        $gameMessage._switchChoicesAtCursor = args.positionEnabled !== "true";
        $gameMessage._switchChoicesWindowPosition = Number(args.windowPosition) || 0;
        $gameMessage._switchChoicesTextAlignment = args.textAlignment || "left";
        $gameMessage._switchChoicesOutsideCancel = true;
        $gameMessage._switchChoicesFirstLineLabel = firstLineLabel ? firstLineLabel.text : "";
        $gameMessage.setChoiceCallback(index => {
            if (resultVariableId) {
                const choiceIndex = firstLineLabel && index >= 0 ? index - 1 : index;
                const result = index === -2 ? 0 : visibleChoices[choiceIndex].result;
                $gameVariables.setValue(resultVariableId, result);
            }
            if (cancelSwitchId && index === -2) $gameSwitches.setValue(cancelSwitchId, true);
            delete $gameMessage._switchChoicesAtCursor;
            delete $gameMessage._switchChoicesWindowPosition;
            delete $gameMessage._switchChoicesTextAlignment;
            delete $gameMessage._switchChoicesOutsideCancel;
            delete $gameMessage._switchChoicesFirstLineLabel;
        });
        this.setWaitMode("message");
    });
})();
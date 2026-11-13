/*:
 * @target MZ
 * @plugindesc 指定したゲーム変数に文字列や配列を代入します。
 * @author Shadowgenic & GitHub Copilot
 *
 * @help
 * 【使い方】イベントから目的に合う変数操作コマンドを選び、保存先の変数と値または参照元を指定します。
 * 文字列・JSON配列・変動アドレス・スイッチを扱う場合は、対応する専用コマンドを使用します。
 * 「文字列を変数に代入」を実行すると、指定した文字列をゲーム変数に代入します。
 * 「配列を変数に代入」を実行すると、数値や真偽値など任意のJSON値を含む配列を
 * ゲーム変数に代入します。
 * 「変数群のコピー」を実行すると、指定した連番のゲーム変数を別の連番の
 * ゲーム変数へ順番にコピーします。
 * 「変数から配列を作成する」を実行すると、指定した連番のゲーム変数の値を
 * 要素にした配列を、指定したゲーム変数へ代入します。
 * 「変動アドレスに書き込み」を実行すると、指定変数の値とオフセットから
 * 書き込み先の変数番号を求め、別の変数の値を代入します。
 * 「変動アドレスに加減算」を実行すると、指定変数の値とオフセットから
 * 書き込み先の変数番号を求め、その変数の値に数値を加減算します。
 * 「変動アドレスから代入」を実行すると、指定変数の値とオフセットから
 * 読み込み元の変数番号を求め、その値を指定したゲーム変数へ代入します。
 * 「変動アドレスのスイッチに代入」を実行すると、指定変数の値とオフセットから
 * 代入先のスイッチ番号を求め、別のスイッチまたは直接指定した値を代入します。
 * 「変動アドレスのスイッチから代入」を実行すると、指定変数の値とオフセットから
 * 読み込み元のスイッチ番号を求め、その値を指定したスイッチへ代入します。
 * 「配列中の存在確認」を実行すると、指定した配列に値が含まれるかを確認し、
 * 結果を指定したスイッチへ代入します。
 * 「数値と文字列の変換」を実行すると、指定したゲーム変数の現在値を数値または
 * 文字列に変換します。
 * 「文字列として結合」を実行すると、2つのゲーム変数の値を文字列として結合し、
 * 指定したゲーム変数へ代入します。
 * 「値を変数の範囲に代入」を実行すると、開始番号から終了番号までの
 * ゲーム変数に同じ値を代入します。
 * 「変数で指定した変数に値を代入」を実行すると、指定したゲーム変数に
 * 入っている番号のゲーム変数へ値を代入します。
 * 各「文字列を変数に追記」コマンドでは、対象のゲーム変数に保存済みの文字列の
 * 後ろへ指定した文字列を追加します。
 *
 * @command setString
 * @text 文字列を変数に代入
 * @desc 指定したゲーム変数に文字列を代入します。
 *
 * @arg variableId
 * @text 代入先ゲーム変数
 * @desc 文字列を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg text
 * @text 代入する文字列
 * @desc ゲーム変数に代入する文字列です。
 * @type string
 * @default
 *
 * @command setArray
 * @text 配列を変数に代入
 * @desc 指定したゲーム変数に任意のJSON値を含む配列を代入します。
 *
 * @arg variableId
 * @text 代入先ゲーム変数
 * @desc 配列を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg values
 * @text 配列（JSON形式）
 * @desc 例: ["文字列", 123, true, {"key":"value"}]
 * @type string
 * @default []
 *
 * @command copyVariableRange
 * @text 変数群のコピー
 * @desc コピー元の連番のゲーム変数を、コピー先の開始番号から順に代入します。
 *
 * @arg sourceStartVariableId
 * @text コピー元始まり
 * @desc コピーする範囲の開始ゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg sourceEndVariableId
 * @text コピー元終わり
 * @desc コピーする範囲の終了ゲーム変数です。始まりと終わりを含みます。
 * @type variable
 * @default 1
 *
 * @arg destinationStartVariableId
 * @text コピー先始まり
 * @desc コピー先の先頭ゲーム変数です。コピー元と同じ個数の変数へ代入します。
 * @type variable
 * @default 1
 *
 * @command createArrayFromVariables
 * @text 変数から配列を作成する
 * @desc 指定した連番のゲーム変数の値を要素にした配列を、指定先のゲーム変数へ代入します。
 *
 * @arg destinationVariableId
 * @text 代入先の変数
 * @desc 作成した配列を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg elementStartVariableId
 * @text 要素となる変数の始まり
 * @desc 配列の最初の要素にするゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg elementEndVariableId
 * @text 要素となる変数の終わり
 * @desc 配列の最後の要素にするゲーム変数です。始まりと終わりを含みます。
 * @type variable
 * @default 1
 *
 * @command writeToDynamicAddress
 * @text 変動アドレスに書き込み
 * @desc 書き込み先指定変数の値にオフセットを加えた番号の変数へ、指定変数または直接指定した値を代入します。
 *
 * @arg addressVariableId
 * @text 書き込み先指定変数
 * @desc 値にオフセットを加えて書き込み先の変数番号を求めるゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg offset
 * @text オフセット
 * @desc 書き込み先指定変数の値に加える整数です。負の値も指定できます。
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @arg valueVariableId
 * @text 書き込み内容変数
 * @desc このゲーム変数に入っている値を代入します。0の場合は直接書き込み内容を使用します。
 * @type variable
 * @default 1
 *
 * @arg directValue
 * @text 直接書き込み内容
 * @desc 書き込み内容変数が0の場合に代入する値です。123は数値、文字列はそのまま、JSON配列も指定できます。
 * @type string
 * @default
 *
 * @command addToDynamicAddress
 * @text 変動アドレスに加減算
 * @desc 書き込み先指定変数の値にオフセットを加えた番号の変数へ、指定した数値を加減算します。負の値を指定すると減算します。
 *
 * @arg addressVariableId
 * @text 書き込み先指定変数
 * @desc 値にオフセットを加えて書き込み先の変数番号を求めるゲーム変数です。
 * @type variable
 * @default 0
 *
 * @arg offset
 * @text オフセット
 * @desc 書き込み先指定変数の値に加える整数です。負の値も指定できます。
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @arg valueVariableId
 * @text 加減算する値の変数
 * @desc このゲーム変数に入っている数値を加減算します。0の場合は直接指定した値を使用します。
 * @type variable
 * @default 0
 *
 * @arg directValue
 * @text 直接指定する加減算値
 * @desc 加減算する値の変数が0の場合に使う数値です。負の値を指定すると減算します。
 * @type number
 * @decimals 4
 * @min -999999999
 * @max 999999999
 * @default 0
 *
 * @command copyFromDynamicAddress
 * @text 変動アドレスから代入
 * @desc 読み込み元指定変数の値にオフセットを加えた番号の変数の値を、指定したゲーム変数へ代入します。
 *
 * @arg destinationVariableId
 * @text 代入先ゲーム変数
 * @desc 読み込んだ値を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg addressVariableId
 * @text 読み込み元指定変数
 * @desc 値にオフセットを加えて読み込み元の変数番号を求めるゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg offset
 * @text オフセット
 * @desc 読み込み元指定変数の値に加える整数です。負の値も指定できます。
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @command writeSwitchToDynamicAddress
 * @text 変動アドレスのスイッチに代入
 * @desc スイッチ番号指定変数の値にオフセットを加えた番号のスイッチへ、指定スイッチまたは直接指定した値を代入します。
 *
 * @arg addressVariableId
 * @text 代入先スイッチ番号指定変数
 * @desc 値にオフセットを加えて代入先のスイッチ番号を求めるゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg offset
 * @text オフセット
 * @desc 代入先スイッチ番号指定変数の値に加える整数です。負の値も指定できます。
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @arg valueSwitchId
 * @text 代入内容スイッチ
 * @desc このスイッチのON/OFFを代入します。0の場合は直接指定するON/OFFを使用します。
 * @type switch
 * @default 0
 *
 * @arg directValue
 * @text 直接指定するON/OFF
 * @desc 代入内容スイッチが0の場合に代入するON/OFFです。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @command copySwitchFromDynamicAddress
 * @text 変動アドレスのスイッチから代入
 * @desc スイッチ番号指定変数の値にオフセットを加えた番号のスイッチのON/OFFを、指定したスイッチへ代入します。
 *
 * @arg destinationSwitchId
 * @text 代入先スイッチ
 * @desc 読み込んだON/OFFを代入するスイッチです。
 * @type switch
 * @default 1
 *
 * @arg addressVariableId
 * @text 読み込み元スイッチ番号指定変数
 * @desc 値にオフセットを加えて読み込み元のスイッチ番号を求めるゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg offset
 * @text オフセット
 * @desc 読み込み元スイッチ番号指定変数の値に加える整数です。負の値も指定できます。
 * @type number
 * @min -9999
 * @max 9999
 * @default 0
 *
 * @command arrayContains
 * @text 配列中の存在確認
 * @desc 指定した配列を格納したゲーム変数に、指定した値が含まれるかを確認してスイッチへ代入します。
 *
 * @arg destinationSwitchId
 * @text 代入先スイッチ
 * @desc 配列に値が含まれるかどうかを代入するスイッチです。
 * @type switch
 * @default 1
 *
 * @arg arrayVariableId
 * @text チェックする配列の変数番号
 * @desc チェック対象の配列を格納したゲーム変数です。配列以外の場合はOFFになります。
 * @type variable
 * @default 1
 *
 * @arg elementVariableId
 * @text 要素の変数番号
 * @desc 配列に含まれるかを確認する値を格納したゲーム変数です。0の場合は直接入力した値を使用します。
 * @type variable
 * @default 0
 *
 * @arg directValue
 * @text 値
 * @desc 要素の変数番号が0の場合に確認する値です。数値・真偽値・JSON配列・JSONオブジェクト、または文字列を指定します。
 * @type string
 * @default
 *
 * @command convertVariableType
 * @text 数値と文字列の変換
 * @desc 指定したゲーム変数の現在値を数値または文字列へ変換します。
 *
 * @arg variableId
 * @text 変数の番号
 * @desc 値の型を変換するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg targetType
 * @text 変換後の型
 * @desc 文字列または数値を選択します。
 * @type select
 * @option 文字列
 * @value string
 * @option 数値
 * @value number
 * @default string
 *
 * @arg digitCount
 * @text 数値文字列の桁数
 * @desc 文字列へ変換する時の桁数です。0は通常の文字列化、1以上は先頭を0で埋めます。
 * @type number
 * @min 0
 * @default 0
 *
 * @command concatenateAsString
 * @text 文字列として結合
 * @desc 前後と間の文字列を加え、2つのゲーム変数の値を文字列として結合します。
 *
 * @arg destinationVariableId
 * @text 代入先の変数
 * @desc 結合結果を代入するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg prefix
 * @text 前に追加する文字列
 * @desc 変数1の前に追加する文字列です。
 * @type string
 * @default
 *
 * @arg firstVariableId
 * @text 変数1
 * @desc 結合する1つ目のゲーム変数です。0の場合は空文字列として扱います。
 * @type variable
 * @default 1
 *
 * @arg separator
 * @text 間に追加する文字列
 * @desc 変数1と変数2の間に追加する文字列です。
 * @type string
 * @default
 *
 * @arg secondVariableId
 * @text 変数2
 * @desc 結合する2つ目のゲーム変数です。0の場合は空文字列として扱います。
 * @type variable
 * @default 1
 *
 * @arg suffix
 * @text 後に追加する文字列
 * @desc 変数2の後に追加する文字列です。
 * @type string
 * @default
 *
 * @command appendString
 * @text 文字列を変数に追記
 * @desc 指定したゲーム変数の既存文字列の後ろに文字列を追加します。
 *
 * @arg variableId
 * @text 代入先ゲーム変数
 * @desc 文字列を追記するゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg text
 * @text 追記する文字列
 * @desc ゲーム変数の既存文字列の後ろに追加する文字列です。
 * @type string
 * @default
 *
 * @command setStringByVariable
 * @text 変数で指定した変数に値を代入
 * @desc 指定したゲーム変数に入っている番号のゲーム変数へ値を代入します。
 *
 * @arg destinationVariableId
 * @text 代入先番号を格納した変数
 * @desc 代入先ゲーム変数の番号を格納したゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg text
 * @text 代入する値
 * @desc 数値・真偽値・JSON配列・JSONオブジェクト、または文字列を指定します。
 * @type string
 * @default
 *
 * @command appendStringByVariable
 * @text 変数で指定した変数に文字列を追記
 * @desc 指定したゲーム変数に入っている番号のゲーム変数へ文字列を追記します。
 *
 * @arg destinationVariableId
 * @text 代入先番号を格納した変数
 * @desc 追記先ゲーム変数の番号を格納したゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg text
 * @text 追記する文字列
 * @desc ゲーム変数の既存文字列の後ろに追加する文字列です。
 * @type string
 * @default
 *
 * @command setStringRange
 * @text 値を変数の範囲に代入
 * @desc 指定した範囲のゲーム変数に同じ値を代入します。
 *
 * @arg startVariableId
 * @text 開始ゲーム変数
 * @desc 文字列を代入する範囲の開始ゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg endVariableId
 * @text 終了ゲーム変数
 * @desc 文字列を代入する範囲の終了ゲーム変数です。開始番号と終了番号を含みます。
 * @type variable
 * @default 1
 *
 * @arg text
 * @text 代入する値
 * @desc 数値・真偽値・JSON配列・JSONオブジェクト、または文字列を指定します。
 * @type string
 * @default
 *
 * @command appendStringRange
 * @text 文字列を変数の範囲に追記
 * @desc 指定した範囲のゲーム変数の既存文字列の後ろに同じ文字列を追加します。
 *
 * @arg startVariableId
 * @text 開始ゲーム変数
 * @desc 文字列を追記する範囲の開始ゲーム変数です。
 * @type variable
 * @default 1
 *
 * @arg endVariableId
 * @text 終了ゲーム変数
 * @desc 文字列を追記する範囲の終了ゲーム変数です。開始番号と終了番号を含みます。
 * @type variable
 * @default 1
 *
 * @arg text
 * @text 追記する文字列
 * @desc 範囲内のゲーム変数の既存文字列の後ろに追加する文字列です。
 * @type string
 * @default
 */

(() => {
    "use strict";

    const pluginName = "SetVariables";

    function validVariableId(value) {
        const variableId = Number(value) || 0;
        return Number.isInteger(variableId) && variableId > 0 ? variableId : 0;
    }

    function validSwitchId(value) {
        const switchId = Number(value) || 0;
        return Number.isInteger(switchId) && switchId > 0 ? switchId : 0;
    }

    function appendString(variableId, text) {
        $gameVariables.setValue(variableId, String($gameVariables.value(variableId)) + text);
    }

    function parseDirectValue(value) {
        if (value === "") {
            return "";
        }
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }

    function romanNumeralToNumber(value) {
        const numeral = value.toUpperCase();
        if (!/^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(numeral)) {
            return null;
        }
        const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        let result = 0;
        for (let index = 0; index < numeral.length; index++) {
            const current = values[numeral[index]];
            const next = values[numeral[index + 1]] || 0;
            result += current < next ? -current : current;
        }
        return result;
    }

    function japaneseNumeralToNumber(value) {
        const digitValues = { "〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9 };
        const smallUnits = { "十": 10, "百": 100, "千": 1000 };
        const largeUnits = { "万": 10000, "億": 100000000, "兆": 1000000000000 };
        let total = 0;
        let section = 0;
        let digit = null;
        for (const character of value) {
            if (Object.prototype.hasOwnProperty.call(digitValues, character)) {
                digit = digitValues[character];
            } else if (Object.prototype.hasOwnProperty.call(smallUnits, character)) {
                section += (digit === null ? 1 : digit) * smallUnits[character];
                digit = null;
            } else if (Object.prototype.hasOwnProperty.call(largeUnits, character)) {
                total += (section + (digit === null ? 0 : digit)) * largeUnits[character];
                section = 0;
                digit = null;
            }
        }
        return total + section + (digit === null ? 0 : digit);
    }

    function valueToNumber(value) {
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) {
            return numberValue;
        }
        if (typeof value !== "string") {
            return 0;
        }

        const normalizedValue = value.normalize("NFKC");
        const digitMatch = normalizedValue.match(/[+-]?\d+(?:\.\d+)?/);
        if (digitMatch) {
            return Number(digitMatch[0]);
        }
        const romanMatch = normalizedValue.match(/[IVXLCDM]+/i);
        if (romanMatch) {
            const romanValue = romanNumeralToNumber(romanMatch[0]);
            if (romanValue !== null) {
                return romanValue;
            }
        }
        const japaneseMatch = value.match(/[〇零一二三四五六七八九十百千万億兆]+/);
        return japaneseMatch ? japaneseNumeralToNumber(japaneseMatch[0]) : 0;
    }

    PluginManager.registerCommand(pluginName, "setString", args => {
        const variableId = validVariableId(args.variableId);
        if (!variableId) {
            console.warn("SetVariables: 有効なゲーム変数を指定してください。");
            return;
        }
        $gameVariables.setValue(variableId, parseDirectValue(args.text || ""));
    });

    PluginManager.registerCommand(pluginName, "setArray", args => {
        const variableId = validVariableId(args.variableId);
        if (!variableId) {
            console.warn("SetVariables: 有効なゲーム変数を指定してください。");
            return;
        }

        try {
            const values = JSON.parse(args.values || "[]");
            if (!Array.isArray(values)) {
                throw new TypeError("配列ではありません。");
            }
            $gameVariables.setValue(variableId, values);
        } catch (error) {
            console.warn("SetVariables: 配列の要素を正しく指定してください。", error);
        }
    });

    PluginManager.registerCommand(pluginName, "copyVariableRange", args => {
        const sourceStartVariableId = validVariableId(args.sourceStartVariableId);
        const sourceEndVariableId = validVariableId(args.sourceEndVariableId);
        const destinationStartVariableId = validVariableId(args.destinationStartVariableId);
        if (!sourceStartVariableId || !sourceEndVariableId || !destinationStartVariableId) {
            console.warn("SetVariables: 有効なコピー元・コピー先ゲーム変数を指定してください。");
            return;
        }

        const firstSourceVariableId = Math.min(sourceStartVariableId, sourceEndVariableId);
        const lastSourceVariableId = Math.max(sourceStartVariableId, sourceEndVariableId);
        const values = [];
        for (let variableId = firstSourceVariableId; variableId <= lastSourceVariableId; variableId++) {
            values.push($gameVariables.value(variableId));
        }
        for (let index = 0; index < values.length; index++) {
            $gameVariables.setValue(destinationStartVariableId + index, values[index]);
        }
    });

    PluginManager.registerCommand(pluginName, "createArrayFromVariables", args => {
        const destinationVariableId = validVariableId(args.destinationVariableId);
        const elementStartVariableId = validVariableId(args.elementStartVariableId);
        const elementEndVariableId = validVariableId(args.elementEndVariableId);
        if (!destinationVariableId || !elementStartVariableId || !elementEndVariableId) {
            console.warn("SetVariables: 有効な代入先・要素となるゲーム変数を指定してください。");
            return;
        }

        const firstElementVariableId = Math.min(elementStartVariableId, elementEndVariableId);
        const lastElementVariableId = Math.max(elementStartVariableId, elementEndVariableId);
        const values = [];
        for (let variableId = firstElementVariableId; variableId <= lastElementVariableId; variableId++) {
            values.push($gameVariables.value(variableId));
        }
        $gameVariables.setValue(destinationVariableId, values);
    });

    PluginManager.registerCommand(pluginName, "writeToDynamicAddress", args => {
        const addressVariableId = validVariableId(args.addressVariableId);
        const valueVariableId = Number(args.valueVariableId);
        const offset = Number(args.offset);
        if (!addressVariableId || !Number.isInteger(offset) || !Number.isInteger(valueVariableId) || valueVariableId < 0) {
            console.warn("SetVariables: 有効な書き込み先指定変数、オフセット、書き込み内容変数を指定してください。");
            return;
        }

        const destinationVariableId = validVariableId(Number($gameVariables.value(addressVariableId)) + offset);
        if (!destinationVariableId) {
            console.warn("SetVariables: 算出した書き込み先のゲーム変数番号が無効です。");
            return;
        }
        const value = valueVariableId === 0
            ? parseDirectValue(args.directValue || "")
            : $gameVariables.value(valueVariableId);
        $gameVariables.setValue(destinationVariableId, value);
    });

    PluginManager.registerCommand(pluginName, "addToDynamicAddress", args => {
        const addressVariableId = validVariableId(args.addressVariableId);
        const valueVariableId = Number(args.valueVariableId);
        const offset = Number(args.offset);
        if (!addressVariableId || !Number.isInteger(offset) || !Number.isInteger(valueVariableId) || valueVariableId < 0) {
            console.warn("SetVariables: 有効な書き込み先指定変数、オフセット、加減算する値の変数を指定してください。");
            return;
        }

        const destinationVariableId = validVariableId(Number($gameVariables.value(addressVariableId)) + offset);
        if (!destinationVariableId) {
            console.warn("SetVariables: 算出した書き込み先のゲーム変数番号が無効です。");
            return;
        }

        const currentValue = Number($gameVariables.value(destinationVariableId));
        const amount = Number(valueVariableId === 0 ? args.directValue : $gameVariables.value(valueVariableId));
        if (!Number.isFinite(currentValue) || !Number.isFinite(amount)) {
            console.warn("SetVariables: 加減算する対象と値には数値を指定してください。");
            return;
        }
        $gameVariables.setValue(destinationVariableId, currentValue + amount);
    });

    PluginManager.registerCommand(pluginName, "copyFromDynamicAddress", args => {
        const addressVariableId = validVariableId(args.addressVariableId);
        const destinationVariableId = validVariableId(args.destinationVariableId);
        const offset = Number(args.offset);
        if (!addressVariableId || !destinationVariableId || !Number.isInteger(offset)) {
            console.warn("SetVariables: 有効な読み込み元指定変数、オフセット、代入先ゲーム変数を指定してください。");
            return;
        }

        const sourceVariableId = validVariableId(Number($gameVariables.value(addressVariableId)) + offset);
        if (!sourceVariableId) {
            console.warn("SetVariables: 算出した読み込み元のゲーム変数番号が無効です。");
            return;
        }
        $gameVariables.setValue(destinationVariableId, $gameVariables.value(sourceVariableId));
    });

    PluginManager.registerCommand(pluginName, "writeSwitchToDynamicAddress", args => {
        const addressVariableId = validVariableId(args.addressVariableId);
        const valueSwitchId = Number(args.valueSwitchId);
        const offset = Number(args.offset);
        if (!addressVariableId || !Number.isInteger(offset) || !Number.isInteger(valueSwitchId) || valueSwitchId < 0) {
            console.warn("SetVariables: 有効な代入先スイッチ番号指定変数、オフセット、代入内容スイッチを指定してください。");
            return;
        }

        const destinationSwitchId = validSwitchId(Number($gameVariables.value(addressVariableId)) + offset);
        if (!destinationSwitchId) {
            console.warn("SetVariables: 算出した代入先のスイッチ番号が無効です。");
            return;
        }
        const value = valueSwitchId === 0 ? args.directValue === "true" : $gameSwitches.value(valueSwitchId);
        $gameSwitches.setValue(destinationSwitchId, value);
    });

    PluginManager.registerCommand(pluginName, "copySwitchFromDynamicAddress", args => {
        const addressVariableId = validVariableId(args.addressVariableId);
        const destinationSwitchId = validSwitchId(args.destinationSwitchId);
        const offset = Number(args.offset);
        if (!addressVariableId || !destinationSwitchId || !Number.isInteger(offset)) {
            console.warn("SetVariables: 有効な読み込み元スイッチ番号指定変数、オフセット、代入先スイッチを指定してください。");
            return;
        }

        const sourceSwitchId = validSwitchId(Number($gameVariables.value(addressVariableId)) + offset);
        if (!sourceSwitchId) {
            console.warn("SetVariables: 算出した読み込み元のスイッチ番号が無効です。");
            return;
        }
        $gameSwitches.setValue(destinationSwitchId, $gameSwitches.value(sourceSwitchId));
    });

    PluginManager.registerCommand(pluginName, "arrayContains", args => {
        const destinationSwitchId = validSwitchId(args.destinationSwitchId);
        const arrayVariableId = validVariableId(args.arrayVariableId);
        const elementVariableId = Number(args.elementVariableId);
        if (!destinationSwitchId || !arrayVariableId || !Number.isInteger(elementVariableId) || elementVariableId < 0) {
            console.warn("SetVariables: 有効な代入先スイッチ、チェックする配列の変数、要素の変数を指定してください。");
            return;
        }

        const array = $gameVariables.value(arrayVariableId);
        const element = elementVariableId === 0
            ? parseDirectValue(args.directValue || "")
            : $gameVariables.value(elementVariableId);
        $gameSwitches.setValue(destinationSwitchId, Array.isArray(array) && array.includes(element));
    });

    PluginManager.registerCommand(pluginName, "convertVariableType", args => {
        const variableId = validVariableId(args.variableId);
        const digitCount = Number(args.digitCount);
        if (!variableId || !Number.isInteger(digitCount) || digitCount < 0) {
            console.warn("SetVariables: 有効なゲーム変数と桁数を指定してください。");
            return;
        }

        const value = $gameVariables.value(variableId);
        if (args.targetType === "string") {
            if (digitCount === 0) {
                $gameVariables.setValue(variableId, String(value));
                return;
            }

            const numberValue = valueToNumber(value);
            if (numberValue === null) {
                console.warn("SetVariables: ゼロ埋めする値を数値に変換できません。");
                return;
            }
            const sign = numberValue < 0 ? "-" : "";
            const digits = String(Math.abs(numberValue)).padStart(digitCount, "0");
            $gameVariables.setValue(variableId, sign + digits);
            return;
        }

        const numberValue = valueToNumber(value);
        if (numberValue === null) {
            console.warn("SetVariables: 数値に変換できない値です。");
            return;
        }
        $gameVariables.setValue(variableId, numberValue);
    });

    PluginManager.registerCommand(pluginName, "concatenateAsString", args => {
        const destinationVariableId = validVariableId(args.destinationVariableId);
        const firstVariableId = Number(args.firstVariableId);
        const secondVariableId = Number(args.secondVariableId);
        if (!destinationVariableId
            || !Number.isInteger(firstVariableId) || firstVariableId < 0
            || !Number.isInteger(secondVariableId) || secondVariableId < 0) {
            console.warn("SetVariables: 有効な代入先、変数1、変数2を指定してください。");
            return;
        }

        const value = String(args.prefix || "")
            + (firstVariableId === 0 ? "" : String($gameVariables.value(firstVariableId)))
            + String(args.separator || "")
            + (secondVariableId === 0 ? "" : String($gameVariables.value(secondVariableId)))
            + String(args.suffix || "");
        $gameVariables.setValue(destinationVariableId, value);
    });

    PluginManager.registerCommand(pluginName, "appendString", args => {
        const variableId = validVariableId(args.variableId);
        if (!variableId) {
            console.warn("SetVariables: 有効なゲーム変数を指定してください。");
            return;
        }
        appendString(variableId, String(args.text || ""));
    });

    PluginManager.registerCommand(pluginName, "setStringByVariable", args => {
        const destinationVariableId = validVariableId(args.destinationVariableId);
        if (!destinationVariableId) {
            console.warn("SetVariables: 代入先番号を格納したゲーム変数を指定してください。");
            return;
        }
        const variableId = validVariableId($gameVariables.value(destinationVariableId));
        if (!variableId) {
            console.warn("SetVariables: 代入先のゲーム変数番号が無効です。");
            return;
        }
        $gameVariables.setValue(variableId, String(args.text || ""));
    });

    PluginManager.registerCommand(pluginName, "appendStringByVariable", args => {
        const destinationVariableId = validVariableId(args.destinationVariableId);
        if (!destinationVariableId) {
            console.warn("SetVariables: 代入先番号を格納したゲーム変数を指定してください。");
            return;
        }
        const variableId = validVariableId($gameVariables.value(destinationVariableId));
        if (!variableId) {
            console.warn("SetVariables: 代入先のゲーム変数番号が無効です。");
            return;
        }
        appendString(variableId, String(args.text || ""));
    });

    PluginManager.registerCommand(pluginName, "setStringRange", args => {
        const startVariableId = validVariableId(args.startVariableId);
        const endVariableId = validVariableId(args.endVariableId);
        if (!startVariableId || !endVariableId) {
            console.warn("SetVariables: 有効な開始・終了ゲーム変数を指定してください。");
            return;
        }
        const value = parseDirectValue(args.text || "");
        const firstVariableId = Math.min(startVariableId, endVariableId);
        const lastVariableId = Math.max(startVariableId, endVariableId);
        for (let variableId = firstVariableId; variableId <= lastVariableId; variableId++) {
            $gameVariables.setValue(variableId, value);
        }
    });

    PluginManager.registerCommand(pluginName, "appendStringRange", args => {
        const startVariableId = validVariableId(args.startVariableId);
        const endVariableId = validVariableId(args.endVariableId);
        if (!startVariableId || !endVariableId) {
            console.warn("SetVariables: 有効な開始・終了ゲーム変数を指定してください。");
            return;
        }
        const text = String(args.text || "");
        const firstVariableId = Math.min(startVariableId, endVariableId);
        const lastVariableId = Math.max(startVariableId, endVariableId);
        for (let variableId = firstVariableId; variableId <= lastVariableId; variableId++) {
            appendString(variableId, text);
        }
    });
})();
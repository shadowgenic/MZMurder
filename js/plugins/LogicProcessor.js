/*:
 * @target MZ
 * @plugindesc スイッチや変数の論理処理を行います。
 * @author Shadowgenic
 *
 * @command andSwitches
 * @text スイッチのAND処理
 * @desc 指定したすべてのスイッチがONのときだけ、代入先スイッチをONにします。
 *
 * @arg targetSwitchId
 * @text 代入先スイッチ
 * @desc ANDの評価結果を代入するスイッチです。
 * @type switch
 * @default 0
 *
 * @arg sourceSwitchIds
 * @text 判定するスイッチ
 * @desc すべてがONなら代入先をONにします。範囲指定と併用できます。
 * @type switch[]
 * @default []
 *
 * @arg rangeStartSwitchId
 * @text 範囲開始スイッチ
 * @desc 判定対象に含めるスイッチ範囲の開始番号です。終了スイッチも指定した場合だけ有効です。
 * @type switch
 * @default 0
 *
 * @arg rangeEndSwitchId
 * @text 範囲終了スイッチ
 * @desc 判定対象に含めるスイッチ範囲の終了番号です。開始・終了の両端を含みます。
 * @type switch
 * @default 0
 *
 * @command orSwitches
 * @text スイッチのOR処理
 * @desc 指定したスイッチのいずれかがONなら、代入先スイッチをONにします。
 *
 * @arg targetSwitchId
 * @text 代入先スイッチ
 * @desc ORの評価結果を代入するスイッチです。
 * @type switch
 * @default 0
 *
 * @arg sourceSwitchIds
 * @text 判定するスイッチ
 * @desc いずれかがONなら代入先をONにします。範囲指定と併用できます。
 * @type switch[]
 * @default []
 *
 * @arg rangeStartSwitchId
 * @text 範囲開始スイッチ
 * @desc 判定対象に含めるスイッチ範囲の開始番号です。終了スイッチも指定した場合だけ有効です。
 * @type switch
 * @default 0
 *
 * @arg rangeEndSwitchId
 * @text 範囲終了スイッチ
 * @desc 判定対象に含めるスイッチ範囲の終了番号です。開始・終了の両端を含みます。
 * @type switch
 * @default 0
 *
 * @command toggleSwitch
 * @text 指定スイッチをトグル
 * @desc 指定したスイッチをONならOFFに、OFFならONに切り替えます。
 *
 * @arg switchId
 * @text 切り替えるスイッチ
 * @desc 現在のON/OFFを反転するスイッチです。
 * @type switch
 * @default 0
 *
 * @command countSwitches
 * @text スイッチの数を数える
 * @desc 指定したスイッチのうち、選んだ状態の数をゲーム変数へ代入します。
 *
 * @arg targetVariableId
 * @text 代入先ゲーム変数
 * @desc ONまたはOFFの数を代入するゲーム変数です。
 * @type variable
 * @default 0
 *
 * @arg sourceSwitchIds
 * @text 数えるスイッチ
 * @desc 数える対象のスイッチです。範囲指定と併用できます。
 * @type switch[]
 * @default []
 *
 * @arg rangeStartSwitchId
 * @text 範囲開始スイッチ
 * @desc 数える対象に含めるスイッチ範囲の開始番号です。終了スイッチも指定した場合だけ有効です。
 * @type switch
 * @default 0
 *
 * @arg rangeEndSwitchId
 * @text 範囲終了スイッチ
 * @desc 数える対象に含めるスイッチ範囲の終了番号です。開始・終了の両端を含みます。
 * @type switch
 * @default 0
 *
 * @arg targetState
 * @text 数える状態
 * @desc ONまたはOFFのどちらを数えるか選びます。
 * @type select
 * @option ON
 * @value true
 * @option OFF
 * @value false
 * @default true
 *
 * @command countVariablesInRange
 * @text 変数の数を数える
 * @desc 指定した範囲条件に当てはまるゲーム変数の数を、ゲーム変数へ代入します。
 *
 * @arg targetVariableId
 * @text 代入先ゲーム変数
 * @desc 条件に当てはまる数を代入するゲーム変数です。
 * @type variable
 * @default 0
 *
 * @arg sourceVariableIds
 * @text 数えるゲーム変数
 * @desc 条件を判定するゲーム変数です。範囲指定と併用できます。
 * @type variable[]
 * @default []
 *
 * @arg rangeStartVariableId
 * @text 対象範囲開始ゲーム変数
 * @desc 数える対象に含めるゲーム変数範囲の開始番号です。終了変数も指定した場合だけ有効です。
 * @type variable
 * @default 0
 *
 * @arg rangeEndVariableId
 * @text 対象範囲終了ゲーム変数
 * @desc 数える対象に含めるゲーム変数範囲の終了番号です。開始・終了の両端を含みます。
 * @type variable
 * @default 0
 *
 * @arg lowerBoundCondition
 * @text 下限の条件
 * @desc 下限を使う場合の比較方法です。
 * @type select
 * @option 下限を指定しない
 * @value none
 * @option 基準値以上
 * @value greaterOrEqual
 * @option 基準値より大きい
 * @value greaterThan
 * @default none
 *
 * @arg lowerBoundValue
 * @text 下限の基準値
 * @desc 下限基準変数が0の場合に使用する下限の値です。
 * @type number
 * @decimals 4
 * @default 0
 *
 * @arg lowerBoundVariableId
 * @text 下限基準変数
 * @desc この変数の現在値を下限に使います。0なら下限の基準値を使用します。
 * @type variable
 * @default 0
 *
 * @arg upperBoundCondition
 * @text 上限の条件
 * @desc 上限を使う場合の比較方法です。
 * @type select
 * @option 上限を指定しない
 * @value none
 * @option 基準値以下
 * @value lessOrEqual
 * @option 基準値より小さい
 * @value lessThan
 * @default none
 *
 * @arg upperBoundValue
 * @text 上限の基準値
 * @desc 上限基準変数が0の場合に使用する上限の値です。
 * @type number
 * @decimals 4
 * @default 0
 *
 * @arg upperBoundVariableId
 * @text 上限基準変数
 * @desc この変数の現在値を上限に使います。0なら上限の基準値を使用します。
 * @type variable
 * @default 0
 *
 * @command averageVariables
 * @text 変数の平均値を代入
 * @desc 指定したゲーム変数の数値だけを平均し、結果を代入先ゲーム変数へ保存します。
 *
 * @arg targetVariableId
 * @text 代入先ゲーム変数
 * @desc 平均値を代入するゲーム変数です。
 * @type variable
 * @default 0
 *
 * @arg sourceVariableIds
 * @text 平均するゲーム変数
 * @desc 平均の対象にするゲーム変数です。範囲指定と併用できます。
 * @type variable[]
 * @default []
 *
 * @arg rangeStartVariableId
 * @text 範囲開始ゲーム変数
 * @desc 平均対象に含めるゲーム変数範囲の開始番号です。終了変数も指定した場合だけ有効です。
 * @type variable
 * @default 0
 *
 * @arg rangeEndVariableId
 * @text 範囲終了ゲーム変数
 * @desc 平均対象に含めるゲーム変数範囲の終了番号です。開始・終了の両端を含みます。
 * @type variable
 * @default 0
 *
 * @arg roundingMode
 * @text 小数の処理方法
 * @desc 平均値が整数でないときの処理方法です。
 * @type select
 * @option 切り捨て
 * @value truncate
 * @option 四捨五入
 * @value round
 * @default round
 *
 * @command maximumVariables
 * @text 変数の最大値を代入
 * @desc 指定したゲーム変数の数値から最大値を求め、代入先ゲーム変数へ保存します。
 *
 * @arg targetVariableId
 * @text 代入先ゲーム変数
 * @desc 最大値を代入するゲーム変数です。
 * @type variable
 * @default 0
 *
 * @arg sourceVariableIds
 * @text 比較するゲーム変数
 * @desc 最大値を求めるゲーム変数です。範囲指定と併用できます。
 * @type variable[]
 * @default []
 *
 * @arg rangeStartVariableId
 * @text 範囲開始ゲーム変数
 * @desc 比較対象に含めるゲーム変数範囲の開始番号です。終了変数も指定した場合だけ有効です。
 * @type variable
 * @default 0
 *
 * @arg rangeEndVariableId
 * @text 範囲終了ゲーム変数
 * @desc 比較対象に含めるゲーム変数範囲の終了番号です。開始・終了の両端を含みます。
 * @type variable
 * @default 0
 *
 * @command minimumVariables
 * @text 変数の最小値を代入
 * @desc 指定したゲーム変数の数値から最小値を求め、代入先ゲーム変数へ保存します。
 *
 * @arg targetVariableId
 * @text 代入先ゲーム変数
 * @desc 最小値を代入するゲーム変数です。
 * @type variable
 * @default 0
 *
 * @arg sourceVariableIds
 * @text 比較するゲーム変数
 * @desc 最小値を求めるゲーム変数です。範囲指定と併用できます。
 * @type variable[]
 * @default []
 *
 * @arg rangeStartVariableId
 * @text 範囲開始ゲーム変数
 * @desc 比較対象に含めるゲーム変数範囲の開始番号です。終了変数も指定した場合だけ有効です。
 * @type variable
 * @default 0
 *
 * @arg rangeEndVariableId
 * @text 範囲終了ゲーム変数
 * @desc 比較対象に含めるゲーム変数範囲の終了番号です。開始・終了の両端を含みます。
 * @type variable
 * @default 0
 *
 * @help
 * プラグインコマンドからのスイッチまたはスイッチ範囲を指定してANDまたはORで評価し、
 * 結果を先頭の「代入先スイッチ」に反映します。
 *
 * 範囲開始スイッチと範囲終了スイッチは両端を含み、開始番号が終了番号より大きい場合も
 * 小さい番号から大きい番号までを判定します。個別指定と範囲指定は併用できます。
 *
 * 「指定スイッチをトグル」では、指定したスイッチがONならOFFに、OFFならONに切り替えます。
 *
 * 「指定スイッチのON/OFF数を代入」では、個別指定または範囲指定したスイッチのうち、
 * 選択した状態に一致する個数を先頭の「代入先ゲーム変数」に保存します。
 *
 * 「範囲内の変数値の数を代入」では、個別指定または範囲指定したゲーム変数のうち、
 * 下限・上限の条件を満たす数値の個数を先頭の「代入先ゲーム変数」に保存します。
 * 基準変数を指定した場合は、その現在値を基準値として使用します。
 *
 * 「変数の平均値を代入」では、個別指定または範囲指定したゲーム変数の平均値を
 * 先頭の「代入先ゲーム変数」に保存します。数値として扱えない値は平均から除外します。
 * 平均値が整数でない場合は、「小数の処理方法」で切り捨てまたは四捨五入を選びます。
 * 対象に数値が一つもない場合は、代入先ゲーム変数を変更しません。
 *
 * 「変数の最大値を代入」と「変数の最小値を代入」も、個別指定または範囲指定した
 * ゲーム変数の数値を比較し、先頭の「代入先ゲーム変数」にそれぞれの結果を保存します。
 *
 * 入力スイッチを指定しなかった場合、ANDとORのどちらも代入先をOFFにします。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 */

(() => {
    'use strict';

    const pluginName = "LogicProcessor";

    const parseSwitchIds = function(value) {
        try {
            const switchIds = JSON.parse(value || "[]");
            return Array.isArray(switchIds)
                ? switchIds.map(Number).filter(switchId => switchId > 0)
                : [];
        } catch (error) {
            return [];
        }
    };

    const collectSourceSwitchIds = function(args) {
        const switchIds = parseSwitchIds(args.sourceSwitchIds);
        const rangeStartSwitchId = Number(args.rangeStartSwitchId);
        const rangeEndSwitchId = Number(args.rangeEndSwitchId);
        if (rangeStartSwitchId > 0 && rangeEndSwitchId > 0) {
            const startSwitchId = Math.min(rangeStartSwitchId, rangeEndSwitchId);
            const endSwitchId = Math.max(rangeStartSwitchId, rangeEndSwitchId);
            for (let switchId = startSwitchId; switchId <= endSwitchId; switchId++) {
                switchIds.push(switchId);
            }
        }
        return [...new Set(switchIds)];
    };

    const collectSourceVariableIds = function(args) {
        const variableIds = parseSwitchIds(args.sourceVariableIds);
        const rangeStartVariableId = Number(args.rangeStartVariableId);
        const rangeEndVariableId = Number(args.rangeEndVariableId);
        if (rangeStartVariableId > 0 && rangeEndVariableId > 0) {
            const startVariableId = Math.min(rangeStartVariableId, rangeEndVariableId);
            const endVariableId = Math.max(rangeStartVariableId, rangeEndVariableId);
            for (let variableId = startVariableId; variableId <= endVariableId; variableId++) {
                variableIds.push(variableId);
            }
        }
        return [...new Set(variableIds)];
    };

    const collectNumericVariableValues = function(args) {
        return collectSourceVariableIds(args)
            .map(variableId => Number($gameVariables.value(variableId)))
            .filter(Number.isFinite);
    };

    const resolveBoundValue = function(value, variableId) {
        const boundVariableId = Number(variableId);
        return Number(boundVariableId > 0 ? $gameVariables.value(boundVariableId) : value);
    };

    const assignResult = function(args, evaluator) {
        const targetSwitchId = Number(args.targetSwitchId);
        const sourceSwitchIds = collectSourceSwitchIds(args);
        const result = sourceSwitchIds.length > 0 && evaluator(sourceSwitchIds);
        if (targetSwitchId > 0) {
            $gameSwitches.setValue(targetSwitchId, result);
        }
    };

    PluginManager.registerCommand(pluginName, "andSwitches", args => {
        assignResult(args, switchIds => switchIds.every(switchId => $gameSwitches.value(switchId)));
    });

    PluginManager.registerCommand(pluginName, "orSwitches", args => {
        assignResult(args, switchIds => switchIds.some(switchId => $gameSwitches.value(switchId)));
    });

    PluginManager.registerCommand(pluginName, "toggleSwitch", args => {
        const switchId = Number(args.switchId);
        if (switchId > 0) {
            $gameSwitches.setValue(switchId, !$gameSwitches.value(switchId));
        }
    });

    PluginManager.registerCommand(pluginName, "countSwitches", args => {
        const targetVariableId = Number(args.targetVariableId);
        const targetState = args.targetState === "true";
        const count = collectSourceSwitchIds(args)
            .filter(switchId => $gameSwitches.value(switchId) === targetState).length;
        if (targetVariableId > 0) {
            $gameVariables.setValue(targetVariableId, count);
        }
    });

    PluginManager.registerCommand(pluginName, "countVariablesInRange", args => {
        const targetVariableId = Number(args.targetVariableId);
        const lowerBound = resolveBoundValue(args.lowerBoundValue, args.lowerBoundVariableId);
        const upperBound = resolveBoundValue(args.upperBoundValue, args.upperBoundVariableId);
        const count = collectNumericVariableValues(args).filter(value => {
            const meetsLowerBound = args.lowerBoundCondition === "none" ||
                (Number.isFinite(lowerBound) && (args.lowerBoundCondition === "greaterOrEqual"
                    ? value >= lowerBound
                    : value > lowerBound));
            const meetsUpperBound = args.upperBoundCondition === "none" ||
                (Number.isFinite(upperBound) && (args.upperBoundCondition === "lessOrEqual"
                    ? value <= upperBound
                    : value < upperBound));
            return meetsLowerBound && meetsUpperBound;
        }).length;
        if (targetVariableId > 0) {
            $gameVariables.setValue(targetVariableId, count);
        }
    });

    PluginManager.registerCommand(pluginName, "averageVariables", args => {
        const targetVariableId = Number(args.targetVariableId);
        const values = collectNumericVariableValues(args);
        if (targetVariableId > 0 && values.length > 0) {
            const average = values.reduce((total, value) => total + value, 0) / values.length;
            const result = args.roundingMode === "truncate" ? Math.trunc(average) : Math.round(average);
            $gameVariables.setValue(targetVariableId, result);
        }
    });

    PluginManager.registerCommand(pluginName, "maximumVariables", args => {
        const targetVariableId = Number(args.targetVariableId);
        const values = collectNumericVariableValues(args);
        if (targetVariableId > 0 && values.length > 0) {
            $gameVariables.setValue(targetVariableId, values.reduce((maximum, value) => Math.max(maximum, value)));
        }
    });

    PluginManager.registerCommand(pluginName, "minimumVariables", args => {
        const targetVariableId = Number(args.targetVariableId);
        const values = collectNumericVariableValues(args);
        if (targetVariableId > 0 && values.length > 0) {
            $gameVariables.setValue(targetVariableId, values.reduce((minimum, value) => Math.min(minimum, value)));
        }
    });
})();

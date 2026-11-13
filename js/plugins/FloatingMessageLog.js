/*:
 * @target MZ
 * @plugindesc メッセージの重ね表示、ルビ対応、履歴ログタブを追加します。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】通常どおり「文章の表示」を使うとメッセージが画面上に重なって記録されます。
 * ログを開く・消去する・同期方式を変える場合は、対応するプラグインコマンドをイベントから実行します。InputTriggerRelease.jsが必要です。
 * 通常のメッセージを画面上へ積み重ねて表示し、既読メッセージをログとして保存します。
 * ログタブを開くと履歴をスクロールして確認できます。`【漢字/かんじ】` 形式の簡易ルビにも対応します。
 * メッセージ待ち中はクリック入力を検出し、画面上のログアイコンからログを開けます。
 *
 * 【使い方】
 * 1. プラグインを有効にし、ログアイコンの画像名と座標を必要に応じて設定します。
 * 2. 通常どおり「文章の表示」を実行すると、メッセージが履歴へ追加されます。
 * 3. イベントコマンド「ログ画面を表示」でログタブを開きます。
 * 4. 「ログ履歴を消去」で保存済みの履歴を消去できます。
 * 5. 自動消去を使う場合は「自動消去の有効/無効」で切り替えます。
 * 6. 「文章スタックのクリア」で画面上の文章だけを消去できます。
 * 画面右上にログアイコンを作成し、過去5000件のログにアクセス可能にします。
 * 文章表示中に右クリックで現在のタブ内にログを表示できます。
 * Shiftキーまたはマウスホイールを一定フレーム以上押し続けると、文章を高速で自動送りできます。
 * 【漢字/かんじ】の形式で記述されたテキストをルビとして自動で上下に分解して描画します。
 * 
 * 【文章同期】
 * FirebaseSync.jsで同じルームへ接続しているPC間で、文章の表示と読み進めを同期できます。
 * イベントを実行したPCのモードで処理され、受信側PCのモード設定は使用しません。
 *
 * ・非同期: 従来どおり、イベントを実行したPCだけに文章を表示します。
 * ・半同期: イベントを実行したPCが文章を全PCへ表示します。各PCは任意のタイミングで読み進めます。
 * ・全同期: イベントを実行したPCが文章を全PCへ表示します。許可されたPCが読み進めると全PCの表示待機を解除します。
 * 連続した「文章の表示」はまとめて送信されます。条件分岐、ウェイト、変数・スイッチ操作などの
 * 非文章コマンドが間にある場合はそこで区切られ、実際に分岐を通過して次の文章へ到達した時点で送信されます。
 *
 * モード初期値は「モード初期値」パラメータで設定します。
 * イベント中に変更する場合は、プラグインコマンド「文章同期モードを変更」を実行してください。
 * このコマンドは実行したPCだけのモードを変更します。
 *
 * 【全同期の読み進め許可】
 * 「読み進め許可を変更」で、GM、イベント実行者、送信された文章と同じ顔グラフィックのPC、全員を個別に有効・無効にできます。
 * 有効な条件のいずれかに該当するPCが読み進めを実行できます。
 * 初期値は各「読み進めを許可」パラメータで設定します。
 *
 * 【他PCから文章を受信した場合の注意】
 * 半同期または全同期の文章を受信すると、受信PCでも文章の待機状態になります。
 * そのPCが別のイベントを実行中の場合、そのイベントは次の待機判定から停止します。
 * 半同期では受信PC自身の入力、全同期では許可PCによる同期入力で待機が解除されます。
 * 複数PCが別々のイベントを並行して実行する場面では、この停止を考慮してイベントを構成してください。
 *
 * 動作にはInputTriggerRelease.jsが必要です。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @param --- ログ表示設定 ---
 * @param logLimit
 * @text ログ保持最大数
 * @desc 保存するメッセージ履歴の最大件数です。超過分は古い順に削除します。
 * @default 1000
 * @param isSingleFace
 * @text 1ファイル1キャラ設定
 * @desc 顔画像を4x2分割せず、1画像全体を1キャラクターとして表示するか指定します。
 * @type boolean
 * @default true
 * @param autoClear
 * @text イベント終了時に自動消去
 * @desc イベント処理終了時に画面上のメッセージ履歴を自動消去するか指定します。
 * @type boolean
 * @default true
 *
 * @param --- 文章同期設定 ---
 * @param messageSyncMode
 * @text モード初期値
 * @desc 非同期は各PCのみ、半同期は表示のみ共有、全同期は表示と読み進めを共有します。
 * @type select
 * @option 非同期
 * @value async
 * @option 半同期
 * @value semiSync
 * @option 全同期
 * @value fullSync
 * @default async
 * @param allowGmAdvance
 * @text GMの読み進めを許可
 * @type boolean
 * @default true
 * @param allowEventRunnerAdvance
 * @text イベント実行者の読み進めを許可
 * @type boolean
 * @default true
 * @param allowSameFaceAdvance
 * @text 同一顔グラフィックPCの読み進めを許可
 * @type boolean
 * @default false
 * @param allowEveryoneAdvance
 * @text 全員の読み進めを許可
 * @type boolean
 * @default false
 *
 * @param --- レイアウト設定 ---
 * @param fontSizeRate
 * @text 文字サイズ倍率
 * @desc メッセージ本文の標準文字サイズに掛ける倍率です。
 * @default 1.3
 * @param rubyFontSizeRate
 * @text ルビ文字サイズ倍率
 * @desc ルビ文字サイズを本文サイズに掛ける倍率です。
 * @type number
 * @decimals 2
 * @min 0.1
 * @default 0.35
 * @param outlineWidth
 * @text 文字の縁取り幅
 * @desc 文字の縁取りの太さをピクセル単位で指定します。0で縁取りなしになります。
 * @type number
 * @min 0
 * @default 5
 * @param lineSpacing
 * @text テキストの行間
 * @desc メッセージ行同士の追加間隔をピクセル単位で指定します。負の値で行間を詰められます。
 * @type number
 * @min -9999
 * @default 20
 * @param iconScale
 * @text 顔グラ表示倍率
 * @desc メッセージに表示する顔グラフィックの倍率です。
 * @default 1.0
 * @param offsetX
 * @text 画面左オフセット
 * @desc メッセージスタックの左端位置をピクセル単位で指定します。
 * @default 400
 * @param offsetY
 * @text 画面上オフセット
 * @desc メッセージスタックの上端位置をピクセル単位で指定します。
 * @default 120
 * @param bottomMargin
 * @text 画面下余白
 * @desc メッセージスタックと画面下端の余白をピクセル単位で指定します。
 * @type number
 * @min 0
 * @default 60
 *
 * @param --- アイコンUI設定 ---
 * @param LogIconFile
 * @text ログ呼び出しアイコン
 * @desc ログ画面を開くために表示するアイコン画像です。
 * @type file
 * @dir img/icon/
 * @default log
 * @param IconX
 * @text アイコン表示位置X
 * @desc ログアイコンのX座標をピクセル単位で指定します。
 * @type number
 * @default 1640
 * @param IconY
 * @text アイコン表示位置Y
 * @desc ログアイコンのY座標をピクセル単位で指定します。
 * @type number
 * @default 12
 *
 * @param skipWaitFrame
 * @text スキップ開始フレーム
 * @desc Shiftキーまたはマウスホイールをこのフレーム数以上押し続けると、文章のスキップ（高速送り）を開始します（デフォルト: 30）
 * @type number
 * @default 30
 *
 * @param indicatorX
 * @text ▼インジケータX座標
 * @desc クリック待ち▼を表示する固定X座標。空欄または0なら自動中央。基準：1920（中央は960）
 * @type number
 * @default 960
 * @param indicatorY
 * @text ▼インジケータY値 / オフセット
 * @desc タイプが「固定座標」なら画面のY座標。「相対オフセット」なら文章最終行からの隙間(px)になります。
 * @type number
 * @default 40
 * @param indicatorYType
 * @text ▼インジケータYの指定タイプ
 * @desc Y値を「絶対的な固定座標」として扱うか、「文章の最終行からの相対位置」として扱うかを選択します。
 * @type select
 * @option 文章の最終行からの相対オフセット
 * @value relative
 * @option 画面上の固定座標
 * @value absolute
 * @default relative
 * @param indicatorOpacity
 * @text ▼インジケータ最大不透明度
 * @desc 点滅時の最大不透明度を指定します（0〜255）。255で完全にくっきり表示されます。
 * @type number
 * @min 0
 * @max 255
 * @default 155
 *
 * @command setAutoClear
 * @arg enabled
 * @text 自動消去の有効状態
 * @desc メッセージログをイベント終了時に自動消去するか指定します。
 * @type boolean
 * @default true
 *
 * @command showLog
 * @text ログ画面を表示
 *
 * @command clearLog
 * @text ログ履歴を消去
 *
 * @command clearMessageStack
 * @text 文章スタックのクリア
 * @desc 画面上に積み重ねて表示されている文章を消去します。ログ履歴は消去しません。
 *
 * @command showAutoAdvanceMessage
 * @text 自動送り文章表示
 * @desc 指定時間後に自動で読み進める文章を表示します。
 * @arg text
 * @text 文章
 * @type multiline_string
 * @desc 表示する文章です。\\V[n]などの制御文字も使用できます。
 * @arg faceName
 * @text 顔画像
 * @type file
 * @dir img/faces
 * @desc 表示する顔画像ファイル名です。空欄で顔画像なし。
 * @arg faceIndex
 * @text 顔画像番号
 * @type number
 * @min 0
 * @max 7
 * @default 0
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
 * @arg positionType
 * @text 表示位置
 * @type select
 * @option 上
 * @value 0
 * @option 中
 * @value 1
 * @option 下
 * @value 2
 * @default 2
 * @arg speakerName
 * @text 名前
 * @type string
 * @desc 表示する話者名です。空欄で名前なし。
 * @arg duration
 * @text 自動送りまでの秒数
 * @type number
 * @decimals 1
 * @min 0
 * @default 3
 * @arg allowManualAdvance
 * @text 手動で読み進め可能
 * @type boolean
 * @on 手動・自動の両方
 * @off 完全自動のみ
 * @default true
 *
 * @command setMessageSyncMode
 * @text 文章同期モードを変更
 * @arg mode
 * @text モード
 * @type select
 * @option 非同期
 * @value async
 * @option 半同期
 * @value semiSync
 * @option 全同期
 * @value fullSync
 * @default async
 *
 * @command setAdvancePermission
 * @text 読み進め許可を変更
 * @arg target
 * @text 許可するPC
 * @type select
 * @option GM
 * @value gm
 * @option イベント実行者
 * @value eventRunner
 * @option 同一顔グラフィックPC
 * @value sameFace
 * @option 全員
 * @value everyone
 * @arg enabled
 * @text 有効
 * @type boolean
 * @default true
 */

(() => {
    'use strict';

    const pluginName = "FloatingMessageLog";
    const params = PluginManager.parameters(pluginName);
    
    const logLimit = Number(params['logLimit'] || 1000);
    const isSingleFace = params['isSingleFace'] === 'true';
    const fontSizeRate = Number(params['fontSizeRate'] || 2.0);
    const rubyFontSizeRate = Math.max(0.1, Number(params['rubyFontSizeRate'] || 0.35));
    const outlineWidth = Math.max(0, Number(params['outlineWidth'] ?? 5));
    const lineSpacing = Number(params['lineSpacing'] ?? 10);
    const iconScale = Number(params['iconScale'] || 1.0);
    const offsetX = Number(params['offsetX'] || 40);
    const offsetY = Number(params['offsetY'] || 60);
    const bottomMargin = Math.max(0, Number(params['bottomMargin'] || 60));
    const indicatorX = Number(params['indicatorX'] || 960);
    const indicatorY = Number(params['indicatorY'] || 40);
    const indicatorYType = params['indicatorYType'] || 'relative';
    const indicatorOpacity = Number(params['indicatorOpacity'] || 255);

    const logIconFile = params['LogIconFile'] || "icon_log";
    const iconX = Number(params['IconX'] || 1640);
    const iconY = Number(params['IconY'] || 12);
    // Shiftキー/マウスホイールをこのフレーム数以上押し続けるとスキップを開始する
    const skipWaitFrame = Math.max(1, Number(params['skipWaitFrame'] || 30));
    const firebaseParams = PluginManager.parameters('FirebaseSync');
    const gmOnlySwitchId = Number(firebaseParams['gmOnlySwitchId'] || 0);
    const pcIdVariableId = Number(firebaseParams['pcIdVar'] || 0);
    const userUidVariableId = Number(firebaseParams['userUidVar'] || 0);

    let rubyDictionary = [];
    let _isWaitingClick = false;
    let _inputWaitFrame = 0;
    let _skipHoldFrame = 0;
    let _autoAdvanceFrames = null;
    let _allowManualAdvance = true;
    let _pendingAutoAdvanceOptions = null;
    let _autoClearEnabled = params['autoClear'] === 'true';
    let _forceShowOnMain = false;
    let _blinkCounter = 0;
    let _messageSyncMode = ['async', 'semiSync', 'fullSync'].includes(params['messageSyncMode']) ? params['messageSyncMode'] : 'async';
    const _advancePermissions = {
        gm: params['allowGmAdvance'] !== 'false',
        eventRunner: params['allowEventRunnerAdvance'] !== 'false',
        sameFace: params['allowSameFaceAdvance'] === 'true',
        everyone: params['allowEveryoneAdvance'] === 'true'
    };
    let _messageSyncRef = null;
    let _messageSyncRoomRef = null;
    let _messageSyncListener = null;
    let _currentSyncedMessage = null;
    let _remoteMessageBatch = null;
    let _pendingLocalBatchMessage = null;
    let _localMessageBatches = new WeakMap();
    // フローティングメッセージ内に表示する選択肢の待機状態
    let _pendingChoice = null;
    let _choiceRects = [];
    let _choiceIndex = -1;

    const COLOR_MAP = {
        "1": "#EEDDFF", "2": "#FFEEDD", "3": "#DDFFEE", "4": "#CCFFFF",
        "5": "#DDEEFF", "6": "#FFDDEE", "7": "#FFFFBB", "8": "#EECCFF",
        "9": "#FFDDEE", "10": "#CCEEFF", "11": "#FFEECC", "12": "#FFCCCC",
        "0": "#FFFFFF"
    };

    const loadRubyDictionary = async () => {
        try {
            const response = await fetch("data/ruby_dict.csv");
            if (!response.ok) return;
            const text = await response.text();
            rubyDictionary = text.split(/\r?\n/).map(line => {
                const parts = line.split(',');
                const base = parts[0] && parts[0].trim();
                const ruby = parts[1] && parts[1].trim();
                return base && ruby ? { base: base, ruby: ruby } : null;
            }).filter(Boolean).sort((left, right) => right.base.length - left.base.length);
        } catch (error) {
            console.warn("FloatingMessageLog: ルビ辞書を読み込めませんでした。", error);
        }
    };
    loadRubyDictionary();

    function normalizeEscapeCharacters(text) {
        return text.replace(/[￥¥](?=[A-Z]+\[|[{}])/gi, "\\");
    }

    function convertSwitchEscapeCharacters(text) {
        text = text.replace(/\x1bSS\[(\w+)\]/gi, (_, switchId) => {
            const eventId = $gameMap && $gameMap._interpreter
                ? $gameMap._interpreter.eventId()
                : 0;
            const key = [$gameMap.mapId(), eventId, switchId.toUpperCase()];
            return $gameSelfSwitches ? $gameSelfSwitches.value(key) : false;
        });
        return text.replace(/\x1bS\[(\d+)\]/gi, (_, switchId) => {
            return $gameSwitches ? $gameSwitches.value(Number(switchId)) : false;
        });
    }

    function syncRef() {
        return typeof OnlineManager !== 'undefined' && OnlineManager.roomRef
            ? OnlineManager.roomRef.child('floating_message') : null;
    }

    function ownUserId() {
        return userUidVariableId > 0 && $gameVariables ? String($gameVariables.value(userUidVariableId) || '') : '';
    }

    function ownPcId() {
        return pcIdVariableId > 0 && $gameVariables ? Number($gameVariables.value(pcIdVariableId) || 0) : 0;
    }

    function isAllowedToAdvance(message) {
        if (!_currentSyncedMessage || message.mode !== 'fullSync') return true;
        if (_advancePermissions.everyone) return true;
        if (_advancePermissions.gm && gmOnlySwitchId > 0 && $gameSwitches.value(gmOnlySwitchId)) return true;
        if (_advancePermissions.eventRunner && ownPcId() === Number(message.sourcePcId || 0)) return true;
        if (_advancePermissions.sameFace && message.entry && message.entry.faceName) {
            const actor = $dataActors[ownPcId()];
            return actor && actor.faceName === message.entry.faceName && Number(actor.faceIndex || 0) === Number(message.entry.faceIndex || 0);
        }
        return false;
    }

    function addMessageEntry(entry) {
        $gameSystem._messageStack.push(entry);
        $gameSystem._messageLogHistory.push(entry);
        if ($gameSystem._messageLogHistory.length > logLimit) $gameSystem._messageLogHistory.shift();
        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene.refreshMadamisMenus) SceneManager._scene.refreshMadamisMenus();
    }

    function beginMessageWait(message, autoAdvanceOptions = null) {
        _currentSyncedMessage = message || null;
        _isWaitingClick = true;
        _inputWaitFrame = 15;
        _autoAdvanceFrames = autoAdvanceOptions ? Math.max(0, Math.round(autoAdvanceOptions.duration * 60)) : null;
        _allowManualAdvance = !autoAdvanceOptions || autoAdvanceOptions.allowManualAdvance;
        _forceShowOnMain = false;
    }

    function createMessageEntry(text, faceName, faceIndex, messageWindow, speakerName = "") {
        const convertedText = convertSwitchEscapeCharacters(messageWindow.convertEscapeCharacters(normalizeEscapeCharacters(text)));
        return {
            text: convertedText,
            color: COLOR_MAP[faceName.match(/\d{1,2}/g)?.pop()] || "#FFFFFF",
            faceName,
            faceIndex,
            speakerName
        };
    }

    // 選択肢をフローティングメッセージ内に表示するための状態を準備する。
    // RPGツアラーMZでは「文章の表示」の直後に「選択肢の表示」がある場合、
    // command101 が先読みして $gameMessage に選択肢とコールバックを設定する。
    // そのため $gameMessage.clear() の前にここで退避しておく。
    function beginChoiceWait(messageWindow, message, autoAdvanceOptions = null) {
        const choices = $gameMessage.choices().map(choice =>
            convertSwitchEscapeCharacters(
                messageWindow.convertEscapeCharacters(normalizeEscapeCharacters(String(choice)))
            )
        );
        const defaultType = $gameMessage.choiceDefaultType();
        const cancelType = $gameMessage.choiceCancelType();
        _pendingChoice = {
            choices,
            callback: $gameMessage._choiceCallback || null,
            defaultType,
            cancelType,
            selected: false,
            selectedIndex: -1
        };
        _choiceRects = [];
        _choiceIndex = defaultType >= 0 && defaultType < choices.length
            ? defaultType
            : (choices.length > 0 ? 0 : -1);
        beginMessageWait(message, autoAdvanceOptions);
        // 選択肢は表示直後からクリックできるようにする
        _inputWaitFrame = 0;
    }

    function selectChoice(index, isCancel = false) {
        if (!_pendingChoice || _pendingChoice.selected) return;
        const cancelType = _pendingChoice.cancelType;
        if (isCancel) {
            if (cancelType === -1) return;
            index = cancelType;
        }
        _pendingChoice.selected = true;
        _pendingChoice.selectedIndex = index;
        if (isCancel) {
            SoundManager.playCancel();
        } else {
            SoundManager.playOk();
        }
        const callback = _pendingChoice.callback;
        if (typeof callback === "function") {
            try {
                callback(index);
            } catch (error) {
                console.warn("FloatingMessageLog: 選択肢コールバックでエラーが発生しました。", error);
            }
        }
    }

    function collectMessageBatch(interpreter, messageWindow) {
        const commands = interpreter._list || [];
        const entries = [];
        const commandIndexes = [];
        let index = interpreter._index;
        while (commands[index] && commands[index].code === 101) {
            const params = commands[index].parameters;
            const lines = [];
            commandIndexes.push(index);
            index++;
            while (commands[index] && commands[index].code === 401) {
                lines.push(commands[index].parameters[0]);
                index++;
            }
            entries.push(createMessageEntry(lines.join("\n"), params[0], params[1], messageWindow));
        }
        return { entries, commandIndexes };
    }

    function publishMessageBatch(entries) {
        const ref = syncRef();
        if (!ref) return null;
        const now = Date.now();
        const message = {
            id: `${now}_${ownUserId() || Math.random()}`,
            sourceUid: ownUserId(),
            sourcePcId: ownPcId(),
            mode: _messageSyncMode,
            entries,
            currentIndex: 0,
            at: now
        };
        ref.set(message)
            .catch(error => console.warn('FloatingMessageLog: 文章同期の送信に失敗しました。', error));
        return message;
    }

    function publishAdvance() {
        const ref = syncRef();
        if (ref && _currentSyncedMessage) ref.child('currentIndex').set(_currentSyncedMessage.index + 1)
            .catch(error => console.warn('FloatingMessageLog: 読み進め同期の送信に失敗しました。', error));
    }

    function showRemoteBatchEntry(index) {
        if (!_remoteMessageBatch || !_remoteMessageBatch.entries[index]) return false;
        const entry = _remoteMessageBatch.entries[index];
        addMessageEntry(entry);
        beginMessageWait({ ..._remoteMessageBatch, index, entry, isRemote: true });
        return true;
    }

    function advanceRemoteSemiSyncMessage() {
        const nextIndex = _currentSyncedMessage.index + 1;
        if (!showRemoteBatchEntry(nextIndex)) {
            _isWaitingClick = false;
            _currentSyncedMessage = null;
        }
    }

    function isFastAdvanceInput() {
        return Input.isPressed('shift') || TouchInput.wheelY !== 0;
    }

    // SHIFT/ホイールの連続入力フレームを数える。離した瞬間に 0 に戻るので
    // 「押しっぱなしの連続フレーム数」だけがカウントされる。
    // 呼び出しはメッセージ待機中のみ。
    function updateSkipHoldFrame() {
        if (isFastAdvanceInput()) {
            _skipHoldFrame = Math.min(_skipHoldFrame + 1, skipWaitFrame);
        } else {
            _skipHoldFrame = 0;
        }
    }

    function advanceCurrentMessage() {
        if (_currentSyncedMessage && _currentSyncedMessage.isRemote && _currentSyncedMessage.mode === 'semiSync') {
            advanceRemoteSemiSyncMessage();
            return true;
        }
        if (_currentSyncedMessage && _currentSyncedMessage.mode === 'fullSync') publishAdvance();
        _isWaitingClick = false;
        _forceShowOnMain = false;
        _currentSyncedMessage = null;
        _autoAdvanceFrames = null;
        _allowManualAdvance = true;
        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene.refreshMadamisMenus) {
            SceneManager._scene.refreshMadamisMenus();
        }
        return false;
    }

    // 選択肢の表示中は、選択されるまで自動送りせずに待機する。
    function updateChoiceWait() {
        if (_inputWaitFrame > 0) {
            _inputWaitFrame--;
            return true;
        }
        const activeTab = $gameSystem._activeTabId;
        if (activeTab && activeTab !== 'main') {
            return true;
        }
        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._menuItems) {
            const isMenuOpen = SceneManager._scene._menuItems.some(item => item._isOpening);
            if (isMenuOpen) {
                return true;
            }
        }
        if (!_pendingChoice.selected) {
            return true;
        }
        // 選択されたので待機を解除して次のコマンド（分岐）へ進む
        _pendingChoice = null;
        _choiceRects = [];
        _choiceIndex = -1;
        return advanceCurrentMessage();
    }

    function ensureMessageSyncListener() {
        const roomRef = typeof OnlineManager !== 'undefined' ? OnlineManager.roomRef : null;
        if (roomRef === _messageSyncRoomRef) return;
        if (_messageSyncRef && _messageSyncListener) _messageSyncRef.off('value', _messageSyncListener);
        _messageSyncRoomRef = roomRef;
        _messageSyncRef = syncRef();
        _messageSyncListener = null;
        if (!_messageSyncRef) return;
        _messageSyncListener = snapshot => {
            const message = snapshot.val();
            if (!message || !message.id) return;
            if (message.sourceUid === ownUserId() || message.mode === 'async' || !Array.isArray(message.entries)) return;
            if (!_remoteMessageBatch || _remoteMessageBatch.id !== message.id) {
                _remoteMessageBatch = message;
                showRemoteBatchEntry(0);
                return;
            }
            _remoteMessageBatch = message;
            if (message.mode === 'fullSync' && _currentSyncedMessage && _currentSyncedMessage.isRemote &&
                _currentSyncedMessage.id === message.id && message.currentIndex > _currentSyncedMessage.index) {
                if (!showRemoteBatchEntry(message.currentIndex)) {
                    _isWaitingClick = false;
                    _currentSyncedMessage = null;
                }
            }
        };
        _messageSyncRef.on('value', _messageSyncListener);
    }

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        $gameSystem._messageLogHistory = $gameSystem._messageLogHistory || [];
        $gameSystem._messageStack = $gameSystem._messageStack || [];
        $gameSystem._logScrollY = $gameSystem._logScrollY || 0;
        $gameSystem._totalLogHeight = 0;
    };

    // --- ルビ解析・描画用ヘルパー関数 ---
    // 【漢字/かんじ】形式の文字列を解析し、セグメント配列に分解する
    function parseRubyText(text) {
        const regex = /【([^/]+)\/([^】]+)?[^】]*】/g;
        const segments = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ type: 'text', text: text.substring(lastIndex, match.index) });
            }
            segments.push({ type: 'ruby', base: match[1], ruby: match[2] });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            segments.push({ type: 'text', text: text.substring(lastIndex) });
        }
        return segments;
    }

    function applyRubyDictionary(text) {
        if (rubyDictionary.length === 0) return text;
        return text.split(/(【[^】]*】)/g).map(part => {
            if (/^【[^】]*】$/.test(part)) return part;
            rubyDictionary.forEach(entry => {
                part = part.split(entry.base).join(`【${entry.base}/${entry.ruby}】`);
            });
            return part;
        }).join("");
    }

    // ルビを含む1行を描画する関数
    function drawLineWithRuby(bitmap, lineText, x, y, fontSize, maxW) {
        const segments = parseRubyText(applyRubyDictionary(lineText));
        let currentX = x;
        const rubyFontSize = Math.max(8, Math.floor(fontSize * rubyFontSizeRate));

        segments.forEach(seg => {
            if (seg.type === 'text') {
                bitmap.fontSize = fontSize;
                bitmap.drawText(seg.text, currentX, y, maxW, fontSize + 10, "left");
                currentX += bitmap.measureTextWidth(seg.text);
            } else if (seg.type === 'ruby') {
                bitmap.fontSize = fontSize;
                const baseParts = Array.from(seg.base).map(character => ({
                    character: character,
                    width: bitmap.measureTextWidth(character)
                }));
                const baseWidth = baseParts.reduce((total, part) => total + part.width, 0);
                bitmap.fontSize = rubyFontSize;
                const rubyParts = Array.from(seg.ruby).map(character => ({
                    character: character,
                    width: bitmap.measureTextWidth(character)
                }));
                const rubyWidth = rubyParts.reduce((total, part) => total + part.width, 0);
                const rubyY = y - rubyFontSize - 2; // 親文字の上に配置
                bitmap.fontSize = fontSize;

                let baseX = currentX;
                baseParts.forEach(part => {
                    bitmap.drawText(part.character, baseX, y, part.width + 4, fontSize + 10, "left");
                    baseX += part.width;
                });

                bitmap.fontSize = rubyFontSize;
                const firstBaseCenter = currentX + baseParts[0].width / 2;
                const lastBaseCenter = currentX + baseWidth - baseParts[baseParts.length - 1].width / 2;
                const centeredFirstRubyCenter = currentX + (baseWidth - rubyWidth) / 2 + rubyParts[0].width / 2;
                const useJustify = rubyParts.length > 1 && centeredFirstRubyCenter >= firstBaseCenter;

                if (useJustify) {
                    const step = (lastBaseCenter - firstBaseCenter) / (rubyParts.length - 1);
                    rubyParts.forEach((part, index) => {
                        const rubyX = firstBaseCenter + step * index - part.width / 2;
                        bitmap.drawText(part.character, rubyX, rubyY, part.width + 4, rubyFontSize + 4, "left");
                    });
                } else {
                    const rubyX = currentX + (baseWidth - rubyWidth) / 2;
                    bitmap.drawText(seg.ruby, rubyX, rubyY, rubyWidth + 4, rubyFontSize + 4, "left");
                }

                currentX += baseWidth;
            }
        });
    }

    function getLineHeight(curFS) {
        return curFS;
    }

    function getMessageBlockHeight(message, includeIndicator = false) {
        const curFS = 28 * fontSizeRate;
        const targetSize = 144 * iconScale;
        const lineHeight = getLineHeight(curFS) + lineSpacing;
        const lineCount = message.text.split("\n").length;
        const textHeight = curFS + ((lineCount - 1) * lineHeight) + (message.speakerName ? curFS + lineSpacing : 0);
        const contentHeight = message.faceName ? Math.max(targetSize, textHeight) : textHeight;
        let blockHeight = contentHeight + 40;
        if (includeIndicator && indicatorYType === 'relative') {
            const textStartY = (contentHeight - textHeight) / 2;
            const indicatorBottom = textStartY + textHeight + indicatorY + curFS + 10;
            blockHeight = Math.max(blockHeight, indicatorBottom);
        }
        return blockHeight;
    }

    function renderMessages(bitmap, stack, startY, scrollY, width, isTabMode = false) {
        bitmap.clear();
        // ログモード（タブ内）なら背景を塗る
        if (isTabMode && stack.length > 0) {
            bitmap.fillRect(0, 0, width, bitmap.height, "rgba(0, 0, 0, 0.7)");
        }
    
        const curFS = 28 * fontSizeRate;
        const targetSize = 144 * iconScale;
        let currentY = startY;
        if (!isTabMode) {
            const totalHeight = stack.reduce((height, message, index) => {
                const isLatestMessage = _isWaitingClick && index === stack.length - 1;
                return height + getMessageBlockHeight(message, isLatestMessage);
            }, 0);
            if (stack.length > 1) {
                currentY = Math.min(startY, bitmap.height - bottomMargin - totalHeight);
            }
            bitmap.context.save();
            bitmap.context.beginPath();
            bitmap.context.rect(0, 60, bitmap.width, bitmap.height - 60);
            bitmap.context.clip();
        }
        
        // 毎フレーム進むカウンタを更新（約30フレーム＝0.5秒周期で点滅）
        _blinkCounter = (_blinkCounter + 1) % 60;
    
        stack.forEach((msg, index) => {
            const lines = msg.text.split("\n");
            const sLH = getLineHeight(curFS) + lineSpacing;
            const textHeight = lines.length * sLH;
            const isLatestMessage = !isTabMode && _isWaitingClick && index === stack.length - 1;
            const bH = getMessageBlockHeight(msg, isLatestMessage);
            const drawY = currentY - scrollY;
    
            if (drawY + bH > 0 && drawY < bitmap.height) {
                const drawX = isTabMode ? 40 : offsetX;
                let tx = drawX + (msg.faceName ? targetSize + 20 : 0);
                const nameHeight = msg.speakerName ? curFS + lineSpacing : 0;
                const messageTextHeight = curFS + ((lines.length - 1) * sLH) + nameHeight;
                const contentHeight = Math.max(targetSize, messageTextHeight);
                
                if (msg.faceName) {
                    const fbm = ImageManager.loadFace(msg.faceName);
                    if (fbm.isReady()) {
                        const faceW = isSingleFace ? fbm.width : 144;
                        const faceH = isSingleFace ? fbm.height : 144;
                        const ratio = Math.min(targetSize / faceW, targetSize / faceH);
                        const dw = faceW * ratio; const dh = faceH * ratio;
                        const sx = isSingleFace ? 0 : (msg.faceIndex % 4) * 144;
                        const sy = isSingleFace ? 0 : Math.floor(msg.faceIndex / 4) * 144;
                        bitmap.blt(fbm, sx, sy, faceW, faceH, drawX + (targetSize - dw) / 2, drawY + (contentHeight - dh) / 2, dw, dh);
                    }
                }
                bitmap.textColor = msg.color;
                bitmap.outlineWidth = outlineWidth;
                
                const tStartY = msg.faceName
                    ? drawY + ((contentHeight - messageTextHeight) / 2)
                    : drawY;

                if (msg.speakerName) {
                    bitmap.fontSize = curFS;
                    bitmap.drawText(msg.speakerName, tx, tStartY, width - tx - 40, curFS + 10, "left");
                }
                
                lines.forEach((line, i) => {
                    drawLineWithRuby(bitmap, line, tx, tStartY + nameHeight + (i * sLH), curFS, width - tx - 40);
                });

                // --- メイン画面かつ最新メッセージの枠内・指定位置に▼を表示 ---
                if (isLatestMessage) {
                    if (_blinkCounter < 30) {
                        const lastAlpha = bitmap.context.globalAlpha;
                        bitmap.context.globalAlpha = indicatorOpacity / 255;

                        bitmap.textColor = "#FFFFFF"; 
                        
                        let finalX = indicatorX;
                        if (!finalX) {
                            const remainingWidth = width - tx - 40;
                            finalX = tx + (remainingWidth / 2) - (curFS / 2);
                        } else {
                            finalX = finalX - (curFS / 2);
                        }
                        
                        let finalY = 0;
                        if (indicatorYType === 'absolute') {
                            finalY = indicatorY;
                        } else {
                            const lastLineBottomY = tStartY + nameHeight + ((lines.length - 1) * sLH) + curFS;
                            finalY = lastLineBottomY + indicatorY;
                        }
                        
                        bitmap.fontSize = curFS;
                        bitmap.drawText("▼", finalX, finalY, 100, curFS + 10, "left");

                        bitmap.context.globalAlpha = lastAlpha;
                    }
                }
            }
            currentY += bH;
        });

        if (!isTabMode) {
            bitmap.context.restore();
        }
        
        if (isTabMode) {
            $gameSystem._totalLogHeight = currentY;
            const viewHeight = bitmap.height;
            const totalHeight = $gameSystem._totalLogHeight;
            if (totalHeight > viewHeight) {
                const barWidth = 10;
                const barPadding = 4;
                const barAreaHeight = viewHeight - (barPadding * 2);
                const knobHeight = Math.max(40, (viewHeight / totalHeight) * barAreaHeight);
                const scrollMax = totalHeight - viewHeight;
                const knobY = barPadding + (scrollY / scrollMax) * (barAreaHeight - knobHeight);
                
                bitmap.fillRect(width - barWidth - barPadding, barPadding, barWidth, barAreaHeight, "rgba(255, 255, 255, 0.1)");
                bitmap.fillRect(width - barWidth - barPadding, knobY, barWidth, knobHeight, "rgba(255, 255, 255, 0.5)");
            }
        }

        return currentY;
    }

    function getChoiceLayout(startY, width) {
        const fs = 28 * fontSizeRate;
        const rowHeight = Math.ceil(fs + 22);
        const gap = 8;
        const marginX = Math.max(offsetX, 40);
        const boxW = Math.min(width - marginX * 2, 1400);
        const boxX = (width - boxW) / 2;
        const choices = _pendingChoice ? _pendingChoice.choices : [];
        const rects = choices.map((choice, index) => ({
            x: boxX,
            y: startY + index * (rowHeight + gap),
            w: boxW,
            h: rowHeight,
            index
        }));
        return { fs, rowHeight, gap, rects };
    }

    function drawChoices(bitmap, startY, width) {
        if (!_pendingChoice || _pendingChoice.choices.length === 0) {
            _choiceRects = [];
            return;
        }
        const layout = getChoiceLayout(startY, width);
        _choiceRects = layout.rects;
        for (const rect of layout.rects) {
            const highlighted = rect.index === _choiceIndex;
            bitmap.fillRect(rect.x, rect.y, rect.w, rect.h, highlighted ? "rgba(70, 140, 210, 0.9)" : "rgba(0, 0, 0, 0.6)");
            bitmap.fillRect(rect.x, rect.y, 10, rect.h, highlighted ? "#FFFFFF" : "rgba(255, 255, 255, 0.35)");
            bitmap.textColor = "#FFFFFF";
            bitmap.outlineWidth = outlineWidth;
            const textY = rect.y + Math.floor((rect.h - layout.fs) / 2);
            drawLineWithRuby(bitmap, _pendingChoice.choices[rect.index], rect.x + 30, textY, layout.fs, rect.w - 60);
        }
    }

    function processChoiceInput() {
        if (!_pendingChoice || _pendingChoice.selected) return;
        if (_inputWaitFrame > 0) return;
        const count = _pendingChoice.choices.length;
        if (count === 0) return;

        const tx = TouchInput.x;
        const ty = TouchInput.y;
        let hovered = -1;
        for (const rect of _choiceRects) {
            if (tx >= rect.x && tx <= rect.x + rect.w && ty >= rect.y && ty <= rect.y + rect.h) {
                hovered = rect.index;
                break;
            }
        }
        if (hovered >= 0 && hovered < count) _choiceIndex = hovered;

        // クリックで決定
        if ((Einput_l_trig() || TouchInput.isTriggered()) && hovered >= 0) {
            selectChoice(hovered);
            return;
        }

        // キーボード操作
        if (Input.isRepeated('down')) _choiceIndex = Math.min(_choiceIndex + 1, count - 1);
        if (Input.isRepeated('up')) _choiceIndex = Math.max(_choiceIndex - 1, 0);
        if (Input.isTriggered('ok') && _choiceIndex >= 0 && _choiceIndex < count) {
            selectChoice(_choiceIndex);
            return;
        }
        if (Input.isTriggered('cancel')) {
            selectChoice(0, true);
        }
    }

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        this.updateLogIconUI(); 
        _Scene_Map_update.call(this);
        this.updateLogContentUI();
    };

    Scene_Map.prototype.updateLogIconUI = function() {
        if (!this._logIconSprite) {
            this._logIconSprite = new Sprite(ImageManager.loadBitmap("img/icon/", logIconFile));
            this._logIconSprite.x = iconX;
            this._logIconSprite.y = iconY;
            this.addChild(this._logIconSprite);
        }
        
        const isVisible = $gameSystem._activeTabId !== 'log';
        this._logIconSprite.visible = isVisible;

        if (isVisible && Einput_l_trig() && this.isLogIconClicked()) {
            this.openLogTab();
        }
    };
    
    Scene_Map.prototype.isLogIconClicked = function() {
        const tx = TouchInput.x;
        const ty = TouchInput.y;
        return tx >= iconX && tx <= iconX + 24 && ty >= iconY && ty <= iconY + 24;
    };
    
    const _Scene_Map_onTabChanged = Scene_Map.prototype.onTabChanged;
    Scene_Map.prototype.onTabChanged = function() {
        if (_Scene_Map_onTabChanged) _Scene_Map_onTabChanged.call(this);
        
        if ($gameSystem._activeTabId === 'log') {
            this.createLogTabLayer();
            this._logTabLayer.visible = true;
        } else if (this._logTabLayer) {
            this._logTabLayer.visible = false;
        }
    };
    
    Scene_Map.prototype.updateLogContentUI = function() {
        this.refreshMessageData(); 
    
        if (!this._logStackLayer) {
             this._logStackLayer = new Sprite(new Bitmap(Graphics.width, Graphics.height));
             this.addChild(this._logStackLayer);
             if (this.children.length > 1) {
                 this.setChildIndex(this._logStackLayer, 1);
             }
        }
        if (!this._logTabLayer && this._tabGroup) {
            this._logTabLayer = new Sprite(new Bitmap(1200, 950));
            this._logTabLayer.x = (1920 - 1200) / 2;
            this._logTabLayer.y = 80;
            this.addChild(this._logTabLayer);
        }
    
        if ($gameSystem._activeTabId === 'log') {
            this._logTabLayer.visible = true;
            this._logStackLayer.visible = false;
            
            const viewWidth = 1200;
            const viewHeight = 950;
            const totalHeight = $gameSystem._totalLogHeight || 0;
            const scrollMax = Math.max(0, totalHeight - viewHeight);
    
            if (TouchInput.wheelY !== 0) {
                $gameSystem._logScrollY = Math.max(0, Math.min($gameSystem._logScrollY + TouchInput.wheelY, scrollMax));
            }
    
            if (TouchInput.isPressed() && scrollMax > 0) {
                const tx = TouchInput.x - this._logTabLayer.x;
                const ty = TouchInput.y - this._logTabLayer.y;
                if (tx >= viewWidth - 20 && tx <= viewWidth && ty >= 0 && ty <= viewHeight) {
                    const clickRatio = ty / viewHeight;
                    $gameSystem._logScrollY = scrollMax * clickRatio;
                }
            }
            
            renderMessages(this._logTabLayer.bitmap, $gameSystem._messageLogHistory, 20, $gameSystem._logScrollY, viewWidth, true);
        } else {
            if (this._logTabLayer) this._logTabLayer.visible = false;
            const isMain = ($gameSystem._activeTabId === 'main' || !$gameSystem._activeTabId);
            this._logStackLayer.visible = isMain;
            if (isMain && (_forceShowOnMain || _isWaitingClick)) {
                const bottomY = renderMessages(this._logStackLayer.bitmap, $gameSystem._messageStack, offsetY, 0, 1920, false);
                if (_pendingChoice) {
                    drawChoices(this._logStackLayer.bitmap, bottomY + 20, 1920);
                    processChoiceInput();
                } else {
                    _choiceRects = [];
                }
            } else {
                this._logStackLayer.bitmap.clear();
                _choiceRects = [];
            }
        }
    };

    Scene_Map.prototype.refreshMessageData = function() {};
    
    Scene_Map.prototype.createLogTabLayer = function() {
        if (!this._logTabLayer) {
            this._logTabLayer = new Sprite(new Bitmap(1200, 950));
            this._logTabLayer.x = (1920 - 1200) / 2;
            this._logTabLayer.y = 80;
            this.addChild(this._logTabLayer);
        }
    }; 
    
    Scene_Map.prototype.openLogTab = function() {
        if (this._tabGroup) {
            this.openTab({ id: 'log', name: 'ログ', isContent: true });
            $gameSystem._activeTabId = 'log';
            
            renderMessages(this._logTabLayer.bitmap, $gameSystem._messageLogHistory, 20, 0, 1200, true);
            
            const viewHeight = 950;
            const totalHeight = $gameSystem._totalLogHeight || 0;
            $gameSystem._logScrollY = Math.max(0, totalHeight - viewHeight);
    
            if (typeof this.addCloseButton === 'function') this.addCloseButton('log');
            this._tabGroup.refresh();
            SoundManager.playOk();
        }
    };
    
    Scene_Map.prototype.closeLogTab = function() {
        if (this._tabGroup) {
            this._tabGroup.removeTab('log');
            $gameSystem._activeTabId = 'main';
            SoundManager.playCancel();
        }
    };

    const _Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
    Game_Interpreter.prototype.command101 = function(params) {
        if (_messageSyncMode !== 'async') {
            const messageWindow = SceneManager._scene && SceneManager._scene._messageWindow;
            if (messageWindow) {
                let batch = _localMessageBatches.get(this);
                if (!batch || !batch.commandIndexes.includes(this._index)) {
                    const collected = collectMessageBatch(this, messageWindow);
                    if (collected.entries.length > 0) {
                        batch = { ...collected, message: publishMessageBatch(collected.entries) };
                        _localMessageBatches.set(this, batch);
                    }
                }
                if (batch && batch.message) {
                    const entryIndex = batch.commandIndexes.indexOf(this._index);
                    if (entryIndex >= 0) _pendingLocalBatchMessage = { ...batch.message, index: entryIndex, entry: batch.message.entries[entryIndex] };
                }
            }
        }
        return _Game_Interpreter_command101.call(this, params);
    };

    const _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        const text = $gameMessage.allText();
        const autoAdvanceOptions = _pendingAutoAdvanceOptions;
        _pendingAutoAdvanceOptions = null;
        let syncedMessage = _pendingLocalBatchMessage;
        _pendingLocalBatchMessage = null;
        const hasChoice = $gameMessage.isChoice();
        if (text.trim() !== "") {
            const faceName = $gameMessage.faceName();
            const entry = syncedMessage ? syncedMessage.entry : createMessageEntry(text, faceName, $gameMessage.faceIndex(), this, $gameMessage.speakerName());
            addMessageEntry(entry);
            if (_messageSyncMode !== 'async' && !syncedMessage) syncedMessage = publishMessageBatch([entry]);
        }
        if (hasChoice) {
            beginChoiceWait(this, syncedMessage, autoAdvanceOptions);
        } else {
            beginMessageWait(syncedMessage, autoAdvanceOptions);
        }
        this.terminateMessage(); 
        $gameMessage.clear();
    };

    // 文章なしで「選択肢の表示」だけが実行された場合は
    // startMessage が呼ばれないため、startInput をフックして
    // 標準の選択肢ウィンドウの代わりにフローティングメッセージ内へ表示する。
    const _Window_Message_startInput = Window_Message.prototype.startInput;
    Window_Message.prototype.startInput = function() {
        if ($gameMessage.isChoice() && !_pendingChoice) {
            beginChoiceWait(this, _currentSyncedMessage, null);
            this.terminateMessage();
            $gameMessage.clear();
            return true;
        }
        return _Window_Message_startInput.call(this);
    };

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (_isWaitingClick) {
            // 選択肢の表示中は、選択されるまで自動送りせずに待機する
            if (_pendingChoice) {
                return updateChoiceWait();
            }
            // メッセージ待機中だけ連続押下フレームを数える
            // （移動中のSHIFTダッシュ等で誤ってスキップ開始しないように）
            updateSkipHoldFrame();
            // skipWaitFrame フレーム以上押しっぱなしでスキップ開始
            const skipActive = _skipHoldFrame >= skipWaitFrame;

            // スキップ開始後はメッセージごとの待機を無視して連続送りする
            if (skipActive) {
                _inputWaitFrame = 0;
            }

            if (_inputWaitFrame > 0) { 
                _inputWaitFrame--; 
                return true; 
            }

            const activeTab = $gameSystem._activeTabId;
            if (activeTab && activeTab !== 'main') {
                return true; 
            }

            if (Einput_l_trig() && TouchInput.y <= 60) {
                return true; 
            }

            if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._menuItems) {
                const isMenuOpen = SceneManager._scene._menuItems.some(item => item._isOpening);
                if (isMenuOpen) {
                    return true;
                }
            }

           if (_autoAdvanceFrames !== null && _autoAdvanceFrames > 0) {
               _autoAdvanceFrames--;
               if (_autoAdvanceFrames === 0) {
                   _isWaitingClick = false;
                   _forceShowOnMain = false;
                   _currentSyncedMessage = null;
                   _autoAdvanceFrames = null;
                   _allowManualAdvance = true;
                   return false;
               }
           }

           if (_allowManualAdvance && (Input.isTriggered('ok') || Einput_l_trig() || skipActive) && isAllowedToAdvance(_currentSyncedMessage)) {
               return advanceCurrentMessage();
           }
           return true;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };
        
    const _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.call(this, mapId);
        this.terminateFloatingMessage();
    };
    
    Game_Map.prototype.terminateFloatingMessage = function() {
        _isWaitingClick = false;
        _inputWaitFrame = 0;
        _skipHoldFrame = 0;
        _autoAdvanceFrames = null;
        _allowManualAdvance = true;
        _pendingAutoAdvanceOptions = null;
        _forceShowOnMain = false;
        _currentSyncedMessage = null;
        _remoteMessageBatch = null;
        _pendingLocalBatchMessage = null;
        _localMessageBatches = new WeakMap();
        _pendingChoice = null;
        _choiceRects = [];
        _choiceIndex = -1;

        if ($gameSystem) {
            $gameSystem._messageStack = [];
        }

        $gameMap._interpreter.setWaitMode("");
        
        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._messageWindow) {
            SceneManager._scene._messageWindow.terminateMessage();
        }
    };
    
    const _Game_Interpreter_terminate = Game_Interpreter.prototype.terminate;
    Game_Interpreter.prototype.terminate = function() {
        _Game_Interpreter_terminate.call(this);
        if (_autoClearEnabled && this._depth === 0) {
            $gameSystem._messageStack = [];
        }
    };
    
    PluginManager.registerCommand(pluginName, "setAutoClear", args => { _autoClearEnabled = String(args.enabled) === "true"; });
    PluginManager.registerCommand(pluginName, "showAutoAdvanceMessage", function(args) {
        if ($gameMessage.isBusy()) return;
        _pendingAutoAdvanceOptions = {
            duration: Math.max(0, Number(args.duration) || 0),
            allowManualAdvance: String(args.allowManualAdvance) === "true"
        };
        $gameMessage.setFaceImage(args.faceName || "", Number(args.faceIndex) || 0);
        $gameMessage.setBackground(Number(args.background) || 0);
        $gameMessage.setPositionType(Number(args.positionType) || 0);
        $gameMessage.setSpeakerName(args.speakerName || "");
        $gameMessage.add(args.text || "");
        this.setWaitMode("message");
    });
    PluginManager.registerCommand(pluginName, "setMessageSyncMode", args => {
        _messageSyncMode = ['async', 'semiSync', 'fullSync'].includes(args.mode) ? args.mode : 'async';
    });
    PluginManager.registerCommand(pluginName, "setAdvancePermission", args => {
        if (Object.prototype.hasOwnProperty.call(_advancePermissions, args.target)) _advancePermissions[args.target] = String(args.enabled) === 'true';
    });
    PluginManager.registerCommand(pluginName, "showLog", () => { if (SceneManager._scene instanceof Scene_Map) SceneManager._scene.openLogTab(); });
    PluginManager.registerCommand(pluginName, "clearLog", () => { if ($gameSystem) { $gameSystem._messageLogHistory = []; $gameSystem._messageStack = []; $gameSystem._logScrollY = 0; $gameSystem._totalLogHeight = 0; } });
    PluginManager.registerCommand(pluginName, "clearMessageStack", () => { if ($gameSystem) $gameSystem._messageStack = []; });

    const _Scene_Map_updateMessageSync = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_updateMessageSync.call(this);
        ensureMessageSyncListener();
    };

})();
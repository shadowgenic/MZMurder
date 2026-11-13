/*:
 * @plugindesc タイトルレイアウト調整・フォント変更・音量1%単位変更
 * @target MZ
 * @author Shadowgenic & Google Gemini
 * 
 * @help
 * 【使い方】プラグインパラメータでタイトル画面・オプション画面に表示する項目、文字サイズ、ウィンドウ幅を設定します。
 * 有効化後、タイトル画面とオプション画面に設定が反映されます。プラグインコマンドはありません。
 * タイトル画面とオプション画面のレイアウトを調整し、フォント選択と音量設定を追加します。
 * BGM・BGS・ME・SEの各音量を表示するか、常時ダッシュ項目を表示するかを個別に設定できます。
 * タイトル画面の位置、文字サイズ、コマンドウィンドウ幅もプラグインパラメータで変更します。
 *
 * 【使い方】
 * 1. タイトル画面の表示に合わせて `Window_Y`、`TitleFontSize`、`TitleWindowWidth` を調整します。
 * 2. `DefaultFontName` に標準フォント名を指定します。フォント一覧はプロジェクトの設定に依存します。
 * 3. 不要な音量項目や常時ダッシュ項目は対応する表示設定をOFFにします。
 * 4. タイトル画面へ戻ると変更内容を確認できます。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 *
 * @param Window_Y
 * @text ウィンドウのY座標
 * @desc タイトルコマンドウィンドウの上端Y座標をピクセル単位で指定します。
 * @type number
 * @default 300
 *
 * @param DefaultFontName
 * @text 「標準」フォントの表示名
 * @desc オプション画面で「標準」として表示するフォント名です。
 * @default 標準
 *
 * @param ShowAlwaysDash
 * @text 「常時ダッシュ」の表示
 * @desc オプション画面に常時ダッシュ設定を表示するか指定します。
 * @type boolean
 * @default false
 *
 * @param ShowBgmVolume
 * @text 「BGM 音量」の表示
 * @desc オプション画面にBGM音量設定を表示するか指定します。
 * @type boolean
 * @default true
 *
 * @param ShowBgsVolume
 * @text 「BGS 音量」の表示
 * @desc オプション画面にBGS音量設定を表示するか指定します。
 * @type boolean
 * @default true
 *
 * @param ShowMeVolume
 * @text 「ME 音量」の表示
 * @desc オプション画面にME音量設定を表示するか指定します。
 * @type boolean
 * @default true
 *
 * @param ShowSeVolume
 * @text 「SE 音量」の表示
 * @desc オプション画面にSE音量設定を表示するか指定します。
 * @type boolean
 * @default true
 *
 * @param HideCancelButton
 * @text 右上の「戻るボタン」を消す
 * @desc オプション画面右上の戻るボタンを隠すか指定します。
 * @type boolean
 * @default true
 *
 * @param HideTitleWindowFrame
 * @text タイトル枠・背景を消す
 * @desc ON(true)にすると、タイトル画面の黒座布団やグレーの四角い枠を完全に消去し、文字だけにします。
 * @type boolean
 * @default true
 *
 * @param TitleFontSize
 * @text タイトル文字の大きさ
 * @desc タイトル画面のコマンド文字のサイズ。デフォルトは 26 です。文字を浮かせるなら 32～36 等がおすすめ。
 * @type number
 * @default 32
 *
 * @param TitleWindowWidth
 * @text タイトルウィンドウの横幅
 * @desc タイトル画面のコマンドウィンドウの横幅です。文字サイズを大きくして見切れる場合は広げてください。
 * @type number
 * @default 360
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const pluginName = "Options_change";
    const param = PluginManager.parameters(pluginName);

    const windowY = Number(param['Window_Y'] || 300);
    const defaultName = String(param['DefaultFontName'] || "標準");
    const hideCancel = (param['HideCancelButton'] === 'true');
    
    const hideTitleFrame = (param['HideTitleWindowFrame'] === 'true');
    const titleFontSize = Number(param['TitleFontSize'] || 32);
    const titleWindowWidth = Number(param['TitleWindowWidth'] || 360);
    
    // --- 【フォント配列】 ---
    const masterFontList = [
        { Name: defaultName, FileName: "", RealName: [] },
        { Name: "M+ 1m Regular", FileName: "mplus-1m-regular.woff", RealName: ["M+ 1m"] },
        { Name: "M+ 2p Bold", FileName: "mplus-2p-bold-sub.woff", RealName: ["M+ 2p"] },
        { Name: "ゴシック体", FileName: "", RealName: ["Hiragino Kaku Gothic ProN","UDゴシック","BIZ UDPGothic", "BIZ UDPゴシック", "BIZ UDGothic","IPAゴシック","MS PGothic", "ヒラギノ角ゴ ProN W3", "ＭＳ Ｐゴシック", "sans-serif"] },
        { Name: "明朝体", FileName: "", RealName: ["Hiragino Mincho ProN","BIZ UDPMincho","BIZ UDP明朝","IPAMincho","IPA明朝","MS Mincho","ＭＳ 明朝","serif"] },
        { Name: "メイリオ", FileName: "", RealName: ["Meiryo", "メイリオ"] },
        { Name: "Osaka", FileName: "", RealName: ["Osaka", "ARISAKA"] },
        { Name: "クレー", FileName: "", RealName: ["Klee", "Klee One", "KleeOne-Regular", "クレー", "クレー One"] },
        { Name: "Android", FileName: "", RealName: ["MotoyaLMaru", "モトヤL丸ゴ", "Droid Sans Japanese"] },
        { Name: "手書き風", FileName: "", RealName: ["漆黒フォント", "飴色フォント", "るりいろ","MIKACHAN","みかちゃん"] },
        { Name: "薔薇", FileName: "", RealName: ["kurobara-cinderella", "akabara-cinderella", "黒薔薇シンデレラ","赤薔薇シンデレラ","cursive","serif"] }
    ];

    const isFontAvailable = function(names) {
        if (!names || names.length === 0) return false;
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const text = "mmmmmmmmmlli";
        context.font = "72px serif";
        const check = (font) => {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            return baseFonts.some(base => {
                context.font = "72px " + base;
                const baseWidth = context.measureText(text).width;
                context.font = "72px '" + font + "', " + base;
                const targetWidth = context.measureText(text).width;
                return baseWidth !== targetWidth;
            });
        };
        return names.some(name => check(name));
    };

    let fontList = masterFontList.filter(font => {
        if (font.FileName === "" && (!font.RealName || font.RealName.length === 0)) return true;
        if (font.FileName !== "") return true;
        return isFontAvailable(font.RealName);
    });

    ConfigManager.fontIndex = 0;
    const _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        const config = _ConfigManager_makeData.call(this);
        config.fontIndex = this.fontIndex;
        return config;
    };
    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        const idx = (config && typeof config.fontIndex === 'number') ? config.fontIndex : 0;
        this.fontIndex = (idx >= 0 && idx < fontList.length) ? idx : 0;
    };

    const _FontManager_makeFontConfig = FontManager.makeFontConfig;
    FontManager.makeFontConfig = function(name) {
        if (name.includes("rmz-font") || name === "rmz-main-font") {
            const idx = ConfigManager.fontIndex || 0;
            const font = fontList[idx];
            if (font && font.FileName) {
                return { name: "rmz-font-" + idx, url: "fonts/" + font.FileName };
            }
        }
        return _FontManager_makeFontConfig.call(this, name);
    };

    Object.defineProperty(Bitmap.prototype, 'fontFace', {
        get: function() {
            const idx = ConfigManager.fontIndex || 0;
            const font = fontList[idx];
            if (font && font.FileName) return "rmz-font-" + idx;
            if (font && font.RealName && font.RealName.length > 0) {
                return font.RealName.map(n => "'" + n + "'").join(", ");
            }
            return "rmz-main-font";
        },
        configurable: true
    });

    Window_Options.prototype.makeCommandList = function() {
        if (param['ShowAlwaysDash'] === 'true') this.addCommand(TextManager.alwaysDash, "alwaysDash");
        if (param['ShowBgmVolume'] === 'true') this.addCommand(TextManager.bgmVolume, "bgmVolume");
        if (param['ShowBgsVolume'] === 'true') this.addCommand(TextManager.bgsVolume, "bgsVolume");
        if (param['ShowMeVolume'] === 'true') this.addCommand(TextManager.meVolume, "meVolume");
        if (param['ShowSeVolume'] === 'true') this.addCommand(TextManager.seVolume, "seVolume");
        if (fontList.length > 1) this.addCommand("フォント変更", "fontIndex");
    };

    Scene_Options.prototype.optionsWindowRect = function() {
        const n = this.maxOptionsItems();
        const ww = 400;  
        const wh = Window_Options.prototype.fittingHeight(n);
        return new Rectangle((Graphics.boxWidth - ww) / 2, windowY, ww, wh);
    };

    Scene_Options.prototype.maxOptionsItems = function() {
        let count = 0;
        if (param['ShowAlwaysDash'] === 'true') count++;
        if (param['ShowBgmVolume'] === 'true') count++;
        if (param['ShowBgsVolume'] === 'true') count++;
        if (param['ShowMeVolume'] === 'true') count++;
        if (param['ShowSeVolume'] === 'true') count++;
        if (fontList.length > 1) count++;
        return count;
    };

    Window_Options.prototype.statusText = function(index) {
        const symbol = this.commandSymbol(index);
        const value = this.getConfigValue(symbol);
        if (symbol === "fontIndex") return fontList[value] ? fontList[value].Name : fontList[0].Name;
        return this.isVolumeSymbol(symbol) ? this.volumeStatusText(value) : this.booleanStatusText(value);
    };

    Window_Options.prototype.cursorRight = function() {
        const symbol = this.commandSymbol(this.index());
        if (symbol === "fontIndex") {
            this.changeFontIndex((ConfigManager.fontIndex + 1) % fontList.length);
        } else if (this.isVolumeSymbol(symbol)) {
            const v = this.getConfigValue(symbol);
            this.changeValue(symbol, v >= 100 ? 0 : v + 1);
        } else {
            Window_Command.prototype.cursorRight.call(this);
        }
    };

    Window_Options.prototype.cursorLeft = function() {
        const symbol = this.commandSymbol(this.index());
        if (symbol === "fontIndex") {
            this.changeFontIndex((ConfigManager.fontIndex - 1 + fontList.length) % fontList.length);
        } else if (this.isVolumeSymbol(symbol)) {
            const v = this.getConfigValue(symbol);
            this.changeValue(symbol, v <= 0 ? 100 : v - 1);
        } else {
            Window_Command.prototype.cursorLeft.call(this);
        }
    };

    Window_Options.prototype.processOk = function() {
        const symbol = this.commandSymbol(this.index());
        if (symbol === "fontIndex") {
            this.changeFontIndex((ConfigManager.fontIndex + 1) % fontList.length);
        } else if (this.isVolumeSymbol(symbol)) {
            const v = this.getConfigValue(symbol);
            let next = (Math.floor(v / 20) + 1) * 20;
            this.changeValue(symbol, next > 100 ? 0 : next);
        } else {
            this.changeValue(symbol, !this.getConfigValue(symbol));
        }
    };

    Window_Options.prototype.changeFontIndex = function(newIndex) {
        ConfigManager.fontIndex = newIndex;
        this.playCursorSound();
        const font = fontList[newIndex];
        if (font.FileName) {
            FontManager.load("rmz-font-" + newIndex, font.FileName);
            const onReady = () => {
                if (FontManager.isReady()) { this.contents.clear(); this.refresh(); }
                else { setTimeout(onReady, 30); }
            };
            onReady();
        }
        this.refresh();
    };

    const _Scene_MenuBase_createButtons = Scene_MenuBase.prototype.createButtons;
    Scene_MenuBase.prototype.createButtons = function() {
        _Scene_MenuBase_createButtons.call(this);
        if (hideCancel && this._cancelButton) {
            this._cancelButton.visible = false;
            this._cancelButton.active = false;
        }
    };


    // =========================================================================
    // 【タイトル画面：文字サイズ・行間・横幅の絶対強制連動調整】
    // =========================================================================
    
    // 1. フォントサイズ変更に伴う行間の調整（1行の高さ）
    Window_TitleCommand.prototype.lineHeight = function() {
        return Math.floor(titleFontSize * 1.4); 
    };

    // システム内部のすべての幅計算、およびツクール公式プラグイン等の衝突を完全に無視して指定値を返します
    Window_TitleCommand.prototype.windowWidth = function() {
        return titleWindowWidth;
    };
    Scene_Title.prototype.mainCommandWidth = function() {
        return titleWindowWidth;
    };

    // ウィンドウ生成サイズ（ここで横幅をパラメータ指定値で完全に上書き固定）
    Scene_Title.prototype.commandWindowRect = function() {
        const ww = titleWindowWidth; 
        const wh = Window_TitleCommand.prototype.fittingHeight(3); 
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = Graphics.boxHeight - wh - 96;
        return new Rectangle(wx, wy, ww, wh);
    };

    // 2. ウィンドウ初期化時：幅の強制上書きと枠消しパラメータの適用
    const _Window_TitleCommand_initialize = Window_TitleCommand.prototype.initialize;
    Window_TitleCommand.prototype.initialize = function(rect) {
        // システム側から渡されるrectの幅も、ここでパラメータ値へ強制変更
        if (rect && typeof rect.width === 'number') {
            rect.width = titleWindowWidth;
            rect.x = (Graphics.boxWidth - titleWindowWidth) / 2;
        }
        _Window_TitleCommand_initialize.call(this, rect);
        
        // 念のため、生成されたインスタンスの横幅自体もパラメータ値でロック
        this.width = titleWindowWidth;
        
        if (hideTitleFrame) {
            this.opacity = 0;          
            this.frameVisible = false; 
            if (this._bgSprite) this._bgSprite.visible = false; 
        }
    };

    // 各項目ごとのグレー背景をカット（パラメータ連動）
    const _Window_TitleCommand_drawItemBackground = Window_TitleCommand.prototype.drawItemBackground;
    Window_TitleCommand.prototype.drawItemBackground = function(index) {
        if (hideTitleFrame) {
            // 表示オフ時は何も描画しない（選択時の青明滅のみにする）
        } else {
            _Window_TitleCommand_drawItemBackground.call(this, index);
        }
    };

    // 文字サイズ変更の適用
    const _Window_TitleCommand_resetFontSettings = Window_TitleCommand.prototype.resetFontSettings;
    Window_TitleCommand.prototype.resetFontSettings = function() {
        _Window_TitleCommand_resetFontSettings.call(this);
        this.contents.fontSize = titleFontSize; 
    };
})();
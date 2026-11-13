/*:
 * @target MZ
 * @plugindesc 情報カテゴリを画面端のスライドメニューに登録し、コンテンツタブを開きます。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】HTMLは html/、画像は img/info/、メニュー用アイコンは img/icon/ に配置します。
 * イベントから「情報の追加」でカテゴリ・ID・表示名・種別を指定し、必要に応じて「ソート順の再読み込み」を実行します。
 * 情報アイコンを最大6カテゴリに分け、画面端から開くスライドメニューとして表示します。
 * アイコンを選ぶと `Madamis_CoreUI` のコンテンツタブが開き、IDをコンテンツファイルの識別子として使用します。
 * 空カテゴリを隠す設定、カテゴリ色、表示順ファイルを変更できます。
 *
 * 【使い方】
 * 1. 「情報の追加」でカテゴリ番号、ID、表示名、コンテンツ種別、`img/icon/` 内のアイコンを登録します。
 * 2. HTMLは `html/`、画像は `img/info/` に配置し、アイコンをクリックして開きます。
 * 3. 「情報の削除」または「カテゴリ内の全削除」で登録項目を整理します。
 * 4. 「カテゴリカラー変更」でカテゴリの背景色をCSS色形式で指定します。
 * 5. `data/sort_order.txt` のIDを1行ずつ記述し、「ソート順の再読み込み」で順序を反映します。
 * 
 *  * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 *
 * @param MenuLabels
 * @text メニューラベルリスト（最大6個）
 * @desc 左側メニューに表示するカテゴリ名を順番に指定します。
 * @type string[]
 * @default ["Common Info", "Handouts", "Items", "Disclosed info"]
 *
 * @param CatColors
 * @text カテゴリカラーリスト
 * @desc 各カテゴリの背景色をCSS色形式で順番に指定します。
 * @type string[]
 * @default ["rgba(173, 216, 230, 0.6)", "rgba(255, 182, 193, 0.6)", "rgba(144, 238, 144, 0.6)", "rgba(255, 255, 224, 0.6)"]
 *
 * @param HideEmptyMenu
 * @text 項目0の時に非表示
 * @desc 登録項目がないカテゴリをメニューから隠すか指定します。
 * @type boolean
 * @default true
 *
 * @command addInfo
 * @text 情報の追加
 * @arg category
 * @text カテゴリ番号
 * @desc 情報を追加・削除するカテゴリ番号です。
 * @type number
 * @min 0
 * @max 5
 * @default 0
 * @arg id
 * @text ID (ファイル名)
 * @desc HTMLまたは画像コンテンツを識別するIDです。
 * @arg name
 * @text 表示名
 * @desc メニューに表示する情報項目の名前です。
 * @arg contentType
 * @text コンテンツ種別
 * @desc HTMLは html/、画像は img/info/ から読み込みます。
 * @type select
 * @option HTML
 * @value html
 * @option 画像 (PNG)
 * @value image
 * @default html
 * @arg iconImage
 * @text アイコン画像
 * @desc メニュー項目に表示するアイコン画像です。
 * @type file
 * @dir img/icon/
 *
 * @command deleteInfo
 * @text 情報の削除
 * @arg category
 * @text カテゴリ番号
 * @desc 削除対象のカテゴリ番号です。
 * @type number
 * @arg id
 * @text ID
 * @desc 削除する情報項目のIDです。
 *
 * @command clearCategory
 * @text カテゴリ内の全削除
 * @arg category
 * @text カテゴリ番号
 * @desc 登録項目をすべて削除するカテゴリ番号です。
 * @type number
 *
 * @command changeCategoryColor
 * @text カテゴリカラー変更
 * @arg category
 * @text カテゴリ番号
 * @desc 色を変更するカテゴリ番号です。
 * @type number
 * @arg color
 * @text 色 (CSS形式)
 * @desc カテゴリに適用するCSS色を指定します。
 *
 * @command setMenuEnabled
 * @text メニュー操作の許可/禁止
 * @arg enabled
 * @text メニュー操作の有効状態
 * @desc サイドメニューを操作できる状態にするか指定します。
 * @type boolean
 * @default true
 *
 * @command reloadSortOrder
 * @text ソート順の再読み込み
 * @arg fileName
 * @text 並び順ファイル名
 * @desc dataフォルダ内で読み込む並び順ファイルの名前です。
 * @default sort_order.txt
 */

(() => {
    'use strict';

    const pluginName = "SideMenu";
    const parameters = PluginManager.parameters(pluginName);

    const ICON_DIR = "icon/";
    const MENU_ITEM_HEIGHT = 150; 
    const UI_CORNER_RADIUS = 12;
    const ICON_SIZE = 150;
    const MAX_VISIBLE_ICONS = 10;
    const MENU_LABELS = JSON.parse(parameters['MenuLabels'] || '["Common Info", "Handouts", "Items", "Disclosed info"]');
    const CAT_COLORS = JSON.parse(parameters['CatColors'] || '[]');
    const MENU_COUNT = MENU_LABELS.length.clamp(1, 6);
    const HIDEEMPTY = parameters['HideEmptyMenu'] === 'true';

    // --- Game_System 設定保持 ---
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this.initMadamisSideMenuSettings();
    };

    Game_System.prototype.initMadamisSideMenuSettings = function() {
        if (!this._menuColors) {
            this._menuColors = [];
            for (let i = 0; i < MENU_COUNT; i++) {
                this._menuColors[i] = CAT_COLORS[i] || 'rgba(128, 128, 128, 0.6)';
            }
        }
        if (!this._madamisData) {
            this._madamisData = Array.from({length: MENU_COUNT}, () => []);
        }
        if (this._madamisMenuDisabled === undefined) {
            this._madamisMenuDisabled = false;
        }
    };

    // --- ソート処理 ---
    let masterSortOrder = [];
    const loadSortOrder = async (fileName = "sort_order.txt") => {
        try {
            const response = await fetch(`data/${fileName}`);
            if (!response.ok) return;
            const text = await response.text();
            masterSortOrder = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
            
            if ($gameSystem && $gameSystem._madamisData) {
                $gameSystem._madamisData.forEach(catArray => applyMadamisSort(catArray));
            }
            if (SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.refreshMadamisMenus();
            }
        } catch (e) {
            console.warn("Failed to load sort order.");
        }
    };
    loadSortOrder("sort_order.txt");

    const applyMadamisSort = (dataArray) => {
        if (!masterSortOrder || masterSortOrder.length === 0) return dataArray;
        const lowerCaseOrder = masterSortOrder.map(id => id.toLowerCase());
        dataArray.sort((a, b) => {
            const indexA = lowerCaseOrder.indexOf(a.id.toLowerCase());
            const indexB = lowerCaseOrder.indexOf(b.id.toLowerCase());
            const sortA = indexA === -1 ? 999999 : indexA;
            const sortB = indexB === -1 ? 999999 : indexB;
            return sortA - sortB;
        });
        return dataArray;
    };

    // --- Madamis_MenuItem ---
    function Madamis_MenuItem() { this.initialize(...arguments); }
    Madamis_MenuItem.prototype = Object.create(Sprite.prototype);
    Madamis_MenuItem.prototype.constructor = Madamis_MenuItem;
    
    Madamis_MenuItem.prototype.initialize = function(index, label) {
        Sprite.prototype.initialize.call(this);
        this._categoryIndex = index;
        this._categoryLabel = label;
        this._isOpening = false;
        this._scrollX = 0;
        this._targetScrollX = 0;
        this._labelWidth = 28; 
    
        this._roundMask = new PIXI.Graphics();
        this._iconViewport = new Sprite();    
        this._uiLayer = new Sprite();         
        
        this.addChild(this._iconViewport);
        this.addChild(this._uiLayer);
        this.addChild(this._roundMask);
        this.mask = this._roundMask;
    
        this.drawGraphics();
    };
    
    Madamis_MenuItem.prototype.update = function() {
        Sprite.prototype.update.call(this);
    
        const tx = this._isOpening ? 0 : -this._maxWidth + this._labelWidth;
        this.x += (tx - this.x) * 0.2;
    
        if (this._isOpening) {
            if (TouchInput.wheelY !== 0) {
                this._targetScrollX = (this._targetScrollX + TouchInput.wheelY).clamp(0, this._maxScroll);
            }
            this._uiLayer.visible = true;
        } else {
            this._uiLayer.visible = false;
            this._targetScrollX = 0;
        }
        
        if (Math.abs(this._targetScrollX - this._scrollX) > 0.1) {
            this._scrollX += (this._targetScrollX - this._scrollX) * 0.2;
            this.refreshIcons();
        } else if (this._scrollX !== this._targetScrollX) {
            this._scrollX = this._targetScrollX;
            this.refreshIcons();
        }
        
        this.processInput();
    };
    
    Madamis_MenuItem.prototype.drawGraphics = function() {
        $gameSystem.initMadamisSideMenuSettings();
        const dataList = $gameSystem._madamisData[this._categoryIndex] || [];
        const color = $gameSystem._menuColors[this._categoryIndex] || 'rgba(128, 128, 128, 0.6)';
        
        const totalContentWidth = dataList.length * ICON_SIZE;
        const hasScroll = dataList.length > MAX_VISIBLE_ICONS;
        
        this._uiSpace = hasScroll ? 40 : 0;
        this._windowWidth = Math.min(ICON_SIZE * MAX_VISIBLE_ICONS, totalContentWidth);
        
        this._maxWidth = (this._uiSpace * 2) + this._windowWidth + this._labelWidth;
        this._maxScroll = Math.max(0, totalContentWidth - this._windowWidth);
    
        if (this.bitmap) this.bitmap.destroy();
        this.bitmap = new Bitmap(this._maxWidth, MENU_ITEM_HEIGHT);
        this.bitmap.fillRect(0, 0, this._maxWidth, MENU_ITEM_HEIGHT, color);
    
        const ctx = this.bitmap.context;
        ctx.save();
        this.bitmap.fontSize = 18;
        this.bitmap.textColor = 'white';
        const labelX = this._maxWidth - (this._labelWidth / 2);
        ctx.translate(labelX, MENU_ITEM_HEIGHT / 2);
        ctx.rotate(-90 * Math.PI / 180);
        this.bitmap.drawText(this._categoryLabel, -MENU_ITEM_HEIGHT / 2, -9, MENU_ITEM_HEIGHT, 18, 'center');
        ctx.restore();
    
        this._roundMask.clear();
        this._roundMask.beginFill(0xffffff);
        this._roundMask.drawRoundedRect(0, 0, this._maxWidth, MENU_ITEM_HEIGHT, UI_CORNER_RADIUS);
        this._roundMask.endFill();
    
        if (!this._viewportMask) {
            this._viewportMask = new PIXI.Graphics();
            this.addChild(this._viewportMask);
        }
        this._viewportMask.clear();
        this._viewportMask.beginFill(0xffffff);
        this._viewportMask.drawRect(this._uiSpace, 0, this._windowWidth, MENU_ITEM_HEIGHT);
        this._viewportMask.endFill();
        this._iconViewport.mask = this._viewportMask;
    
        this._iconViewport.x = this._uiSpace;
        this.x = -this._maxWidth + this._labelWidth;
        
        this.refreshIcons(); 
    };
        
    Madamis_MenuItem.prototype.refreshIcons = function() {
        const dataList = $gameSystem._madamisData[this._categoryIndex] || [];
        
        while (this._iconViewport.children.length > 0) {
            const child = this._iconViewport.removeChildAt(0);
            if (child.destroy) child.destroy({ children: true, texture: false });
        }
    
        const startIdx = Math.max(0, Math.floor(this._scrollX / ICON_SIZE));
        const endIdx = Math.min(dataList.length - 1, startIdx + MAX_VISIBLE_ICONS);
    
        for (let i = startIdx; i <= endIdx; i++) {
            const item = dataList[i];
            if (item) {
                const container = new Sprite();
                const s = new Sprite(ImageManager.loadBitmap("img/" + ICON_DIR, item.icon));
                container.addChild(s);
    
                if (item.name) {
                    const nameLabel = new Sprite(new Bitmap(ICON_SIZE, ICON_SIZE));
                    nameLabel.bitmap.fontSize = 14;
                    nameLabel.bitmap.outlineColor = 'rgba(0, 0, 0, 0.8)';
                    nameLabel.bitmap.outlineWidth = 4;
                    nameLabel.bitmap.drawText(item.name, -10, ICON_SIZE - 40, ICON_SIZE, 30, 'right');
                    container.addChild(nameLabel);
                }
    
                container.x = (i * ICON_SIZE) - this._scrollX;
                container.y = 0;
    
                if (container.x > -ICON_SIZE && container.x < this._windowWidth) {
                    this._iconViewport.addChild(container);
                }
            }
        }
        this.updateIndicators();
    };
    
    Madamis_MenuItem.prototype.processInput = function() {
        if (!Einput_l_trig()) return;
    
        const localX = TouchInput.x - this.x;
        const isInside = (localX >= 0 && localX < this._maxWidth && 
                          TouchInput.y >= this.y && TouchInput.y < this.y + MENU_ITEM_HEIGHT);
    
        if (this._isOpening) {
            if (isInside) {
                const dataList = $gameSystem._madamisData[this._categoryIndex];
                
                if (this._uiSpace > 0) {
                    if (localX < this._uiSpace) {
                        this._targetScrollX = (this._targetScrollX - ICON_SIZE).clamp(0, this._maxScroll);
                        return;
                    }
                    if (localX > this._uiSpace + this._windowWidth && localX < this._uiSpace + this._windowWidth + this._uiSpace) {
                        this._targetScrollX = (this._targetScrollX + ICON_SIZE).clamp(0, this._maxScroll);
                        return;
                    }
                }
    
                const iconAreaX = localX - this._uiSpace;
                const realX = iconAreaX + this._scrollX;
                const idx = Math.floor(realX / ICON_SIZE);
                if (dataList && dataList[idx] && iconAreaX >= 0 && iconAreaX < this._windowWidth) {
                    SceneManager._scene.openTab(dataList[idx]);
                    SoundManager.playOk();
                    this._isOpening = false;
                }
            } else {
                this._isOpening = false;
            }
        } else {
            if (isInside) {
                this._isOpening = true;
                SoundManager.playCursor();
            }
        }
    };
    
    Madamis_MenuItem.prototype.updateIndicators = function() {
        this._uiLayer.removeChildren();
        const dataList = $gameSystem._madamisData[this._categoryIndex] || [];
        if (dataList.length <= MAX_VISIBLE_ICONS) return;
    
        const leftTri = new PIXI.Graphics();
        leftTri.beginFill(0xffffff, 0.8).drawPolygon([10,75, 30,60, 30,90]).endFill();
        this._uiLayer.addChild(leftTri);
        
        const rightTri = new PIXI.Graphics();
        const rx = this._uiSpace + this._windowWidth + 5;
        rightTri.beginFill(0xffffff, 0.8).drawPolygon([rx+25,75, rx+5,60, rx+5,90]).endFill();
        this._uiLayer.addChild(rightTri);
    
        const dotSpacing = Math.min(15, (this._windowWidth - 40) / dataList.length);
        const startX = this._uiSpace + (this._windowWidth - (dataList.length - 1) * dotSpacing) / 2;
        const currentIdx = Math.round(this._scrollX / ICON_SIZE);
    
        for (let i = 0; i < dataList.length; i++) {
            const d = new PIXI.Graphics();
            const isActive = (i >= currentIdx && i < currentIdx + MAX_VISIBLE_ICONS);
            d.beginFill(0xffffff, isActive ? 1.0 : 0.3).drawCircle(startX + (i * dotSpacing), MENU_ITEM_HEIGHT - 12, 4).endFill();
            this._uiLayer.addChild(d);
        }
    };

    // --- Scene_Map 拡張 ---
    Scene_Map.prototype.refreshMadamisMenus = function() {
        if (this._menuItems) {
            for (const item of this._menuItems) {
                this.removeChild(item);
            }
        }
        this._menuItems = [];
        
        const hiddenTabIds = ['log', 'gm_scene'];
        if (hiddenTabIds.includes($gameSystem._activeTabId) || $gameSystem._madamisMenuDisabled) {
            return;
        }
    
        let displayCount = 0;
        for (let i = 0; i < MENU_COUNT; i++) {
            const dataList = $gameSystem._madamisData[i] || [];
            if (HIDEEMPTY && dataList.length === 0) continue; 
    
            const m = new Madamis_MenuItem(i, MENU_LABELS[i]);
            m.y = 120 + (MENU_ITEM_HEIGHT + 10) * displayCount;
            this.addChild(m);
            this._menuItems.push(m);
            displayCount++;
        }
    };

    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.refreshMadamisMenus();
    };

    const _Game_Interpreter_command121 = Game_Interpreter.prototype.command121;
    Game_Interpreter.prototype.command121 = function(params) {
        const result = _Game_Interpreter_command121.call(this, params);
        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.refreshMadamisMenus();
        }
        return result;
    };

    // --- プラグインコマンド ---
    PluginManager.registerCommand(pluginName, "addInfo", args => {
        const cat = parseInt(args.category);
        if (cat >= 0 && cat < MENU_COUNT) {
            if (!$gameSystem._madamisData[cat].some(i => i.id === args.id)) {
                $gameSystem._madamisData[cat].push({
                    id: args.id,
                    name: args.name,
                    icon: args.iconImage,
                    contentType: args.contentType === 'image' ? 'image' : 'html'
                });
                applyMadamisSort($gameSystem._madamisData[cat]);
                if (SceneManager._scene instanceof Scene_Map) {
                    SceneManager._scene.refreshMadamisMenus();
                }
            }
        }
    });

    PluginManager.registerCommand(pluginName, "deleteInfo", args => {
        const cat = parseInt(args.category);
        if (cat >= 0 && cat < MENU_COUNT) {
            $gameSystem._madamisData[cat] = $gameSystem._madamisData[cat].filter(i => i.id !== args.id);
            if (SceneManager._scene instanceof Scene_Map) {
                if (SceneManager._scene._tabGroup) SceneManager._scene._tabGroup.removeTab(args.id);
                SceneManager._scene.refreshMadamisMenus();
            }
        }
    });

    PluginManager.registerCommand(pluginName, "clearCategory", args => {
        const cat = parseInt(args.category);
        if (cat >= 0 && cat < MENU_COUNT) {
            const removedItems = $gameSystem._madamisData[cat].map(i => i.id);
            $gameSystem._madamisData[cat] = [];
            if (SceneManager._scene instanceof Scene_Map) {
                if (SceneManager._scene._tabGroup) {
                    removedItems.forEach(id => SceneManager._scene._tabGroup.removeTab(id));
                }
                SceneManager._scene.refreshMadamisMenus();
            }
        }
    });

    PluginManager.registerCommand(pluginName, "changeCategoryColor", args => {
        const cat = parseInt(args.category);
        if (cat >= 0 && cat < MENU_COUNT) {
            $gameSystem.initMadamisSideMenuSettings();
            $gameSystem._menuColors[cat] = args.color;
            if (SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene.refreshMadamisMenus();
            }
        }
    });

    PluginManager.registerCommand(pluginName, "setMenuEnabled", args => {
        $gameSystem._madamisMenuDisabled = String(args.enabled) === "false";
        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.refreshMadamisMenus();
        }
    });

    PluginManager.registerCommand(pluginName, "reloadSortOrder", args => {
        const fileName = args.fileName || "sort_order.txt";
        loadSortOrder(fileName);
    });

})();
/*:
 * @target MZ
 * @plugindesc Madamis画面共通のタブバー、タブ切替、閉じる操作を管理します。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】他のMadamis用プラグインより先に有効化し、メインタブ名と閉じるアイコンをパラメータで設定します。
 * イベントでは「メインタブをアクティブにする」「メイン以外の全タブを閉じる」などでタブ状態を操作できます。
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 * マップ画面上部にメインタブと各コンテンツタブを表示する共通UIです。
 * `SideMenu`、`GMSceneManager`、`FloatingMessageLog` などが開くタブを管理します。
 * タブはクリックで切り替えられ、閉じるアイコンで個別に閉じられます。メインタブは常に残ります。
 *
 * 【使い方】
 * 1. このプラグインを、タブを利用するプラグインより先に読み込みます。
 * 2. 「メインタブをアクティブにする」で盤面へ戻します。
 * 3. 「メイン以外の全タブを閉じる」で開いているコンテンツを一括終了します。
 * 4. 「メインタブ固定」を有効にすると、メインタブを閉じる操作を禁止できます。
 * 5. 「メインタブ名変更」でゲーム中にメインタブの表示名を変更できます。
 *
 * @param MainTabName
 * @text メインタブの名称
 * @desc マップ画面上部に常時表示するメインタブの名前です。
 * @default メイン（盤面）
 *
 * @param CloseIconImage
 * @text 閉じるアイコン画像
 * @desc コンテンツタブを閉じるボタンに表示するアイコンです。
 * @type file
 * @dir img/icon/
 * @default close
 *
 * @param CloseSeName
 * @text タブを閉じる時のSE
 * @desc タブを閉じたときに再生する効果音ファイルです。
 * @type file
 * @dir audio/se/
 * @default Cancel1
 *
 * @param CloseSeVolume
 * @text 閉じるSEの音量
 * @desc タブを閉じたときの効果音の音量です。
 * @type number
 * @default 90
 *
 * @param CloseSePitch
 * @text 閉じるSEのピッチ
 * @desc タブを閉じたときの効果音のピッチです。
 * @type number
 * @default 100
 *
 * @command activateMainTab
 * @text メインタブをアクティブにする
 *
 * @command closeAllTabs
 * @text メイン以外の全タブを閉じる
 *
 * @command setTabFixed
 * @text メインタブ固定の有効/無効
 * @arg fixed
 * @text メインタブ固定
 * @desc メインタブを固定して閉じられない状態にするか指定します。
 * @type boolean
 * @default false
 *
 * @command changeMainTabName
 * @text メインタブ名変更
 * @arg newName
 * @text 新しいメインタブ名
 * @desc メインタブに表示する新しい名前です。
 * @type string
 * @default メイン(盤面)
 */

(() => {
    'use strict';

    const pluginName = "TabUI";
    const parameters = PluginManager.parameters(pluginName);
    const MAIN_TAB_NAME = parameters['MainTabName'] || "メイン（盤面）";
    const CLOSE_ICON_NAME = parameters['CloseIconImage'] || 'close';
    const CLOSE_SE_NAME = parameters['CloseSeName'] || 'Cancel1';
    const CLOSE_SE_VOL = Number(parameters['CloseSeVolume'] || 90);
    const CLOSE_SE_PITCH = Number(parameters['CloseSePitch'] || 100);

    const UI_WIDTH = 1920;
    const TAB_HEIGHT = 50;
    const UI_CORNER_RADIUS = 12;
    const TAB_START_X = 40; 
    const MAX_VISIBLE_TABS = 6; 
    const TAB_WIDTH = 240;
    const TAB_SPACING = 10;

    function resolveEscapeCharacters(text) {
        let result = String(text).replace(/[￥¥](?=[A-Z]+\[|[{}])/gi, "\\");
        while (/\\V\[(\d+)\]/i.test(result)) {
            result = result.replace(/\\V\[(\d+)\]/gi, (_, variableId) =>
                $gameVariables.value(Number(variableId))
            );
        }
        return result.replace(/\\N\[(\d+)\]/gi, (_, actorId) => {
            const actor = $gameActors.actor(Number(actorId));
            return actor ? actor.name() : "";
        });
    }

    // --- SE再生ヘルパー ---
    const playCloseSe = () => {
        if (CLOSE_SE_NAME) {
            AudioManager.playSe({
                name: CLOSE_SE_NAME,
                volume: CLOSE_SE_VOL,
                pitch: CLOSE_SE_PITCH,
                pan: 0
            });
        }
    };

    // --- Game_System 拡張 ---
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() { 
        _Game_System_initialize.call(this); 
        this._activeTabId = 'main'; 
        this._madamisTabFixed = false;
        if (!this._tabs) {
            this._tabs = [{ id: 'main', label: MAIN_TAB_NAME, canClose: false }];
            this._tabScrollIndex = 0;
        }
    };

    const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function() {
        _Game_System_onAfterLoad.call(this);
        if (this._madamisTabFixed === undefined) this._madamisTabFixed = false;
    };

    // --- タッチ入力ガード判定 ---
    window.Madamis_GetTouchTarget = function() {
        if (!$gameSystem || !SceneManager._scene) return "map";
        const scene = SceneManager._scene;
        const tx = TouchInput.x;
        const ty = TouchInput.y;

        if (ty <= 60) return "tab";

        const isGmOpen = (scene._gmOverlay && scene._gmOverlay.visible);
        const isActiveTabSpecial = ($gameSystem._activeTabId === 'log' || $gameSystem._activeTabId === 'gm_scene');
        const isNotMain = ($gameSystem._activeTabId && $gameSystem._activeTabId !== 'main');
        if (isGmOpen || isActiveTabSpecial || isNotMain) return "ui_only";

        const renderer = scene._renderer;
        if (renderer && renderer.x > -395) {
            let maxR = 0;
            if (renderer.children) {
                renderer.children.forEach(c => { 
                    if(c.visible) maxR = Math.max(maxR, c.x + (c._width || 0)); 
                });
            }
            const currentRightEdge = renderer.x + maxR;
            if (tx <= currentRightEdge || (tx <= 400 && ty >= 700)) return "ui_only";
        }

        return "map";
    };

    const _Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    window.Madamis_CoreUIProcessMapTouch = function(scene) {
        if (Madamis_GetTouchTarget() === "ui_only") return;
        if (window.Madamis_NoClickMove) {
            if (Einput_r_trig()) TouchInput.clear();
            return;
        }
        _Scene_Map_processMapTouch.call(scene);
    };
    Scene_Map.prototype.processMapTouch = function() {
        window.Madamis_CoreUIProcessMapTouch(this);
    };

    const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
    Scene_Map.prototype.isMenuEnabled = function() {
        if (window.Madamis_NoClickMove) return false;
        if ($gameSystem._activeTabId && $gameSystem._activeTabId !== 'main') return false;
        return _Scene_Map_isMenuEnabled.call(this);
    };

    const _Window_Message_isTriggered = Window_Message.prototype.isTriggered;
    Window_Message.prototype.isTriggered = function() {
        if (Madamis_GetTouchTarget() === "ui_only") return false;
        return _Window_Message_isTriggered.call(this);
    };

    const _TouchInput_isTriggered = TouchInput.isTriggered;
    TouchInput.isTriggered = function() {
        const triggered = _TouchInput_isTriggered.call(this);
        if (triggered) {
            const target = Madamis_GetTouchTarget();
            const stack = new Error().stack;
            if (target === "ui_only") {
                if (stack.includes("Window_") || stack.includes("Floating")) {
                    return false;
                }
            }
        }
        return triggered;
    };

    // --- Madamis_TabGroup ---
    function Madamis_TabGroup() { this.initialize(...arguments); }
    Madamis_TabGroup.prototype = Object.create(Sprite.prototype);
    Madamis_TabGroup.prototype.constructor = Madamis_TabGroup;
    
    Madamis_TabGroup.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(UI_WIDTH, TAB_HEIGHT);
        this._closeIcon = ImageManager.loadBitmap('img/icon/', CLOSE_ICON_NAME);
        
        if (!$gameSystem._madamisTabs) {
            $gameSystem._madamisTabs = [{ id: 'main', label: MAIN_TAB_NAME, canClose: false }];
        }
        this._tabs = $gameSystem._madamisTabs;
        this._scrollIndex = $gameSystem._tabScrollIndex || 0;
        this._dragIndex = -1;
        this._dragX = 0;
        this._closeIcon.addLoadListener(() => this.refresh());
    };
    
    Madamis_TabGroup.prototype.refresh = function() {
        if (!this.bitmap) return;
        const ctx = this.bitmap.context, bh = TAB_HEIGHT - 10, r = UI_CORNER_RADIUS, off = 0.5;
        this.bitmap.clear();
        
        const activeId = $gameSystem._activeTabId || 'main';
        const visibleTabs = this._tabs.slice(this._scrollIndex, this._scrollIndex + MAX_VISIBLE_TABS);
    
        const mainTab = this._tabs.find(t => t.id === 'main');
        if (mainTab) {
            mainTab.label = ($gameSystem && $gameSystem._customMainTabName) ? 
                            $gameSystem._customMainTabName : MAIN_TAB_NAME;
        }
    
        const drawTabPath = (tx, skipBottom) => {
            ctx.beginPath();
            ctx.moveTo(tx + off, bh + off);
            ctx.lineTo(tx + off, r + off);
            ctx.arcTo(tx + off, off, tx + r + off, off, r);
            ctx.lineTo(tx + TAB_WIDTH - r + off, off);
            ctx.arcTo(tx + TAB_WIDTH + off, off, tx + TAB_WIDTH + off, r + off, r);
            ctx.lineTo(tx + TAB_WIDTH + off, bh + off);
            if (!skipBottom) ctx.lineTo(tx + off, bh + off);
        };
    
        ctx.lineJoin = "round";
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 3;
    
        ctx.beginPath();
        ctx.moveTo(0, bh + off);
        visibleTabs.forEach((tab, i) => {
            const tx = TAB_START_X + i * (TAB_WIDTH + TAB_SPACING);
            const isActive = (tab.id === activeId);
            if (isActive) {
                ctx.lineTo(tx + off, bh + off);
                ctx.moveTo(tx + TAB_WIDTH + off, bh + off);
            } else {
                ctx.lineTo(tx + TAB_WIDTH + TAB_SPACING + off, bh + off);
            }
        });
        ctx.lineTo(UI_WIDTH, bh + off);
        ctx.stroke();
    
        visibleTabs.forEach((tab, i) => {
            const tx = TAB_START_X + i * (TAB_WIDTH + TAB_SPACING);
            const isActive = (tab.id === activeId);
            const isDragging = (i + this._scrollIndex === this._dragIndex);
            const drawX = isDragging ? (TouchInput.x - this._dragX) : tx;
            
            drawTabPath(drawX, isActive);
            ctx.stroke();
        });
    
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
    
        ctx.beginPath();
        ctx.moveTo(0, bh + off);
        visibleTabs.forEach((tab, i) => {
            const tx = TAB_START_X + i * (TAB_WIDTH + TAB_SPACING);
            const isActive = (tab.id === activeId);
            if (isActive) {
                ctx.lineTo(tx + off, bh + off);
                ctx.moveTo(tx + TAB_WIDTH + off, bh + off);
            } else {
                ctx.lineTo(tx + TAB_WIDTH + TAB_SPACING + off, bh + off);
            }
        });
        ctx.lineTo(UI_WIDTH, bh + off);
        ctx.stroke();
    
        visibleTabs.forEach((tab, i) => {
            const tx = TAB_START_X + i * (TAB_WIDTH + TAB_SPACING);
            const isActive = (tab.id === activeId);
            const isDragging = (i + this._scrollIndex === this._dragIndex);
            const drawX = isDragging ? (TouchInput.x - this._dragX) : tx;
    
            ctx.save();
            if (isDragging) ctx.globalAlpha = 0.6;
            
            drawTabPath(drawX, isActive);
            ctx.stroke();
    
            this.bitmap.fontSize = 18;
            this.bitmap.textColor = isActive ? '#ffffff' : 'rgba(255,255,255,0.5)';
            this.bitmap.drawText(resolveEscapeCharacters(tab.label), drawX + 15, 2, TAB_WIDTH - 45, bh, 'left');
            if (tab.canClose) {
                this.bitmap.blt(this._closeIcon, 0, 0, 24, 24, drawX + TAB_WIDTH - 34, (bh - 24) / 2, 24, 24);
            }
            ctx.restore();
        });
    
        this.bitmap.fontSize = 20;
        this.bitmap.textColor = 'white';
        if (this._scrollIndex > 0) this.bitmap.drawText("◀", 5, 0, 30, bh, 'center');
        if (this._tabs.length > this._scrollIndex + MAX_VISIBLE_TABS) {
            const rx = TAB_START_X + MAX_VISIBLE_TABS * (TAB_WIDTH + TAB_SPACING);
            this.bitmap.drawText("▶", rx + 5, 0, 30, bh, 'center');
        }
    };
    
    Madamis_TabGroup.prototype.removeTab = function(id) {
        this._tabs = this._tabs.filter(t => t.id !== id);
        $gameSystem._madamisTabs = this._tabs;
        if (window.Madamis_OnTabClosed) {
            window.Madamis_OnTabClosed(String(id));
        }
        if ($gameSystem._activeTabId === id) {
            $gameSystem._activeTabId = 'main';
            if (SceneManager._scene.onTabChanged) SceneManager._scene.onTabChanged();
        }
        this.refresh();
    };
    
    Madamis_TabGroup.prototype.update = function() {
        Sprite.prototype.update.call(this);

        const touchX = TouchInput.x;
        const touchY = TouchInput.y;

        if (Einput_l_trig() && touchY < TAB_HEIGHT) {
            if (this._scrollIndex > 0 && touchX < TAB_START_X) {
                this._scrollIndex--;
                SoundManager.playCursor();
                this.refresh();
                return;
            }
            const rightArrowX = TAB_START_X + MAX_VISIBLE_TABS * (TAB_WIDTH + TAB_SPACING);
            if (this._tabs.length > this._scrollIndex + MAX_VISIBLE_TABS && touchX > rightArrowX) {
                this._scrollIndex++;
                SoundManager.playCursor();
                this.refresh();
                return;
            }

            for (let i = 0; i < Math.min(this._tabs.length - this._scrollIndex, MAX_VISIBLE_TABS); i++) {
                const tx = TAB_START_X + i * (TAB_WIDTH + TAB_SPACING);
                if (touchX >= tx && touchX < tx + TAB_WIDTH) {
                    const globalIdx = i + this._scrollIndex;
                    const tab = this._tabs[globalIdx];
                    if (tab.canClose && touchX > tx + TAB_WIDTH - 40) {
                        this.removeTab(tab.id);
                        playCloseSe();
                    } else {
                        if (globalIdx > 0) {
                            this._dragIndex = globalIdx;
                            this._dragX = touchX - tx;
                        }
                        $gameSystem._activeTabId = tab.id;
                        SoundManager.playCursor();
                        this.refresh();
                    }
                    if (SceneManager._scene instanceof Scene_Map) SceneManager._scene.onTabChanged();
                    break;
                }
            }
        }

        if (this._dragIndex >= 1) {
            if (TouchInput.isPressed()) {
                const currentIndex = this._dragIndex;
                const newIndex = Math.floor((touchX - TAB_START_X + (TAB_WIDTH / 2)) / (TAB_WIDTH + TAB_SPACING))
                                     .clamp(1, Math.min(this._tabs.length, MAX_VISIBLE_TABS) - 1);
                
                if (newIndex !== currentIndex) {
                    const temp = this._tabs.splice(currentIndex, 1)[0];
                    this._tabs.splice(newIndex, 0, temp);
                    this._dragIndex = newIndex;
                }
                this.refresh();
            } else if (Einput_l_rel()) {
                this._dragIndex = -1;
                this.refresh();
            }
        }
    };

    Madamis_TabGroup.prototype.ensureTabVisible = function() {
        const activeId = $gameSystem._activeTabId || 'main';
        const activeIndex = this._tabs.findIndex(t => t.id === activeId);
        if (activeIndex === -1) return;

        if (activeIndex < this._scrollIndex) {
            this._scrollIndex = activeIndex;
        } else if (activeIndex >= this._scrollIndex + MAX_VISIBLE_TABS) {
            this._scrollIndex = activeIndex - MAX_VISIBLE_TABS + 1;
        }
    };

    // --- Scene_Map への組み込み ---
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this._tabGroup = new Madamis_TabGroup();
        this.addChild(this._tabGroup);
    };

    Scene_Map.prototype.createButtons = function() {};

    Scene_Map.prototype.onTabChanged = function() {
        if (this.refreshMadamisMenus) this.refreshMadamisMenus();
        if (this._renderer && this._renderer.loadContent) {
            const activeTab = this._tabGroup?._tabs.find(tab => tab.id === $gameSystem._activeTabId);
            this._renderer.loadContent(activeTab || $gameSystem._activeTabId);
        }
    };

    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if ($gameSystem && this._tabGroup) {
            $gameSystem._activeTabId = 'main'; 
            if (this._renderer) this._renderer.visible = false;
            if (this.refreshMadamisMenus) this.refreshMadamisMenus();
            this._tabGroup.refresh();
        }
    };

    Scene_Map.prototype.openTab = function(item) {
        const id = String(item._id !== undefined ? item._id : item.id);
        const excludeIds = ['gm_scene', 'log']; 
        if (!excludeIds.includes(id)) {
            const hasId = id !== "undefined" && id !== "null" && id !== "";
            if (!hasId) return;
        }

        const alreadyOpened = this._tabGroup._tabs.some(t => String(t.id) === id);
        if (!alreadyOpened) {
            this._tabGroup._tabs.push({ 
                id: id, 
                label: item._name || item.name || "No Title", 
                canClose: true,
                contentType: item.contentType
            });
        }
        
        $gameSystem._activeTabId = id;
        if (this._tabGroup) {
            this._tabGroup.ensureTabVisible();
            this._tabGroup.refresh();
        }
        this.onTabChanged();
    };


    window.Madamis_GetCurrentTabId = function() {
        return ($gameSystem && $gameSystem._activeTabId) ? $gameSystem._activeTabId : 'main';
    };

    // プラグインコマンド
    PluginManager.registerCommand(pluginName, "activateMainTab", args => {
        $gameSystem._activeTabId = 'main';
        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene._tabGroup.refresh();
            SceneManager._scene.onTabChanged();
        }
    });

    PluginManager.registerCommand(pluginName, "closeAllTabs", args => {
        if (SceneManager._scene instanceof Scene_Map) {
            const tabGroup = SceneManager._scene._tabGroup;
            tabGroup._tabs = tabGroup._tabs.filter(t => !t.canClose);
            $gameSystem._activeTabId = 'main';
            tabGroup.refresh();
            SceneManager._scene.onTabChanged();
        }
    });

    PluginManager.registerCommand(pluginName, "setTabFixed", args => {
        $gameSystem._madamisTabFixed = String(args.fixed) === "true";
        if ($gameSystem._madamisTabFixed) {
            $gameSystem._activeTabId = 'main';
            if (SceneManager._scene instanceof Scene_Map) {
                SceneManager._scene._tabGroup.refresh();
                SceneManager._scene.onTabChanged();
            }
        }
    });

    PluginManager.registerCommand(pluginName, "changeMainTabName", args => {
        const newName = String(args.newName);
        if ($gameSystem) {
            $gameSystem._customMainTabName = newName;
            if ($gameSystem._madamisTabs) {
                const main = $gameSystem._madamisTabs.find(t => t.id === 'main');
                if (main) main.label = newName;
            }
        }
        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._tabGroup) {
            SceneManager._scene._tabGroup.refresh();
        }
    });

})();
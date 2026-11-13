/*:
 * @target MZ
 * @plugindesc HTMLと画像の情報ファイルをMadamisのコンテンツタブへ描画します。
 * @author Shadowgenic & Gemini
 *
 * @help
 * 【使い方】表示したいHTMLを html/ に、参照画像を所定の画像フォルダに配置します。
 * ゲーム中の配色は「HTML配色の変更」で切り替えられ、ルビは data/ruby_dict.csv に登録します。
 * `html/` フォルダ内のHTMLファイルと、HTMLから参照する画像をゲーム内のコンテンツタブへ描画します。
 * 見出しの大きさに応じて配色を適用し、ルビ辞書、スクロール、文字サイズ変更に対応します。
 * タブIDとファイル名は、`Madamis_SideMenu` などで登録したIDを基準に解決されます。
 *
 * 【使い方】
 * 1. 表示したいHTMLを `html/` に配置し、画像は同フォルダまたは既存の参照先へ置きます。
 * 2. サイドメニューへHTMLのIDを登録し、コンテンツタブを開きます。
 * 3. プラグインパラメータで表示幅、高さ、背景色、見出し色を調整します。
 * 4. 「HTML配色の変更」で type とCSS色を指定すると、ゲーム中に配色を変更できます。
 * 5. `data/ruby_dict.csv` は「漢字,よみ」の形式で記述します。
 * HTML資料の見出しには h1、h2、h3、h4 を使用できます。h1 と h2 は大見出しとして表示します。
 *  
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 *
 * @param HtmlWidth
 * @text 表示幅
 * @desc HTMLコンテンツを表示する領域の幅をピクセル単位で指定します。
 * @type number
 * @default 800
 *
 * @param HtmlHeight
 * @text HTML表示高さ
 * @desc HTMLコンテンツを表示する領域の高さをピクセル単位で指定します。
 * @type number
 * @default 900
 *
 * @param HtmlY
 * @text 表示位置Y
 * @desc HTMLコンテンツ領域の上端Y座標をピクセル単位で指定します。
 * @type number
 * @default 90
 *
 * @param TabBackgroundColor
 * @text タブ余白の背景色
 * @desc HTML・画像タブの本文外側に表示する背景色です。
 * @type color
 * @default #000000
 *
 * @param TabBackgroundOpacity
 * @text タブ余白の不透明度
 * @desc HTML・画像タブの本文外側に表示する背景の不透明度です。0で透明、255で不透明です。
 * @type number
 * @min 0
 * @max 255
 * @default 153
 *
 * @param ImageHeight
 * @text 画像表示高さ
 * @desc コンテンツ内画像の表示高さをピクセル単位で指定します。
 * @type number
 * @default 900
 *
 * @param DefaultFontSize
 * @text 初期フォントサイズ
 * @desc HTMLコンテンツの初期文字サイズをピクセル単位で指定します。
 * @type number
 * @default 16
 *
 * @param BgColor
 * @text 全体背景色
 * @desc コンテンツ全体の背景色をCSS色形式で指定します。
 * @default #fdfdfd
 *
 * @param DefaultTextColor
 * @text 基本文字色
 * @desc 通常の本文に使う文字色をCSS色形式で指定します。
 * @default #333333
 *
 * @param BigTitleBgColor
 * @text 大見出し背景色
 * @desc 大見出しの背景色をCSS色形式で指定します。
 * @default #222266
 *
 * @param BigTitleTextColor
 * @text 大見出し文字色
 * @desc 大見出しの文字色をCSS色形式で指定します。
 * @default #ffffff
 *
 * @param SubTitleBgColor
 * @text 小見出し背景色
 * @desc 中・小見出しの背景色をCSS色形式で指定します。
 * @default #ccebff
 *
 * @param SubTitleTextColor
 * @text 小見出し文字色
 * @desc 中・小見出しの文字色をCSS色形式で指定します。
 * @default #003856
 *
 * @param ZoomUpImage
 * @text 文字拡大ボタン画像
 * @desc コンテンツの文字を拡大するボタン画像です。
 * @type file
 * @dir img/icon/
 * @default Button_zoomup
 *
 * @param ZoomDownImage
 * @text 文字縮小ボタン画像
 * @desc コンテンツの文字を縮小するボタン画像です。
 * @type file
 * @dir img/icon/
 * @default Button_zoomdown
 *
 * @command changeColor
 * @text HTML配色の変更
 * @arg type
 * @text 変更対象
 * @desc 変更するコンテンツ配色の種類です。
 * @type select
 * @option 全体背景色
 * @value bg
 * @option 基本文字色
 * @value text
 * @option 大見出し背景色
 * @value bigBg
 * @option 大見出し文字色
 * @value bigText
 * @option 中見出し背景色
 * @value subBg
 * @option 中見出し文字色
 * @value subText
 * @option 小見出し背景色
 * @value smallBg
 * @option 小見出し文字色
 * @value smallText
 * @arg color
 * @text 色コード (#ffffff等)
 * @desc 選択した配色に適用するCSS色コードです。

 */

(() => {
    'use strict';

    const pluginName = "ContentRenderer";
    const parameters = PluginManager.parameters(pluginName);

    const HTML_W = Number(parameters['HtmlWidth'] || 800);
    const HTML_H = Number(parameters['HtmlHeight'] || 900);
    const HTML_Y = Number(parameters['HtmlY'] || 90);
    const TAB_BACKGROUND_COLOR = parameters['TabBackgroundColor'] || '#000000';
    const TAB_BACKGROUND_OPACITY = Math.max(0, Math.min(255, Number(parameters['TabBackgroundOpacity'] || 153)));
    const IMG_H = Number(parameters['ImageHeight'] || 900);
    const DEFAULT_FONT_SIZE = Number(parameters['DefaultFontSize'] || 22);

    const ZOOM_UP_NAME = parameters['ZoomUpImage'] || 'Button_zoomup';
    const ZOOM_DOWN_NAME = parameters['ZoomDownImage'] || 'Button_zoomdown';

    const INFO_DIR = "info/"; 
    const HTML_FOLDER = "html/"; 

    function drawTabBackground(bitmap) {
        const context = bitmap.context;
        context.save();
        context.globalAlpha = TAB_BACKGROUND_OPACITY / 255;
        bitmap.fillRect(0, 60, Graphics.width, Graphics.height - 60, TAB_BACKGROUND_COLOR);
        context.restore();
    }

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

    const loadHtmlText = async (fileName) => {
        const htmlUrl = `${HTML_FOLDER}${fileName}.htm`;
        if (Utils.isNwjs()) {
            const fs = require("fs");
            const path = require("path");
            const gameDirectory = path.dirname(process.mainModule.filename);
            return fs.readFileSync(path.join(gameDirectory, htmlUrl), "utf8");
        }
        const response = await fetch(htmlUrl);
        if (!response.ok) throw new Error(`Failed to load ${htmlUrl}`);
        return response.text();
    };

    // --- Game_System 設定保持 ---
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this.initMadamisColors();
    };

    Game_System.prototype.initMadamisColors = function() {
        if (!this._madamisColors) {
            this._madamisColors = {
                bg: parameters['BgColor'] || '#fdfdfd',
                text: parameters['DefaultTextColor'] || '#333333',
                bigBg: parameters['BigTitleBgColor'] || '#222266',
                bigText: parameters['BigTitleTextColor'] || '#ffffff',
                subBg: parameters['SubTitleBgColor'] || '#ccebff',
                subText: parameters['SubTitleTextColor'] || '#003856',
                smallBg: parameters['SmallTitleBgColor'] || '#d1e7dd',
                smallText: parameters['SmallTitleTextColor'] || '#0f5132'
            };
        }
    };

    // --- ルビ辞書読み込み ---
    let rubyDictionary = [];
    const loadRubyDictionary = async () => {
        try {
            const response = await fetch("data/ruby_dict.csv");
            if (!response.ok) return;
            const text = await response.text();
            rubyDictionary = text.split(/\r?\n/).map(line => {
                const parts = line.split(',');
                const base = parts[0]?.trim();
                const ruby = parts[1]?.trim();
                if (base && ruby) return { base: base, ruby: ruby };
                return null;
            }).filter(item => item !== null);
            rubyDictionary.sort((a, b) => b.base.length - a.base.length);
        } catch (e) { 
            console.warn("Ruby dictionary load failed."); 
        }
    };
    loadRubyDictionary();

    // --- Madamis_Renderer ---
    function Madamis_Renderer() { this.initialize(...arguments); }
    Madamis_Renderer.prototype = Object.create(Sprite.prototype);
    Madamis_Renderer.prototype.constructor = Madamis_Renderer;

    Madamis_Renderer.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.bitmap = new Bitmap(Graphics.width, Graphics.height);
        this.visible = false;
        this._mode = "html"; 
        this._maxScrollY = 0;
        this._isLoadingNewTab = false;
        this._baseFontSize = DEFAULT_FONT_SIZE;
        this._fullTextBitmap = null;
        this._isDraggingContent = false;
        this._isDraggingBar = false;
        this._lastTouchY = 0;
        this._contentLoadToken = 0;
        this._tabContentCache = Object.create(null);
        this.createZoomButtons();
    };

    Madamis_Renderer.prototype.createZoomButtons = function() {
        this._btnZoomUp = new Sprite(ImageManager.loadBitmap('img/icon/', ZOOM_UP_NAME));
        this._btnZoomDown = new Sprite(ImageManager.loadBitmap('img/icon/', ZOOM_DOWN_NAME));
        this.addChild(this._btnZoomUp); 
        this.addChild(this._btnZoomDown);
    };

    Madamis_Renderer.prototype.getTabScrollY = function(tabId) {
        if (!$gameSystem || !tabId) return 0;
        if (!$gameSystem._madamisTabScrollPositions) {
            $gameSystem._madamisTabScrollPositions = {};
        }
        return Number($gameSystem._madamisTabScrollPositions[tabId]) || 0;
    };

    Madamis_Renderer.prototype.setTabScrollY = function(tabId, scrollY) {
        if (!$gameSystem || !tabId) return;
        if (!$gameSystem._madamisTabScrollPositions) {
            $gameSystem._madamisTabScrollPositions = {};
        }
        $gameSystem._madamisTabScrollPositions[tabId] = scrollY;
    };

    Madamis_Renderer.prototype.loadContent = async function(tab) {
        const tabName = typeof tab === 'object' ? tab.id : tab;
        const contentType = typeof tab === 'object' && tab.contentType === 'image'
            ? 'image'
            : 'html';
        const loadToken = ++this._contentLoadToken;
        this._currentOwnerTabId = tabName;
        this._isLoadingNewTab = true;

        const isCurrentLoad = () => {
            return loadToken === this._contentLoadToken
                && this._currentOwnerTabId === tabName
                && (!$gameSystem || $gameSystem._activeTabId === tabName);
        };

        if (!tabName || tabName === 'main' || tabName === 'culprit_vote') { 
            this.visible = false; 
            return; 
        }

        const cached = this._tabContentCache[tabName];
        if (cached) {
            this._mode = cached.mode;
            this._baseFontSize = cached.baseFontSize || DEFAULT_FONT_SIZE;
            this._maxScrollY = cached.maxScrollY || 0;
            this._currentHtmlRawText = cached.rawText || '';
            this._fullTextBitmap = cached.fullTextBitmap || null;
            this._isLoadingNewTab = false;
            if (cached.mode === 'html') {
                this._btnZoomUp.visible = this._btnZoomDown.visible = true;
                this.refreshHtml();
            } else {
                this.showImageBitmap(cached.bitmap);
            }
            this.visible = true;
            return;
        }

        this.visible = false;

        if (contentType === 'image') {
            this._mode = 'image';
            this.renderAsImage(tabName, loadToken);
            return;
        }

        try {
            const text = await loadHtmlText(tabName);
            if (!isCurrentLoad()) return;

            this._mode = "html";
            this._currentHtmlRawText = text;
            this.prepareRenderHtml(loadToken, tabName);
            this.visible = true;
        } catch (e) {
            if (!isCurrentLoad()) return;
            console.error(`Failed to load HTML content: ${HTML_FOLDER}${tabName}.htm`, e);
            this.visible = false;
        }
    };

    Madamis_Renderer.prototype.renderAsImage = function(id, loadToken) {
        const bitmap = ImageManager.loadBitmap("img/" + INFO_DIR, id);
        bitmap.addLoadListener(() => {
            if (loadToken !== this._contentLoadToken
                || this._currentOwnerTabId !== id
                || ($gameSystem && $gameSystem._activeTabId !== id)) return;
            if (bitmap.isError()) { this.visible = false; return; }
            this._tabContentCache[id] = {
                mode: 'image',
                bitmap: bitmap,
                baseFontSize: this._baseFontSize,
                maxScrollY: 0
            };
            this.showImageBitmap(bitmap);
            this.visible = true;
        });
    };

    Madamis_Renderer.prototype.showImageBitmap = function(bitmap) {
        this.bitmap.clear();
        drawTabBackground(this.bitmap);
        this._btnZoomUp.visible = this._btnZoomDown.visible = false;
        const availW = Graphics.width - 20, availH = IMG_H;
        const scale = Math.min(availW / bitmap.width, availH / bitmap.height);
        const drawW = bitmap.width * scale, drawH = bitmap.height * scale;
        const dx = (Graphics.width - drawW) / 2, dy = HTML_Y;
        this.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, dx, dy, drawW, drawH);
    };

    Madamis_Renderer.prototype.prepareRenderHtml = function(renderToken, renderTabId) {
        renderToken = renderToken ?? this._contentLoadToken;
        renderTabId = renderTabId ?? this._currentOwnerTabId;
        if (renderToken !== this._contentLoadToken
            || this._currentOwnerTabId !== renderTabId
            || ($gameSystem && $gameSystem._activeTabId !== renderTabId)) return;
        if (!this._currentHtmlRawText) return;
        $gameSystem.initMadamisColors();
        this._btnZoomUp.visible = this._btnZoomDown.visible = true;
        const dx_center = (Graphics.width - HTML_W) / 2;
        this._btnZoomUp.x = dx_center + HTML_W + 15;
        this._btnZoomUp.y = HTML_Y + 40;
        this._btnZoomDown.x = this._btnZoomUp.x;
        this._btnZoomDown.y = HTML_Y + 100;
     
        this._scrollRatioBeforeRender = this._maxScrollY > 0
            ? this.getTabScrollY(this._currentOwnerTabId) / this._maxScrollY
            : 0;
        const baseFontSize = this._baseFontSize || 22;
        let cleanHtml = this._currentHtmlRawText.replace(/<title>[\s\S]*?<\/title>/gi, '');
        const parser = new DOMParser(), doc = parser.parseFromString(cleanHtml, 'text/html');
        
        const elements = Array.from(doc.body.querySelectorAll('div, img, h1, h2, h3, h4, br'));
        
        const marginX = 60, marginY = 50;
        const rubySpace = Math.max(10, Math.round(baseFontSize * 0.45));
        const LINE_SPACING = 8;
        const standardLineHeight = baseFontSize + rubySpace + LINE_SPACING;

        const testBitmap = new Bitmap(10, 10);
        const kinsokuBurasage = "、。？！）」』】〉》〉｝〉】］〕｝」』〉》」』";
        
        const renderItems = [];
        let pendingImages = 0;

        elements.forEach(el => {
            if (el.nodeName === "BR") {
                renderItems.push({ type: 'emptyLine', height: standardLineHeight });
                return;
            }

            if (el.nodeName === "IMG") {
                const src = el.getAttribute('src');
                if (!src) return;
                
                const imgName = src.split('/').pop().replace(/\.[^/.]+$/, "");
                const bitmap = ImageManager.loadBitmap("img/" + HTML_FOLDER, imgName);
                
                const imgBlock = { type: 'image', bitmap: bitmap, height: 0, loaded: false };
                renderItems.push(imgBlock);
                pendingImages++;

                bitmap.addLoadListener(() => {
                    const maxWidth = HTML_W - (marginX * 2);
                    const scale = (bitmap.width > maxWidth) ? maxWidth / bitmap.width : 1.0;
                    imgBlock.height = bitmap.height * scale;
                    imgBlock.scale = scale;
                    imgBlock.loaded = true;
                    pendingImages--;
                    
                    if (pendingImages === 0) {
                        this.finalizeHtmlRender(renderItems, marginX, marginY, standardLineHeight, renderToken, renderTabId);
                    }
                });
                return;
            }

            const div = el;
            if (div.querySelector('img')) return;

            const rawText = resolveEscapeCharacters(div.innerText);
            const checkText = rawText.trim();
            
            const isEmptyLine = !checkText || checkText === " " || rawText.replace(/[\s ]/g, '') === "";
            if (isEmptyLine) {
                renderItems.push({ type: 'emptyLine', height: standardLineHeight });
                return;
            }

            let maxEm = 1.0;
            const styles = [div.getAttribute('style') || ""];
            div.querySelectorAll('[style*="font-size"]').forEach(child => styles.push(child.getAttribute('style') || ""));
            styles.forEach(s => { 
                const m = s ? s.match(/font-size:\s*([\d.]+)em/) : null; 
                if (m) maxEm = Math.max(maxEm, parseFloat(m[1])); 
            });

            let type = "normal";
            const tagName = div.nodeName.toLowerCase();
            const styleStr = div.getAttribute('style') || "";
            if (tagName === "h1" || tagName === "h2" || maxEm >= 1.6 || styleStr.includes("COLOR=\"#ffffff\"")) {
                type = "bigTitle";
            } else if (tagName === "h3" || maxEm >= 1.4) {
                type = "subTitle";
            } else if (tagName === "h4" || maxEm > 1.0 || (div.querySelector('b') && checkText.length < 30)) {
                type = "smallTitle";
            } else {
                type = "normal";
            }

            let fSize = baseFontSize;
            if (type === "bigTitle") {
                fSize = Math.round(baseFontSize * 1.72);
            } else if (type === "subTitle") {
                fSize = Math.round(baseFontSize * 1.35);
            } else if (type === "smallTitle") {
                fSize = Math.round(baseFontSize * 1.05);
            }

            const rSpace = Math.max(10, Math.round(fSize * 0.45));
            const lHeight = fSize + rSpace + LINE_SPACING;
            let baseIndent = (type === "bigTitle") ? 10 : (type === "subTitle" || type === "smallTitle") ? 15 : 10;
            const maxWidth = HTML_W - (marginX * 2) - baseIndent;
            
            const subLines = [];
            let currentLineNodes = [], currentLineWidth = 0;

            const processNode = (node, parentStyle) => {
                let currentStyle = { ...parentStyle };
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tag = node.nodeName;
                    if (tag === "B" || tag === "STRONG") currentStyle.bold = true;
                    if (tag === "FONT") { const color = node.getAttribute("color"); if (color) currentStyle.color = color; }
                    const inlineStyle = node.getAttribute("style");
                    if (inlineStyle) {
                        const colorMatch = inlineStyle.match(/color:\s*(#[0-9a-fA-F]+|[a-zA-Z]+)/);
                        if (colorMatch) currentStyle.color = colorMatch[1];
                        if (inlineStyle.includes("font-weight:bold") || inlineStyle.includes("font-weight: bold")) currentStyle.bold = true;
                    }
                }

                const createRubyObj = (baseText, rubyText) => {
                    testBitmap.fontSize = fSize; testBitmap.fontBold = currentStyle.bold;
                    const rubyFontSize = Math.max(10, Math.round(fSize * 0.4));

                    let baseTotalW = 0;
                    const baseParts = [];
                    for (let i = 0; i < baseText.length; i++) {
                        const bChar = baseText[i];
                        const bw = testBitmap.measureTextWidth(bChar);
                        baseTotalW += bw;
                        baseParts.push({ char: bChar, w: bw });
                    }

                    testBitmap.fontSize = rubyFontSize;
                    const rubyParts = [];
                    let rubyTotalW = 0;
                    for (let j = 0; j < rubyText.length; j++) {
                        const rChar = rubyText[j];
                        const rw = testBitmap.measureTextWidth(rChar);
                        rubyTotalW += rw;
                        rubyParts.push({ char: rChar, w: rw });
                    }
                    testBitmap.fontSize = fSize;

                    const mappings = baseParts.map(p => ({ baseChar: p.char, baseW: p.w }));

                    return {
                        type: 'rubyAdvanced',
                        baseText: baseText,
                        rubyText: rubyText,
                        baseTotalW: baseTotalW,
                        rubyParts: rubyParts,
                        rubyTotalW: rubyTotalW,
                        mappings: mappings,
                        style: currentStyle
                    };
                };

                if (node.nodeName === "RUBY") {
                    const baseNodes = Array.from(node.childNodes).filter(n => n.nodeName !== "RT");
                    const baseText = baseNodes.map(n => n.textContent).join('').trim();
                    const rtNode = node.querySelector("rt"), rubyText = rtNode ? rtNode.textContent.trim() : "";
                    
                    const rubyObj = createRubyObj(baseText, rubyText);

                    if (currentLineWidth + rubyObj.baseTotalW > maxWidth) { 
                        subLines.push({ nodes: currentLineNodes }); 
                        currentLineNodes = []; 
                        currentLineWidth = 0; 
                    }
                    currentLineNodes.push(rubyObj);
                    currentLineWidth += rubyObj.baseTotalW;

                } else if (node.nodeType === Node.TEXT_NODE) {
                    let text = resolveEscapeCharacters(node.textContent).replace(/[\r\n]/g, '');
                    
                    for (let i = 0; i < text.length; i++) {
                        let matched = null;
                        if (text[i] === '【') {
                            const closeIdx = text.indexOf('】', i);
                            const slashIdx = text.indexOf('/', i);
                            if (closeIdx !== -1 && slashIdx !== -1 && slashIdx < closeIdx) {
                                const baseText = text.substring(i + 1, slashIdx).trim();
                                const rubyText = text.substring(slashIdx + 1, closeIdx).trim();
                                matched = { base: baseText, ruby: rubyText };
                                matched.consumeLength = (closeIdx - i) + 1;
                            }
                        }

                        if (!matched && typeof rubyDictionary !== 'undefined') {
                            for (const entry of rubyDictionary) { 
                                if (text.substring(i, i + entry.base.length) === entry.base) { 
                                    matched = { base: entry.base.trim(), ruby: entry.ruby.trim(), consumeLength: entry.base.length }; 
                                    break; 
                                } 
                            }
                        }

                        testBitmap.fontSize = fSize; testBitmap.fontBold = currentStyle.bold;
                        if (matched) {
                            const rubyObj = createRubyObj(matched.base, matched.ruby);

                            if (currentLineWidth + rubyObj.baseTotalW > maxWidth) { 
                                subLines.push({ nodes: currentLineNodes }); 
                                currentLineNodes = []; 
                                currentLineWidth = 0; 
                            }
                            currentLineNodes.push(rubyObj);
                            currentLineWidth += rubyObj.baseTotalW;
                            i += matched.consumeLength - 1;
                        } else {
                            const char = text[i];
                            const w = (char === ' ') ? fSize : testBitmap.measureTextWidth(char);
                            
                            if (currentLineWidth + w > maxWidth && !kinsokuBurasage.includes(char)) { 
                                subLines.push({ nodes: currentLineNodes }); 
                                currentLineNodes = []; 
                                currentLineWidth = 0; 
                            }
                            currentLineNodes.push({ type: 'text', text: char, w, style: currentStyle });
                            currentLineWidth += w;
                        }
                    }
                } else { node.childNodes.forEach(child => processNode(child, currentStyle)); }
            };

            processNode(div, { bold: (type !== "normal"), color: null });
            if (currentLineNodes.length > 0) subLines.push({ nodes: currentLineNodes });

            if (type === "normal") {
                subLines.forEach(lineObj => {
                    renderItems.push({
                        type: 'textLine',
                        lineNodes: lineObj.nodes,
                        fSize: fSize,
                        rSpace: rSpace,
                        lHeight: lHeight,
                        indent: baseIndent,
                        blockType: 'normal'
                    });
                });
            } else {
                const effectiveLines = Math.max(1, subLines.length);
                const totalBlockHeight = (effectiveLines * lHeight) + 8;
                renderItems.push({
                    type: 'titleBlock',
                    textLines: subLines,
                    blockType: type,
                    fSize: fSize,
                    rSpace: rSpace,
                    lHeight: lHeight,
                    indent: baseIndent,
                    totalBlockHeight: totalBlockHeight
                });
            }
        });

        if (pendingImages === 0) {
            this.finalizeHtmlRender(renderItems, marginX, marginY, standardLineHeight, renderToken, renderTabId);
        }
    };

    Madamis_Renderer.prototype.finalizeHtmlRender = function(renderItems, marginX, marginY, standardLineHeight, renderToken, renderTabId) {
        if (renderToken !== this._contentLoadToken
            || this._currentOwnerTabId !== renderTabId
            || ($gameSystem && $gameSystem._activeTabId !== renderTabId)) return;
        let totalHeight = marginY;
        renderItems.forEach((item, index) => {
            if (item.type === 'titleBlock' && index > 0) totalHeight += 16;
            if (item.type === 'textLine') totalHeight += item.lHeight;
            else if (item.type === 'emptyLine') totalHeight += standardLineHeight;
            else if (item.type === 'titleBlock') totalHeight += item.totalBlockHeight + 10;
            else if (item.type === 'image') totalHeight += item.height + standardLineHeight;
        });

        this._fullTextBitmap = new Bitmap(HTML_W, Math.max(totalHeight + marginY, HTML_H));
        const b = this._fullTextBitmap; 
        b.fillRect(0, 0, b.width, b.height, $gameSystem._madamisColors.bg);
        let curY = marginY;

        const drawLineNodes = (lineNodes, startX, textDrawY, fSize, rSpace, defaultColor) => {
            let curX = startX;
            const rbSize = Math.max(10, Math.floor(fSize * 0.4));

            lineNodes.forEach(node => {
                b.fontSize = fSize; 
                b.fontBold = node.style.bold; 
                b.textColor = node.style.color || defaultColor; 
                b.outlineWidth = 0;
                
                if (node.type === 'text') { 
                    b.drawText(node.text, curX, textDrawY, node.w + 4, fSize, "left"); 
                    curX += node.w; 
                } else if (node.type === 'rubyAdvanced') {
                    let charCurX = curX;
                    node.mappings.forEach(m => {
                        if (m.baseChar) {
                            b.fontSize = fSize;
                            b.fontBold = node.style.bold;
                            b.drawText(m.baseChar, charCurX, textDrawY, m.baseW + 4, fSize, "left");
                        }
                        charCurX += m.baseW;
                    });

                    const rLen = node.rubyText.length;
                    b.fontSize = rbSize;
                    b.fontBold = false;

                    const rWidths = node.rubyParts.map(p => ({ char: p.char, w: b.measureTextWidth(p.char) }));
                    const totalRubyNaturalW = rWidths.reduce((sum, p) => sum + p.w, 0);

                    let useJustify = false;
                    const firstBaseCenter = curX + (node.mappings[0].baseW / 2);
                    const lastBaseCenter = (curX + node.baseTotalW) - (node.mappings[node.mappings.length - 1].baseW / 2);
                    const totalSpan = lastBaseCenter - firstBaseCenter;

                    if (rLen > 1) {
                        const centeredFirstRubyCenter = (curX + (node.baseTotalW - totalRubyNaturalW) / 2) + (rWidths[0].w / 2);
                        const firstBaseCharCenter = firstBaseCenter;
                        if (centeredFirstRubyCenter >= firstBaseCharCenter) {
                            useJustify = true;
                        }
                    }

                    if (useJustify) {
                        const step = totalSpan / (rLen - 1);
                        for (let j = 0; j < rLen; j++) {
                            const targetCenter = firstBaseCenter + (step * j);
                            const rw = rWidths[j].w;
                            const rCharDrawX = targetCenter - (rw / 2);
                            b.drawText(rWidths[j].char, rCharDrawX, textDrawY - rbSize - 2, rw + 4, rbSize, "left");
                        }
                    } else {
                        let rCurX = curX + (node.baseTotalW - totalRubyNaturalW) / 2;
                        b.drawText(node.rubyText, rCurX, textDrawY - rbSize - 2, totalRubyNaturalW + 4, rbSize, "left");
                    }

                    curX += node.baseTotalW;
                }
            });
        };

        renderItems.forEach((item, index) => {
            if (item.type === 'titleBlock' && index > 0) curY += 16;

            if (item.type === 'emptyLine') {
                curY += standardLineHeight;
            } else if (item.type === 'textLine') {
                const startX = marginX + item.indent;
                const textDrawY = curY + item.rSpace;
                drawLineNodes(item.lineNodes, startX, textDrawY, item.fSize, item.rSpace, $gameSystem._madamisColors.text);
                curY += item.lHeight;
            } else if (item.type === 'titleBlock') {
                let bg = $gameSystem._madamisColors.subBg;
                if (item.blockType === "bigTitle") bg = $gameSystem._madamisColors.bigBg;
                else if (item.blockType === "smallTitle") bg = $gameSystem._madamisColors.smallBg;
                
                let blockDefaultColor = $gameSystem._madamisColors.text;
                if (item.blockType === "bigTitle") blockDefaultColor = $gameSystem._madamisColors.bigText;
                else if (item.blockType === "subTitle") blockDefaultColor = $gameSystem._madamisColors.subText;
                else if (item.blockType === "smallTitle") blockDefaultColor = $gameSystem._madamisColors.smallText;

                b.fillRect(marginX - 10, curY, HTML_W - (marginX * 2) + 20, item.totalBlockHeight, bg);

                const effectiveLines = Math.max(1, item.textLines.length);
                const textOnlyHeight = effectiveLines * item.lHeight;
                const startDrawY = curY + (item.totalBlockHeight - textOnlyHeight) / 2;

                item.textLines.forEach((lineObj, i) => {
                    const lineBaseY = startDrawY + (i * item.lHeight);
                    const textDrawY = lineBaseY + item.rSpace;
                    const startX = marginX + item.indent;
                    drawLineNodes(lineObj.nodes, startX, textDrawY, item.fSize, item.rSpace, blockDefaultColor);
                });
                curY += item.totalBlockHeight + 10;
            } else if (item.type === 'image' && item.loaded) {
                const drawW = item.bitmap.width * item.scale, drawH = item.bitmap.height * item.scale;
                const dx = (HTML_W - drawW) / 2;
                b.blt(item.bitmap, 0, 0, item.bitmap.width, item.bitmap.height, dx, curY, drawW, drawH);
                curY += item.height + standardLineHeight;
            }
        });

        this._maxScrollY = Math.max(0, totalHeight - HTML_H);
        this._tabContentCache[renderTabId] = {
            mode: 'html',
            rawText: this._currentHtmlRawText,
            fullTextBitmap: this._fullTextBitmap,
            maxScrollY: this._maxScrollY,
            baseFontSize: this._baseFontSize
        };
        if (this._isLoadingNewTab) {
            this.setTabScrollY(
                this._currentOwnerTabId,
                this.getTabScrollY(this._currentOwnerTabId).clamp(0, this._maxScrollY)
            );
        } else {
            this.setTabScrollY(
                this._currentOwnerTabId,
                (this._scrollRatioBeforeRender * this._maxScrollY).clamp(0, this._maxScrollY)
            );
        }
        this._isLoadingNewTab = false;
        
        this.refreshHtml(); 
    };

    Madamis_Renderer.prototype.refreshHtml = function() {
        if (this._mode !== "html" || !this._fullTextBitmap) return;
    
        this.bitmap.clear();
        drawTabBackground(this.bitmap);
        const dx = (Graphics.width - HTML_W) / 2;
        const scrollY = this.getTabScrollY(this._currentOwnerTabId);
        this.bitmap.blt(this._fullTextBitmap, 0, scrollY, HTML_W, HTML_H, dx, HTML_Y);
    
        if (this._maxScrollY > 0) {
            const barW = 8, padding = 5, areaH = HTML_H - (padding * 2);
            const barH = Math.max(30, (HTML_H / (this._maxScrollY + HTML_H)) * areaH);
            const scrollRatio = scrollY / this._maxScrollY;
            const barY = HTML_Y + padding + (scrollRatio * (areaH - barH)), barX = dx + HTML_W - barW - 6;
            this.bitmap.fillRect(barX, HTML_Y + padding, barW, areaH, "rgba(0,0,0,0.05)");
            this.bitmap.fillRect(barX, barY, barW, barH, "rgba(0,0,0,0.3)");
        }
    };

    Madamis_Renderer.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this.visible || this._mode !== "html") return;

        if (this._currentOwnerTabId !== $gameSystem._activeTabId) return;

        if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._menuItems) {
            const isMenuOpen = SceneManager._scene._menuItems.some(item => item._isOpening);
            if (isMenuOpen) return;
        }

        if (Einput_l_trig()) {
            if (this.isButtonTouched(this._btnZoomUp)) { 
                this._baseFontSize = (this._baseFontSize + 2).clamp(12, 60); 
                SoundManager.playCursor(); 
                this.prepareRenderHtml(); 
                return; 
            }
            if (this.isButtonTouched(this._btnZoomDown)) { 
                this._baseFontSize = (this._baseFontSize - 2).clamp(12, 60); 
                SoundManager.playCursor(); 
                this.prepareRenderHtml(); 
                return; 
            }
        }

        if (TouchInput.wheelY !== 0) {
            const scrollY = (this.getTabScrollY(this._currentOwnerTabId) + TouchInput.wheelY)
                .clamp(0, this._maxScrollY);
            this.setTabScrollY(this._currentOwnerTabId, scrollY);
            this.refreshHtml();
        }

        if (TouchInput.isPressed()) {
            const dx = (Graphics.width - HTML_W) / 2;
            const rx = TouchInput.x - dx;
            const ry = TouchInput.y - HTML_Y;

            if (!this._isDraggingContent && !this._isDraggingBar) {
                if (rx >= HTML_W - 40 && rx <= HTML_W + 10 && ry >= 0 && ry <= HTML_H) {
                    this._isDraggingBar = true;
                } else if (rx >= 0 && rx <= HTML_W && ry >= 0 && ry <= HTML_H) {
                    this._isDraggingContent = true;
                    this._lastTouchY = TouchInput.y;
                }
            }

            if (this._isDraggingBar) {
                const padding = 5;
                const areaH = HTML_H - (padding * 2);
                const barH = Math.max(30, (HTML_H / (this._maxScrollY + HTML_H)) * areaH);
                const moveRange = areaH - barH;
                const ratio = ((TouchInput.y - (HTML_Y + padding + barH / 2)) / moveRange).clamp(0, 1);
                this.setTabScrollY(this._currentOwnerTabId, ratio * this._maxScrollY);
                this.refreshHtml();
            } else if (this._isDraggingContent) {
                const dy = this._lastTouchY - TouchInput.y;
                const scrollY = (this.getTabScrollY(this._currentOwnerTabId) + dy)
                    .clamp(0, this._maxScrollY);
                this._lastTouchY = TouchInput.y;
                this.setTabScrollY(this._currentOwnerTabId, scrollY);
                this.refreshHtml();
            }
        } else {
            this._isDraggingContent = false;
            this._isDraggingBar = false;
        }
    };

    Madamis_Renderer.prototype.isButtonTouched = function(s) {
        if (this._currentOwnerTabId !== $gameSystem._activeTabId) return false;
        const x = TouchInput.x - (this.x + s.x);
        const y = TouchInput.y - (this.y + s.y);
        return x >= 0 && y >= 0 && x < s.width && y < s.height;
    };

    Madamis_Renderer.prototype.clearTabContent = function(tabId) {
        if (!tabId || tabId === 'main') return;
        delete this._tabContentCache[tabId];
    };

    window.Madamis_OnTabClosed = function(tabId) {
        const scene = SceneManager._scene;
        if (scene instanceof Scene_Map && scene._renderer) {
            scene._renderer.clearTabContent(String(tabId));
        }
    };

    // --- Scene_Map 連携拡張 ---
    const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this._renderer = new Madamis_Renderer();
        this.addChild(this._renderer);
    };

    window.Madamis_GetCurrentTabAttribute = function() {
        const scene = SceneManager._scene;
        if (!(scene instanceof Scene_Map) || !scene._renderer) return "main";
        const activeId = window.Madamis_GetCurrentTabId ? window.Madamis_GetCurrentTabId() : 'main';
        if (activeId === 'main') return "main";
        return scene._renderer._mode; 
    };

    // --- プラグインコマンド ---
    PluginManager.registerCommand(pluginName, "changeColor", args => {
        $gameSystem.initMadamisColors();
        const type = args.type;
        if ($gameSystem._madamisColors[type] !== undefined) {
            $gameSystem._madamisColors[type] = args.color;
            if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._renderer) {
                SceneManager._scene._renderer.prepareRenderHtml();
            }
        }
    });

})();

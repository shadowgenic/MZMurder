/*:
 * @target MZ
 * @plugindesc 入力文字をゲーム変数へ保存するSpriteベースの入力フォームです。
 * @author Shadowgenic & Google Gemini
 * @help
 * 【使い方】img/system/InputBackground.png を配置し、イベントから「テキスト入力フォームを表示」を実行します。
 * 保存先変数と最大文字数を指定し、Enterで確定、Escapeでキャンセルします。
 * 【デザイン仕様】
 * img/system/InputBackground.png を読み込んで背景にします。
 * フォントはオプションプラグインの設定に自動追従します。
 *
 * 【使い方】
 * イベントのプラグインコマンド「テキスト入力フォームを表示」で保存先変数と最大文字数を指定します。
 * 入力中はキーボードで文字を編集し、Enterで確定、Escapeでキャンセルします。
 * 背景画像 `img/system/InputBackground.png` が必要です。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 *  
 * @command showInput
 * @text テキスト入力フォームを表示
 * @arg variableId
 * @text 保存先変数
 * @desc 入力確定時の文字列を保存するゲーム変数です。
 * @type variable
 * @default 1
 * @arg maxLength
 * @text 最大文字数
 * @desc 入力できる文字数の上限です。
 * @type number
 * @default 20
 */

(() => {
    'use strict';

    // プラグインコマンド：入力フォームの表示
    PluginManager.registerCommand("TextInput", "showInput", args => {
        const variableId = Number(args.variableId);
        const maxLength = Number(args.maxLength || 20);
        
        // Scene_Mapの上に直接Spriteを追加（MadamisUIコンテナがある場合はそこへ）
        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene.showMadamisTextInput(variableId, maxLength);
        }
    });

    // --- Scene_Mapへの機能追加 ---
    Scene_Map.prototype.showMadamisTextInput = function(varId, max) {
        if (this._madamisInputWindow) {
            this._madamisInputWindow.terminate();
        }
        this._madamisInputWindow = new Sprite_MadamisInput(varId, max);
        this.addChild(this._madamisInputWindow);
    };

    // --- Sprite_MadamisInput クラス ---
    function Sprite_MadamisInput() {
        this.initialize(...arguments);
    }

    Sprite_MadamisInput.prototype = Object.create(Sprite.prototype);
    Sprite_MadamisInput.prototype.constructor = Sprite_MadamisInput;

    Sprite_MadamisInput.prototype.initialize = function(varId, max) {
        Sprite.prototype.initialize.call(this);
        this._variableId = varId;
        this._maxLength = max;
        this._text = "";
        this._active = true;
        
        this.createBitmap();
        this.createInputHandlers();
    };

    Sprite_MadamisInput.prototype.createBitmap = function() {
        // 背景素材の読み込み（デザインは素材に任せる）
        this._backgroundBitmap = ImageManager.loadSystem("InputBackground");
        this.bitmap = new Bitmap(800, 100);
        this._backgroundBitmap.addLoadListener(() => {
            this.bitmap.resize(this._backgroundBitmap.width, this._backgroundBitmap.height);
            this.x = (Graphics.width - this.bitmap.width) / 2;
            this.y = (Graphics.height - this.bitmap.height) / 2;
            this.refresh();
        });
    };

    Sprite_MadamisInput.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._active) {
            this.refresh();
        }
    };

    Sprite_MadamisInput.prototype.refresh = function() {
        // オプションで選ばれたフォントをBitmapが自動的に参照する
        this.bitmap.clear();
        // 背景描画（画像ロード完了後）
        const bg = this._backgroundBitmap;
        if (bg && bg.isReady()) {
            this.bitmap.blt(bg, 0, 0, bg.width, bg.height, 0, 0);
        }
        
        // 文字描画
        this.bitmap.fontSize = 32;
        this.bitmap.drawText(this._text + (Graphics.frameCount % 60 < 30 ? "|" : ""), 20, 0, this.bitmap.width - 40, this.bitmap.height, "center");
    };

    Sprite_MadamisInput.prototype.createInputHandlers = function() {
        this._onKeyDown = (event) => {
            if (!this._active) return;
            
            if (event.key === "Enter") {
                event.preventDefault();
                // 変数への代入処理
                $gameVariables.setValue(this._variableId, this._text);
                this.terminate();
            } else if (event.key === "Escape") {
                event.preventDefault();
                this.terminate();
            } else if (event.key === "Backspace") {
                event.preventDefault();
                this._text = this._text.slice(0, -1);
            } else if (event.key.length === 1 && this._text.length < this._maxLength) {
                event.preventDefault();
                this._text += event.key;
            }
        };
        window.addEventListener("keydown", this._onKeyDown);
    };

    Sprite_MadamisInput.prototype.terminate = function() {
        if (!this._active) return;
        this._active = false;
        window.removeEventListener("keydown", this._onKeyDown);
        if (this.parent) this.parent.removeChild(this);
    };

})();
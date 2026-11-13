/*:
 * @target MZ
 * @plugindesc 画面上のスライダーで各プレイヤーのマスター音量を個別に調整します。
 * @author Shadowgenic & Google Gemini
 *
 * @help
 * 【使い方】img/icon/ に通常時・ミュート時のアイコンを配置し、BarX/BarY と MuteX/MuteY で画面上の位置を設定します。
 * 有効化するとスライダーとミュートボタンが表示され、プレイヤーごとにマスター音量を変更できます。
 * 画面上に音量スライダーとミュートボタンを表示し、BGM・BGS・ME・SE・動画の音量をまとめて調整します。
 * 音量値はプレイヤーごとに保持され、他の参加者の音量設定には影響しません。
 *
 * 【使い方】
 * 1. `img/icon/` に通常時とミュート時のアイコンを配置します。
 * 2. `BarX`、`BarY`、`MuteX`、`MuteY` で画面上の配置を調整します。
 * 3. ゲーム中にスライダーをドラッグし、ミュートアイコンをクリックして音を消します。
 * 
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要。
 *
 * @param DefaultVolume
 * @text デフォルト音量
 * @desc ゲーム開始時のプレイヤー個別音量を0から100で指定します。
 * @type number
 * @default 30
 *
 * @param BarX @text バーのX座標 @desc 音量バーの左端X座標をピクセル単位で指定します。 @default 1700
 * @param BarY @text バーのY座標 @desc 音量バーの上端Y座標をピクセル単位で指定します。 @default 17
 * @param SliderBaseY @text スライダーのY座標 @desc スライダーつまみの基準Y座標をピクセル単位で指定します。 @default 12
 *
 * @param NormalIconName @text 通常時アイコン @desc 音声出力中に表示するアイコン画像名です。 @default mute
 * @param MuteIconName @text ミュート時アイコン @desc ミュート中に表示するアイコン画像名です。 @default mute2
 * @param MuteX @text アイコンX座標 @desc ミュートボタンのX座標をピクセル単位で指定します。 @default 1670
 * @param MuteY @text アイコンY座標 @desc ミュートボタンのY座標をピクセル単位で指定します。 @default 12
 */

(() => {
    'use strict';
    const pluginName = 'SetVolume';
    const legacyPluginName = 'Madamis_VolumeSlider';
    const params = Object.assign({}, PluginManager.parameters(legacyPluginName), PluginManager.parameters(pluginName));
    
    // パラメータ取得
    const BAR_X = Number(params['BarX'] || 1700);
    const BAR_Y = Number(params['BarY'] || 17);
    const SLIDER_Y = Number(params['SliderBaseY'] || 12);
    const ICON_X = Number(params['MuteX'] || 1670);
    const ICON_Y = Number(params['MuteY'] || 12);
    const NORMAL_ICON = params['NormalIconName'] || 'mute';
    const MUTE_ICON = params['MuteIconName'] || 'mute2';

    // 重要：つまみの開始位置は常に「バーのX座標 - 5px」にする
    // これにより、BarXを変えれば自動的にここも変わる
    const getSliderStartX = () => BAR_X - 5;
    const BAR_WIDTH = 200;

    if (window._currentMadamisVolume === undefined) {
        window._currentMadamisVolume = Number(params['DefaultVolume'] || 30);
        window._isMadamisMuted = false;
    }

    const applyVolume = () => {
        // 数値の計算（BGM用）
        const vol = window._isMadamisMuted ? 0 : (window._currentMadamisVolume || 0);
        const gain = (Number(vol) / 100).clamp(0, 1);

        if (typeof WebAudio !== 'undefined') {
            WebAudio.setMasterVolume(gain);
        }
        if (Video._element) {
            const ve = Video._element;
            // playイベント時に、現在のボリューム変数の値を自動で反映させる
            // 既に登録済みなら無視されるので、一度だけ登録される
            if (!ve._hooked) {
                ve.addEventListener('play', () => {
                    ve.volume = (window._currentMadamisVolume / 100).clamp(0, 1);
                });
                ve._hooked = true;
            }
            // 今、動いているものに対しても反映
            ve.volume = gain;
        }
    };

    class Sprite_MadamisVolume extends Sprite {
        constructor() {
            super();
            this.createSprites();
            this.z = 100;
            this._isDragging = false;
        }

        createSprites() {
            this._muteButton = new Sprite();
            this._muteButton.x = ICON_X;
            this._muteButton.y = ICON_Y;
            this.addChild(this._muteButton);

            this._bar = new Sprite(ImageManager.loadPicture('VolumeBar'));
            this._bar.x = BAR_X;
            this._bar.y = BAR_Y;
            this._bar.opacity = 128;
            this.addChild(this._bar);

            this._slider = new Sprite(ImageManager.loadPicture('VolumeSilder'));
            this._slider.y = SLIDER_Y;
            this.addChild(this._slider);
            
            this.refreshSliderPosition();
        }

        update() {
            super.update();
            this.updateMuteIcon();
            this.processTouch();
        }

        refreshSliderPosition() {
            // 自動計算された開始地点を基準にする
            this._slider.x = (window._currentMadamisVolume * 2) + getSliderStartX();
        }

        updateMuteIcon() {
            const name = window._isMadamisMuted ? MUTE_ICON : NORMAL_ICON;
            const bitmap = ImageManager.loadBitmap('img/icon/', name);
            if (this._muteButton.bitmap !== bitmap) this._muteButton.bitmap = bitmap;
        }

        processTouch() {
            const tx = TouchInput.x;
            const ty = TouchInput.y;
            const startX = getSliderStartX();

            if (Einput_l_trig()) {
                // ミュート判定
                if (tx >= ICON_X && tx <= ICON_X + 24 && ty >= ICON_Y && ty <= ICON_Y + 24) {
                    window._isMadamisMuted = !window._isMadamisMuted;
                    applyVolume();
                    this._isDragging = false;
                    return;
                }
                
                // スライダー判定：BarXを基準に「バーの見た目」の範囲内か厳密に判定
                if (tx >= startX && tx <= startX + BAR_WIDTH && ty >= BAR_Y - 10 && ty <= BAR_Y + 15) {
                    this._isDragging = true;
                } else {
                    this._isDragging = false;
                }
            }

            if (Einput_l_rel()) {
                this._isDragging = false;
            }

            if (this._isDragging && TouchInput.isPressed()) {
                // 座標から音量を逆算（ここも連動）
                const newVol = Math.floor((tx - startX) / 2).clamp(0, 100);
                if (window._currentMadamisVolume !== newVol) {
                    window._currentMadamisVolume = newVol;
                    this.refreshSliderPosition();
                    applyVolume();
                }
            }
        }
    }

    const _Scene_Base_start = Scene_Base.prototype.start;
    Scene_Base.prototype.start = function() {
        _Scene_Base_start.call(this);
        if (this instanceof Scene_Title || this instanceof Scene_Map || this instanceof Scene_Menu) {
            if (this._volumeUI) {
                this.removeChild(this._volumeUI);
                this._volumeUI.destroy();
            }
            this._volumeUI = new Sprite_MadamisVolume();
            this.addChild(this._volumeUI);
            applyVolume();
        }
    };

    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        if (this._volumeUI && !this._volumeUI.parent) this.addChild(this._volumeUI);
    };
})();
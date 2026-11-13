/*:
 * @target MZ
 * @plugindesc PCキャラクター選択画面をプラグインコマンドで表示します。
 * @author Shadowgenic & Google Gemini
 *
 * @param totalPlayers
 * @text 参加人数
 * @desc GMを含む、選択画面に表示するキャラクター数と通常の開始人数です。FirebaseSyncの入室上限とは別の設定です。
 * @type number
 * @min 1
 * @default 6
 *
 * @param startUnselected
 * @text 全員未選択で開始
 * @desc ONのとき、部屋の作成者を含む全員がキャラクター未選択で選択画面を開きます。OFFでは作成者のGMキャラクターを初期選択します。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @param allowGmChange
 * @text GM変更許可
 * @desc ONのとき、GMキャラクターを選択中の人も空いている他のキャラクターへ変更できます。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @param allowEarlyStartSwitchId
 * @text 人数不足時の開始許可
 * @desc ONのとき、人数が揃っていなくても開始ボタンを押せます。(テストプレイ時true推奨、開発完了後false推奨)
 * @type boolean
 * @on ON
 * @off OFF
 * @default true
 *
 * @param autoStartWhenReady
 * @text 全員選択時の自動開始
 * @desc ONのとき、全員の選択が揃うと開始ボタンを押さずに選択画面を閉じます。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @param backgroundImage
 * @text 背景画像
 * @desc キャラクター選択画面の背景に表示する画像です。未設定の場合は半透明の黒背景を使用します。
 * @type file
 * @dir img/pictures
 * @default
 *
 * @param pcImages
 * @text PC画像
 * @desc PC1から順番に表示する画像です。GMもPCの一つとして、GMの番号に対応する画像を設定します。設定しない場合は顔グラフィックを使用します。
 * @type file[]
 * @dir img/pictures
 * @default []
 *
 * @param isSingleFace
 * @text 1ファイル1キャラ設定
 * @desc 顔グラフィックを使用する場合に画像を4x2分割せず、1画像全体を1キャラクターとして表示します。
 * @type boolean
 * @on ON
 * @off OFF
 * @default false
 *
 * @param cursorImage
 * @text 選択カーソル画像
 * @desc 自分が選択したキャラクターの右下に表示するカーソル画像です。
 * @type file
 * @dir img/pictures
 * @default
 *
 * @param cursorOffsetX
 * @text 選択カーソルXオフセット
 * @desc 選択カーソルの右下基準位置からのX座標のずれをピクセル単位で指定します。
 * @type number
 * @min -1920
 * @default 0
 *
 * @param cursorOffsetY
 * @text 選択カーソルYオフセット
 * @desc 選択カーソルの右下基準位置からのY座標のずれをピクセル単位で指定します。
 * @type number
 * @min -1080
 * @default 0
 *
 * @param imageWidth
 * @text 画像表示幅
 * @desc キャラクター画像を表示する幅をピクセル単位で指定します。
 * @type number
 * @min 1
 * @default 200
 *
 * @param imageHeight
 * @text 画像表示高さ
 * @desc キャラクター画像を表示する高さをピクセル単位で指定します。
 * @type number
 * @min 1
 * @default 140
 *
 * @param columns
 * @text 横方向の列数
 * @desc キャラクター画像を横に何枚並べてから次の行へ送るかを指定します。
 * @type number
 * @min 1
 * @default 6
 *
 * @param firstX
 * @text 最初の画像X
 * @desc 左上に配置する最初の画像のX座標をピクセル単位で指定します。
 * @type number
 * @default 100
 *
 * @param firstY
 * @text 最初の画像Y
 * @desc 左上に配置する最初の画像のY座標をピクセル単位で指定します。
 * @type number
 * @default 180
 *
 * @param spacingX
 * @text 画像間の横余白
 * @desc 同じ行に並ぶ画像同士の横方向の間隔をピクセル単位で指定します。
 * @type number
 * @default 40
 *
 * @param spacingY
 * @text 画像間の縦余白
 * @desc 行と行の間の縦方向の間隔をピクセル単位で指定します。
 * @type number
 * @default 80
 *
 * @param nameOffsetX
 * @text 名前Xオフセット
 * @desc キャラクター名の基準位置からのX座標のずれをピクセル単位で指定します。
 * @type number
 * @min -1920
 * @default 0
 *
 * @param nameOffsetY
 * @text 名前Yオフセット
 * @desc キャラクター名の基準位置からのY座標のずれをピクセル単位で指定します。
 * @type number
 * @min -1080
 * @default 0
 *
 * @param nameAlign
 * @text 名前の揃え
 * @desc キャラクター名の表示位置の揃えを選択します。
 * @type select
 * @option 中央揃え
 * @value center
 * @option 左詰め
 * @value left
 * @default center
 *
 * @param textLine1
 * @text 1行目の表示項目
 * @desc 1行目に表示するキャラクター情報を選択します。
 * @type select
 * @option なし
 * @value none
 * @option 名前
 * @value name
 * @option 二つ名
 * @value nickname
 * @option 職業
 * @value class
 * @default name
 *
 * @param textLine2
 * @text 2行目の表示項目
 * @desc 2行目に表示するキャラクター情報を選択します。
 * @type select
 * @option なし
 * @value none
 * @option 名前
 * @value name
 * @option 二つ名
 * @value nickname
 * @option 職業
 * @value class
 * @default none
 *
 * @param textLine3
 * @text 3行目の表示項目
 * @desc 3行目に表示するキャラクター情報を選択します。
 * @type select
 * @option なし
 * @value none
 * @option 名前
 * @value name
 * @option 二つ名
 * @value nickname
 * @option 職業
 * @value class
 * @default none
 *
 * @param nextButtonImage
 * @text 開始ボタン画像
 * @desc 選択画面の開始ボタンに使用する画像です。img/pictures/から読み込みます。
 * @type file
 * @dir img/pictures
 * @default Button/NEXT_anim_01
 *
 * @param nextButtonX
 * @text 開始ボタンX
 * @desc 開始ボタンの左端のX座標をピクセル単位で指定します。
 * @type number
 * @default 1600
 *
 * @param nextButtonY
 * @text 開始ボタンY
 * @desc 開始ボタンの上端のY座標をピクセル単位で指定します。
 * @type number
 * @default 900
 *
 * @param nextButtonWidth
 * @text 開始ボタン幅
 * @desc 開始ボタンを表示する幅をピクセル単位で指定します。
 * @type number
 * @default 260
 *
 * @param nextButtonHeight
 * @text 開始ボタン高さ
 * @desc 開始ボタンを表示する高さをピクセル単位で指定します。
 * @type number
 * @default 100
 *
 * @param roomIdX
 * @text RoomID表示X
 * @desc RoomIDを表示する左端のX座標をピクセル単位で指定します。
 * @type number
 * @default 80
 *
 * @param roomIdY
 * @text RoomID表示Y
 * @desc RoomIDを表示する上端のY座標をピクセル単位で指定します。
 * @type number
 * @default 40
 *
 * @param completionCommonEventId
 * @text 全員選択後のコモンイベント
 * @desc 開始ボタンで選択画面を閉じた後に自動予約します。0で無効です。
 * @type common_event
 * @default 0
 *
 * @param completionSwitchId
 * @text 全員選択後にONにするスイッチ
 * @desc 選択画面の完了時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @command open
 * @text キャラクター選択処理の実行
 * @desc キャラクター選択画面を表示します。呼び出し元を含むイベント処理は停止しません。
 *
 * @help
 * 【使い方】PC数・画像・選択ルールをパラメータで設定し、開始イベントから「キャラクター選択画面を開く」を実行します。
 * 選択画面のPC数は本プラグインの「参加人数」を使用します。GMも1人として数えます。
 * 入室者がこの人数以上いる場合、PCを選ばなかった参加者は観戦者として進行に参加します。
 * 選択したPC番号はFirebaseSyncの「PC番号変数」（pcIdVar）へ保存されます。
 * FirebaseSync.jsと併用すると、PCごとの選択状態をルーム内で共有します。
 * FirebaseSyncの「GM初期PC番号」に対応するキャラクターをGMキャラクターとして扱います。
 * 「全員未選択で開始」がONなら、ルーム作成者もキャラクターを初期選択しません。
 * OFFなら、ルーム作成者のGMキャラクターを初期選択します。
 * GMとPCは基本的に同じ選択ルールで処理されます。allowGmChangeがOFFの場合、GMだけはGMキャラクターから変更できません。
 * GMキャラクターを選んだPCがGMとして扱われます。
 * 選択済みのキャラクターは他のPCから選べません。
 * GMとPCで選択方法に違いはありません。
 * GMレス作品では、内部処理の都合上いずれかのキャラクターをGM扱いに設定し、allowEarlyStartSwitchIdをfalseにしてください。
 *
 * 【配置と実行順】
 * ・このコマンドはゲーム開始後の初期マップで実行してください。
 * ・初期マップには、このコマンドを呼び出すイベント以外のイベントを置かないことを推奨します。
 * ・選択画面の背景はマップ側で指定するか、別のイベントなどで表示してください。
 * ・このコマンドを呼び出す前に、Madamis_SyncMapTransfer.jsで移動先を予約してください。
 * ・このコマンドを呼び出してもイベント処理は継続して実行されます。キャラクター選択完了後に実行したいイベントはコモンイベントか別マップに配置、もしくはスイッチなどを条件に実装してください。
 * ・通常は開始ボタンを押すと選択画面を閉じます。autoStartWhenReadyをONにすると、全員の選択が揃った時点で自動的に閉じます。
 * ・このコマンドはイベント処理を待機させず、呼び出し元を含むイベントを継続して実行します。
 * ・キャラクター選択処理の終了後に何らかの方法でMadamis_SyncMapTransfer.jsの完了報告を実行してください。コモンイベントで実行すると簡単です。
 * もちろんこのコマンドを使わずにキャラクター選択を独自に実装してもかまいません。
 */

(() => {
    'use strict';

    const pluginName = 'CharacterSelection';
    const params = PluginManager.parameters(pluginName);
    const pcIdVariableId = firebaseParameter('pcIdVar', 101);
    const totalPlayers = Math.max(1, Number(params.totalPlayers || 6));
    const startUnselected = params.startUnselected === 'true';
    const gmCharacterNumber = Math.max(1, firebaseParameter('defaultGmPcId', 7));
    const gmOnlySwitchId = firebaseParameter('gmOnlySwitchId', 0);
    const allowGmChange = params.allowGmChange === 'true';
    const allowEarlyStartSwitchId = params.allowEarlyStartSwitchId === 'true';
    const autoStartWhenReady = params.autoStartWhenReady === 'true';
    const backgroundImage = params.backgroundImage || '';
    const pcImages = parseArray(params.pcImages);
    const isSingleFace = params.isSingleFace === 'true';
    const cursorImage = params.cursorImage || '';
    const cursorOffsetX = Number(params.cursorOffsetX || 0);
    const cursorOffsetY = Number(params.cursorOffsetY || 0);
    const imageWidth = Math.max(1, Number(params.imageWidth || 200));
    const imageHeight = Math.max(1, Number(params.imageHeight || 140));
    const columns = Math.max(1, Number(params.columns || 6));
    const firstX = Number(params.firstX || 100);
    const firstY = Number(params.firstY || 180);
    const spacingX = Number(params.spacingX || 40);
    const spacingY = Number(params.spacingY || 80);
    const nameOffsetX = Number(params.nameOffsetX || 0);
    const nameOffsetY = Number(params.nameOffsetY || 0);
    const nameAlign = params.nameAlign === 'left' ? 'left' : 'center';
    const textLineTypes = ['textLine1', 'textLine2', 'textLine3'].map(parameterName => {
        const type = params[parameterName] || 'none';
        return ['none', 'name', 'nickname', 'class'].includes(type) ? type : 'none';
    });
    const textDisplayHeight = Math.max(42, 2 + Math.max(0, nameOffsetY) + textLineTypes.reduce((height, type, index) => {
        return type === 'none' ? height : Math.max(height, (index + 1) * 36);
    }, 0));
    const nextButtonImage = params.nextButtonImage || '';
    const nextButtonX = Number(params.nextButtonX || 1600);
    const nextButtonY = Number(params.nextButtonY || 900);
    const nextButtonWidth = Math.max(1, Number(params.nextButtonWidth || 260));
    const nextButtonHeight = Math.max(1, Number(params.nextButtonHeight || 100));
    const roomIdX = Number(params.roomIdX || 80);
    const roomIdY = Number(params.roomIdY || 40);
    const completionCommonEventId = Number(params.completionCommonEventId || 0);
    const completionSwitchId = Number(params.completionSwitchId || 0);

    let selectionScene = null;
    let hasSoloGmAuthority = false;
    let hasFallbackGmAuthority = false;
    let selectionOpenedForCurrentGame = false;

    function parseArray(value) {
        try {
            const parsed = JSON.parse(value || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function firebaseSelectionRef() {
        if (typeof OnlineManager === 'undefined' || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child('pc_data');
    }

    function firebaseMembersRef() {
        if (typeof OnlineManager === 'undefined' || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child('members');
    }

    function firebaseCompletionRef() {
        if (typeof OnlineManager === 'undefined' || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef.child('character_selection');
    }

    function selectionsFromPcData(pcData) {
        return Object.keys(pcData || {}).reduce((selections, pcId) => {
            if (pcData[pcId]?.uid && Number(pcId) > 0) {
                selections[pcId] = Number(pcId);
            }
            return selections;
        }, {});
    }

    function firebaseParameter(name, fallback) {
        const firebaseParams = PluginManager.parameters('FirebaseSync');
        return Number(firebaseParams[name] || fallback);
    }

    function isGm() {
        if (selectionScene && selectionScene.selections) {
            return Number(selectionScene.selections[ownSelectionKey()] || 0) === gmCharacterNumber
                || (isRoomCreator() && !hasGmCharacterSelection(selectionScene.selections));
        }
        return myPcId() === gmCharacterNumber
            || hasFallbackGmAuthority
            || (startUnselected && !selectionOpenedForCurrentGame && isRoomCreator());
    }

    function isRoomCreator() {
        const switchId = firebaseParameter('creatorSwitchId', 101);
        const creatorSwitchOn = !$gameSwitches || $gameSwitches.value(switchId);
        return creatorSwitchOn || (typeof OnlineManager !== 'undefined' && OnlineManager._isCreatorFlag === true);
    }

    function myPcId() {
        return Number($gameVariables.value(pcIdVariableId) || 0);
    }

    function refreshGmOnlySwitch() {
        if (gmOnlySwitchId > 0 && $gameSwitches) {
            $gameSwitches.setValue(gmOnlySwitchId, isGm() || hasSoloGmAuthority, true);
        }
    }

    function ownSelectionKey() {
        return String(myPcId() || 'unknown');
    }

    function availableCharacterNumbers(selections) {
        const used = Object.keys(selections).reduce((result, key) => {
            const value = Number(selections[key]);
            if (value > 0) result.add(value);
            return result;
        }, new Set());
        return used;
    }

    function hasGmCharacterSelection(selections) {
        return Object.values(selections || {}).some(selection => {
            return Number(selection) === gmCharacterNumber;
        });
    }

    function totalReady(selections) {
        const selectedPcIds = Object.keys(selections).filter(key => {
            return Number(selections[key]) > 0;
        });
        return selectedPcIds.length > 0 &&
            (allowEarlyStartSwitchId || selectedPcIds.length >= totalPlayers);
    }

    function selectedMemberCount(members, pcData) {
        const selectedUids = new Set(Object.entries(pcData || {})
            .filter(([pcId, entry]) => Number(pcId) >= 1 && Number(pcId) <= totalPlayers && entry?.uid)
            .map(([, entry]) => entry.uid));
        return Object.keys(members || {}).filter(uid => selectedUids.has(uid)).length;
    }

    function characterEntries() {
        return Array.from({ length: totalPlayers }, (_, index) => {
            const actor = $dataActors[index + 1] || {};
            return {
                number: index + 1,
                image: pcImages[index] || '',
                faceName: actor.faceName || '',
                faceIndex: Number(actor.faceIndex || 0),
                name: actor.name || `PC ${index + 1}`,
                nickname: actor.nickname || '',
                className: $dataClasses[actor.classId]?.name || ''
            };
        });
    }

    function characterText(entry, type) {
        if (type === 'name') return entry.name;
        if (type === 'nickname') return entry.nickname;
        if (type === 'class') return entry.className;
        return '';
    }

    function addSelectionLayer(scene, layer) {
        scene.addChild(layer);
        if (scene._tabGroup) {
            scene.setChildIndex(layer, scene.getChildIndex(scene._tabGroup));
        }
    }

    class CharacterSelectionLayer extends Sprite {
        constructor() {
            super();
            this.selections = {};
            this._sprites = [];
            this._selectionRequestId = 0;
            this._lastSelectionText = '';
            this._creatorSelectionInitialized = false;
            this.pcData = {};
            this.members = {};
            this._ref = firebaseSelectionRef();
            this._membersRef = firebaseMembersRef();
            this._completionRef = firebaseCompletionRef();
            if (myPcId() > 0) {
                this.selections[ownSelectionKey()] = myPcId();
            }
            this.createBackground();
            this.createCharacters();
            this.createNextButton();
            this.createRoomId();
            this.refreshFromRemote();
            if (this._ref) {
                this._listener = snapshot => {
                    this.pcData = snapshot.val() || {};
                    this.selections = selectionsFromPcData(this.pcData);
                    this.refreshCharacters();
                    this.refreshNextButton();
                    this.tryAutoFinish();
                };
                this._ref.on('value', this._listener);
            }
            if (this._membersRef) {
                this._membersListener = snapshot => {
                    this.members = snapshot.val() || {};
                    this.refreshNextButton();
                    this.tryAutoFinish();
                };
                this._membersRef.on('value', this._membersListener);
            }
            if (this._completionRef) {
                this._completionListener = snapshot => {
                    if (!snapshot.val()?.completedAt) return;
                    this.close();
                    this.complete();
                };
                this._completionRef.on('value', this._completionListener);
            }
        }

        createBackground() {
            this._background = backgroundImage
                ? new Sprite(ImageManager.loadPicture(backgroundImage))
                : new Sprite(new Bitmap(Graphics.width, Graphics.height));
            if (!backgroundImage) {
                this._background.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, 'rgba(0, 0, 0, 0.9)');
            }
            this.addChild(this._background);
        }

        createCharacters() {
            characterEntries().forEach((entry, index) => {
                const sprite = new Sprite_Clickable();
                sprite.x = firstX + (index % columns) * (imageWidth + spacingX);
                sprite.y = firstY + Math.floor(index / columns) * (imageHeight + spacingY);
                sprite.bitmap = new Bitmap(imageWidth, imageHeight + textDisplayHeight);
                sprite._entry = entry;
                sprite._selectionCursor = new Sprite();
                sprite._selectionCursor.bitmap = cursorImage
                    ? ImageManager.loadPicture(cursorImage)
                    : null;
                sprite._selectionCursor.visible = false;
                sprite.addChild(sprite._selectionCursor);
                sprite.onClick = () => this.selectCharacter(entry.number);
                this.addChild(sprite);
                this._sprites.push(sprite);
                if (sprite._selectionCursor.bitmap) {
                    sprite._selectionCursor.bitmap.addLoadListener(() => this.positionCursor(sprite));
                }
            });
        }

        positionCursor(sprite) {
            const cursor = sprite._selectionCursor;
            if (!cursor || !cursor.bitmap) return;
            cursor.x = imageWidth - cursor.bitmap.width + cursorOffsetX;
            cursor.y = imageHeight - cursor.bitmap.height + cursorOffsetY;
        }

        createNextButton() {
            this._nextButton = new Sprite_Clickable();
            this._nextButton.x = nextButtonX;
            this._nextButton.y = nextButtonY;
            this._nextButton.bitmap = ImageManager.loadPicture(nextButtonImage);
            this._nextButton.onClick = () => this.finish();
            this.addChild(this._nextButton);
        }

        createRoomId() {
            this._roomId = new Sprite(new Bitmap(Graphics.width, 48));
            this._roomId.x = roomIdX;
            this._roomId.y = roomIdY;
            this._roomId.bitmap.fontSize = 28;
            this._roomId.bitmap.textColor = '#FFFFFF';
            this._roomId.bitmap.outlineColor = '#000000';
            this._roomId.bitmap.outlineWidth = 4;
            this.addChild(this._roomId);
            this.refreshRoomId();
        }

        refreshRoomId() {
            if (!this._roomId) return;
            const roomIdVariableId = firebaseParameter('roomIdVariable', 118);
            const roomId = String($gameVariables.value(roomIdVariableId) || '').replace(/,/g, '');
            this._roomId.bitmap.clear();
            this._roomId.bitmap.drawText(`RoomID: ${roomId}`, 0, 0, Graphics.width, 42, 'left');
        }

        refreshFromRemote() {
            if (this._ref) {
                this._ref.once('value').then(snapshot => {
                    this.pcData = snapshot.val() || {};
                    this.selections = selectionsFromPcData(this.pcData);
                    this.refreshCharacters();
                    this.refreshNextButton();
                    this.tryAutoFinish();
                });
            } else {
                this.selections = {};
                if (myPcId() > 0) this.selections[ownSelectionKey()] = myPcId();
                this.refreshCharacters();
                this.refreshNextButton();
                this.tryAutoFinish();
            }
        }

        canStart() {
            if (!this._membersRef) {
                return isGm() && totalReady(this.selections);
            }
            const memberCount = Object.keys(this.members).length;
            const selectedCount = selectedMemberCount(this.members, this.pcData);
            const enoughPlayers = allowEarlyStartSwitchId
                ? selectedCount > 0
                : selectedCount >= totalPlayers;
            const unselectedAreSpectators = memberCount >= totalPlayers || selectedCount === memberCount;
            const isSoloMember = memberCount === 1;
            return (isGm() || isSoloMember) && enoughPlayers &&
                (allowEarlyStartSwitchId || unselectedAreSpectators);
        }

        allCharactersSelected() {
            const selectedPcIds = Object.keys(this.selections).filter(key => {
                const pcId = Number(key);
                return pcId >= 1 && pcId <= totalPlayers && Number(this.selections[key]) > 0;
            });
            return selectedPcIds.length >= totalPlayers;
        }

        refreshCharacters() {
            const used = availableCharacterNumbers(this.selections);
            const ownKey = ownSelectionKey();
            this._sprites.forEach(sprite => {
                const entry = sprite._entry;
                const selectedBy = Object.keys(this.selections).find(key => Number(this.selections[key]) === entry.number);
                const isOwn = selectedBy === ownKey;
                const isSelected = !!selectedBy;
                sprite.bitmap.clear();
                if (entry.image) {
                    const bitmap = ImageManager.loadPicture(entry.image);
                    if (bitmap.isReady()) {
                        sprite.bitmap.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, imageWidth, imageHeight);
                    } else {
                        bitmap.addLoadListener(() => this.refreshCharacters());
                    }
                } else if (entry.faceName) {
                    const bitmap = ImageManager.loadFace(entry.faceName);
                    if (bitmap.isReady()) {
                        const faceWidth = isSingleFace ? bitmap.width : ImageManager.faceWidth;
                        const faceHeight = isSingleFace ? bitmap.height : ImageManager.faceHeight;
                        const sourceX = isSingleFace ? 0 : (entry.faceIndex % 4) * faceWidth;
                        const sourceY = isSingleFace ? 0 : Math.floor(entry.faceIndex / 4) * faceHeight;
                        sprite.bitmap.blt(bitmap, sourceX, sourceY, faceWidth, faceHeight, 0, 0, imageWidth, imageHeight);
                    } else {
                        bitmap.addLoadListener(() => this.refreshCharacters());
                    }
                }
                if (isSelected && !isOwn) {
                    sprite.bitmap.fillRect(0, 0, imageWidth, imageHeight, 'rgba(0, 0, 0, 0.55)');
                }
                if (isSelected && isOwn) {
                    const borderSize = 6;
                    const borderColor = 'rgba(70, 220, 110, 0.95)';
                    sprite.bitmap.fillRect(0, 0, imageWidth, borderSize, borderColor);
                    sprite.bitmap.fillRect(0, imageHeight - borderSize, imageWidth, borderSize, borderColor);
                    sprite.bitmap.fillRect(0, 0, borderSize, imageHeight, borderColor);
                    sprite.bitmap.fillRect(imageWidth - borderSize, 0, borderSize, imageHeight, borderColor);
                }
                sprite.bitmap.fontSize = 24;
                sprite.bitmap.textColor = '#FFFFFF';
                sprite.bitmap.outlineColor = '#000000';
                sprite.bitmap.outlineWidth = 4;
                textLineTypes.forEach((type, lineIndex) => {
                    const text = characterText(entry, type);
                    if (text) {
                        sprite.bitmap.drawText(text, nameOffsetX, imageHeight + 2 + nameOffsetY + lineIndex * 36, imageWidth, 36, nameAlign);
                    }
                });
                if (isSelected) sprite.bitmap.drawText('SELECTED', 0, 8, imageWidth, 32, 'center');
                if (sprite._selectionCursor) {
                    this.positionCursor(sprite);
                    sprite._selectionCursor.visible = isOwn && isSelected && !!cursorImage;
                }
                sprite.visible = true;
                sprite._canSelect = !selectedBy || isOwn;
            });
        }

        refreshNextButton() {
            if (!this._nextButton || !this._nextButton.transform || !this._nextButton.bitmap) return;
            const canStart = this.canStart();
            this._nextButton.visible = canStart;
            this._nextButton.opacity = canStart ? 255 : 100;
            this._nextButton.scale.x = nextButtonWidth / Math.max(1, this._nextButton.bitmap.width || nextButtonWidth);
            this._nextButton.scale.y = nextButtonHeight / Math.max(1, this._nextButton.bitmap.height || nextButtonHeight);
        }

        selectCharacter(number) {
            const sprite = this._sprites.find(item => item._entry.number === number);
            if (!sprite || !sprite._canSelect) return;
            if (Number(this.selections[ownSelectionKey()] || 0) === gmCharacterNumber
                && !allowGmChange && number !== gmCharacterNumber) return;
            const ownKey = ownSelectionKey();
            const used = availableCharacterNumbers(this.selections);
            const oldNumber = Number(this.selections[ownKey] || 0);
            if (used.has(number) && oldNumber !== number) return;
            if (!this._ref) {
                this.selections[ownKey] = number;
                $gameVariables.setValue(pcIdVariableId, number);
                this.refreshCharacters();
                this.refreshNextButton();
                this.tryAutoFinish();
                return;
            }

            const requestId = ++this._selectionRequestId;
            const userUidVarId = firebaseParameter('userUidVar', 102);
            const userUid = String($gameVariables.value(userUidVarId) || '');
            const canClaimSlot = typeof OnlineManager !== 'undefined'
                && OnlineManager.roomRef
                && OnlineManager.claimPcSlot
                && userUid;
            if (!canClaimSlot) {
                console.warn('CharacterSelection: PC番号を確認できません。Firebase接続を確認してください。');
                return;
            }

            const claim = ownKey === String(number)
                ? Promise.resolve(true)
                : OnlineManager.claimPcSlot(number, null, userUid);
            claim.then(claimed => {
                if (requestId !== this._selectionRequestId || !claimed) return;
                $gameVariables.setValue(pcIdVariableId, number);
                if (Number(ownKey) > 0 && ownKey !== String(number)) {
                    OnlineManager.roomRef.child(`pc_data/${ownKey}`).remove();
                }
                this.selections = Object.assign({}, this.selections);
                if (ownKey !== String(number)) delete this.selections[ownKey];
                this.selections[String(number)] = number;
                this.refreshCharacters();
                this.refreshNextButton();
                this.tryAutoFinish();
            }).catch(error => {
                console.warn('CharacterSelection: PC番号の確保に失敗しました。', error);
            });
        }

        complete() {
            if (this._completionHandled) return;
            this._completionHandled = true;
            hasSoloGmAuthority = Object.keys(this.members).length === 1;
            hasFallbackGmAuthority = isRoomCreator() && !hasGmCharacterSelection(this.selections);
            refreshGmOnlySwitch();
            if (completionSwitchId > 0) $gameSwitches.setValue(completionSwitchId, true);
            if (completionCommonEventId > 0) $gameTemp.reserveCommonEvent(completionCommonEventId);
        }

        tryAutoFinish() {
            if (autoStartWhenReady && this.allCharactersSelected()) {
                this.finish();
            }
        }

        finish() {
            const canStart = this.canStart();
            if (!canStart) return;
            if (this._completionRef) {
                this._completionRef.set({
                    completedAt: Date.now(),
                    startedBy: myPcId()
                }).catch(error => {
                    console.warn('CharacterSelection: 開始通知の送信に失敗しました。', error);
                });
            } else {
                this.close();
                this.complete();
            }
        }

        close() {
            if (this._ref && this._listener) this._ref.off('value', this._listener);
            if (this._membersRef && this._membersListener) this._membersRef.off('value', this._membersListener);
            if (this._completionRef && this._completionListener) {
                this._completionRef.off('value', this._completionListener);
            }
            this.parent?.removeChild(this);
            if (selectionScene === this) selectionScene = null;
        }
    }

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        refreshGmOnlySwitch();
        if (selectionScene && (selectionScene.parent !== this || !selectionScene.transform)) {
            selectionScene.close();
            selectionScene = new CharacterSelectionLayer();
            addSelectionLayer(this, selectionScene);
        }
        const layer = selectionScene;
        if (layer) {
            layer.refreshNextButton();
            if (selectionScene === layer) layer.refreshRoomId();
        }
    };

    const _DataManager_setupNewGame_CharacterSelection = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        selectionOpenedForCurrentGame = false;
        hasSoloGmAuthority = false;
        hasFallbackGmAuthority = false;
        if (selectionScene) selectionScene.close();
        _DataManager_setupNewGame_CharacterSelection.call(this);
        if (startUnselected && isRoomCreator()) {
            $gameVariables.setValue(pcIdVariableId, 0);
        }
    };

    PluginManager.registerCommand(pluginName, 'open', function() {
        if (selectionScene) return;
        selectionOpenedForCurrentGame = true;
        hasSoloGmAuthority = false;
        hasFallbackGmAuthority = false;
        if (typeof OnlineManager !== 'undefined' && OnlineManager.roomRef) {
            OnlineManager.roomRef.child('character_selection').remove();
        }
        if (isRoomCreator() && !startUnselected) {
            const previousPcId = myPcId();
            if (previousPcId !== gmCharacterNumber) {
                $gameVariables.setValue(pcIdVariableId, gmCharacterNumber);
                if (typeof OnlineManager !== 'undefined' && OnlineManager.roomRef && previousPcId > 0) {
                    OnlineManager.roomRef.child(`pc_data/${previousPcId}`).remove();
                }
            }
            refreshGmOnlySwitch();
        }
        selectionScene = new CharacterSelectionLayer();
        addSelectionLayer(SceneManager._scene, selectionScene);
        refreshGmOnlySwitch();
    });
})();

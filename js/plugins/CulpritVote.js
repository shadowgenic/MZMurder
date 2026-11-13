/*:
 * @target MZ
 * @plugindesc PC全員による犯人投票をFirebaseで同期します。
 * @author Shadowgenic & GitHub Copilot
 *
 * @param openInTab
 * @text 投票画面をタブで開く
 * @desc ONなら投票画面を専用タブで開き、メインタブに戻って情報を確認できます。
 * @type boolean
 * @default false
 *
 * @param tabName
 * @text 投票タブ名
 * @desc 投票画面をタブで開く場合の表示名です。
 * @default 犯人投票
 *
 * @param pcImages
 * @text PC画像
 * @desc PC1から順番に表示する画像です。空欄の場合はアクターの顔グラフィックを使用します。
 * @type file[]
 * @dir img/pictures
 * @default []
 *
 * @param isSingleFace
 * @text 1ファイル1キャラ設定
 * @desc 顔グラフィックを4x2分割せず、画像全体を1キャラクターとして表示します。
 * @type boolean
 * @default true
 *
 * @param cursorImage
 * @text 選択カーソル画像
 * @desc 自分が投票したPCの右下に表示する画像です。
 * @type file
 * @dir img/pictures
 * @default
 *
 * @param cursorOffsetX
 * @text 選択カーソルXオフセット
 * @type number
 * @min -1920
 * @default 0
 *
 * @param cursorOffsetY
 * @text 選択カーソルYオフセット
 * @type number
 * @min -1080
 * @default 0
 *
 * @param imageWidth
 * @text 画像表示幅
 * @type number
 * @min 1
 * @default 256
 *
 * @param imageHeight
 * @text 画像表示高さ
 * @type number
 * @min 1
 * @default 256
 *
 * @param columns
 * @text 横方向の列数
 * @type number
 * @min 1
 * @default 6
 *
 * @param firstX
 * @text 最初の画像X
 * @type number
 * @default 100
 *
 * @param firstY
 * @text 最初の画像Y
 * @type number
 * @default 180
 *
 * @param spacingX
 * @text 画像間の横余白
 * @type number
 * @default 40
 *
 * @param spacingY
 * @text 画像間の縦余白
 * @type number
 * @default 80
 *
 * @command open
 * @text 犯人投票を開始
 * @desc 全PCが投票するまで閉じない投票画面を開きます。ルーム作成者が前回の投票を消去します。
 *
 * @arg characterCount
 * @text 投票対象キャラクター数
 * @desc アクター1からこの数までを候補として扱います。0ならデータベース上の全アクターを候補にします。
 * @type number
 * @min 0
 * @default 0
 *
 * @arg backgroundImage
 * @text 投票画面の背景画像
 * @desc この投票画面の背景に表示する画像です。未指定なら黒背景を表示します。
 * @type file
 * @dir img/pictures
 * @default
 *
 * @arg includeGmAsTarget
 * @text GMを投票先に含める
 * @desc ONならGMも投票候補に含めます。OFFなら候補から除外します。
 * @type boolean
 * @default false
 *
 * @arg onlyActivePcsAsTargets
 * @text プレイ中のPCのみ対象とする
 * @desc ONなら現在membersにいるPCだけを投票候補にします。OFFなら未参加PCを含めます。
 * @type boolean
 * @default false
 *
 * @arg allowSelfVote
 * @text 自分のPCへの投票を許可
 * @desc ONなら自分のPCを投票先に選べます。OFFなら選べません。
 * @type boolean
 * @default true
 *
 * @arg allowGmVote
 * @text GMにも投票権を与える
 * @desc ONならGMも投票できます。OFFならGMを投票完了の対象から除外します。
 * @type boolean
 * @default false
 *
 * @arg weightedVoterPcId
 * @text 1.5票にする投票者PC番号
 * @desc このPCが投じた票を1.5票として集計します。0で無効です。
 * @type number
 * @min 0
 * @default 0
 *
 * @arg weightedVoterPcVariableId
 * @text 1.5票にする投票者PC番号の変数
 * @desc この変数のPC番号が投じた票を1.5票として集計します。0で無効。固定指定と併用できます。
 * @type variable
 * @default 0
 *
 * @arg completionCommonEventId
 * @text 全員投票後のコモンイベント
 * @desc 全員の投票が揃い、投票画面が閉じた後に自動予約します。0で無効です。
 * @type common_event
 * @default 0
 *
 * @arg completionSwitchId
 * @text 全員投票後にONにするスイッチ
 * @desc 全員の投票が揃った時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @command openForPcsInVariable
 * @text 指定PC配列を投票対象にして犯人投票を開始
 * @desc 指定変数のPC番号配列だけを投票先として表示し、全PCの投票を待ちます。
 *
 * @arg targetPcsVariableId
 * @text 投票対象PC番号配列の変数
 * @desc 例: [1, 3]。この配列に入っているPCだけを投票対象にします。[]なら全PCが対象です。
 * @type variable
 * @default 0
 *
 * @arg backgroundImage
 * @text 投票画面の背景画像
 * @desc この投票画面の背景に表示する画像です。未指定なら黒背景を表示します。
 * @type file
 * @dir img/pictures
 * @default
 *
 * @arg onlyActivePcsAsTargets
 * @text プレイ中のPCのみ対象とする
 * @desc ONなら配列内のうち、現在membersにいるPCだけを投票候補にします。
 * @type boolean
 * @default false
 *
 * @arg allowSelfVote
 * @text 自分のPCへの投票を許可
 * @desc ONなら自分のPCを投票先に選べます。OFFなら選べません。
 * @type boolean
 * @default true
 *
 * @arg allowGmVote
 * @text GMにも投票権を与える
 * @desc ONならGMも投票できます。OFFならGMを投票完了の対象から除外します。
 * @type boolean
 * @default false
 *
 * @arg weightedVoterPcId
 * @text 1.5票にする投票者PC番号
 * @desc このPCが投じた票を1.5票として集計します。0で無効です。
 * @type number
 * @min 0
 * @default 0
 *
 * @arg weightedVoterPcVariableId
 * @text 1.5票にする投票者PC番号の変数
 * @desc この変数のPC番号が投じた票を1.5票として集計します。0で無効。固定指定と併用できます。
 * @type variable
 * @default 0
 *
 * @arg completionCommonEventId
 * @text 全員投票後のコモンイベント
 * @desc 全員の投票が揃い、投票画面が閉じた後に自動予約します。0で無効です。
 * @type common_event
 * @default 0
 *
 * @arg completionSwitchId
 * @text 全員投票後にONにするスイッチ
 * @desc 全員の投票が揃った時にONにするスイッチです。0で無効です。
 * @type switch
 * @default 0
 *
 * @command getResults
 * @text 投票結果を取得
 * @desc Firebase上の投票を集計して、指定した変数・スイッチへ代入します。
 *
 * @arg mostVotedPcVariableId
 * @text 最多票PC番号の変数
 * @desc 最も票を得たPC番号を代入します。同票の場合は最小のPC番号です。0で無効です。
 * @type variable
 * @default 0
 *
 * @arg highestVoteCountVariableId
 * @text 最多票数の変数
 * @desc 最多票の票数を代入します。0で無効です。
 * @type variable
 * @default 0
 *
 * @arg highestVotePcCountVariableId
 * @text 最多票PC人数の変数
 * @desc 最多票を得たPCの人数を代入します。0で無効です。
 * @type variable
 * @default 0
 *
 * @arg highestVotedPcsVariableId
 * @text 最多票PC番号配列の変数
 * @desc 最多票を得たPC番号の配列を代入します。例: [2, 4]。0で無効です。
 * @type variable
 * @default 0
 *
 * @arg hasTieSwitchId
 * @text 最多票同数スイッチ
 * @desc 最多票のPCが複数ならON、1人だけならOFFにします。0で無効です。
 * @type switch
 * @default 0
 *
 * @command getTargetVoteCount
 * @text 特定PCの得票数を取得
 * @desc 指定したPCの得票数を、指定変数に代入します。
 *
 * @arg targetPcNumber
 * @text 得票数を調べるPC番号
 * @desc 得票数を取得するPC番号です。
 * @type number
 * @min 1
 * @default 1
 *
 * @arg targetVoteCountVariableId
 * @text 得票数の変数
 * @desc 指定PCの得票数を代入します。
 * @type variable
 * @default 0
 *
 * @help
 * 【使い方: 事前準備】
 * FirebaseSync.jsを有効にし、参加者全員が同じオンラインルームへ入室した状態で使用します。
 * PC画像を使う場合は「PC画像」にPC1から順番に画像を指定します。未指定時はアクターの顔グラフィックを表示します。
 *
 * 【投票の開始】
 * イベントから「犯人投票を開始」を実行します。候補をPC番号の配列で限定する場合は、
 * 「指定PC配列を投票対象にして犯人投票を開始」を使い、例として [1, 3] を変数に入れます。
 * 自己投票、GMの投票権、参加中PCだけを候補にするかは、各コマンドの項目で設定します。
 *
 * 【投票の完了と結果】
 * 各参加者が候補を選ぶと投票内容が同期され、全員の投票が揃って3秒間変更がなければ画面が自動的に閉じます。
 * 完了時にONにするスイッチ、または予約するコモンイベントを開始コマンドで指定できます。
 * 続けて「投票結果を取得」を実行すると、最多票PC、得票数、同票の有無を指定した変数・スイッチへ代入します。
 * 特定のPCの得票数だけが必要な場合は「特定PCの得票数を取得」を使用します。
 *  
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 */

(() => {
    'use strict';

    const pluginName = 'CulpritVote';
    const params = PluginManager.parameters(pluginName);
    const openInTab = params.openInTab === 'true';
    const tabName = params.tabName || '犯人投票';
    const pcImages = parseArray(params.pcImages);
    const isSingleFace = params.isSingleFace === 'true';
    const cursorImage = params.cursorImage || '';
    const cursorOffsetX = Number(params.cursorOffsetX || 0);
    const cursorOffsetY = Number(params.cursorOffsetY || 0);
    const imageWidth = Math.max(1, Number(params.imageWidth || 256));
    const imageHeight = Math.max(1, Number(params.imageHeight || 256));
    const columns = Math.max(1, Number(params.columns || 6));
    const firstX = Number(params.firstX || 100);
    const firstY = Number(params.firstY || 180);
    const spacingX = Number(params.spacingX || 40);
    const spacingY = Number(params.spacingY || 80);
    let voteLayer = null;

    function parseArray(value) {
        try {
            const parsed = JSON.parse(value || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function firebaseParameter(name, fallback) {
        const firebaseParams = PluginManager.parameters('FirebaseSync');
        return Number(firebaseParams[name] || fallback);
    }

    function myPcId() {
        return Number($gameVariables.value(firebaseParameter('pcIdVar', 101)) || 0);
    }

    function roomRef() {
        if (typeof OnlineManager === 'undefined' || !OnlineManager.roomRef) return null;
        return OnlineManager.roomRef;
    }

    function isRoomCreator() {
        const switchId = firebaseParameter('creatorSwitchId', 101);
        return $gameSwitches.value(switchId)
            || (typeof OnlineManager !== 'undefined' && OnlineManager._isCreatorFlag === true);
    }

    function participantPcIds(room) {
        const memberUids = new Set(Object.keys(room?.members || {}));
        return Object.entries(room?.pc_data || {}).reduce((pcIds, [pcId, data]) => {
            const number = Number(pcId);
            if (number > 0 && data?.uid && memberUids.has(data.uid)) pcIds.push(number);
            return pcIds;
        }, []).sort((left, right) => left - right);
    }

    function allActorIds() {
        return Array.from({ length: Math.max(0, $dataActors.length - 1) }, (_, index) => index + 1)
            .filter(actorId => !!$dataActors[actorId]);
    }

    function voteTargetIds(candidateIds, participants, settings) {
        let targets = candidateIds.length > 0 ? candidateIds : allActorIds();
        if (settings.onlyActivePcsAsTargets) {
            targets = targets.filter(pcId => participants.includes(pcId));
        }
        if (!settings.includeGmAsTarget) {
            const gmPcId = firebaseParameter('defaultGmPcId', 7);
            targets = targets.filter(pcId => pcId !== gmPcId);
        }
        return targets;
    }

    function votingPcIds(participants, settings) {
        const gmPcId = firebaseParameter('defaultGmPcId', 7);
        if (settings.allowGmVote || (participants.length === 1 && participants[0] === gmPcId)) {
            return participants;
        }
        return participants.filter(pcId => pcId !== gmPcId);
    }

    function weightedVoterPcNumbers(settings) {
        const pcIds = [settings.weightedVoterPcId];
        if (settings.weightedVoterPcVariableId > 0) {
            pcIds.push(Number($gameVariables.value(settings.weightedVoterPcVariableId)) || 0);
        }
        return new Set(pcIds.filter(pcId => pcId > 0));
    }

    function voteSettings() {
        return $gameSystem._culpritVoteSettings || {
            allowGmVote: false,
            weightedVoterPcId: 0,
            weightedVoterPcVariableId: 0,
            includeGmAsTarget: true,
            onlyActivePcsAsTargets: false,
            allowSelfVote: true,
            backgroundImage: '',
            candidateIds: [],
            completionCommonEventId: 0,
            completionSwitchId: 0
        };
    }

    function validVotes(pcData, participants, voters, targets = participants, settings = voteSettings()) {
        const votes = {};
        Object.keys(pcData || {}).forEach(voterId => {
            const voter = Number(voterId);
            const target = Number(pcData[voterId]?.culpritVote);
            if (voters.includes(voter) && targets.includes(target) &&
                (settings.allowSelfVote !== false || voter !== target)) {
                votes[voter] = target;
            }
        });
        return votes;
    }

    function allPlayersVoted(votes, voters) {
        return voters.length > 0 && voters.every(pcId => Number(votes[pcId]) > 0);
    }

    function characterEntries(participants) {
        return participants.map(number => ({
            number,
            image: pcImages[number - 1] || '',
            faceName: $dataActors[number]?.faceName || '',
            faceIndex: Number($dataActors[number]?.faceIndex || 0),
            label: $dataActors[number]?.name || `PC ${number}`
        }));
    }

    function addVoteLayer(scene, layer) {
        scene.addChild(layer);
        if (scene._tabGroup) scene.setChildIndex(layer, scene.getChildIndex(scene._tabGroup));
    }

    function openVoteTab(scene) {
        if (!openInTab || !scene._tabGroup) return;
        scene.openTab({ id: 'culprit_vote', name: tabName });
        const tab = scene._tabGroup._tabs.find(entry => entry.id === 'culprit_vote');
        if (tab) tab.canClose = false;
        $gameSystem._activeTabId = 'culprit_vote';
        scene._tabGroup.refresh();
    }

    class CulpritVoteLayer extends Sprite {
        constructor(targetPcIds = [], settings = voteSettings()) {
            super();
            this.votes = {};
            this.participants = [];
            this.voters = [];
            this.targetPcIds = targetPcIds;
            this.settings = settings;
            this.targets = [];
            this._sprites = [];
            this._roomRef = roomRef();
            this._completionTimer = null;
            this._completedVoteSignature = null;
            this.createBackground();
            this.visible = !openInTab || $gameSystem._activeTabId === 'culprit_vote';
            if (!this._roomRef) {
                console.warn('CulpritVote: Firebase接続を確認してください。');
                return;
            }
            this._listener = snapshot => {
                const room = snapshot.val() || {};
                this.updateParticipants(participantPcIds(room));
                this.votes = validVotes(room.pc_data, this.participants, this.voters, this.targets, this.settings);
                this.refreshCharacters();
                this.updateCompletionTimer();
            };
            this._roomRef.on('value', this._listener);
        }

        update() {
            const activeTabId = $gameSystem._activeTabId || 'main';
            const voteIsActive = openInTab
                ? activeTabId === 'culprit_vote'
                : activeTabId === 'main';
            if (!voteIsActive) {
                this.visible = false;
                return;
            }
            super.update();
            this.visible = true;
        }

        createBackground() {
            if (this.settings.backgroundImage) {
                this._background = new Sprite(ImageManager.loadPicture(this.settings.backgroundImage));
                this._background.bitmap.addLoadListener(() => {
                    this._background.scale.set(
                        Graphics.width / this._background.bitmap.width,
                        Graphics.height / this._background.bitmap.height
                    );
                });
            } else {
                this._background = new Sprite(new Bitmap(Graphics.width, Graphics.height));
                this._background.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, 'rgba(0, 0, 0, 0.9)');
            }
            this.addChild(this._background);
        }

        updateCompletionTimer() {
            if (!allPlayersVoted(this.votes, this.voters)) {
                this.clearCompletionTimer();
                this._completedVoteSignature = null;
                return;
            }
            const signature = this.voters.map(pcId => `${pcId}:${this.votes[pcId]}`).join('|');
            if (signature === this._completedVoteSignature) return;
            this.clearCompletionTimer();
            this._completedVoteSignature = signature;
            this._completionTimer = setTimeout(() => {
                this._completionTimer = null;
                this.close();
                this.complete();
            }, 3000);
        }

        clearCompletionTimer() {
            if (this._completionTimer !== null) clearTimeout(this._completionTimer);
            this._completionTimer = null;
        }

        updateParticipants(participants) {
            const changed = participants.length !== this.participants.length
                || participants.some((pcId, index) => pcId !== this.participants[index]);
            this.participants = participants;
            this.voters = votingPcIds(participants, this.settings);
            this.targets = voteTargetIds(this.targetPcIds, participants, this.settings);
            if (!changed) return;
            this._sprites.forEach(sprite => this.removeChild(sprite));
            this._sprites = [];
            this.createCharacters();
        }

        displayTargetIds() {
            return this.targets;
        }

        createCharacters() {
            characterEntries(this.displayTargetIds()).forEach((entry, index) => {
                const sprite = new Sprite_Clickable();
                sprite.x = firstX + (index % columns) * (imageWidth + spacingX);
                sprite.y = firstY + Math.floor(index / columns) * (imageHeight + spacingY);
                sprite.bitmap = new Bitmap(imageWidth, imageHeight + 42);
                sprite._entry = entry;
                sprite._cursor = new Sprite(cursorImage ? ImageManager.loadPicture(cursorImage) : null);
                sprite._cursor.visible = false;
                sprite.addChild(sprite._cursor);
                sprite.onClick = () => this.castVote(entry.number);
                this.addChild(sprite);
                this._sprites.push(sprite);
                if (sprite._cursor.bitmap) sprite._cursor.bitmap.addLoadListener(() => this.positionCursor(sprite));
            });
            this.refreshCharacters();
        }

        positionCursor(sprite) {
            const cursor = sprite._cursor;
            if (!cursor?.bitmap) return;
            cursor.x = imageWidth - cursor.bitmap.width + cursorOffsetX;
            cursor.y = imageHeight - cursor.bitmap.height + cursorOffsetY;
        }

        refreshCharacters() {
            const ownVote = Number(this.votes[myPcId()] || 0);
            this._sprites.forEach(sprite => {
                const entry = sprite._entry;
                sprite.bitmap.clear();
                this.drawCharacterImage(sprite, entry);
                if (ownVote === entry.number) {
                    const borderSize = 6;
                    const borderColor = 'rgba(220, 80, 70, 0.95)';
                    sprite.bitmap.fillRect(0, 0, imageWidth, borderSize, borderColor);
                    sprite.bitmap.fillRect(0, imageHeight - borderSize, imageWidth, borderSize, borderColor);
                    sprite.bitmap.fillRect(0, 0, borderSize, imageHeight, borderColor);
                    sprite.bitmap.fillRect(imageWidth - borderSize, 0, borderSize, imageHeight, borderColor);
                }
                sprite.bitmap.fontSize = 24;
                sprite.bitmap.textColor = '#FFFFFF';
                sprite.bitmap.outlineColor = '#000000';
                sprite.bitmap.outlineWidth = 4;
                sprite.bitmap.drawText(entry.label, 0, imageHeight + 2, imageWidth, 36, 'center');
                this.positionCursor(sprite);
                sprite._cursor.visible = ownVote === entry.number && !!cursorImage;
            });
        }

        drawCharacterImage(sprite, entry) {
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
        }

        isPointerOverSideMenu() {
            const menuItems = SceneManager._scene?._menuItems || [];
            return menuItems.some(menuItem => {
                if (!menuItem.visible || !menuItem.bitmap) return false;
                return TouchInput.x >= menuItem.x && TouchInput.x < menuItem.x + menuItem.bitmap.width
                    && TouchInput.y >= menuItem.y && TouchInput.y < menuItem.y + menuItem.bitmap.height;
            });
        }

        castVote(targetPcId) {
            const voterPcId = myPcId();
            if (this.isPointerOverSideMenu() || !this._roomRef || !this.voters.includes(voterPcId) ||
                !this.targets.includes(targetPcId) ||
                (this.settings.allowSelfVote === false && voterPcId === targetPcId)) {
                if (!this.isPointerOverSideMenu()) {
                    console.warn('CulpritVote: この参加者には投票権がありません。');
                }
                return;
            }
            this._roomRef.child(`pc_data/${voterPcId}/culpritVote`).set(targetPcId).catch(error => {
                console.warn('CulpritVote: 投票を保存できませんでした。', error);
            });
        }

        complete() {
            if (this._completionHandled) return;
            this._completionHandled = true;
            if (this.settings.completionSwitchId > 0) {
                $gameSwitches.setValue(this.settings.completionSwitchId, true);
            }
            if (this.settings.completionCommonEventId > 0) {
                $gameTemp.reserveCommonEvent(this.settings.completionCommonEventId);
            }
        }

        close() {
            this.clearCompletionTimer();
            if (this._roomRef && this._listener) this._roomRef.off('value', this._listener);
            if (openInTab && SceneManager._scene?._tabGroup) {
                SceneManager._scene._tabGroup.removeTab('culprit_vote');
            }
            this.parent?.removeChild(this);
            if (voteLayer === this) voteLayer = null;
        }
    }

    function applyResults(room, args) {
        const participants = participantPcIds(room);
        const settings = voteSettings();
        const targets = voteTargetIds(settings.candidateIds, participants, settings);
        const votes = validVotes(room?.pc_data, participants, votingPcIds(participants, settings), targets, settings);
        const counts = voteCounts(votes, targets, settings);
        const highestVoteCount = targets.length > 0 ? Math.max(...Object.values(counts)) : 0;
        const highestVotedPcs = highestVoteCount > 0
            ? targets.filter(pcId => counts[pcId] === highestVoteCount)
            : [];
        const mostVotedPc = highestVoteCount > 0
            ? highestVotedPcs[0]
            : 0;
        const hasTie = highestVotedPcs.length > 1;
        const mostVotedPcVariableId = Number(args.mostVotedPcVariableId || 0);
        const highestVoteCountVariableId = Number(args.highestVoteCountVariableId || 0);
        const highestVotePcCountVariableId = Number(args.highestVotePcCountVariableId || 0);
        const highestVotedPcsVariableId = Number(args.highestVotedPcsVariableId || 0);
        const hasTieSwitchId = Number(args.hasTieSwitchId || 0);
        if (mostVotedPcVariableId > 0) $gameVariables.setValue(mostVotedPcVariableId, mostVotedPc);
        if (highestVoteCountVariableId > 0) $gameVariables.setValue(highestVoteCountVariableId, highestVoteCount);
        if (highestVotePcCountVariableId > 0) $gameVariables.setValue(highestVotePcCountVariableId, highestVotedPcs.length);
        if (highestVotedPcsVariableId > 0) $gameVariables.setValue(highestVotedPcsVariableId, highestVotedPcs);
        if (hasTieSwitchId > 0) $gameSwitches.setValue(hasTieSwitchId, hasTie);
    }

    function voteCounts(votes, participants, settings = voteSettings()) {
        const counts = Object.fromEntries(participants.map(pcId => [pcId, 0]));
        const weightedVoters = weightedVoterPcNumbers(settings);
        Object.entries(votes).forEach(([voter, target]) => {
            counts[target] += weightedVoters.has(Number(voter)) ? 1.5 : 1;
        });
        return counts;
    }

    function openVote(targetPcIds = [], settings = voteSettings()) {
        if (voteLayer) return;
        const ref = roomRef();
        if (!ref) {
            console.warn('CulpritVote: Firebase接続を確認してください。');
            return;
        }
        if (isRoomCreator()) {
            ref.child('pc_data').once('value').then(snapshot => {
                const updates = {};
                Object.keys(snapshot.val() || {}).forEach(pcId => {
                    updates[`pc_data/${pcId}/culpritVote`] = null;
                });
                return ref.update(updates);
            }).catch(error => console.warn('CulpritVote: 前回の投票を消去できませんでした。', error));
        }
        openVoteTab(SceneManager._scene);
        $gameSystem._culpritVoteSettings = settings;
        voteLayer = new CulpritVoteLayer(targetPcIds, settings);
        addVoteLayer(SceneManager._scene, voteLayer);
    }

    PluginManager.registerCommand(pluginName, 'open', args => {
        const characterCount = Number(args.characterCount || 0);
        const targetPcIds = characterCount > 0
            ? Array.from({ length: characterCount }, (_, index) => index + 1)
            : [];
        openVote(targetPcIds, {
            allowGmVote: args.allowGmVote === 'true',
            weightedVoterPcId: Number(args.weightedVoterPcId || 0),
            weightedVoterPcVariableId: Number(args.weightedVoterPcVariableId || 0),
            includeGmAsTarget: args.includeGmAsTarget === 'true',
            onlyActivePcsAsTargets: args.onlyActivePcsAsTargets === 'true',
            allowSelfVote: args.allowSelfVote !== 'false',
            backgroundImage: args.backgroundImage || '',
            candidateIds: targetPcIds,
            completionCommonEventId: Number(args.completionCommonEventId || 0),
            completionSwitchId: Number(args.completionSwitchId || 0)
        });
    });

    PluginManager.registerCommand(pluginName, 'openForPcsInVariable', args => {
        const variableId = Number(args.targetPcsVariableId || 0);
        const value = variableId > 0 ? $gameVariables.value(variableId) : null;
        const gmPcId = firebaseParameter('defaultGmPcId', 7);
        if (!Array.isArray(value)) {
            console.warn('CulpritVote: 投票対象PC番号の変数にPC番号配列を設定してください。');
            return;
        }
        if (value.length === 0) {
            openVote([], {
                allowGmVote: args.allowGmVote === 'true',
                weightedVoterPcId: Number(args.weightedVoterPcId || 0),
                weightedVoterPcVariableId: Number(args.weightedVoterPcVariableId || 0),
                includeGmAsTarget: false,
                onlyActivePcsAsTargets: args.onlyActivePcsAsTargets === 'true',
                allowSelfVote: args.allowSelfVote !== 'false',
                backgroundImage: args.backgroundImage || '',
                candidateIds: [],
                completionCommonEventId: Number(args.completionCommonEventId || 0),
                completionSwitchId: Number(args.completionSwitchId || 0)
            });
            return;
        }
        const targetPcIds = [...new Set(value.map(Number).filter(pcId => pcId > 0))];
        if (targetPcIds.length === 0) {
            console.warn('CulpritVote: 投票対象PC番号配列に有効なPC番号がありません。');
            return;
        }
        openVote(targetPcIds, {
            allowGmVote: args.allowGmVote === 'true',
            weightedVoterPcId: Number(args.weightedVoterPcId || 0),
            weightedVoterPcVariableId: Number(args.weightedVoterPcVariableId || 0),
            includeGmAsTarget: targetPcIds.includes(gmPcId),
            onlyActivePcsAsTargets: args.onlyActivePcsAsTargets === 'true',
            allowSelfVote: args.allowSelfVote !== 'false',
            backgroundImage: args.backgroundImage || '',
            candidateIds: targetPcIds,
            completionCommonEventId: Number(args.completionCommonEventId || 0),
            completionSwitchId: Number(args.completionSwitchId || 0)
        });
    });

    PluginManager.registerCommand(pluginName, 'getResults', args => {
        const ref = roomRef();
        if (!ref) {
            console.warn('CulpritVote: Firebase接続を確認してください。');
            return;
        }
        ref.once('value').then(snapshot => applyResults(snapshot.val(), args)).catch(error => {
            console.warn('CulpritVote: 投票結果を取得できませんでした。', error);
        });
    });

    PluginManager.registerCommand(pluginName, 'getTargetVoteCount', args => {
        const ref = roomRef();
        const targetPcNumber = Number(args.targetPcNumber || 0);
        const variableId = Number(args.targetVoteCountVariableId || 0);
        if (!ref || targetPcNumber <= 0 || variableId <= 0) return;
        ref.once('value').then(snapshot => {
            const room = snapshot.val() || {};
            const participants = participantPcIds(room);
            const settings = voteSettings();
            const targets = voteTargetIds(settings.candidateIds, participants, settings);
            const votes = validVotes(room.pc_data, participants, votingPcIds(participants, settings), targets, settings);
            $gameVariables.setValue(variableId, voteCounts(votes, targets, settings)[targetPcNumber] || 0);
        }).catch(error => console.warn('CulpritVote: 特定PCの得票数を取得できませんでした。', error));
    });
})();

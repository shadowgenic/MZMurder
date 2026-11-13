/*:
 * @target MZ
 * @plugindesc APNG（アニメーションPNG）をピクチャとして再生します。
 * @author Shadowgenic & Claude
 *
 * @help
 * APNGファイルを、通常のPNGと同じ手順で扱えるようにします。
 * ファイルの拡張子は .png のまま img/pictures/ などに置き、
 * 「ピクチャの表示」でそのまま指定してください。
 *
 * 【仕組み】
 * 読み込んだPNGに acTL チャンク（APNGの印）があれば、各フレームを
 * 単独のPNGに分解して読み込み、Bitmap の canvas へ順に合成描画します。
 * ブラウザ機能（ImageDecoder等）には依存しません。
 * 通常のPNGは従来どおりの処理で、影響を受けません。
 *
 * 【対象フォルダ】
 * img/pictures の画像のみ判定します。
 *
 * 失敗した場合は F8 のコンソールに [ApngSupport] で始まる警告が出ます。
 *
 * 利用規約：無断で改変、再配布が可能。クレジット表記不要
 */

(() => {
    "use strict";

    const TARGET_PATTERN = /img\/pictures\//i;
    const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

    const animations = new Set();

    //-------------------------------------------------------------------------
    // バイナリ処理
    //-------------------------------------------------------------------------
    const crcTable = (() => {
        const table = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
            table[n] = c >>> 0;
        }
        return table;
    })();

    function crc32(bytes) {
        let c = 0xffffffff;
        for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
        return (c ^ 0xffffffff) >>> 0;
    }

    function makeChunk(type, data) {
        const chunk = new Uint8Array(12 + data.length);
        const view = new DataView(chunk.buffer);
        view.setUint32(0, data.length);
        for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
        chunk.set(data, 8);
        view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
        return chunk;
    }

    function fetchBytes(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const encrypted = Utils.hasEncryptedImages();
            xhr.open("GET", encrypted ? url + "_" : url);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
                if (xhr.status >= 400) return reject(new Error("HTTP " + xhr.status));
                resolve(encrypted ? Utils.decryptArrayBuffer(xhr.response) : xhr.response);
            };
            xhr.onerror = () => reject(new Error("XHR error"));
            xhr.send();
        });
    }

    // APNGを解析し、フレームごとの単独PNGバイト列を返す。APNGでなければ null
    function parseApng(buffer) {
        const bytes = new Uint8Array(buffer);
        const view = new DataView(buffer);
        if (bytes.length < 8 || !PNG_SIGNATURE.every((v, i) => bytes[i] === v)) return null;

        let width = 0, height = 0, plays = 0, hasActl = false;
        let ihdrData = null;
        const shared = []; // IDAT より前の共通チャンク（PLTE, tRNS 等）
        const frames = [];
        let current = null;

        let pos = 8;
        while (pos + 12 <= bytes.length) {
            const length = view.getUint32(pos);
            const type = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
            const data = bytes.subarray(pos + 8, pos + 8 + length);
            const whole = bytes.subarray(pos, pos + 12 + length);
            pos += 12 + length;

            if (type === "IHDR") {
                ihdrData = data;
                width = view.getUint32(pos - 12 - length + 8);
                height = view.getUint32(pos - 12 - length + 12);
            } else if (type === "acTL") {
                hasActl = true;
                plays = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(4);
            } else if (type === "fcTL") {
                const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
                current = {
                    width: dv.getUint32(4), height: dv.getUint32(8),
                    x: dv.getUint32(12), y: dv.getUint32(16),
                    delay: dv.getUint16(20) / (dv.getUint16(22) || 100) * 1000,
                    dispose: data[24], blend: data[25], idat: []
                };
                frames.push(current);
            } else if (type === "IDAT") {
                if (current) current.idat.push(data);
            } else if (type === "fdAT") {
                if (current) current.idat.push(data.subarray(4));
            } else if (type === "IEND") {
                break;
            } else if (type !== "fcTL" && frames.length === 0 && !["cHRM", "gAMA", "iCCP", "sBIT", "sRGB", "tEXt", "zTXt", "iTXt", "bKGD", "pHYs"].includes(type)) {
                shared.push(whole);
            }
        }
        if (!hasActl || !ihdrData || frames.length < 2) return null;

        const blobs = frames.map(f => {
            const ihdr = new Uint8Array(ihdrData);
            const iv = new DataView(ihdr.buffer);
            iv.setUint32(0, f.width);
            iv.setUint32(4, f.height);
            const parts = [new Uint8Array(PNG_SIGNATURE), makeChunk("IHDR", ihdr), ...shared];
            f.idat.forEach(d => parts.push(makeChunk("IDAT", d)));
            parts.push(makeChunk("IEND", new Uint8Array(0)));
            return new Blob(parts, { type: "image/png" });
        });
        return { width, height, plays, frames, blobs };
    }

    //-------------------------------------------------------------------------
    // ApngPlayer
    //-------------------------------------------------------------------------
    class ApngPlayer {
        constructor(bitmap, info, images) {
            this.bitmap = bitmap;
            this.frames = info.frames;
            this.images = images;
            this.loopsLeft = info.plays === 0 ? Infinity : info.plays;
            this.index = 0;
            this.nextTime = 0;
            this.finished = false;
            this.snapshot = null;
            this.started = false;
        }

        update(now) {
            if (this.finished || now < this.nextTime) return;
            const bitmap = this.bitmap;
            if (!bitmap._canvas) return;
            const ctx = bitmap._context;
            const i = this.index;
            const f = this.frames[i];

            // 前フレームの後始末
            if (i === 0) {
                ctx.clearRect(0, 0, bitmap._canvas.width, bitmap._canvas.height);
            } else {
                const p = this.frames[i - 1];
                if (p.dispose === 1) {
                    ctx.clearRect(p.x, p.y, p.width, p.height);
                } else if (p.dispose === 2 && this.snapshot) {
                    ctx.putImageData(this.snapshot, p.x, p.y);
                }
            }
            this.snapshot = null;
            if (f.dispose === 2 && i > 0) {
                this.snapshot = ctx.getImageData(f.x, f.y, f.width, f.height);
            }
            if (f.blend === 0) ctx.clearRect(f.x, f.y, f.width, f.height);
            ctx.drawImage(this.images[i], f.x, f.y);
            bitmap._baseTexture.update();

            this.nextTime = now + Math.max(f.delay, 16);
            this.index++;
            if (this.index >= this.frames.length) {
                this.loopsLeft--;
                if (this.loopsLeft <= 0) {
                    this.finished = true;
                } else {
                    this.index = 0;
                }
            }
        }

        destroy() {
            this.finished = true;
            this.images.forEach(img => { if (img.close) img.close(); });
            this.images = [];
        }
    }

    //-------------------------------------------------------------------------
    // Bitmap
    //-------------------------------------------------------------------------
    const _Bitmap_onLoad = Bitmap.prototype._onLoad;
    Bitmap.prototype._onLoad = function() {
        if (!TARGET_PATTERN.test(this._url || "")) {
            _Bitmap_onLoad.call(this);
            return;
        }
        fetchBytes(this._url).then(buffer => {
            const info = parseApng(buffer);
            if (!info) return null;
            return Promise.all(info.blobs.map(b => createImageBitmap(b)))
                .then(images => ({ info, images }));
        }).catch(e => {
            console.warn("[ApngSupport] " + this._url + ": " + e);
            return null;
        }).then(result => {
            if (!result) {
                _Bitmap_onLoad.call(this);
                return;
            }
            this._startApng(result.info, result.images);
        });
    };

    Bitmap.prototype._startApng = function(info, images) {
        if (Utils.hasEncryptedImages()) {
            URL.revokeObjectURL(this._image.src);
        }
        this._createCanvas(info.width, info.height);
        this._loadingState = "loaded";
        this._apng = new ApngPlayer(this, info, images);
        this._apng.update(performance.now()); // 1コマ目を即描画
        animations.add(this._apng);
        this._callLoadListeners();
    };

    const _Bitmap_destroy = Bitmap.prototype.destroy;
    Bitmap.prototype.destroy = function() {
        if (this._apng) {
            animations.delete(this._apng);
            this._apng.destroy();
            this._apng = null;
        }
        _Bitmap_destroy.call(this);
    };

    //-------------------------------------------------------------------------
    // 毎フレーム更新
    //-------------------------------------------------------------------------
    const _SceneManager_update = SceneManager.update;
    SceneManager.update = function(deltaTime) {
        _SceneManager_update.call(this, deltaTime);
        if (animations.size > 0) {
            const now = performance.now();
            animations.forEach(player => player.update(now));
        }
    };
})();

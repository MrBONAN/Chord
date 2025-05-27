export class ImageSaver {
    constructor(canvas) {
        this.canvas = canvas;
    }

    async saveImage(metadata) {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob(async (blob) => {
                try {
                    const arrayBuffer = await blob.arrayBuffer();
                    const finalBlob = this.addMetadataToPng(arrayBuffer, metadata);
                    resolve(finalBlob);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    async loadImage(file) {
        if (!file || file.type !== "image/png") {
            throw new Error("Invalid file type");
        }
        return await this.extractMetadataFromPng(file);
    }

    addMetadataToPng(pngArrayBuffer, metadataObj) {
        const metadataStr = JSON.stringify(metadataObj);
        const encoder = new TextEncoder();
        const keyword = encoder.encode('Description');
        const textData = encoder.encode(metadataStr);

        const nullByte = new Uint8Array([0]);
        const chunkData = this.concatUint8Arrays([keyword, nullByte, textData]);

        const chunkType = encoder.encode('tEXt');
        const crcData = this.concatUint8Arrays([chunkType, chunkData]);
        const crc = this.crc32(crcData);

        const chunkLength = new Uint8Array(new Uint32Array([chunkData.length]).buffer).reverse(); // Big-endian
        const crcBytes = new Uint8Array(new Uint32Array([crc]).buffer).reverse();

        const chunk = this.concatUint8Arrays([chunkLength, chunkType, chunkData, crcBytes]);

        const pngBytes = new Uint8Array(pngArrayBuffer);

        const ihdrEnd = 8 + 4 + 4 + 13 + 4;

        const newPng = this.concatUint8Arrays([
            pngBytes.slice(0, ihdrEnd),
            chunk,
            pngBytes.slice(ihdrEnd)
        ]);

        return new Blob([newPng], { type: 'image/png' });
    }

    concatUint8Arrays(arrays) {
        const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        return result;
    }

    crc32(buf) {
        let crc = ~0;
        for (let i = 0; i < buf.length; i++) {
            crc ^= buf[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
        }
        return ~crc >>> 0;
    }

    extractMetadataFromPng(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const data = new Uint8Array(reader.result);
                let pos = 8;

                while (pos < data.length) {
                    const length = (data[pos] << 24) | (data[pos+1] << 16) | (data[pos+2] << 8) | data[pos+3];
                    const type = String.fromCharCode(...data.slice(pos+4, pos+8));

                    if (type === 'tEXt') {
                        const chunkData = data.slice(pos+8, pos+8+length);
                        const nullIndex = chunkData.indexOf(0);
                        const keyword = new TextDecoder().decode(chunkData.slice(0, nullIndex));
                        const text = new TextDecoder().decode(chunkData.slice(nullIndex+1));
                        if (keyword === 'Description') {
                            try {
                                const metadata = JSON.parse(text);
                                resolve(metadata);
                            } catch (e) {
                                reject('Ошибка парсинга JSON в метаданных.');
                            }
                            return;
                        }
                    }

                    pos += 12 + length;
                }

                resolve(null);
            };

            reader.onerror = () => reject('Ошибка чтения файла.');
            reader.readAsArrayBuffer(file);
        });
    }
}
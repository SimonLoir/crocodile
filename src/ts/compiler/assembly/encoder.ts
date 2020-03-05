import { Buffer } from 'buffer';
export default class encoder {
    public encodeString(str: string) {
        return [str.length, ...str.split('').map(s => s.charCodeAt(0))];
    }

    public unsignedLEB128(n: number) {
        const buffer = [];
        do {
            let byte = n & 0x7f;
            n >>>= 7;
            if (n !== 0) {
                byte |= 0x80;
            }
            buffer.push(byte);
        } while (n !== 0);
        return buffer;
    }

    public signedLEB128 = (n: number) => {
        const buffer = [];
        let more = true;
        while (more) {
            let byte = n & 0x7f;
            n >>>= 7;
            if (
                (n === 0 && (byte & 0x40) === 0) ||
                (n === -1 && (byte & 0x40) !== 0)
            ) {
                more = false;
            } else {
                byte |= 0x80;
            }
            buffer.push(byte);
        }
        return buffer;
    };

    public ieee754(n: number) {
        const buf = Buffer.allocUnsafe(4);
        buf.writeFloatLE(n, 0);
        return Uint8Array.from(buf);
    }
}

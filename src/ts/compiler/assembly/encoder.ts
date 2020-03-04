export default class encoder {
    private encodeString(str: string) {
        return [str.length, ...str.split('').map(s => s.charCodeAt(0))];
    }

    private unsignedLEB128(n: number) {
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

    private signedLEB128 = (n: number) => {
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
}

import { reverse_codes } from './wasmbuilder';
export default class binary_viewer {
    public static decodeWasm(array: Uint8Array) {
        return this.goThrough(array, (instruction) => instruction);
    }

    public static wasmToOpCodes(array: Uint8Array) {
        return this.goThrough(array, (instruction) => {
            if (reverse_codes[instruction]) return reverse_codes[instruction];
            return instruction;
        });
    }

    private static goThrough(array: Uint8Array, cb: (inst: number) => any) {
        let out: any[][] = [];
        let buffer: any[] = [];
        for (let i = 1; i <= array.length; i++) {
            const element = cb(array[i - 1]);
            buffer.push(element);
            if (i % 8 == 0) {
                out.push([...buffer]);
                buffer = [];
            }
        }
        if (buffer.length != 0) out.push([...buffer]);
        console.table(out);
    }
}

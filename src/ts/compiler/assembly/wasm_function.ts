import wasm_builder from './wasmbuilder';

export default class wasm_function {
    constructor() {}
    public static f32_sub(a: any[], b: any[]): any[] {
        return [...a, ...b, wasm_builder.codes.sub_f32];
    }
    public static f32_add(a: any[], b: any[]): any[] {
        return [...a, ...b, wasm_builder.codes.add_f32];
    }
}

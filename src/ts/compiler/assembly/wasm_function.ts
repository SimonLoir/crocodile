import wasm_builder from './wasmbuilder';

export default class wasm_function {
    constructor() {}
    public static f32_sub(a: any[], b: any[]): any[] {
        return [...a, ...b, wasm_builder.op_codes.f32_sub];
    }
    public static f32_add(a: any[], b: any[]): any[] {
        return [...a, ...b, wasm_builder.op_codes.f32_add];
    }
}

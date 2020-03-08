import wasm_builder from './wasmbuilder';

type type = 'i32' | 'f64' | 'i64' | 'f32';
export default class wasm_function {
    constructor() {}

    public static op(op: any, a: any[], b: any[]): any[] {
        //@ts-ignore
        return [...a, ...b, wasm_builder.codes[op]];
    }

    public static add(type: type, a: any[], b: any[]): any[] {
        return this.op('add_' + type, a, b);
    }

    public static sub(type: type, a: any[], b: any[]): any[] {
        return this.op('sub_' + type, a, b);
    }

    public static mul(type: type, a: any[], b: any[]): any[] {
        return this.op('mul_' + type, a, b);
    }

    public static div_signed(type: type, a: any[], b: any[]): any[] {
        return this.op('div_s_' + type, a, b);
    }

    public static div_unsigned(type: type, a: any[], b: any[]): any[] {
        return this.op('div_u_' + type, a, b);
    }

    public static div_float(type: type, a: any[], b: any[]): any[] {
        return this.op('div_s_' + type, a, b);
    }
}

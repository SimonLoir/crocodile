import binary_builder from '../binary_builder';
import encoder from './encoder';

export let reverse_codes: any = {};

export default class wasm_builder extends binary_builder {
    public encoder = new encoder();
    private types: any[] = [];
    private funcs: any[] = [];
    private exports: any[] = [];
    private code: any[] = [];

    private wasm_module_header = [0x00, 0x61, 0x73, 0x6d];

    private wasm_module_version = [0x01, 0x00, 0x00, 0x00];

    private section_codes = {
        custom: 0,
        type: 1,
        import: 2,
        func: 3,
        table: 4,
        memory: 5,
        global: 6,
        export: 7,
        start: 8,
        element: 9,
        code: 10,
        data: 11,
    };

    public static codes = {
        // Value types
        i32: 0x7f,
        i64: 0x7e,
        f32: 0x7d,
        f64: 0x7c,

        // Export types
        export_func: 0x00,
        export_table: 0x01,
        export_mem: 0x02,
        export_global: 0x03,

        // Variable Instructions
        get_local: 0x20,
        set_local: 0x21,
        tee_local: 0x22,
        get_global: 0x23,
        set_global: 0x24,

        // Control Instructions
        end: 0x0b,
        unreachable: 0x00,
        nop: 0x01,
        block: 0x02,
        loop: 0x03,
        if: 0x04,
        else: 0x05,
        br: 0x0c,
        br_if: 0x0d,
        br_table: 0x0e,
        return: 0x0f,
        call: 0x10,
        call_indirect: 0x11,

        // Parametric Instructions
        drop: 0x1a,
        select: 0x1b,

        // Constants
        const_i32: 0x41,
        const_i64: 0x42,
        const_f32: 0x43,
        const_f46: 0x44,

        // i32 Instructions
        eqz_i32: 0x45,
        eq_i32: 0x46,
        ne_i32: 0x47,
        lt_s_i32: 0x48,
        lt_u_i32: 0x49,
        gt_s_i32: 0x4a,
        gt_u_i32: 0x4b,
        le_s_i32: 0x4c,
        le_u_i32: 0x4d,
        ge_s_i32: 0x4e,
        ge_u_i32: 0x4f,

        clz_i32: 0x67,
        ctz_i32: 0x68,
        popcnt_i32: 0x69,
        add_i32: 0x6a,
        sub_i32: 0x6b,
        mul_i32: 0x6c,
        div_s_i32: 0x6d,
        div_u_i32: 0x6e,
        rem_s_i32: 0x6f,
        rem_u_i32: 0x70,
        and_i32: 0x71,
        or_i32: 0x72,
        xor_i32: 0x73,
        shl_i32: 0x74,
        shr_s_i32: 0x75,
        shr_u_i32: 0x76,
        rotl_i32: 0x77,
        rotr_i32: 0x78,

        // i64 Instructions
        eqz_i64: 0x50,
        eq_i64: 0x51,
        ne_i64: 0x52,
        lt_s_i64: 0x53,
        lt_u_i64: 0x54,
        gt_s_i64: 0x55,
        gt_u_i64: 0x56,
        le_s_i64: 0x57,
        le_u_i64: 0x58,
        ge_s_i64: 0x59,
        ge_u_i64: 0x5a,

        clz_i64: 0x79,
        ctz_i64: 0x7a,
        popcnt_i64: 0x7b,
        add_i64: 0x7c,
        sub_i64: 0x7d,
        mul_i64: 0x7e,
        div_s_i64: 0x7f,
        div_u_i64: 0x80,
        rem_s_i64: 0x81,
        rem_u_i64: 0x82,
        and_i64: 0x83,
        or_i64: 0x84,
        xor_i64: 0x85,
        shl_i64: 0x86,
        shr_s_i64: 0x87,
        shr_u_i64: 0x88,
        rotl_i64: 0x89,
        rotr_i64: 0x8a,

        // f32 Instructions
        eq_f32: 0x5b,
        ne_f32: 0x5c,
        lt_f32: 0x5d,
        gt_f32: 0x5e,
        le_f32: 0x5f,
        ge_f32: 0x60,

        abs_f32: 0x8b,
        neg_f32: 0x8c,
        ceil_f32: 0x8d,
        floor_f32: 0x8e,
        trunc_f32: 0x8f,
        nearest_f32: 0x90,
        sqrt_f32: 0x91,
        add_f32: 0x92,
        sub_f32: 0x93,
        mul_f32: 0x94,
        div_f32: 0x95,
        min_f32: 0x96,
        max_f32: 0x97,
        copysign_f32: 0x98,

        // f64 Instructions
        eq_f64: 0x61,
        ne_f64: 0x62,
        lt_f64: 0x63,
        gt_f64: 0x64,
        le_f64: 0x65,
        ge_f64: 0x66,

        abs_f64: 0x99,
        neg_f64: 0x9a,
        ceil_f64: 0x9b,
        floor_f64: 0x9c,
        trunc_f64: 0x9d,
        nearest_f64: 0x9e,
        sqrt_f64: 0x9f,
        add_f64: 0xa0,
        sub_f64: 0xa1,
        mul_f64: 0xa2,
        div_f64: 0xa3,
        min_f64: 0xa4,
        max_f64: 0xa5,
        copysign_f64: 0xa6,
    };

    constructor() {
        super();
        this.code_array = [];
    }

    /**
     * Creates a new function type
     * @param args the arguments represented as a type name
     * @param return_type the type name of the return value
     */
    public addFunctionType(
        args: Array<'i32' | 'i64' | 'f32' | 'f64'>,
        return_type: 'i32' | 'i64' | 'f32' | 'f64'
    ) {
        const args_codes = args.map((arg) => wasm_builder.codes[arg]);
        const return_code = wasm_builder.codes[return_type];
        return this.encoder.signedLEB128(
            this.types.push([
                0x60,
                ...this.vector(args_codes),
                ...this.vector([return_code]),
            ]) - 1
        );
    }

    /**
     * Creates a new section
     * @param sectionType the section code of the section
     * @param data the content of the section
     */
    private createSection(sectionType: any, data: any[]) {
        return [sectionType, ...this.vector(data)];
    }

    /**
     * Creates a new vector from the data
     * @param data
     */
    private vector(data: any[]) {
        return [
            this.encoder.unsignedLEB128(data.length),
            ...this.flatten(data),
        ];
    }

    private flatten(arr: any[]) {
        return [].concat.apply([], arr);
    }

    /**
     * Creates a new function and registers it in the func array and the export system
     * @param name the name of the function in the exports
     * @param type the type of the function
     */
    public createFunction(name: string, type: number[], func_code: any[]) {
        const functionIndex = this.funcs.push(type) - 1;
        // valid funccode [0x0, ...func_code, wasm_builder.op_codes.end]
        this.code.push(this.vector(func_code));
        this.exports.push([
            ...this.encoder.encodeString(name),
            wasm_builder.codes.export_func,
            this.encoder.signedLEB128(functionIndex),
        ]);
    }

    /**
     * Builds an array of instructions
     */
    protected build() {
        this.code_array = [
            // Defines a wasm module
            ...this.wasm_module_header,
            // Defines the version of webassembly
            ...this.wasm_module_version,
            // Defines the types of the functions
            ...this.createSection(
                this.section_codes.type,
                this.vector(this.types)
            ),
            // Defines the functions
            ...this.createSection(
                this.section_codes.func,
                this.vector(this.funcs)
            ),
            // Exports the functions
            ...this.createSection(
                this.section_codes.export,
                this.vector(this.exports)
            ),
            // The code of the functions
            ...this.createSection(
                this.section_codes.code,
                this.vector(this.code)
            ),
        ];
    }
}

const keys = Object.keys(wasm_builder.codes);

keys.forEach((key) => {
    // @ts-ignore
    const value = wasm_builder.codes[key];
    reverse_codes[value] = key;
});

console.log(reverse_codes);

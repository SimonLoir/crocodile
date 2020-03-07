import binary_builder from '../binary_builder';
import encoder from './encoder';

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

    public value_codes = {
        i32: 0x7f,
        i64: 0x7e,
        f32: 0x7d,
        f64: 0x7c,
    };

    private static export_codes = {
        func: 0x00,
        table: 0x01,
        mem: 0x02,
        global: 0x03,
    };

    public static op_codes = {
        end: 0x0b,
        get_local: 0x20,
        /**
         * Dealing with f32
         */
        f32_add: 0x92,
        f32_sub: 0x93,
        f32_const: 0x43,
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
        const args_codes = args.map((arg) => this.value_codes[arg]);
        const return_code = this.value_codes[return_type];
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
            wasm_builder.export_codes.func,
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

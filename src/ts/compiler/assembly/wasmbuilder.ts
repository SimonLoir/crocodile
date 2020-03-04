import binary_builder from '../binary_builder';
import encoder from './encoder';

export default class wasm_builder extends binary_builder {
    private encoder = new encoder();

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
        data: 11
    };

    private value_codes = {
        i32: 0x7f,
        i64: 0x7e,
        f32: 0x7d,
        f64: 0x7c
    };

    private export_codes = {
        func: 0x00,
        table: 0x01,
        mem: 0x02,
        global: 0x03
    };

    constructor() {
        super();
        this.code_array = [
            ...this.wasm_module_header,
            ...this.wasm_module_version
        ];
    }

    private push(data: any[]) {
        this.code_array = [...this.code_array, ...data];
    }

    public addFunctionType(
        args: Array<'i32' | 'i64' | 'f32' | 'f64'>,
        return_type: 'i32' | 'i64' | 'f32' | 'f64'
    ) {
        const args_codes = args.map(arg => this.value_codes[arg]);
        const return_code = this.value_codes[return_type];

        this.push(
            this.createSection(
                this.section_codes.type,
                this.vector([
                    [
                        0x60,
                        ...this.vector(args_codes),
                        ...this.vector([return_code])
                    ],
                    [
                        0x60,
                        ...this.vector(args_codes),
                        ...this.vector([return_code])
                    ]
                ])
            )
        );
    }

    private createSection(sectionType: any, data: any[]) {
        return [sectionType, ...this.vector(data)];
    }

    private vector(data: any[]) {
        return [
            this.encoder.unsignedLEB128(data.length),
            ...this.flatten(data)
        ];
    }

    private flatten(arr: any[]) {
        return [].concat.apply([], arr);
    }

    private createFunction(name: string) {}
}

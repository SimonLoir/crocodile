class PyWASMBuilder {
    private wasm_module_header = [0x00, 0x61, 0x73, 0x6d];
    private wasm_module_version = [0x01, 0x00, 0x00, 0x00];

    private codes = {
        op_codes: {
            end: 0x0b,
            get_local: 0x20,
            f32_add: 0x92
        },
        values: {
            i32: 0x7f,
            f32: 0x7d
        }
    };

    private createSection(sectionType: any, data: any[]) {
        return [sectionType, ...this.vector(data)];
    }

    private addFunction(name: string, index: number) {
        const type = [
            0x60,
            ...this.vector([this.codes.values.f32, this.codes.values.f32]),
            ...this.vector([this.codes.values.f32])
        ];

        const funcSection = this.createSection(
            this.section.func,
            this.vector([this.signedLEB128(index)])
        );

        const funcBody = this.vector([
            0x0,
            this.codes.op_codes.get_local,
            this.unsignedLEB128(0),
            this.codes.op_codes.get_local,
            this.unsignedLEB128(1),
            this.codes.op_codes.f32_add,
            this.codes.op_codes.end
        ]);

        const funcCodeSection = this.createSection(
            this.section.code,
            this.vector([funcBody])
        );

        const exportSection = this.createSection(
            this.section.export,
            this.vector([
                [...this.encodeString(name), 0x00, this.signedLEB128(index)]
            ])
        );

        return [
            ...this.createSection(this.section.type, this.vector([type])),
            ...funcSection,
            ...exportSection,
            ...funcCodeSection
        ];
    }

    private build() {
        return new Uint8Array([
            ...this.wasm_module_header,
            ...this.wasm_module_version,
            ...this.addFunction('add', 0)
        ]);
    }

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

    private flatten(arr: any[]) {
        return [].concat.apply([], arr);
    }

    private vector(data: any[]) {
        return [this.unsignedLEB128(data.length), ...this.flatten(data)];
    }

    private section = {
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

    public async run() {
        const wasm_code = this.build();
        const { instance } = await WebAssembly.instantiate(wasm_code);
        console.log(instance.exports.add(5, 35.8888));
        console.log(this.codes);
    }
}

new PyWASMBuilder().run();

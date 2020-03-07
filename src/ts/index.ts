import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';
import CompileError from './compiler/compile_error';
import binary_viewer from './compiler/assembly/binary_viewer';
const builder = new wasm_builder();
const c = new compiler(builder);

console.time('Compile time');

try {
    c.compile(`
def i32 _test125(i32 a, i32 b):
    var i32 c = a + b
    return c + b * a 
def i32 sub (i32 a, i32 b):
    return a - b
`);
} catch (e) {
    if (e instanceof CompileError) {
        console.error(e.message);
    }
}

const type = builder.addFunctionType(['f32'], 'f32');

builder.createFunction('test', type, [
    // Vars in the body
    //...builder.vector([wasm_builder.codes.i32]),
    //...builder.vector([wasm_builder.codes.i32, 0x00, 0x00]),

    ...builder.vector([
        [1, wasm_builder.codes.f32],
        [1, wasm_builder.codes.f32],
    ]),

    wasm_builder.codes.const_f32,
    ...builder.encoder.ieee754(5),
    wasm_builder.codes.set_local,
    1,

    wasm_builder.codes.const_f32,
    ...builder.encoder.ieee754(6),
    wasm_builder.codes.set_local,
    2,

    // Equals to 5 ?
    wasm_builder.codes.get_local,
    0,

    wasm_builder.codes.const_f32,
    ...builder.encoder.ieee754(5),
    // Equal op_code
    0x5b,

    // If ($1) then
    0x04,
    0x40,

    // -1 when equals 5
    wasm_builder.codes.const_f32,
    ...builder.encoder.ieee754(-1),

    // Return
    0x0f,
    0x0b,

    // Gets the argument
    wasm_builder.codes.get_local,
    1,
    wasm_builder.codes.get_local,
    2,

    wasm_builder.codes.add_f32,

    // Returns the first argument
    0x0b,
]);

binary_viewer.decodeWasm(builder.export());

const test = async () => {
    const { instance } = await WebAssembly.instantiate(builder.export());
    //@ts-ignore
    window.fn = instance.exports;
    console.timeEnd('Compile time');
};
test();

const button = document.createElement('button');
document.body.appendChild(button);
button.innerText = 'Télécharger le fichier wasm';
button.addEventListener('click', () =>
    downloadBlob(builder.export(), 'file.wasm', 'wasm')
);

function downloadBlob(data: any, fileName: string, mimeType: string) {
    var blob: any, url: any;
    blob = new Blob([data], {
        type: mimeType,
    });
    url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(function() {
        return window.URL.revokeObjectURL(url);
    }, 1000);
}

function downloadURL(data: any, fileName: string) {
    var a;
    a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

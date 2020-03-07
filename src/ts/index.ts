import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';
import CompileError from './compiler/compile_error';
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
    0x00,

    // Equals to 5 ?
    wasm_builder.op_codes.get_local,
    builder.encoder.signedLEB128(0),

    wasm_builder.op_codes.get_local,
    builder.encoder.signedLEB128(0),

    0x5b,

    // If ($1) then
    0x04,
    0x40,

    wasm_builder.op_codes.f32_const,
    ...builder.encoder.ieee754(-1),

    // Return
    0x0f,
    0x0b,

    wasm_builder.op_codes.get_local,
    0,

    // Returns the first argument
    0x0b,
]);

console.log(builder.export());

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

import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';
import CompileError from './compiler/compile_error';
const builder = new wasm_builder();
const c = new compiler(builder);

console.time('Compile time');

try {
    c.compile(`
def i32 _test125(i32 a, i32 b):
    return a + b
def i32 sub (i32 a, i32 b):
    return a - b
`);
} catch (e) {
    if (e instanceof CompileError) {
        console.error(e.message);
    }
}

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
        type: mimeType
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

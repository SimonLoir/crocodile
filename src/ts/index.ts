import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';
const builder = new wasm_builder();
const c = new compiler(builder);

c.compile(`
def i32 test(i32 a, i32 b):
    return a + b
`);

const f32_fn = builder.addFunctionType(['f32', 'f32'], 'f32');
builder.createFunction('f32add', f32_fn);
builder.createFunction('f32add2', f32_fn);

console.log(f32_fn);

const test = async () => {
    const { instance } = await WebAssembly.instantiate(builder.export());
    //@ts-ignore
    window.fn = instance.exports;
};
test();

const button = document.createElement('button');
document.body.appendChild(button);
button.innerText = 'Télécharger le fichier wasm';
console.log(builder.export());
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

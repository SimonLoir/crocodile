import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';
const builder = new wasm_builder();
const c = new compiler(builder);

c.compile(`#python
def test(a:int, b:int):
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

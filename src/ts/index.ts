import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';
const builder = new wasm_builder();
const c = new compiler(builder);

c.compile(`#python
def test(a:int, b:int):
    return a + b
`);

builder.addFunctionType(['i32', 'i32'], 'i32');
//builder.addFunctionType(['i32', 'f64'], 'f64');

const test = async () => {
    const { instance } = await WebAssembly.instantiate(builder.export());

    console.log(instance.exports);
};
test();

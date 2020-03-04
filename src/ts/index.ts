import compiler from './compiler/compiler';
import wasm_builder from './compiler/assembly/wasmbuilder';

new compiler(new wasm_builder()).compile(`#python
def test(a:int, b:int):
    return a + b
`);

export default class CompileError extends Error {
    constructor(message = '', line: number) {
        super(`line ${line + 1} - ${message}`);
        this.name = 'Compile Error';
    }
}

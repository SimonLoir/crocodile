export default class CompileError extends Error {
    constructor(message = '') {
        super(message);
        this.name = 'Compile Error';
    }
}

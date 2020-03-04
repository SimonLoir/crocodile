export default class binary_builder {
    protected code_array: any = [];
    protected export() {
        return new Uint8Array(this.code_array);
    }
}

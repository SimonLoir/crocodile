export default class binary_builder {
    protected code_array: any = [];
    public export() {
        return new Uint8Array(this.code_array);
    }
}

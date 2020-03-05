export default class binary_builder {
    protected code_array: any = [];
    protected build() {
        console.error('Please specify a build method');
    }
    public export() {
        this.build();
        return new Uint8Array(this.code_array);
    }
}

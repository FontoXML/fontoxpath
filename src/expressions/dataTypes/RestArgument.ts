class RestArgument {
    isRestArgument: boolean;
    constructor() {
        this.isRestArgument = true;
    }
}
export default RestArgument;
export const REST_ARGUMENT_INSTANCE = new RestArgument();

import TypeDeclaration from './TypeDeclaration';

class RestArgument {
	public isRestArgument: boolean;
	constructor() {
		this.isRestArgument = true;
	}
}
export default RestArgument;
export const REST_ARGUMENT_INSTANCE = new RestArgument();

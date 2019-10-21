import FunctionValue, { FunctionSignature } from '../dataTypes/FunctionValue';
import RestArgument from '../dataTypes/RestArgument';
import TypeDeclaration from '../dataTypes/TypeDeclaration';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IAsyncIterator } from '../util/iterators';

export default class UpdatingFunctionValue extends FunctionValue<
	IAsyncIterator<UpdatingExpressionResult>
> {
	constructor(definition: {
		argumentTypes: (TypeDeclaration | RestArgument)[];
		arity: number;
		isAnonymous?: boolean;
		isUpdating: boolean;
		localName: string;
		namespaceURI: string;
		returnType: TypeDeclaration;
		value: FunctionSignature<IAsyncIterator<UpdatingExpressionResult>>;
	}) {
		super(definition);
	}
}

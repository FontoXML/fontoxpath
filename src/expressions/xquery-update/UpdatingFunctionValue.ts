import FunctionValue, { FunctionSignature } from '../dataTypes/FunctionValue';
import RestArgument from '../dataTypes/RestArgument';
import TypeDeclaration from '../dataTypes/TypeDeclaration';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IIterator } from '../util/iterators';

export default class UpdatingFunctionValue extends FunctionValue<
	IIterator<UpdatingExpressionResult>
> {
	constructor(definition: {
		argumentTypes: (TypeDeclaration | RestArgument)[];
		arity: number;
		isAnonymous?: boolean;
		isUpdating: boolean;
		localName: string;
		namespaceURI: string;
		returnType: TypeDeclaration;
		value: FunctionSignature<IIterator<UpdatingExpressionResult>>;
	}) {
		super(definition);
	}
}

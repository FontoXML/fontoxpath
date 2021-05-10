import FunctionValue, { FunctionSignature } from '../dataTypes/FunctionValue';
import { ParameterType, SequenceType } from '../dataTypes/Value';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IIterator } from '../util/iterators';

export default class UpdatingFunctionValue extends FunctionValue<
	IIterator<UpdatingExpressionResult>
> {
	constructor(definition: {
		argumentTypes: ParameterType[];
		arity: number;
		isAnonymous?: boolean;
		isUpdating: boolean;
		localName: string;
		namespaceURI: string;
		returnType: SequenceType;
		value: FunctionSignature<IIterator<UpdatingExpressionResult>>;
	}) {
		super(definition);
	}
}

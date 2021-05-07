import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import StaticContext from '../StaticContext';
import createDoublyIterableSequence from '../util/createDoublyIterableSequence';
import ISequence from './ISequence';
import RestArgument from './RestArgument';
import sequenceFactory from './sequenceFactory';
import Value, { SequenceMultiplicity, ValueType } from './Value';
import QName from './valueTypes/QName';

export type FunctionSignature<T> = (
	dynamicContext: DynamicContext,
	executionParameters: ExecutionParameters,
	staticContext: StaticContext,
	...args: ISequence[]
) => T;

function expandRestArgumentToArity(argumentTypes: (ValueType | RestArgument)[], arity: number) {
	let indexOfRest = -1;
	for (let i = 0; i < argumentTypes.length; i++) {
		if ((argumentTypes[i] as RestArgument).isRestArgument) {
			indexOfRest = i;
		}
	}

	if (indexOfRest > -1) {
		const replacePart = new Array(arity - (argumentTypes.length - 1)).fill(
			argumentTypes[indexOfRest - 1]
		);

		return argumentTypes.slice(0, indexOfRest).concat(replacePart);
	}
	return argumentTypes;
}

class FunctionValue<T = ISequence> extends Value {
	public readonly isUpdating: boolean;
	public readonly value: FunctionSignature<T>;
	private readonly _argumentTypes: (ValueType | RestArgument)[];
	private readonly _arity: number;
	private readonly _isAnonymous: boolean;
	private readonly _localName: string;
	private readonly _namespaceURI: string;
	private readonly _returnType: ValueType;

	constructor({
		argumentTypes,
		arity,
		isAnonymous = false,
		isUpdating = false,
		localName,
		namespaceURI,
		returnType,
		value,
	}: {
		argumentTypes: (ValueType | RestArgument)[];
		arity: number;
		isAnonymous?: boolean;
		isUpdating?: boolean;
		localName: string;
		namespaceURI: string;
		returnType: ValueType;
		value: FunctionSignature<T>;
	}) {
		super(ValueType.FUNCTION, null);

		this.value = value;
		this.isUpdating = isUpdating;
		this._argumentTypes = expandRestArgumentToArity(argumentTypes, arity);
		this._arity = arity;
		this._isAnonymous = isAnonymous;
		this._localName = localName;
		this._namespaceURI = namespaceURI;
		this._returnType = returnType;
	}

	/**
	 * Apply these arguments to curry them into a new function
	 */
	public applyArguments(appliedArguments: (ISequence | null)[]) {
		const fn = this.value;

		const argumentSequenceCreators = appliedArguments.map((arg) => {
			if (arg === null) {
				return null;
			}
			return createDoublyIterableSequence(arg);
		});

		// fn (dynamicContext, ...arg)
		function curriedFunction(
			dynamicContext: DynamicContext,
			executionParameters: ExecutionParameters,
			staticContext: StaticContext
		) {
			const newArguments = Array.from(arguments).slice(3);
			const allArguments = argumentSequenceCreators.map((createArgumentSequence) => {
				// If createArgumentSequence === null, it is a placeholder, so use a provided one
				if (createArgumentSequence === null) {
					return newArguments.shift();
				}
				return createArgumentSequence();
			});
			return fn.apply(
				undefined,
				[dynamicContext, executionParameters, staticContext].concat(allArguments)
			);
		}
		const argumentTypes = appliedArguments.reduce(
			(indices: (ValueType | RestArgument)[], arg: ISequence | null, index: number) => {
				if (arg === null) {
					indices.push(this._argumentTypes[index]);
				}
				return indices;
			},
			[]
		);

		const functionItem = new FunctionValue({
			argumentTypes,
			arity: argumentTypes.length,
			isAnonymous: true,
			isUpdating: this.isUpdating,
			localName: 'boundFunction',
			namespaceURI: this._namespaceURI,
			returnType: this._returnType,
			value: curriedFunction,
		});

		return sequenceFactory.singleton(functionItem);
	}

	public getArgumentTypes() {
		return this._argumentTypes;
	}

	public getArity() {
		return this._arity;
	}

	public getName() {
		return this._localName;
	}

	public getQName() {
		return new QName('', this._namespaceURI, this._localName);
	}

	public getReturnType() {
		return this._returnType;
	}

	public isAnonymous() {
		return this._isAnonymous;
	}
}

export default FunctionValue;

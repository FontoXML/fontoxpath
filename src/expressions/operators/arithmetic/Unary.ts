import atomize from '../../dataTypes/atomize';
import castToType from '../../dataTypes/castToType';
import createAtomicValue from '../../dataTypes/createAtomicValue';
import isSubtypeOf from '../../dataTypes/isSubtypeOf';
import sequenceFactory from '../../dataTypes/sequenceFactory';
import { SequenceType, ValueType } from '../../dataTypes/Value';
import DynamicContext from '../../DynamicContext';
import ExecutionParameters from '../../ExecutionParameters';
import Expression from '../../Expression';

type UnaryLookupTable = {
	[key: number]: ValueType;
};

// TODO: fix this?
const UNARY_LOOKUP: UnaryLookupTable = {
	[ValueType.XSINTEGER]: ValueType.XSINTEGER,
	[ValueType.XSNONPOSITIVEINTEGER]: ValueType.XSINTEGER,
	[ValueType.XSNEGATIVEINTEGER]: ValueType.XSINTEGER,
	[ValueType.XSLONG]: ValueType.XSINTEGER,
	[ValueType.XSINT]: ValueType.XSINTEGER,
	[ValueType.XSSHORT]: ValueType.XSINTEGER,
	[ValueType.XSBYTE]: ValueType.XSINTEGER,
	[ValueType.XSNONNEGATIVEINTEGER]: ValueType.XSINTEGER,
	[ValueType.XSUNSIGNEDLONG]: ValueType.XSINTEGER,
	[ValueType.XSUNSIGNEDINT]: ValueType.XSINTEGER,
	[ValueType.XSUNSIGNEDSHORT]: ValueType.XSINTEGER,
	[ValueType.XSUNSIGNEDBYTE]: ValueType.XSINTEGER,
	[ValueType.XSPOSITIVEINTEGER]: ValueType.XSINTEGER,

	[ValueType.XSDECIMAL]: ValueType.XSDECIMAL,
	[ValueType.XSFLOAT]: ValueType.XSFLOAT,
	[ValueType.XSDOUBLE]: ValueType.XSDOUBLE,
};

class Unary extends Expression {
	private _kind: string;
	private _valueExpr: Expression;

	/**
	 * Positivese or negativise a value: +1 = 1, -1 = 0 - 1, -1 + 2 = 1, --1 = 1, etc
	 * @param  kind       Either + or -
	 * @param  valueExpr  The selector evaluating to the value to process
	 */
	constructor(kind: string, valueExpr: Expression, type: SequenceType) {
		super(valueExpr.specificity, [valueExpr], { canBeStaticallyEvaluated: false }, false, type);
		this._valueExpr = valueExpr;
		this._kind = kind;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		return atomize(
			this._valueExpr.evaluateMaybeStatically(dynamicContext, executionParameters),
			executionParameters
		).mapAll((atomizedValues) => {
			if (atomizedValues.length === 0) {
				// Return the empty sequence when inputted the empty sequence
				return sequenceFactory.empty();
			}

			if (atomizedValues.length > 1) {
				throw new Error(
					'XPTY0004: The operand to a unary operator must be a sequence with a length less than one'
				);
			}

			const value = atomizedValues[0];

			// We could infer the return type during annotation so we can early return here
			if (this.type) {
				return sequenceFactory.singleton(
					createAtomicValue(
						this._kind === '+' ? value.value : -value.value,
						UNARY_LOOKUP[value.type]
					)
				);
			}

			if (isSubtypeOf(value.type, ValueType.XSUNTYPEDATOMIC)) {
				const castValue = castToType(value, ValueType.XSDOUBLE).value as number;
				return sequenceFactory.singleton(
					createAtomicValue(
						this._kind === '+' ? castValue : -castValue,
						ValueType.XSDOUBLE
					)
				);
			}

			if (isSubtypeOf(value.type, ValueType.XSNUMERIC)) {
				if (this._kind === '+') {
					return sequenceFactory.singleton(value);
				}
				return sequenceFactory.singleton(
					createAtomicValue((value.value as number) * -1, UNARY_LOOKUP[value.type])
				);
			}
			return sequenceFactory.singleton(createAtomicValue(Number.NaN, ValueType.XSDOUBLE));
		});
	}
}

export default Unary;

import atomize from './dataTypes/atomize';
import castToType from './dataTypes/castToType';
import ISequence from './dataTypes/ISequence';
import isSubtypeOf from './dataTypes/isSubtypeOf';
import sequenceFactory from './dataTypes/sequenceFactory';
import { getPrimitiveTypeName } from './dataTypes/typeHelpers';
import Value, { BaseType, ValueType } from './dataTypes/Value';
import DynamicContext from './DynamicContext';
import ExecutionParameters from './ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from './Expression';
import FlworExpression from './FlworExpression';
import convertItemsToCommonType from './functions/convertItemsToCommonType';
import valueCompare from './operators/compares/valueCompare';
import PossiblyUpdatingExpression from './PossiblyUpdatingExpression';
import Specificity from './Specificity';
import { DONE_TOKEN, IIterator, IterationHint, IterationResult, ready } from './util/iterators';
import { errXPTY0004 } from './xquery/XQueryErrors';
import { SequenceType } from './dataTypes/Value';

function getFirstPrimitiveType(values: Value[]): BaseType | null {
	const firstActualValue = values.find((value) => !!value);

	if (!firstActualValue) {
		return null;
	}

	return getPrimitiveTypeName(firstActualValue.type.kind);
}

class OrderByExpression extends FlworExpression {
	private _orderSpecs: {
		expression: Expression;
		isAscending: boolean;
		isEmptyLeast: boolean;
	}[];

	constructor(
		orderSpecs: {
			expression: Expression;
			isAscending: boolean;
			isEmptyLeast: boolean;
		}[],
		returnExpression: PossiblyUpdatingExpression
	) {
		const specificity = new Specificity({});
		super(
			specificity,
			[returnExpression, ...orderSpecs.map((spec) => spec.expression)],
			{
				canBeStaticallyEvaluated: false,
				peer: false,
				resultOrder: RESULT_ORDERINGS.UNSORTED,
				subtree: false,
			},
			returnExpression
		);

		this._orderSpecs = orderSpecs;
	}

	public doFlworExpression(
		dynamicContext: DynamicContext,
		dynamicContextIterator: IIterator<DynamicContext>,
		executionParameters: ExecutionParameters,
		createReturnSequence: (dynamicContextIterator: IIterator<DynamicContext>) => ISequence
	): ISequence {
		// More than one order spec is not supported for now.
		if (this._orderSpecs[1]) {
			throw new Error('More than one order spec is not supported for the order by clause.');
		}

		const dynamicContexts: DynamicContext[] = [];

		let hasValues = false;
		let values: Value[];
		let indices: number[];

		let returnValueIterator: IIterator<Value> = null;

		const orderSpec = this._orderSpecs[0];

		return sequenceFactory.create({
			next: () => {
				if (!hasValues) {
					let iteratorResult: IterationResult<DynamicContext> = dynamicContextIterator.next(
						IterationHint.NONE
					);
					while (!iteratorResult.done) {
						dynamicContexts.push(iteratorResult.value);
						iteratorResult = dynamicContextIterator.next(IterationHint.NONE);
					}

					// Evaluate order specs. Limited to only one order spec for now.
					const evaluatedOrderSpecs: ISequence[] = dynamicContexts.map(
						(dynamicContextForEvaluation) =>
							orderSpec.expression.evaluate(
								dynamicContextForEvaluation,
								executionParameters
							)
					);

					// Atomize
					// Atomization is applied to the result of the expression in each orderspec. If the result of atomization is neither a single atomic value nor an empty sequence, a type error is raised [err:XPTY0004].
					const atomizedSequences: ISequence[] = evaluatedOrderSpecs.map(
						(evaluatedOrderSpec) => atomize(evaluatedOrderSpec, executionParameters)
					);
					if (atomizedSequences.find((val) => !val.isEmpty() && !val.isSingleton())) {
						throw errXPTY0004('Order by only accepts empty or singleton sequences');
					}

					// Switch to values instead of sequences as we now know we're dealing with singletons only.
					values = atomizedSequences.map((seq) => seq.first());

					// Casting values
					// If the value of an orderspec has the dynamic type xs:untypedAtomic, it is cast to the type xs:string.
					values = values.map((value) => {
						if (value === null) {
							return value;
						}

						if (isSubtypeOf(BaseType.XSUNTYPEDATOMIC, value.type.kind))
						{
							return castToType(value, BaseType.XSSTRING);
						}

						return value;
					});

					// If the resulting sequence contains values that are instances of more than one primitive type, then:
					// 1. If each value is an instance of one of the types xs:string or xs:anyURI, then all values are cast to type xs:string.
					// 2. If each value is an instance of one of the types xs:decimal or xs:float, then all values are cast to type xs:float.
					// 3. If each value is an instance of one of the types xs:decimal, xs:float, or xs:double, then all values are cast to type xs:double.
					// 4. Otherwise, a type error is raised [err:XPTY0004].
					const firstPrimitiveType: BaseType | null = getFirstPrimitiveType(values);

					if (firstPrimitiveType) {
						values = convertItemsToCommonType(values);

						if (!values) {
							throw errXPTY0004('Could not cast values');
						}
					}

					// Sort values
					const numberOfValues: number = values.length;
					indices = values.map((_value, index) => index);
					for (let startIndex: number = 0; startIndex < numberOfValues; startIndex++) {
						if (startIndex + 1 === numberOfValues) {
							continue;
						}

						for (let i: number = startIndex; i >= 0; i--) {
							const firstItemIndex = i;
							const secondItemIndex = i + 1;

							if (secondItemIndex === numberOfValues) {
								continue;
							}

							const W: Value = values[indices[firstItemIndex]];
							const V: Value = values[indices[secondItemIndex]];

							if (V === null && W === null) {
								continue;
							}

							if (orderSpec.isEmptyLeast) {
								// W is empty and thus is already in the right spot
								if (W === null) {
									continue;
								}

								if (V === null && W !== null) {
									// V is an empty sequence, thus swap indices in index array
									[indices[firstItemIndex], indices[secondItemIndex]] = [
										indices[secondItemIndex],
										indices[firstItemIndex],
									];

									continue;
								}

								if (isNaN(V.value) && W !== null && !isNaN(W.value)) {
									// V is NaN, thus swap indices in index array
									[indices[firstItemIndex], indices[secondItemIndex]] = [
										indices[secondItemIndex],
										indices[firstItemIndex],
									];

									continue;
								}
							} else {
								// V is already empty and thus is in the right spot
								if (V === null) {
									continue;
								}

								if (W === null && V !== null) {
									[indices[firstItemIndex], indices[secondItemIndex]] = [
										indices[secondItemIndex],
										indices[firstItemIndex],
									];

									continue;
								}

								if (isNaN(W.value) && V !== null && !isNaN(V.value)) {
									[indices[firstItemIndex], indices[secondItemIndex]] = [
										indices[secondItemIndex],
										indices[firstItemIndex],
									];

									continue;
								}
							}

							if (valueCompare('gtOp', W, V, dynamicContext)) {
								[indices[firstItemIndex], indices[secondItemIndex]] = [
									indices[secondItemIndex],
									indices[firstItemIndex],
								];
							}
							// Else done
						}
					}

					// For the purpose of determining their relative position in the ordering sequence, the greater-than relationship between two orderspec values W and V is defined as follows:

					// When the orderspec specifies empty least, the following rules are applied in order:
					// 1. If V is an empty sequence and W is not an empty sequence, then W greater-than V is true.
					// 2. If V is NaN and W is neither NaN nor an empty sequence, then W greater-than V is true.
					// 3. If a specific collation C is specified, and V and W are both of type xs:string or are convertible to xs:string by subtype substitution and/or type promotion, then:
					// 4. If fn:compare(V, W, C) is less than zero, then W greater-than V is true; otherwise W greater-than V is false.
					// 5. If none of the above rules apply, then:
					// 6. If W gt V is true, then W greater-than V is true; otherwise W greater-than V is false.

					// When the orderspec specifies empty greatest, the following rules are applied in order:
					// 1. If W is an empty sequence and V is not an empty sequence, then W greater-than V is true.
					// 2. If W is NaN and V is neither NaN nor an empty sequence, then W greater-than V is true.
					// 3. If a specific collation C is specified, and V and W are both of type xs:string or are convertible to xs:string by subtype substitution and/or type promotion, then:
					// 4. If fn:compare(V, W, C) is less than zero, then W greater-than V is true; otherwise W greater-than V is false.
					// 5. If none of the above rules apply, then:
					// 6. If W gt V is true, then W greater-than V is true; otherwise W greater-than V is false.

					// When the orderspec specifies neither empty least nor empty greatest, the default order for empty sequences in the static context determines whether the rules for empty least or empty greatest are used.

					let currentIndex = orderSpec.isAscending ? 0 : values.length - 1;

					// We have an order here.
					// Order the dynamic contexts by the same order and pass them in an iterator to the createReturnSequence
					const returnValue: ISequence = createReturnSequence({
						next: () => {
							if (orderSpec.isAscending) {
								if (currentIndex >= values.length) {
									return DONE_TOKEN;
								}

								return ready(dynamicContexts[indices[currentIndex++]]);
							} else {
								if (currentIndex < 0) {
									return DONE_TOKEN;
								}

								return ready(dynamicContexts[indices[currentIndex--]]);
							}
						},
					});

					returnValueIterator = returnValue.value;

					hasValues = true;
				}

				return returnValueIterator.next(IterationHint.NONE);
			},
		});
	}
}

export default OrderByExpression;

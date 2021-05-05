import DomFacade from '../../domFacade/DomFacade';
import { sortNodeValues } from '../dataTypes/documentOrderUtils';
import ISequence from '../dataTypes/ISequence';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import Value, { BaseType, SequenceType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import createSingleValueIterator from '../util/createSingleValueIterator';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import { concatSortedSequences, mergeSortedSequences } from '../util/sortedSequenceUtils';

function sortResults(domFacade: DomFacade, result: Value[]) {
	let resultContainsNodes = false;
	let resultContainsNonNodes = false;
	result.forEach((resultValue) => {
		if (isSubtypeOf(resultValue.type.kind, BaseType.NODE)) {
			resultContainsNodes = true;
		} else {
			resultContainsNonNodes = true;
		}
	});
	if (resultContainsNonNodes && resultContainsNodes) {
		throw new Error(
			'XPTY0018: The path operator should either return nodes or non-nodes. Mixed sequences are not allowed.'
		);
	}

	if (resultContainsNodes) {
		return sortNodeValues(domFacade, result);
	}
	return result;
}

class PathExpression extends Expression {
	private _requireSortedResults: boolean;
	private _stepExpressions: Expression[];

	constructor(stepExpressions: Expression[], requireSortedResults: boolean) {
		const pathResultsInPeerSequence = stepExpressions.every((selector) => selector.peer);
		const pathResultsInSubtreeSequence = stepExpressions.every((selector) => selector.subtree);
		super(
			stepExpressions.reduce((specificity, selector) => {
				// Implicit AND, so sum
				return specificity.add(selector.specificity);
			}, new Specificity({})),
			stepExpressions,
			{
				canBeStaticallyEvaluated: false,
				peer: pathResultsInPeerSequence,
				resultOrder: requireSortedResults
					? RESULT_ORDERINGS.SORTED
					: RESULT_ORDERINGS.UNSORTED,
				subtree: pathResultsInSubtreeSequence,
			}
		);

		this._stepExpressions = stepExpressions;
		this._requireSortedResults = requireSortedResults;
	}

	public evaluate(dynamicContext: DynamicContext, executionParameters: ExecutionParameters) {
		let sequenceHasPeerProperty = true;
		const result = this._stepExpressions.reduce<ISequence>(
			(intermediateResultNodesSequence, selector) => {
				let childContextIterator: IIterator<DynamicContext>;
				if (intermediateResultNodesSequence === null) {
					// first call, we should use the current dynamic context
					childContextIterator = createSingleValueIterator(dynamicContext);
				} else {
					childContextIterator = dynamicContext.createSequenceIterator(
						intermediateResultNodesSequence
					);
				}
				let resultValuesInOrderOfEvaluation: IIterator<ISequence> = {
					next: (hint: IterationHint) => {
						const childContext = childContextIterator.next(hint);

						if (childContext.done) {
							return DONE_TOKEN;
						}
						if (
							childContext.value.contextItem !== null &&
							!isSubtypeOf(childContext.value.contextItem.type.kind, BaseType.NODE)
						) {
							throw new Error(
								'XPTY0019: The / operator can only be applied to xml/json nodes.'
							);
						}
						return ready(
							selector.evaluateMaybeStatically(
								childContext.value,
								executionParameters
							)
						);
					},
				};
				// Assume nicely sorted
				let sortedResultSequence: ISequence;
				if (!this._requireSortedResults) {
					sortedResultSequence = concatSortedSequences(resultValuesInOrderOfEvaluation);
				} else {
					switch (selector.expectedResultOrder) {
						case RESULT_ORDERINGS.REVERSE_SORTED: {
							const resultValuesInReverseOrder = resultValuesInOrderOfEvaluation;
							resultValuesInOrderOfEvaluation = {
								next: (hint: IterationHint) => {
									const res = resultValuesInReverseOrder.next(hint);
									if (res.done) {
										return res;
									}
									return ready(
										res.value.mapAll((items) =>
											sequenceFactory.create(items.reverse())
										)
									);
								},
							};
							// Fallthrough for merges
						}
						case RESULT_ORDERINGS.SORTED:
							if (selector.subtree && sequenceHasPeerProperty) {
								sortedResultSequence = concatSortedSequences(
									resultValuesInOrderOfEvaluation
								);
								break;
							}
							// Only locally sorted
							sortedResultSequence = mergeSortedSequences(
								executionParameters.domFacade,
								resultValuesInOrderOfEvaluation
							);
							break;
						case RESULT_ORDERINGS.UNSORTED: {
							// The result should be sorted before we can continue
							const concattedSequence = concatSortedSequences(
								resultValuesInOrderOfEvaluation
							);
							return concattedSequence.mapAll((allValues) =>
								sequenceFactory.create(
									sortResults(executionParameters.domFacade, allValues)
								)
							);
						}
					}
				}
				// If this selector returned non-peers, the sequence could be contaminated with ancestor/descendant nodes
				// This makes sorting using concat impossible
				sequenceHasPeerProperty = sequenceHasPeerProperty && selector.peer;
				return sortedResultSequence;
			},
			null
		);

		return result;
	}

	public getBucket() {
		return this._stepExpressions[0].getBucket();
	}
}

export default PathExpression;

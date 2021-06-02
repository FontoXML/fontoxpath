import { AttributeNodePointer, ChildNodePointer, ElementNodePointer } from '../../domClone/Pointer';
import DomFacade from '../../domFacade/DomFacade';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import Value, { ValueType } from '../dataTypes/Value';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { IIterator, IterationHint, ready } from '../util/iterators';
import parseContent from '../xquery/ElementConstructorContent';
import { IPendingUpdate } from './IPendingUpdate';
import {
	insertAfter,
	insertAttributes,
	insertBefore,
	insertInto,
	insertIntoAsFirst,
	insertIntoAsLast,
} from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';
import UpdatingExpression from './UpdatingExpression';
import {
	errXUDY0023,
	errXUDY0024,
	errXUDY0027,
	errXUDY0029,
	errXUDY0030,
	errXUTY0004,
	errXUTY0005,
	errXUTY0006,
	errXUTY0022,
} from './XQueryUpdateFacilityErrors';
const ELEMENT_NODE = 1;

export enum TargetChoice {
	INSERT_AFTER = 1,
	INSERT_BEFORE = 2,
	INSERT_INTO = 3,
	INSERT_INTO_AS_FIRST = 4,
	INSERT_INTO_AS_LAST = 5,
}

function testNamespaceURIForAttribute(
	targetElement: ElementNodePointer,
	attributeNode: AttributeNodePointer,
	namespaceBindings: { [s: string]: string },
	domFacade: DomFacade
): void {
	const prefix = domFacade.getPrefix(attributeNode as any) || '';
	const namespaceURI = domFacade.getNamespaceURI(attributeNode as any);

	// b. No attribute node in $alist may have a QName whose implied namespace binding conflicts with a namespace binding in the "namespaces" property of $target [err:XUDY0023].
	const boundNamespaceURI = prefix
		? (targetElement.node as any).lookupNamespaceURI(prefix)
		: null;
	if (boundNamespaceURI && boundNamespaceURI !== namespaceURI) {
		throw errXUDY0023(namespaceURI);
	}
	// c. Multiple attribute nodes in $alist may not have QNames whose implied namespace bindings conflict with each other [err:XUDY0024].
	const alreadyDeclaredNamespace = namespaceBindings[prefix];
	if (alreadyDeclaredNamespace) {
		if (namespaceURI !== alreadyDeclaredNamespace) {
			throw errXUDY0024(namespaceURI);
		}
	}
}

function buildPendingUpdates(
	targetChoice: TargetChoice,
	target: ElementNodePointer,
	parent: ElementNodePointer,
	alist: AttributeNodePointer[],
	clist: ChildNodePointer[]
) {
	const updates = [];
	switch (targetChoice) {
		// a. If as first into is specified, the pending update list includes the following update primitives:
		case TargetChoice.INSERT_INTO_AS_FIRST:
			// i. If $alist is not empty, upd:insertAttributes($target, $alist)
			if (alist.length) {
				updates.push(insertAttributes(target, alist));
			}
			// ii. If $clist is not empty, upd:insertIntoAsFirst($target, $clist)
			if (clist.length) {
				updates.push(insertIntoAsFirst(target, clist));
			}
			break;
		// b. If as last into is specified, the pending update list includes the following update primitives:
		case TargetChoice.INSERT_INTO_AS_LAST:
			// i. If $alist is not empty, upd:insertAttributes($target, $alist)
			if (alist.length) {
				updates.push(insertAttributes(target, alist));
			}
			// ii. If $clist is not empty, upd:insertIntoAsLast($target, $clist)
			if (clist.length) {
				updates.push(insertIntoAsLast(target, clist));
			}
			break;
		// c. If into is specified with neither as first nor as last, the pending update list includes the following update primitives:
		case TargetChoice.INSERT_INTO:
			// i. If $alist is not empty, upd:insertAttributes($target, $alist)
			if (alist.length) {
				updates.push(insertAttributes(target, alist));
			}
			// ii. If $clist is not empty, upd:insertInto($target, $clist)
			if (clist.length) {
				updates.push(insertInto(target, clist));
			}
			break;
		// d. If before is specified, let $parent be the parent node of $target. The pending update list includes the following update primitives:
		case TargetChoice.INSERT_BEFORE:
			// i. If $alist is not empty, upd:insertAttributes($parent, $alist)
			if (alist.length) {
				updates.push(insertAttributes(parent, alist));
			}
			// ii. If $clist is not empty, upd:insertBefore($target, $clist)
			if (clist.length) {
				updates.push(insertBefore(target, clist));
			}
			break;
		// e. If after is specified, let $parent be the parent node of $target. The pending update list includes the following update primitives:
		case TargetChoice.INSERT_AFTER:
			// i. If $alist is not empty, upd:insertAttributes($parent, $alist)
			if (alist.length) {
				updates.push(insertAttributes(parent, alist));
			}
			// ii. If $clist is not empty, upd:insertAfter($target, $clist)
			if (clist.length) {
				updates.push(insertAfter(target, clist));
			}
			break;
	}
	return updates;
}

class InsertExpression extends UpdatingExpression {
	private _sourceExpression: Expression;
	private _targetChoice: TargetChoice;
	private _targetExpression: Expression;

	constructor(
		sourceExpression: Expression,
		targetChoice: TargetChoice,
		targetExpression: Expression
	) {
		super(new Specificity({}), [sourceExpression, targetExpression], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		this._sourceExpression = sourceExpression;
		this._targetChoice = targetChoice;
		this._targetExpression = targetExpression;
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult> {
		const sourceValueIterator = this.ensureUpdateListWrapper(this._sourceExpression)(
			dynamicContext,
			executionParameters
		);
		const targetValueIterator = this.ensureUpdateListWrapper(this._targetExpression)(
			dynamicContext,
			executionParameters
		);
		const domFacade = executionParameters.domFacade;

		let alist: AttributeNodePointer[];
		let clist: ChildNodePointer[];
		let sourceUpdates: IPendingUpdate[];

		let target: Value;
		let targetUpdates: IPendingUpdate[];
		let parent: ElementNodePointer;
		return {
			next: () => {
				if (!alist) {
					// 1. SourceExpr is evaluated as though it were an enclosed expression in an element constructor (see Rule 1e in Section 3.9.1.3 Content XQ30). The result of this step is either an error or a sequence of nodes to be inserted, called the insertion sequence. If the insertion sequence contains a document node, the document node is replaced in the insertion sequence by its children. If the insertion sequence contains an attribute node following a node that is not an attribute node, a type error is raised [err:XUTY0004].
					const sv = sourceValueIterator.next(IterationHint.NONE);
					const allChildNodes = [sv.value.xdmValue];
					const insertionSequence = parseContent(
						allChildNodes,
						executionParameters,
						errXUTY0004
					);

					// Let $alist be the sequence of attribute nodes in the insertion sequence. Let $clist be the remainder of the insertion sequence, in its original order.
					alist = insertionSequence.attributes.map((attr) => {
						return { node: attr, graftAncestor: null };
					});
					clist = insertionSequence.contentNodes.map((contentNode) => {
						return { node: contentNode, graftAncestor: null };
					});
					sourceUpdates = sv.value.pendingUpdateList;
				}

				if (!target) {
					// 2. TargetExpr is evaluated and checked as follows:
					const tv = targetValueIterator.next(IterationHint.NONE);

					// a. If the result is an empty sequence, [err:XUDY0027] is raised.
					if (tv.value.xdmValue.length === 0) {
						throw errXUDY0027();
					}

					if (this._targetChoice >= TargetChoice.INSERT_INTO) {
						// b. If any form of into is specified, the result must be a single element or document node; any other non-empty result raises a type error [err:XUTY0005].
						if (tv.value.xdmValue.length !== 1) {
							throw errXUTY0005();
						}
						if (
							!isSubtypeOf(tv.value.xdmValue[0].type, ValueType.ELEMENT) &&
							!isSubtypeOf(tv.value.xdmValue[0].type, ValueType.DOCUMENTNODE)
						) {
							throw errXUTY0005();
						}
					} else {
						// c. If before or after is specified, the result must be a single element, text, comment, or processing instruction node; any other non-empty result raises a type error [err:XUTY0006].
						if (tv.value.xdmValue.length !== 1) {
							throw errXUTY0006();
						}
						if (
							!isSubtypeOf(tv.value.xdmValue[0].type, ValueType.ELEMENT) &&
							!isSubtypeOf(tv.value.xdmValue[0].type, ValueType.TEXT) &&
							!isSubtypeOf(tv.value.xdmValue[0].type, ValueType.COMMENT) &&
							!isSubtypeOf(tv.value.xdmValue[0].type, ValueType.PROCESSINGINSTRUCTION)
						) {
							throw errXUTY0006();
						}

						// d. If before or after is specified, the node returned by the target expression must have a non-empty parent property [err:XUDY0029].
						parent = domFacade.getParentNodePointer(
							tv.value.xdmValue[0].value,
							null
						) as ElementNodePointer;
						if (parent === null) {
							throw errXUDY0029(tv.value.xdmValue[0].value);
						}
					}

					// Let $target be the node returned by the target expression.
					target = tv.value.xdmValue[0];
					targetUpdates = tv.value.pendingUpdateList;
				}

				// 3. If $alist is not empty and any form of into is specified, the following checks are performed:
				if (alist.length) {
					if (this._targetChoice >= TargetChoice.INSERT_INTO) {
						// a. $target must be an element node [err:XUTY0022].
						if (!isSubtypeOf(target.type, ValueType.ELEMENT)) {
							throw errXUTY0022();
						}
					} else {
						// a. parent($target) must be an element node [err:XUDY0030].
						if (domFacade.getNodeType(parent) !== ELEMENT_NODE) {
							throw errXUDY0030();
						}
					}

					alist.reduce(
						(namespaceBindings: { [prefix: string]: string }, attributeNode) => {
							const prefix = domFacade.getPrefix(attributeNode as any) || '';

							testNamespaceURIForAttribute(
								target.value,
								attributeNode,
								namespaceBindings,
								domFacade
							);

							namespaceBindings[prefix] = domFacade.getNamespaceURI(
								attributeNode as any
							);
							return namespaceBindings;
						},
						{}
					);
				}

				// 5. The result of the insert expression is an empty XDM instance and a pending update list constructed by merging the pending update lists returned by the SourceExpr and TargetExpr with the following update primitives using upd:mergeUpdates:
				return ready({
					xdmValue: [],
					pendingUpdateList: mergeUpdates(
						buildPendingUpdates(
							this._targetChoice,
							target.value,
							parent ? parent : null,
							alist,
							clist
						),
						sourceUpdates,
						targetUpdates
					),
				});
			},
		};
	}
}

export default InsertExpression;

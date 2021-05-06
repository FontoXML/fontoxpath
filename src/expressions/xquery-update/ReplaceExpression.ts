import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import isSubtypeOf from '../dataTypes/isSubtypeOf';
import sequenceFactory from '../dataTypes/sequenceFactory';
import { SequenceType } from '../dataTypes/Value';
import { BaseType } from '../dataTypes/BaseType';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import Expression, { RESULT_ORDERINGS } from '../Expression';
import Specificity from '../Specificity';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { DONE_TOKEN, IIterator, IterationHint, ready } from '../util/iterators';
import parseContent from '../xquery/ElementConstructorContent';
import { errXQDY0026, errXQDY0072 } from '../xquery/XQueryErrors';
import { replaceElementContent, replaceNode, replaceValue } from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';
import UpdatingExpression from './UpdatingExpression';
import {
	errXUDY0009,
	errXUDY0023,
	errXUDY0024,
	errXUDY0027,
	errXUTY0008,
	errXUTY0010,
	errXUTY0011,
} from './XQueryUpdateFacilityErrors';

function evaluateReplaceNode(
	executionParameters: ExecutionParameters,
	targetValueIterator: IIterator<UpdatingExpressionResult>,
	replacementValueIterator: IIterator<UpdatingExpressionResult>
) {
	const domFacade = executionParameters.domFacade;
	let rlist;
	let rlistUpdates;
	let parent;
	return {
		next: () => {
			if (!rlist) {
				// The expression following the keyword with is
				// evaluated as though it were an enclosed
				// expression in an element constructor (see Rule
				// 1e in Section 3.9.1.3 Content XQ30).

				const rl = replacementValueIterator.next(IterationHint.NONE);
				// Let $rlist be the node sequence that results
				// from this evaluation. If $rlist contains a document node, the
				// document node is replaced in $rlist by its
				// children.
				const allChildNodes = [rl.value.xdmValue];
				const parsedContent = parseContent(allChildNodes, executionParameters, errXUDY0024);
				rlist = {
					attributes: parsedContent.attributes.map((attr) => {
						return { node: attr, graftAncestor: null };
					}),
					contentNodes: parsedContent.contentNodes.map((contentNode) => {
						return { node: contentNode, graftAncestor: null };
					}),
				};
				rlistUpdates = rl.value.pendingUpdateList;
			}

			// TargetExpr is evaluated and checked as follows:
			const tv = targetValueIterator.next(IterationHint.NONE);
			// If the result is an empty sequence,
			// [err:XUDY0027] is raised.
			if (tv.value.xdmValue.length === 0) {
				throw errXUDY0027();
			}

			// If the result is non-empty and does not consist
			// of a single element, attribute, text, comment,
			// or processing instruction node, [err:XUTY0008]
			// is raised.
			if (tv.value.xdmValue.length !== 1) {
				throw errXUTY0008();
			}
			if (
				!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.ELEMENT) &&
				!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.ATTRIBUTE) &&
				!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.TEXT) &&
				!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.COMMENT) &&
				!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.PROCESSINGINSTRUCTION)
			) {
				throw errXUTY0008();
			}

			// If the result consists of a node whose parent
			// property is empty, [err:XUDY0009] is raised.
			parent = executionParameters.domFacade.getParentNodePointer(
				tv.value.xdmValue[0].value,
				null
			);
			if (parent === null) {
				throw errXUDY0009(tv.value.xdmValue[0].value);
			}

			// Let $target be the node returned by the target
			// expression, and let $parent be its parent node.
			const target = tv.value.xdmValue[0];
			const targetUpdates = tv.value.pendingUpdateList;

			// If $target is an element, text, comment, or
			// processing instruction node, then $rlist must
			// consist exclusively of zero or more element, text,
			// comment, or processing instruction nodes
			// [err:XUTY0010].
			if (!isSubtypeOf(target.type.kind, BaseType.ATTRIBUTE)) {
				if (rlist.attributes.length) {
					throw errXUTY0010();
				}
			} else {
				// If $target is an attribute node, then:

				// $rlist must consist exclusively of zero or more
				// attribute nodes [err:XUTY0011].
				if (rlist.contentNodes.length) {
					throw errXUTY0011();
				}

				rlist.attributes.reduce((namespaceBindings, attributePointer) => {
					const prefix = domFacade.getPrefix(attributePointer) || '';
					const namespaceURI = domFacade.getNamespaceURI(attributePointer);

					// No attribute node in $rlist may have a QName
					// whose implied namespace binding conflicts with
					// a namespace binding in the "namespaces"
					// property of $parent [err:XUDY0023].
					const boundNamespaceURI = parent.node.lookupNamespaceURI(prefix);
					if (boundNamespaceURI && boundNamespaceURI !== namespaceURI) {
						throw errXUDY0023(namespaceURI);
					}

					// Multiple attribute nodes in $rlist may not have
					// QNames whose implied namespace bindings
					// conflict with each other [err:XUDY0024].
					const alreadyDeclaredNamespace = namespaceBindings[prefix];
					if (alreadyDeclaredNamespace) {
						if (namespaceURI !== alreadyDeclaredNamespace) {
							throw errXUDY0024(namespaceURI);
						}
					}

					namespaceBindings[prefix] = namespaceURI;
					return namespaceBindings;
				}, {});
			}

			// The result of the replace expression is an empty
			// XDM instance and a pending update list constructed
			// by merging the pending update lists returned by the
			// TargetExpr and the expression following the keyword
			// with with the following update primitives using
			// upd:mergeUpdates: upd:replaceNode($target, $rlist)
			return ready({
				xdmValue: [],
				pendingUpdateList: mergeUpdates(
					[replaceNode(target.value, rlist.attributes.concat(rlist.contentNodes))],
					rlistUpdates,
					targetUpdates
				),
			});
		},
	};
}

function evaluateReplaceNodeValue(
	executionParameters: ExecutionParameters,
	targetValueIterator: IIterator<UpdatingExpressionResult>,
	replacementValueIterator: IIterator<UpdatingExpressionResult>
) {
	let target;
	let targetUpdates;
	let text;
	let rlistUpdates;
	let done = false;
	return {
		next: () => {
			if (done) {
				return DONE_TOKEN;
			}

			if (!text) {
				// The expression following the keyword with is
				// evaluated as though it were the content expression
				// of a text node constructor (see Section 3.7.3.4 of
				// [XQuery 3.0: An XML Query Language].)

				const rl = replacementValueIterator.next(IterationHint.NONE);
				// The result of this step, in the absence of errors,
				// is either a single text node or an empty sequence.
				// Let $text be the result of this step.
				const atomized = atomize(
					sequenceFactory.create(rl.value.xdmValue),
					executionParameters
				).map((value) =>
					castToType(value, {
						kind: BaseType.XSSTRING,
						seqType: SequenceType.EXACTLY_ONE,
					})
				);

				const textContent = atomized
					.getAllValues()
					.map((value) => value.value)
					.join(' ');
				text =
					textContent.length === 0
						? null
						: {
								node: executionParameters.nodesFactory.createTextNode(textContent),
								graftAncestor: null,
						  };
				rlistUpdates = rl.value.pendingUpdateList;
			}

			if (!target) {
				// TargetExpr is evaluated and checked as follows:
				const tv = targetValueIterator.next(IterationHint.NONE);
				// If the result is an empty sequence,
				// [err:XUDY0027] is raised.
				if (tv.value.xdmValue.length === 0) {
					throw errXUDY0027();
				}

				// If the result is non-empty and does not consist
				// of a single element, attribute, text, comment,
				// or processing instruction node, [err:XUTY0008]
				// is raised.
				if (tv.value.xdmValue.length !== 1) {
					throw errXUTY0008();
				}
				if (
					!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.ELEMENT) &&
					!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.ATTRIBUTE) &&
					!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.TEXT) &&
					!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.COMMENT) &&
					!isSubtypeOf(tv.value.xdmValue[0].type.kind, BaseType.PROCESSINGINSTRUCTION)
				) {
					throw errXUTY0008();
				}

				// Let $target be the node returned by the target
				// expression.
				target = tv.value.xdmValue[0];
				targetUpdates = tv.value.pendingUpdateList;
			}

			// If $target is an element node, the result of the
			// replace expression is an empty XDM instance and a
			// pending update list constructed by merging the pending
			// update lists returned by the TargetExpr and the
			// expression following the keyword with with the
			// following update primitives using upd:mergeUpdates:
			// upd:replaceElementContent($target, $text)
			if (isSubtypeOf(target.type.kind, BaseType.ELEMENT)) {
				done = true;
				return ready({
					xdmValue: [],
					pendingUpdateList: mergeUpdates(
						[replaceElementContent(target.value, text)],
						rlistUpdates,
						targetUpdates
					),
				});
			}

			// If $target is an attribute, text, comment, or
			// processing instruction node, let $string be the string
			// value of the text node constructed in Step 1. If Step
			// 1 did not construct a text node, let $string be a
			// zero-length string. Then:
			if (
				isSubtypeOf(target.type.kind, BaseType.ATTRIBUTE) ||
				isSubtypeOf(target.type.kind, BaseType.TEXT) ||
				isSubtypeOf(target.type.kind, BaseType.COMMENT) ||
				isSubtypeOf(target.type.kind, BaseType.PROCESSINGINSTRUCTION)
			) {
				const stringValue = text
					? executionParameters.domFacade.getDataFromPointer(text)
					: '';

				// If $target is a comment node, and $string contains
				// two adjacent hyphens or ends with a hyphen, a
				// dynamic error is raised [err:XQDY0072].
				if (
					isSubtypeOf(target.type.kind, BaseType.COMMENT) &&
					(stringValue.includes('--') || stringValue.endsWith('-'))
				) {
					throw errXQDY0072(stringValue);
				}

				// If $target is a processing instruction node, and
				// $string contains the substring "?>", a dynamic
				// error is raised [err:XQDY0026].
				if (
					isSubtypeOf(target.type.kind, BaseType.PROCESSINGINSTRUCTION) &&
					stringValue.includes('?>')
				) {
					throw errXQDY0026(stringValue);
				}

				// In the absence of errors, the result of a replace
				// expression is an empty XDM instance and a pending
				// update list constructed by merging the pending
				// update lists returned by the TargetExpr and the
				// expression following the keyword with with the
				// following update primitives using
				// upd:mergeUpdates: upd:replaceValue($target,
				// $string).
				done = true;
				return ready({
					xdmValue: [],
					pendingUpdateList: mergeUpdates(
						[replaceValue(target.value, stringValue)],
						rlistUpdates,
						targetUpdates
					),
				});
			}
		},
	};
}

class ReplaceExpression extends UpdatingExpression {
	private _replacementExpression: Expression;
	private _targetExpression: Expression;
	private _valueOf: boolean;

	constructor(valueOf: boolean, targetExpression: Expression, replacementExpression: Expression) {
		super(new Specificity({}), [targetExpression, replacementExpression], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		this._valueOf = valueOf;
		this._targetExpression = targetExpression;
		this._replacementExpression = replacementExpression;
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IIterator<UpdatingExpressionResult> {
		const targetValueIterator = this.ensureUpdateListWrapper(this._targetExpression)(
			dynamicContext,
			executionParameters
		);
		const replacementValueIterator = this.ensureUpdateListWrapper(this._replacementExpression)(
			dynamicContext,
			executionParameters
		);

		return this._valueOf
			? evaluateReplaceNodeValue(
					executionParameters,
					targetValueIterator,
					replacementValueIterator
			  )
			: evaluateReplaceNode(
					executionParameters,
					targetValueIterator,
					replacementValueIterator
			  );
	}
}

export default ReplaceExpression;

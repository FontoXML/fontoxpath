import Expression from '../Expression';
import Specificity from '../Specificity';

import Sequence from '../dataTypes/Sequence';
import { replaceNode } from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';

import { DONE_TOKEN, ready } from '../util/iterators';
import isSubTypeOf from '../dataTypes/isSubtypeOf';

import {
	errXUTY0008,
	errXUDY0009,
	errXUTY0010,
	errXUTY0011,
	errXUDY0024,
	errXUDY0027
} from './XQueryUpdateFacilityErrors';

function ensureUpdateListWrapper (expression) {
	if (expression.isUpdating) {
		return (dynamicContext, executionParameters) => expression.evaluateWithUpdateList(dynamicContext, executionParameters);
	}

	return (dynamicContext, executionParameters) => {
		const sequence = expression.evaluate(dynamicContext, executionParameters);
		let done = false;
		return {
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				const allValues = sequence.tryGetAllValues();
				if (!allValues.ready) {
					return allValues;
				}
				done = true;
				return ready({
					pendingUpdates: [],
					xdmValue: allValues.value
				});
			}
		};
	};
}

/**
 * @extends     {Expression}
 * @implements  {UpdatingExpression}
 */
class ReplaceNodeExpression extends Expression {
	/**
	 * @param  {boolean} valueOf
	 * @param  {!Expression} targetExpression
	 * @param  {!Expression} replacementExpression
	 */
	constructor (valueOf, targetExpression, replacementExpression) {
		super(
			new Specificity({}),
			[targetExpression, replacementExpression],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._valueOf = valueOf;
		this._targetExpression = targetExpression;
		this._replacementExpression = replacementExpression;
		this.isUpdating = true;
	}

	evaluateWithUpdateList (dynamicContext, executionParameters) {
		const targetValueIterator = ensureUpdateListWrapper(this._targetExpression)(dynamicContext, executionParameters);
		const replacementValueIterator = ensureUpdateListWrapper(this._replacementExpression)(dynamicContext, executionParameters);
		let target;
		let targetUpdates;
		let rlist;
		let rlistUpdates;
		let parent;
		let done = false;
		return {
			next: () => {
				if (done) {
					return DONE_TOKEN;
				}
				if (!rlist) {
					// The expression following the keyword with is
					// evaluated as though it were an enclosed
					// expression in an element constructor (see Rule
					// 1e in Section 3.9.1.3 Content XQ30).

					const rl = replacementValueIterator.next();
					if (!rl.ready) {
						return rl;
					}
					// Let $rlist be the node sequence that results
					// from this evaluation.
					rlist = rl.value.xdmValue;
					rlistUpdates = rl.value.pendingUpdates;

					// If $rlist contains a document node, the
					// document node is replaced in $rlist by its
					// children.
					for (let i = 0; i < rlist.length; ++i) {
						if (isSubTypeOf(rlist[i].type, 'document-node()')) {
							rlist.splice.apply(rlist, [i, 1].concat(executionParameters.getChildNodes(rlist[i])));
							--i;
						}
					}
				}

				if (!target) {
					// TargetExpr is evaluated and checked as follows:
					const tv = targetValueIterator.next();
					if (!tv.ready) {
						return tv;
					}
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
					if (!isSubTypeOf(tv.xdmValue[0].type, 'element()') &&
						!isSubTypeOf(tv.xdmValue[0].type, 'attribute()') &&
						!isSubTypeOf(tv.xdmValue[0].type, 'text()') &&
						!isSubTypeOf(tv.xdmValue[0].type, 'comment()') &&
						!isSubTypeOf(tv.xdmValue[0].type, 'processing-instruction()')) {
						throw errXUTY0008();
					}

					// If the result consists of a node whose parent
					// property is empty, [err:XUDY0009] is raised.
					parent = executionParameters.domFacade.getParentNode(tv.xdmValue[0].value);
					if (parent === null) {
						throw errXUDY0009();
					}

					// Let $target be the node returned by the target
					// expression, and let $parent be its parent node.
					target = tv.value.xdmValue[0];
					targetUpdates = tv.value.pendingUpdates;
				}
				// If $target is an element, text, comment, or
				// processing instruction node, then $rlist must
				// consist exclusively of zero or more element, text,
				// comment, or processing instruction nodes
				// [err:XUTY0010].
				if (!isSubTypeOf(target.type, 'attribute()')) {
					if (rlist.some(
						node =>
							!isSubTypeOf(node.type, 'element()') ||
							!isSubTypeOf(node.type, 'text()') ||
							!isSubTypeOf(node.type, 'comment()') ||
							!isSubTypeOf(node.type, 'processing-instruction()'))) {
						throw errXUTY0010();
					}
				}
				else {
					// If $target is an attribute node, then:

					// $rlist must consist exclusively of zero or more
					// attribute nodes [err:XUTY0011].
					if (rlist.some(node => !isSubTypeOf(node.type, 'attribute()'))) {
						throw errXUTY0011();
					}

					// No attribute node in $rlist may have a QName
					// whose implied namespace binding conflicts with
					// a namespace binding in the "namespaces"
					// property of $parent [err:XUDY0023].

					// TODO

					// Multiple attribute nodes in $rlist may not have
					// QNames whose implied namespace bindings
					// conflict with each other [err:XUDY0024].
					rlist.reduce((namespaceBindings, attributeNode) => {
						const prefix = attributeNode.value.prefix || '';
						const alreadyDeclaredNamespace = namespaceBindings[prefix];
						if (alreadyDeclaredNamespace !== null) {
							if (attributeNode.value.namespaceURI !== alreadyDeclaredNamespace) {
								throw errXUDY0024();
							}
						}

						namespaceBindings[prefix] = attributeNode.value.namespaceURI;
						return namespaceBindings;
					});
				}

				// The result of the replace expression is an empty
				// XDM instance and a pending update list constructed
				// by merging the pending update lists returned by the
				// TargetExpr and the expression following the keyword
				// with with the following update primitives using
				// upd:mergeUpdates: upd:replaceNode($target, $rlist)
				done = true;
				return ready({
					value: Sequence.empty(),
					pendingUpdateList: mergeUpdates(
						replaceNode(target, rlist),
						rlistUpdates,
						targetUpdates)
				});
			}
		};
	}
}

export default ReplaceNodeExpression;

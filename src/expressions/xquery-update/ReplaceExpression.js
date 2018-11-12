import Expression from '../Expression';
import UpdatingExpression from '../UpdatingExpression';
import Specificity from '../Specificity';

import Sequence from '../dataTypes/Sequence';
import { replaceElementContent, replaceNode, replaceValue } from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';

import { DONE_TOKEN, ready } from '../util/iterators';
import atomize from '../dataTypes/atomize';
import castToType from '../dataTypes/castToType';
import isSubTypeOf from '../dataTypes/isSubtypeOf';
import parseContent from '../ElementConstructorContent';

import {
	errXQDY0026,
	errXQDY0072
} from '../xquery/XQueryErrors';

import {
	errXUTY0008,
	errXUDY0009,
	errXUTY0010,
	errXUTY0011,
	errXUDY0024,
	errXUDY0027
} from './XQueryUpdateFacilityErrors';

function ensureUpdateListWrapper (expression) {
	if (expression instanceof UpdatingExpression) {
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

function evaluateReplaceNode (executionParameters, targetValueIterator, replacementValueIterator) {
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
				const allChildNodes = [rl.value.xdmValue];
				rlist = parseContent(allChildNodes, executionParameters);
				rlistUpdates = rl.value.pendingUpdates;

				// If $rlist contains a document node, the
				// document node is replaced in $rlist by its
				// children.
				for (let i = 0; i < rlist.contentNodes.length; ++i) {
					if (rlist.contentNodes[i].nodeType === rlist.contentNodes[i].DOCUMENT_NODE) {
						rlist.contentNodes.splice.apply(rlist.contentNodes, [i, 1].concat(executionParameters.domFacade.getChildNodes(rlist.contentNodes[i])));
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
				if (!isSubTypeOf(tv.value.xdmValue[0].type, 'element()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'attribute()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'text()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'comment()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'processing-instruction()')) {
					throw errXUTY0008();
				}

				// If the result consists of a node whose parent
				// property is empty, [err:XUDY0009] is raised.
				parent = executionParameters.domFacade.getParentNode(tv.value.xdmValue[0].value);
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
				if (rlist.attributes.length) {
					throw errXUTY0010();
				}
			}
			else {
				// If $target is an attribute node, then:

				// $rlist must consist exclusively of zero or more
				// attribute nodes [err:XUTY0011].
				if (rlist.contentNodes.length) {
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
				rlist.attributes.reduce((namespaceBindings, attributeNode) => {
					const prefix = attributeNode.prefix || '';
					const alreadyDeclaredNamespace = namespaceBindings[prefix];
					if (alreadyDeclaredNamespace) {
						if (attributeNode.namespaceURI !== alreadyDeclaredNamespace) {
							throw errXUDY0024();
						}
					}

					namespaceBindings[prefix] = attributeNode.namespaceURI;
					return namespaceBindings;
				}, []);
			}

			// The result of the replace expression is an empty
			// XDM instance and a pending update list constructed
			// by merging the pending update lists returned by the
			// TargetExpr and the expression following the keyword
			// with with the following update primitives using
			// upd:mergeUpdates: upd:replaceNode($target, $rlist)
			done = true;
			return ready({
				value: [],
				pendingUpdateList: mergeUpdates(
					[replaceNode(target.value, rlist.attributes.concat(rlist.contentNodes))],
					rlistUpdates,
					targetUpdates)
			});
		}
	};
}

function evaluateReplaceNodeValue (executionParameters, targetValueIterator, replacementValueIterator) {
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

				const rl = replacementValueIterator.next();
				if (!rl.ready) {
					return rl;
				}
				// The result of this step, in the absence of errors,
				// is either a single text node or an empty sequence.
				// Let $text be the result of this step.
				const atomized = rl.value.xdmValue.map(value => castToType(atomize(value, executionParameters), 'xs:string'));

				text = atomized.length === 0 ?
					null :
					executionParameters.nodesFactory.createTextNode(atomized.map(value => value.value).join(' '));
				rlistUpdates = rl.value.pendingUpdates;
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
				if (!isSubTypeOf(tv.value.xdmValue[0].type, 'element()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'attribute()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'text()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'comment()') &&
					!isSubTypeOf(tv.value.xdmValue[0].type, 'processing-instruction()')) {
					throw errXUTY0008();
				}

				// Let $target be the node returned by the target
				// expression.
				target = tv.value.xdmValue[0];
				targetUpdates = tv.value.pendingUpdates;
			}

			// If $target is an element node, the result of the
			// replace expression is an empty XDM instance and a
			// pending update list constructed by merging the pending
			// update lists returned by the TargetExpr and the
			// expression following the keyword with with the
			// following update primitives using upd:mergeUpdates:
			// upd:replaceElementContent($target, $text)
			if (isSubTypeOf(target.type, 'element()')) {
				done = true;
				return ready({
					value: [],
					pendingUpdateList: mergeUpdates(
						[replaceElementContent(target.value, text)],
						rlistUpdates,
						targetUpdates)
				});
			}

			// If $target is an attribute, text, comment, or
			// processing instruction node, let $string be the string
			// value of the text node constructed in Step 1. If Step
			// 1 did not construct a text node, let $string be a
			// zero-length string. Then:
			if (isSubTypeOf(target.type, 'attribute()') ||
				isSubTypeOf(target.type, 'text()') ||
				isSubTypeOf(target.type, 'comment()') ||
				isSubTypeOf(target.type, 'processing-instruction()')) {
				const string = text ? text.data : '';

				// If $target is a comment node, and $string contains
				// two adjacent hyphens or ends with a hyphen, a
				// dynamic error is raised [err:XQDY0072].
				if (isSubTypeOf(target.type, 'comment()') && (string.includes('--') || string.endsWith('-'))) {
					throw errXQDY0072();
				}

				// If $target is a processing instruction node, and
				// $string contains the substring "?>", a dynamic
				// error is raised [err:XQDY0026].
				if (isSubTypeOf(target.target, 'processing-instruction()') && string.includes('?>')) {
					throw errXQDY0026();
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
					value: [],
					pendingUpdateList: mergeUpdates(
						[replaceValue(target.value, string)],
						rlistUpdates,
						targetUpdates)
				});
			}
		}
	};
}

/**
 * @extends     {UpdatingExpression}
 */
class ReplaceNodeExpression extends UpdatingExpression {
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
	}

	evaluateWithUpdateList (dynamicContext, executionParameters) {
		const targetValueIterator = ensureUpdateListWrapper(this._targetExpression)(dynamicContext, executionParameters);
		const replacementValueIterator = ensureUpdateListWrapper(this._replacementExpression)(dynamicContext, executionParameters);

		return this._valueOf ?
			evaluateReplaceNodeValue(executionParameters, targetValueIterator, replacementValueIterator) :
			evaluateReplaceNode(executionParameters, targetValueIterator, replacementValueIterator);
	}
}

export default ReplaceNodeExpression;

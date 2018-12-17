import Expression from '../Expression';
import UpdatingExpression from './UpdatingExpression';
import Specificity from '../Specificity';

import { rename } from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';

import { evaluateNCNameExpression, evaluateQNameExpression } from '../xquery/nameExpressions';
import { ready } from '../util/iterators';
import isSubTypeOf from '../dataTypes/isSubtypeOf';
import QName from '../dataTypes/valueTypes/QName';

import {
	errXUTY0012,
	errXUDY0023,
	errXUDY0027
} from './XQueryUpdateFacilityErrors';
import Sequence from '../dataTypes/Sequence';

function evaluateTarget (targetXdmValue) {
	// TargetExpr is evaluated and checked as follows:

	// If the result is an empty sequence,
	// [err:XUDY0027] is raised.
	if (targetXdmValue.length === 0) {
		throw errXUDY0027();
	}

	// If the result is non-empty and does not consist of a single element, attribute, or processing instruction node, [err:XUTY0012] is raised.
	if (targetXdmValue.length !== 1) {
		throw errXUTY0012();
	}
	if (!isSubTypeOf(targetXdmValue[0].type, 'element()') &&
		!isSubTypeOf(targetXdmValue[0].type, 'attribute()') &&
		!isSubTypeOf(targetXdmValue[0].type, 'processing-instruction()')) {
		throw errXUTY0012();
	}

	// Let $target be the node returned by the target expression.
	return targetXdmValue[0];
}

function evaluateNewName (staticContext, executionParameters, newNameXdmValue, target) {
	// NewNameExpr is processed as follows:
	const nameSequence = new Sequence(newNameXdmValue);

	switch (target.type) {
		case 'element()': {
			// If $target is an element node, let $QName be the result of evaluating NewNameExpr as though it were the name expression of a computed element constructor (see Section 3.9.3.1 Computed Element Constructors XQ30).
			const qName = evaluateQNameExpression(staticContext, executionParameters, nameSequence);

			// If the namespace binding of $QName conflicts with any namespace binding in the namespaces property of $target, a dynamic error is raised [err:XUDY0023].
			const boundNamespaceURI = target.value.lookupNamespaceURI(qName.prefix);
			if (boundNamespaceURI && boundNamespaceURI !== qName.namespaceURI) {
				throw errXUDY0023(qName.namespaceURI);
			}

			return qName;
		}
		case 'attribute()' : {
			// If $target is an attribute node, let $QName be the result of evaluating NewNameExpr as though it were the name expression of a computed attribute constructor (see Section 3.9.3.2 Computed Attribute Constructors XQ30).
			const qName = evaluateQNameExpression(staticContext, executionParameters, nameSequence);

			// If $QName has a non-absent namespace URI, and if the namespace binding of $QName conflicts with any namespace binding in the namespaces property of the parent (if any) of $target, a dynamic error is raised [err:XUDY0023].
			if (qName.namespaceURI) {
				const boundNamespaceURI = target.value.lookupNamespaceURI(qName.prefix);
				if (boundNamespaceURI && boundNamespaceURI !== qName.namespaceURI) {
					throw errXUDY0023(qName.namespaceURI);
				}
			}

			return qName;
		}
		case 'processing-instruction()' : {
			// If $target is a processing instruction node, let $NCName be the result of evaluating NewNameExpr as though it were the name expression of a computed processing instruction constructor (see Section 3.9.3.5 Computed Processing Instruction Constructors XQ30),
			const nCName = evaluateNCNameExpression(executionParameters, nameSequence);

			// and let $QName be defined as fn:QName((), $NCName).
			return new QName('', null, nCName);
		}
	}
}

/**
 * @extends     {UpdatingExpression}
 */
class RenameExpression extends UpdatingExpression {
	/**
	 * @param  {!Expression} targetExpression
	 * @param  {!Expression} newNameExpression
	 */
	constructor (targetExpression, newNameExpression) {
		super(
			new Specificity({}),
			[targetExpression, newNameExpression],
			{
				canBeStaticallyEvaluated: false,
				resultOrder: Expression.RESULT_ORDERINGS.UNSORTED
			});

		this._targetExpression = targetExpression;
		this._newNameExpression = newNameExpression;
		this._staticContext = undefined;
	}

	performStaticEvaluation (staticContext) {
		this._staticContext = staticContext.cloneContext();
		super.performStaticEvaluation(staticContext);
	}

	evaluateWithUpdateList (dynamicContext, executionParameters) {
		const targetValueIterator = super.ensureUpdateListWrapper(this._targetExpression)(dynamicContext, executionParameters);
		const newNameValueIterator = super.ensureUpdateListWrapper(this._newNameExpression)(dynamicContext, executionParameters);

		return {
			next: () => {
				const tv = targetValueIterator.next();
				if (!tv.ready) {
					return tv;
				}
				const target = evaluateTarget(tv.value.xdmValue);

				const nnv = newNameValueIterator.next();
				if (!nnv.ready) {
					return nnv;
				}
				const qName = evaluateNewName(this._staticContext, executionParameters, nnv.value.xdmValue, target);

				// The result of the rename expression is an empty XDM instance and a pending update list constructed by merging the pending update lists returned by the NewNameExpr and TargetExpr with the following update primitives using upd:mergeUpdates: upd:rename($target, $QName).
				return ready({
					xdmValue: [],
					pendingUpdateList: mergeUpdates([rename(target.value, qName)], tv.value.pendingUpdateList, nnv.value.pendingUpdateList)
				});
			}
		};
	}
}

export default RenameExpression;

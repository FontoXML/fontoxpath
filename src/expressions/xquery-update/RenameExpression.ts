import Expression, { RESULT_ORDERINGS } from '../Expression';

import Specificity from '../Specificity';
import UpdatingExpression from './UpdatingExpression';

import { rename } from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';

import isSubtypeOf from '../dataTypes/isSubtypeOf';
import QName from '../dataTypes/valueTypes/QName';
import { IAsyncIterator, IterationHint, ready } from '../util/iterators';
import { evaluateNCNameExpression, evaluateQNameExpression } from '../xquery/nameExpression';

import sequenceFactory from '../dataTypes/sequenceFactory';
import DynamicContext from '../DynamicContext';
import ExecutionParameters from '../ExecutionParameters';
import UpdatingExpressionResult from '../UpdatingExpressionResult';
import { errXUDY0023, errXUDY0027, errXUTY0012 } from './XQueryUpdateFacilityErrors';

function evaluateTarget(targetXdmValue) {
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
	if (
		!isSubtypeOf(targetXdmValue[0].type, 'element()') &&
		!isSubtypeOf(targetXdmValue[0].type, 'attribute()') &&
		!isSubtypeOf(targetXdmValue[0].type, 'processing-instruction()')
	) {
		throw errXUTY0012();
	}

	// Let $target be the node returned by the target expression.
	return targetXdmValue[0];
}

function evaluateNewName(staticContext, executionParameters, newNameXdmValue, target) {
	// NewNameExpr is processed as follows:
	const nameSequence = sequenceFactory.create(newNameXdmValue);

	switch (target.type) {
		case 'element()': {
			// If $target is an element node, let $QName be the result of evaluating NewNameExpr as though it were the name expression of a computed element constructor (see Section 3.9.3.1 Computed Element Constructors XQ30).
			const qName = evaluateQNameExpression(
				staticContext,
				executionParameters,
				nameSequence
			).next(IterationHint.NONE).value.value;

			// If the namespace binding of $QName conflicts with any namespace binding in the namespaces property of $target, a dynamic error is raised [err:XUDY0023].
			const boundNamespaceURI = target.value.node.lookupNamespaceURI(qName.prefix);
			if (boundNamespaceURI && boundNamespaceURI !== qName.namespaceURI) {
				throw errXUDY0023(qName.namespaceURI);
			}

			return qName;
		}
		case 'attribute()': {
			// If $target is an attribute node, let $QName be the result of evaluating NewNameExpr as though it were the name expression of a computed attribute constructor (see Section 3.9.3.2 Computed Attribute Constructors XQ30).
			const qName = evaluateQNameExpression(
				staticContext,
				executionParameters,
				nameSequence
			).next(IterationHint.NONE).value.value;

			// If $QName has a non-absent namespace URI, and if the namespace binding of $QName conflicts with any namespace binding in the namespaces property of the parent (if any) of $target, a dynamic error is raised [err:XUDY0023].
			if (qName.namespaceURI) {
				const boundNamespaceURI = target.value.node.lookupNamespaceURI(qName.prefix);
				if (boundNamespaceURI && boundNamespaceURI !== qName.namespaceURI) {
					throw errXUDY0023(qName.namespaceURI);
				}
			}

			return qName;
		}
		case 'processing-instruction()': {
			// If $target is a processing instruction node, let $NCName be the result of evaluating NewNameExpr as though it were the name expression of a computed processing instruction constructor (see Section 3.9.3.5 Computed Processing Instruction Constructors XQ30),
			const nCName = evaluateNCNameExpression(executionParameters, nameSequence).next(
				IterationHint.NONE
			).value.value;

			// and let $QName be defined as fn:QName((), $NCName).
			return new QName('', null, nCName);
		}
	}
}

class RenameExpression extends UpdatingExpression {
	private _newNameExpression: Expression;
	private _staticContext: any;
	private _targetExpression: Expression;

	constructor(targetExpression: Expression, newNameExpression: Expression) {
		super(new Specificity({}), [targetExpression, newNameExpression], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED,
		});

		this._targetExpression = targetExpression;
		this._newNameExpression = newNameExpression;
		this._staticContext = undefined;
	}

	public evaluateWithUpdateList(
		dynamicContext: DynamicContext,
		executionParameters: ExecutionParameters
	): IAsyncIterator<UpdatingExpressionResult> {
		const targetValueIterator = this.ensureUpdateListWrapper(this._targetExpression)(
			dynamicContext,
			executionParameters
		);
		const newNameValueIterator = this.ensureUpdateListWrapper(this._newNameExpression)(
			dynamicContext,
			executionParameters
		);

		return {
			next: () => {
				const tv = targetValueIterator.next(IterationHint.NONE);
				if (!tv.ready) {
					return tv;
				}
				const target = evaluateTarget(tv.value.xdmValue);

				const nnv = newNameValueIterator.next(IterationHint.NONE);
				if (!nnv.ready) {
					return nnv;
				}
				const qName = evaluateNewName(
					this._staticContext,
					executionParameters,
					nnv.value.xdmValue,
					target
				);

				// The result of the rename expression is an empty XDM instance and a pending update list constructed by merging the pending update lists returned by the NewNameExpr and TargetExpr with the following update primitives using upd:mergeUpdates: upd:rename($target, $QName).
				return ready({
					xdmValue: [],
					pendingUpdateList: mergeUpdates(
						[rename(target.value, qName)],
						tv.value.pendingUpdateList,
						nnv.value.pendingUpdateList
					),
				});
			},
		};
	}

	public performStaticEvaluation(staticContext) {
		this._staticContext = staticContext.cloneContext();
		super.performStaticEvaluation(staticContext);
	}
}

export default RenameExpression;

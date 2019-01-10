import Expression, { RESULT_ORDERINGS } from '../Expression';

import UpdatingExpression from './UpdatingExpression';
import Specificity from '../Specificity';

import { deletePu } from './pulPrimitives';
import { mergeUpdates } from './pulRoutines';

import { ready } from '../util/iterators';
import isSubTypeOf from '../dataTypes/isSubtypeOf';

import { errXUTY0007 } from './XQueryUpdateFacilityErrors';

class DeleteExpression extends UpdatingExpression {
	_targetExpression: Expression;

	constructor(targetExpression: Expression) {
		super(new Specificity({}), [targetExpression], {
			canBeStaticallyEvaluated: false,
			resultOrder: RESULT_ORDERINGS.UNSORTED
		});

		this._targetExpression = targetExpression;
	}

	evaluateWithUpdateList(dynamicContext, executionParameters) {
		const targetValueIterator = super.ensureUpdateListWrapper(this._targetExpression)(
			dynamicContext,
			executionParameters
		);
		const domFacade = executionParameters.domFacade;

		let tlist, tlistUpdates;
		return {
			next: () => {
				if (!tlist) {
					// 1. TargetExpr is evaluated.
					const tv = targetValueIterator.next();
					if (!tv.ready) {
						return tv;
					}

					// The result must be a sequence of zero or more nodes; otherwise a type error is raised [err:XUTY0007].
					if (tv.value.xdmValue.some(entry => !isSubTypeOf(entry.type, 'node()'))) {
						throw errXUTY0007();
					}

					// Let $tlist be the list of nodes returned by the target expression.
					tlist = tv.value.xdmValue;
					tlistUpdates = tv.value.pendingUpdateList;
				}

				// 2. If any node in $tlist has no parent, it is removed from $tlist (and is thus ignored in the following step).
				tlist = tlist.filter(node => domFacade.getParentNode(node.value));

				// 3. A new pending update list is created. For each node $tnode in $tlist, the following update primitive is appended to the pending update list: upd:delete($tnode). The resulting pending update list is merged with the pending update list returned by the TargetExpr using upd:mergeUpdates, and together with an empty XDM instance forms the result of the delete expression.
				return ready({
					xdmValue: [],
					pendingUpdateList: mergeUpdates(
						tlist.map(node => deletePu(node.value)),
						tlistUpdates
					)
				});
			}
		};
	}
}

export default DeleteExpression;

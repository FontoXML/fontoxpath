import DynamicContext from './DynamicContext';
import SequenceFactory from './dataTypes/SequenceFactory';

type VariableBindings = { variableBindings: { [s: string]: any } };

export default class UnfocusableDynamicContext extends DynamicContext {
	constructor(bindings: VariableBindings) {
		super({
			contextItem: null,
			contextItemIndex: -1,
			contextSequence: SequenceFactory.empty(),
			variableBindings: bindings.variableBindings
		});
	}
}

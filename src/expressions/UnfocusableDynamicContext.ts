import sequenceFactory from './dataTypes/sequenceFactory';
import DynamicContext from './DynamicContext';

type VariableBindings = { variableBindings: { [s: string]: any } };

export default class UnfocusableDynamicContext extends DynamicContext {
	constructor(bindings: VariableBindings) {
		super({
			contextItem: null,
			contextItemIndex: -1,
			contextSequence: sequenceFactory.empty(),
			variableBindings: bindings.variableBindings
		});
	}
}

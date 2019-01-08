import DynamicContext from './DynamicContext';
import SequenceFactory from './dataTypes/SequenceFactory';

export default class UnfocusableDynamicContext extends DynamicContext {
	constructor ({ variableBindings = {} }) {
		super({
			contextItem: null,
			contextItemIndex: -1,
			contextSequence: SequenceFactory.empty(),
			variableBindings: variableBindings
		});
	}
}

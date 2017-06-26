import DynamicContext from '../DynamicContext';
import Sequence from '../dataTypes/Sequence';

/**
 * @param  {../DynamicContext}      dynamicContext
 * @param  {../dataTypes/Sequence}  query
 * @param  {../dataTypes/Sequence}  args
 */
function fontoxpathEvaluate (dynamicContext, query, args) {
	/**
	 * @type {string}
	 */
	const queryString = query.first().value;
	const variables = {};
	args.first().keyValuePairs.reduce((expandedArgs, arg) => {
		expandedArgs[arg.key.value] = arg.value;
		return expandedArgs;
	}, variables);

	// Take off the context item
	const contextItemSequence = variables['.'] || Sequence.empty();
	delete variables['.'];

	const selector = dynamicContext.createSelectorFromXPath(queryString);
	const context = contextItemSequence.isEmpty() ? {
		contextItem: null,
		contextSequence: contextItemSequence,
		contextItemIndex: -1,
		variables,
		domFacade: dynamicContext.domFacade,
		resolveNamespacePrefix: dynamicContext.resolveNamespacePrefix,
		createSelectorFromXPath: dynamicContext.createSelectorFromXPath
	} : {
		contextItem: contextItemSequence.first(),
		contextSequence: contextItemSequence,
		contextItemIndex: 0,
		variables,
		domFacade: dynamicContext.domFacade,
		resolveNamespacePrefix: dynamicContext.resolveNamespacePrefix,
		createSelectorFromXPath: dynamicContext.createSelectorFromXPath
	};
	const innerDynamicContext = new DynamicContext(context);

	const result = selector.evaluate(innerDynamicContext);
	return result;
}


export default {
	declarations: [
		{
			name: 'fontoxpath:evaluate',
			argumentTypes: ['xs:string', 'map(*)'],
			returnType: 'item()*',
			callFunction: fontoxpathEvaluate
		}
	]
};

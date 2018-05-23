export default class ExecutionParameters {
	constructor (domFacade, nodesFactory, createSelectorFromXPath) {
		/**
		 *@type {!IDomFacade}
		 */
		this.domFacade = domFacade;
		/**
		 * @type {!INodesFactory}
		 */
		this.nodesFactory = nodesFactory;
		this.createSelectorFromXPath = createSelectorFromXPath;
	}
}

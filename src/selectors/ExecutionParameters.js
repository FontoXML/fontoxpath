import DomFacade from '../DomFacade';
export default class ExecutionParameters {
	constructor (domFacade, nodesFactory, createSelectorFromXPath) {
		/**
		 *@type {!DomFacade}
		 */
		this.domFacade = domFacade;
		/**
		 * @type {!INodesFactory}
		 */
		this.nodesFactory = nodesFactory;
		this.createSelectorFromXPath = createSelectorFromXPath;
	}
}

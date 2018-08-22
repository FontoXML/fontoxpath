import DomFacade from '../DomFacade';
export default class ExecutionParameters {
	constructor (domFacade, nodesFactory) {
		/**
		 *@type {!DomFacade}
		 */
		this.domFacade = domFacade;
		/**
		 * @type {!INodesFactory}
		 */
		this.nodesFactory = nodesFactory;
	}
}

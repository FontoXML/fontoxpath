import DomFacade from '../DomFacade';
export default class ExecutionParameters {
	constructor (domFacade, nodesFactory, createExpressionFromXPath) {
		/**
		 *@type {!DomFacade}
		 */
		this.domFacade = domFacade;
		/**
		 * @type {!INodesFactory}
		 */
		this.nodesFactory = nodesFactory;
		this.createExpressionFromXPath = createExpressionFromXPath;
	}
}

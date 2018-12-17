import DomFacade from '../DomFacade';
export default class ExecutionParameters {
	constructor (domFacade, nodesFactory, documentWriter) {
		/**
		 *@type {!DomFacade}
		 */
		this.domFacade = domFacade;
		/**
		 * @type {!INodesFactory}
		 */
		this.nodesFactory = nodesFactory;
		/**
		 * @type {!IDocumentWriter}
		 */
		this.documentWriter = documentWriter;
	}
}

import parseExpression from './parsing/parseExpression';
import adaptJavaScriptValueToXPathValue from './expressions/adaptJavaScriptValueToXPathValue';
import DynamicContext from './expressions/DynamicContext';
import DomFacade from './DomFacade';
import ExecutionParameters from './expressions/ExecutionParameters';
import domBackedDomFacade from './domBackedDomFacade';
import domBackedDocumentWriter from './domBackedDocumentWriter';

import atomize from './expressions/dataTypes/atomize';
import castToType from './expressions/dataTypes/castToType';
import Sequence from './expressions/dataTypes/Sequence';
import isSubtypeOf from './expressions/dataTypes/isSubtypeOf';
import staticallyCompileXPath from './parsing/staticallyCompileXPath';

import { generateGlobalVariableBindingName } from './expressions/ExecutionSpecificStaticContext';

import { DONE_TOKEN, ready, notReady } from './expressions/util/iterators';

/**
 * Evaluates an XPath on the given contextItem. Returns the string result as if the XPath is wrapped in string(...).
 *
 * @param  {!string}       updateScript     The updateScript to execute. Supports XPath 3.1.
 * @param  {any }          contextItem  The initial context for the script
 * @param  {?IDomFacade=}  domFacade    The domFacade (or DomFacade like interface) for retrieving relations.
 * @param  {?Object=}      variables    Extra variables (name=>value). Values can be number / string or boolean.
 * @param  {?Object=}      options      Extra options for evaluating this XPath
 *
 * @return  {Promise<{updateList: pendingUpdate[], result: Object}>}         The string result.
 */
export default async function executePendingUpdateList (pendingUpdateList, contextItem, domFacade, options) {
	if (!domFacade) {
		domFacade = domBackedDomFacade;
	}

	// Always wrap in an actual domFacade
	const wrappedDomFacade = new DomFacade(domFacade);

	let documentWriter = options['documentWriter'];
	if (!documentWriter) {
		documentWriter = domBackedDocumentWriter;
	}

	pendingUpdateList.forEach(operation => {
		switch (operation.type) {
			case 'replaceNode': {
				const parent = wrappedDomFacade.getParentNode(operation.target);
				const following = wrappedDomFacade.getNextSibling(operation.target);
				operation.replacement.reverse().forEach(newNode => {
					documentWriter.insertBefore(parent, newNode, following);
				});
				documentWriter.removeChild(parent, operation.target);
				break;
			}
		}
	});
}

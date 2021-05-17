import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import { adaptJavaScriptValueToArrayOfXPathValues } from '../expressions/adaptJavaScriptValueToXPathValue';
import { SequenceMultiplicity, ValueType } from '../expressions/dataTypes/Value';
import { IReturnTypes } from '../parsing/convertXDMReturnValue';
import * as RuntimeLib from './RuntimeLib';

/**
 * Execute XPath compiled to JavaScript that is evaluated to a function. For
 * compiling XPath to JavaScript, see {@link compileXPathToJavaScript}.
 *
 * @beta
 *
 * @param compiledJavaScriptFunction - A function containing compiled XPath in
 * its body.
 * @param contextItem - The node from which to run the XPath.
 * @param domFacade - The domFacade (or DomFacade like interface) for retrieving relation.
 *
 * @returns The result of executing this XPath.
 */
const executeJavaScriptCompiledXPath = <
	TNode extends Node,
	TReturnType extends keyof IReturnTypes<TNode>
>(
	compiledJavaScriptFunction: any,
	contextItem?: any | null,
	domFacade?: IDomFacade | null
): IReturnTypes<TNode>[TReturnType] => {
	const wrappedDomFacade: DomFacade = new DomFacade(
		!domFacade ? new ExternalDomFacade() : domFacade
	);

	const contextArray = adaptJavaScriptValueToArrayOfXPathValues(wrappedDomFacade, contextItem, {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_ONE,
	});

	contextItem = contextArray[0];

	return compiledJavaScriptFunction()(contextItem, wrappedDomFacade, RuntimeLib);
};

export default executeJavaScriptCompiledXPath;

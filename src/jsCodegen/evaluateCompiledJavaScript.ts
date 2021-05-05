import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import { adaptJavaScriptValueToArrayOfXPathValues } from '../expressions/adaptJavaScriptValueToXPathValue';
import Value from '../expressions/dataTypes/Value';
import * as runtimeLibrary from './runtimeLibrary';

type RuntimeLibrary = {};

export type CompiledJavaScriptFunction = (
	dynamicContext: Value,
	domFacade: DomFacade,
	runtimeLibrary: RuntimeLibrary
) => any;

export default function evaluateCompiledJavaScript(
	compiledJavaScriptFunction: CompiledJavaScriptFunction,
	contextItem?: any | null,
	domFacade?: IDomFacade | null
): any {
	const wrappedDomFacade: DomFacade = new DomFacade(
		domFacade === null ? new ExternalDomFacade() : domFacade
	);

	const contextArray = adaptJavaScriptValueToArrayOfXPathValues(
		wrappedDomFacade,
		contextItem,
		'item()?'
	);

	const dynamicContext = contextArray[0];

	return compiledJavaScriptFunction(dynamicContext, wrappedDomFacade, runtimeLibrary);
}

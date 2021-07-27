import DomFacade from '../domFacade/DomFacade';
import ExternalDomFacade from '../domFacade/ExternalDomFacade';
import IDomFacade from '../domFacade/IDomFacade';
import { adaptJavaScriptValueToArrayOfXPathValues } from '../expressions/adaptJavaScriptValueToXPathValue';
import { SequenceMultiplicity, ValueType } from '../expressions/dataTypes/Value';
import { IReturnTypes, ReturnType } from '../parsing/convertXDMReturnValue';
import { Node } from '../types/Types';
import runtimeLib from './runtimeLib';

// Here we tell Closure Compiler what attributes NOT to mangle/obfuscate, since these are
// used in generated code.
declare interface IInternalDomFacadeUnmangled {
	getAllAttributes: typeof DomFacade.prototype.getAllAttributes;
	getChildNodes: typeof DomFacade.prototype.getChildNodes;
	getParentNode: typeof DomFacade.prototype.getParentNode;
}

/**
 * The (compiled) result of what {@link compileXPathToJavaScript} generated.
 *
 * @beta
 */
export type CompiledXPathFunction<
	TNode extends Node = Node,
	TReturnType extends ReturnType = ReturnType.ANY
> = () => (
	contextItem: unknown,
	domFacade: unknown,
	runtimeLib: unknown,
	functions: unknown
) => IReturnTypes<TNode>[TReturnType];

/**
 * Execute XPath compiled to JavaScript that is evaluated to a function. For
 * compiling XPath to JavaScript, see {@link compileXPathToJavaScript}.
 *
 * @beta
 *
 * @param compiledXPathFunction - A function containing compiled XPath in
 * its body.
 * @param contextItem - The node from which to run the XPath.
 * @param domFacade - The domFacade (or DomFacade like interface) for retrieving relation.
 *
 * @returns The result of executing this XPath.
 */
const executeJavaScriptCompiledXPath = <TNode extends Node, TReturnType extends ReturnType>(
	compiledXPathFunction: CompiledXPathFunction<TNode, TReturnType>,
	contextItem?: any | null,
	domFacade?: IDomFacade | null,
	functions?: [any]
): IReturnTypes<TNode>[TReturnType] => {
	const wrappedDomFacade: DomFacade = new DomFacade(
		!domFacade ? new ExternalDomFacade() : domFacade
	);

	const contextArray = adaptJavaScriptValueToArrayOfXPathValues(wrappedDomFacade, contextItem, {
		type: ValueType.ITEM,
		mult: SequenceMultiplicity.ZERO_OR_ONE,
	});

	contextItem = contextArray[0];

	return compiledXPathFunction()(
		contextItem,
		wrappedDomFacade as IInternalDomFacadeUnmangled,
		runtimeLib,
		functions
	);
};

export default executeJavaScriptCompiledXPath;

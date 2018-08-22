import { parse } from './parsing/xPathParser';
import StaticContext from './expressions/StaticContext';
import ExecutionSpecificStaticContext from './expressions/ExecutionSpecificStaticContext';

import { loadModuleFile } from './parsing/globalModuleCache';

import processProlog from './parsing/processProlog';

/**
* @typedef {{moduleDecl: {namespaceURI: ?, prefix: ?}, prolog: ?}}
*/
let XQueryModuleAST;

export default function registerXQueryModule (moduleString) {
	// TODO:
	// - Parse stuff
	// - Assert that this is a library (or should we? should we just disable XQuery main modules for now? Regard them as XPaths (`evaluateXPath(file.readString(prrt.xqm))?`))
	// - get the URI
	// - Register this to the global environment, under the URI
	// - Statically compile it (assuming every import can be resolved, TODO: figure out if XQuery has circular imports. I hope not...)

	/**
	 * @type {XQueryModuleAST}
	 */
	const parsedModule = parse(moduleString, { 'startRule': 'Module' });

	// First, lets get the module main bit
	const moduleTargetNamespaceURI = parsedModule['moduleDecl']['namespaceURI'];
	const moduleTargetPrefix = parsedModule['moduleDecl']['prefix'];

	const staticContext = new StaticContext(new ExecutionSpecificStaticContext(() => null, Object.create(null)));

	staticContext.registerNamespace(moduleTargetPrefix, moduleTargetNamespaceURI);

	const moduleDeclaration = processProlog(parsedModule['prolog'], staticContext);

	moduleDeclaration.functionDeclarations.forEach(({ namespaceURI }) => {
		if (moduleTargetNamespaceURI !== namespaceURI) {
			throw new Error('XQST0048: Functions and variables declared in a module must reside in the module target namespace.');
		}
	});

	loadModuleFile(moduleTargetNamespaceURI, moduleDeclaration);

	return moduleTargetNamespaceURI;
}

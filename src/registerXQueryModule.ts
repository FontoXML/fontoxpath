import ExecutionSpecificStaticContext from './expressions/ExecutionSpecificStaticContext';
import StaticContext from './expressions/StaticContext';
import astHelper from './parsing/astHelper';
import { parse } from './parsing/xPathParser';

import { loadModuleFile } from './parsing/globalModuleCache';

import processProlog from './parsing/processProlog';

/**
 * @param   moduleString
 * @return  The namespace uri of the new module
 */
export default function registerXQueryModule(moduleString: string): string {
	const parsedModule = parse(moduleString, { outputDebugInfo: false, xquery: true });

	const libraryModule = astHelper.getFirstChild(parsedModule, 'libraryModule');
	if (!libraryModule) {
		throw new Error('XQuery module must be declared in a library module.');
	}
	const moduleDecl = astHelper.getFirstChild(libraryModule, 'moduleDecl');
	const uriNode = astHelper.getFirstChild(moduleDecl, 'uri');
	const moduleTargetNamespaceURI = astHelper.getTextContent(uriNode);
	const prefixNode = astHelper.getFirstChild(moduleDecl, 'prefix');
	const moduleTargetPrefix = astHelper.getTextContent(prefixNode);

	const staticContext = new StaticContext(
		new ExecutionSpecificStaticContext(() => null, Object.create(null))
	);

	staticContext.registerNamespace(moduleTargetPrefix, moduleTargetNamespaceURI);

	const prolog = astHelper.getFirstChild(libraryModule, 'prolog');
	if (prolog !== null) {
		const moduleDeclaration = processProlog(prolog, staticContext);
		moduleDeclaration.functionDeclarations.forEach(({ namespaceURI }) => {
			if (moduleTargetNamespaceURI !== namespaceURI) {
				throw new Error(
					'XQST0048: Functions and variables declared in a module must reside in the module target namespace.'
				);
			}
		});

		loadModuleFile(moduleTargetNamespaceURI, moduleDeclaration);
	} else {
		loadModuleFile(moduleTargetNamespaceURI, { functionDeclarations: [] });
	}

	return moduleTargetNamespaceURI;
}

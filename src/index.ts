import IDocumentWriter from './documentWriter/IDocumentWriter';
import ExternalDomFacade from './domFacade/ExternalDomFacade';
import IDomFacade from './domFacade/IDomFacade';
import evaluateUpdatingExpression, { UpdatingOptions } from './evaluateUpdatingExpression';
import evaluateUpdatingExpressionSync from './evaluateUpdatingExpressionSync';
import evaluateXPath, { Language, Options } from './evaluateXPath';
import evaluateXPathToArray from './evaluateXPathToArray';
import evaluateXPathToAsyncIterator from './evaluateXPathToAsyncIterator';
import evaluateXPathToBoolean from './evaluateXPathToBoolean';
import evaluateXPathToFirstNode from './evaluateXPathToFirstNode';
import evaluateXPathToMap from './evaluateXPathToMap';
import evaluateXPathToNodes from './evaluateXPathToNodes';
import evaluateXPathToNumber from './evaluateXPathToNumber';
import evaluateXPathToNumbers from './evaluateXPathToNumbers';
import evaluateXPathToString from './evaluateXPathToString';
import evaluateXPathToStrings from './evaluateXPathToStrings';
import executePendingUpdateList from './executePendingUpdateList';
import getBucketsForNode from './getBucketsForNode';
import INodesFactory from './nodesFactory/INodesFactory';
import astHelper from './parsing/astHelper';
import compileAstToExpression from './parsing/compileAstToExpression';
import {
	getAnyStaticCompilationResultFromCache,
	storeHalfCompiledCompilationResultInCache
} from './parsing/compiledExpressionCache';
import parseExpression from './parsing/parseExpression';
import precompileXPath from './precompileXPath';
import registerCustomXPathFunction from './registerCustomXPathFunction';
import registerXQueryModule from './registerXQueryModule';
import {
	Attr,
	CDATASection,
	CharacterData,
	Comment,
	Document,
	Element,
	Node,
	ProcessingInstruction,
	Text
} from './types/Types';
import { IReturnTypes, ReturnType } from './parsing/convertXDMReturnValue';

function parseXPath(xpathString: string) {
	const cachedExpression = getAnyStaticCompilationResultFromCache(xpathString, 'XPath', false);
	if (cachedExpression) {
		return cachedExpression;
	}

	const ast = parseExpression(xpathString, { allowXQuery: false });
	const queryBody = astHelper.followPath(ast, ['mainModule', 'queryBody', '*']);

	if (queryBody === null) {
		throw new Error('Library modules do not have a specificity');
	}

	const expression = compileAstToExpression(queryBody, {
		allowUpdating: false,
		allowXQuery: false
	});

	storeHalfCompiledCompilationResultInCache(xpathString, 'XPath', expression, false);

	return expression;
}

/**
 * @public
 * @param xpathString - The XPath for which a bucket should be retrieved
 */
function getBucketForSelector(xpathString: string) {
	return parseXPath(xpathString).getBucket();
}

/**
 * Compare the specificity of two XPath expressions. This function will return -1 if the second XPath is more specific, 1 if the first one is more specific and 0 if they are equal in specificity.
 *
 * @public
 *
 * @example
 * compareSpecificity('self::a', 'self::a[\@b]') === -1;
 * compareSpecificity('self::a', 'self::a and child::b') === -1;
 * compareSpecificity('self::*', 'self::a') === 1;
 * compareSpecificity('self::a', 'self::a') === 0;
 *
 * @param xpathStringA - The first XPath to compare
 * @param xpathStringB - The XPath to compare to
 *
 * @returns Either 1, 0, or -1
 */
function compareSpecificity(xpathStringA: string, xpathStringB: string): -1 | 0 | 1 {
	return parseXPath(xpathStringA).specificity.compareTo(parseXPath(xpathStringB).specificity);
}

/**
 * @public
 */
const domFacade = new ExternalDomFacade() as IDomFacade;

// This declaration is needed, as we don't depend anymore on lib.dom.
declare var window;

/* istanbul ignore next */
if (typeof window !== 'undefined') {
	window['compareSpecificity'] = compareSpecificity;
	window['domFacade'] = domFacade;
	window['evaluateXPath'] = evaluateXPath;
	window['evaluateXPathToArray'] = evaluateXPathToArray;
	window['evaluateXPathToBoolean'] = evaluateXPathToBoolean;
	window['evaluateXPathToAsyncIterator'] = evaluateXPathToAsyncIterator;
	window['evaluateXPathToFirstNode'] = evaluateXPathToFirstNode;
	window['evaluateXPathToMap'] = evaluateXPathToMap;
	window['evaluateXPathToNodes'] = evaluateXPathToNodes;
	window['evaluateXPathToNumber'] = evaluateXPathToNumber;
	window['evaluateXPathToNumbers'] = evaluateXPathToNumbers;
	window['evaluateXPathToString'] = evaluateXPathToString;
	window['evaluateXPathToStrings'] = evaluateXPathToStrings;
	window['evaluateUpdatingExpression'] = evaluateUpdatingExpression;
	window['evaluateUpdatingExpressionSync'] = evaluateUpdatingExpressionSync;
	window['executePendingUpdateList'] = executePendingUpdateList;
	window['getBucketForSelector'] = getBucketForSelector;
	window['getBucketsForNode'] = getBucketsForNode;
	/** @suppress {deprecated} */
	// @ts-ignore We still need to expose this deprecated API
	window['precompileXPath'] = precompileXPath;
	window['registerXQueryModule'] = registerXQueryModule;
	window['registerCustomXPathFunction'] = registerCustomXPathFunction;
}

export {
	Attr,
	CDATASection,
	CharacterData,
	Comment,
	Document,
	Element,
	IDocumentWriter,
	IDomFacade,
	INodesFactory,
	IReturnTypes,
	Language,
	Node,
	Options,
	ProcessingInstruction,
	ReturnType,
	Text,
	UpdatingOptions,
	compareSpecificity,
	domFacade,
	evaluateUpdatingExpression,
	evaluateUpdatingExpressionSync,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings,
	executePendingUpdateList,
	getBucketForSelector,
	getBucketsForNode,
	precompileXPath,
	registerCustomXPathFunction,
	registerXQueryModule
};

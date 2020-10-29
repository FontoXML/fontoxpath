import IDocumentWriter from './documentWriter/IDocumentWriter';
import ExternalDomFacade from './domFacade/ExternalDomFacade';
import IDomFacade from './domFacade/IDomFacade';
import evaluateUpdatingExpression, { UpdatingOptions } from './evaluateUpdatingExpression';
import evaluateUpdatingExpressionSync from './evaluateUpdatingExpressionSync';
import evaluateXPath, { EvaluateXPath, Language, Logger, Options } from './evaluateXPath';
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
import { getBucketsForNode } from './getBuckets';
import INodesFactory from './nodesFactory/INodesFactory';
import ISimpleNodesFactory from './nodesFactory/ISimpleNodesFactory';
import parseScript from './parseScript';
import astHelper from './parsing/astHelper';
import compileAstToExpression from './parsing/compileAstToExpression';
import {
	getAnyStaticCompilationResultFromCache,
	storeHalfCompiledCompilationResultInCache,
} from './parsing/compiledExpressionCache';
import { IReturnTypes, ReturnType } from './parsing/convertXDMReturnValue';
import parseExpression from './parsing/parseExpression';
import { Profiler, profiler, XPathPerformanceMeasurement } from './performance';
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
	Text,
} from './types/Types';

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
		allowXQuery: false,
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
declare var fontoxpathGlobal;

/* istanbul ignore next */
if (typeof fontoxpathGlobal !== 'undefined') {
	fontoxpathGlobal['compareSpecificity'] = compareSpecificity;
	fontoxpathGlobal['domFacade'] = domFacade;
	fontoxpathGlobal['evaluateXPath'] = evaluateXPath;
	fontoxpathGlobal['evaluateXPathToArray'] = evaluateXPathToArray;
	fontoxpathGlobal['evaluateXPathToBoolean'] = evaluateXPathToBoolean;
	fontoxpathGlobal['evaluateXPathToAsyncIterator'] = evaluateXPathToAsyncIterator;
	fontoxpathGlobal['evaluateXPathToFirstNode'] = evaluateXPathToFirstNode;
	fontoxpathGlobal['evaluateXPathToMap'] = evaluateXPathToMap;
	fontoxpathGlobal['evaluateXPathToNodes'] = evaluateXPathToNodes;
	fontoxpathGlobal['evaluateXPathToNumber'] = evaluateXPathToNumber;
	fontoxpathGlobal['evaluateXPathToNumbers'] = evaluateXPathToNumbers;
	fontoxpathGlobal['evaluateXPathToString'] = evaluateXPathToString;
	fontoxpathGlobal['evaluateXPathToStrings'] = evaluateXPathToStrings;
	fontoxpathGlobal['evaluateUpdatingExpression'] = evaluateUpdatingExpression;
	fontoxpathGlobal['evaluateUpdatingExpressionSync'] = evaluateUpdatingExpressionSync;
	fontoxpathGlobal['executePendingUpdateList'] = executePendingUpdateList;
	fontoxpathGlobal['getBucketForSelector'] = getBucketForSelector;
	fontoxpathGlobal['getBucketsForNode'] = getBucketsForNode;
	/** @suppress {deprecated} */
	// @ts-ignore We still need to expose this deprecated API
	fontoxpathGlobal['precompileXPath'] = precompileXPath;
	fontoxpathGlobal['registerXQueryModule'] = registerXQueryModule;
	fontoxpathGlobal['registerCustomXPathFunction'] = registerCustomXPathFunction;
	fontoxpathGlobal['parseScript'] = parseScript;
	fontoxpathGlobal['profiler'] = profiler;
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
	ISimpleNodesFactory,
	IReturnTypes,
	Language,
	Logger,
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
	EvaluateXPath,
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
	registerXQueryModule,
	parseScript,
	Profiler,
	profiler,
	XPathPerformanceMeasurement,
};

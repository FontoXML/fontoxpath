import ExternalDomFacade from './domFacade/ExternalDomFacade';
import evaluateUpdatingExpression from './evaluateUpdatingExpression';
import evaluateXPath from './evaluateXPath';
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

function parseXPath(xpathString: string) {
	const cachedExpression = getAnyStaticCompilationResultFromCache(xpathString, 'XPath');
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

	storeHalfCompiledCompilationResultInCache(xpathString, 'XPath', expression);

	return expression;
}

function getBucketForSelector(xpathString) {
	return parseXPath(xpathString).getBucket();
}

function compareSpecificity(xpathStringA, xpathStringB) {
	return parseXPath(xpathStringA).specificity.compareTo(parseXPath(xpathStringB).specificity);
}

const domFacade = new ExternalDomFacade();

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
	window['executePendingUpdateList'] = executePendingUpdateList;
	window['getBucketForSelector'] = getBucketForSelector;
	window['getBucketsForNode'] = getBucketsForNode;
	window['precompileXPath'] = precompileXPath;
	window['registerXQueryModule'] = registerXQueryModule;
	window['registerCustomXPathFunction'] = registerCustomXPathFunction;
}

export {
	domFacade,
	evaluateXPath,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToAsyncIterator,
	evaluateXPathToFirstNode,
	evaluateXPathToMap,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToStrings,
	evaluateUpdatingExpression,
	executePendingUpdateList,
	precompileXPath,
	registerXQueryModule,
	evaluateXPathToString,
	registerCustomXPathFunction,
	getBucketsForNode,
	getBucketForSelector,
	compareSpecificity
};

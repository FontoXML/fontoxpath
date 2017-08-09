import evaluateXPath from './evaluateXPath';
import evaluateXPathToArray from './evaluateXPathToArray';
import evaluateXPathToAsyncIterator from './evaluateXPathToAsyncIterator';
import evaluateXPathToBoolean from './evaluateXPathToBoolean';
import evaluateXPathToFirstNode from './evaluateXPathToFirstNode';
import evaluateXPathToNodes from './evaluateXPathToNodes';
import evaluateXPathToNumber from './evaluateXPathToNumber';
import evaluateXPathToMap from './evaluateXPathToMap';
import evaluateXPathToNumbers from './evaluateXPathToNumbers';
import evaluateXPathToString from './evaluateXPathToString';
import evaluateXPathToStrings from './evaluateXPathToStrings';
import precompileXPath from './precompileXPath';
import getBucketsForNode from './getBucketsForNode';
import registerCustomXPathFunction from './registerCustomXPathFunction';
import createSelectorFromXPath from './parsing/createSelectorFromXPath';
import domFacade from './domBackedDomFacade';

function getBucketForSelector (xpathString) {
	return createSelectorFromXPath(xpathString).getBucket();
}

function compareSpecificity (xpathStringA, xpathStringB) {
	return createSelectorFromXPath(xpathStringA).specificity.compareTo(createSelectorFromXPath(xpathStringB).specificity);
}

/**
* @suppress {undefinedVars}
*/
(function () {
	/* istanbul ignore else */
	if (typeof exports !== 'undefined') {
		exports['compareSpecificity'] = compareSpecificity;
		exports['domFacade'] = domFacade;
		exports['evaluateXPath'] = evaluateXPath;
		exports['evaluateXPathToArray'] = evaluateXPathToArray;
		exports['evaluateXPathToBoolean'] = evaluateXPathToBoolean;
		exports['evaluateXPathToAsyncIterator'] = evaluateXPathToAsyncIterator;
		exports['evaluateXPathToFirstNode'] = evaluateXPathToFirstNode;
		exports['evaluateXPathToMap'] = evaluateXPathToMap;
		exports['evaluateXPathToNodes'] = evaluateXPathToNodes;
		exports['evaluateXPathToNumber'] = evaluateXPathToNumber;
		exports['evaluateXPathToNumbers'] = evaluateXPathToNumbers;
		exports['evaluateXPathToString'] = evaluateXPathToString;
		exports['evaluateXPathToStrings'] = evaluateXPathToStrings;
		exports['getBucketForSelector'] = getBucketForSelector;
		exports['getBucketsForNode'] = getBucketsForNode;
		exports['precompileXPath'] = precompileXPath;
		exports['registerCustomXPathFunction'] = registerCustomXPathFunction;
	}
})();

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
	precompileXPath,
	evaluateXPathToString,
	registerCustomXPathFunction,
	getBucketsForNode,
	getBucketForSelector,
	compareSpecificity
};

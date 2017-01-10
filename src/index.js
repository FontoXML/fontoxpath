import evaluateXPathToArray from './evaluateXPathToArray';
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

/**
 * @constructor
 * @implements {IDomFacade}
 */
function ReadOnlyDomFacade () {}

ReadOnlyDomFacade.prototype.getParentNode = (node) => {
    return node.parentNode;
};

ReadOnlyDomFacade.prototype.getFirstChild = function (node) {
    return node.firstChild;
};

ReadOnlyDomFacade.prototype.getLastChild = function (node) {
    return node.lastChild;
};

ReadOnlyDomFacade.prototype.getNextSibling = function (node) {
    return node.nextSibling;
};

ReadOnlyDomFacade.prototype.getPreviousSibling = function (node) {
    return node.previousSibling;
};

ReadOnlyDomFacade.prototype.getChildNodes = function (node) {
    var childNodes = [];

    for (var childNode = this.getFirstChild(node); childNode; childNode = this.getNextSibling(childNode)) {
        childNodes.push(childNode);
    }

    return childNodes;
};

ReadOnlyDomFacade.prototype.getAttribute = function (node, attributeName) {
    return node.getAttribute(attributeName);
};

ReadOnlyDomFacade.prototype.getAllAttributes = function (node) {
    return Array.from(/** @type {!Iterable<Attr>} */ (node.attributes));
};

ReadOnlyDomFacade.prototype.getData = function (node) {
    return node.data || '';
};

ReadOnlyDomFacade.prototype.getRelatedNodes = function (node, callback) {
	return callback(node, this);
};

const domFacade = new ReadOnlyDomFacade();

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
	if (typeof exports !== 'undefined') {
		exports['domFacade'] = domFacade,
		exports['evaluateXPathToArray'] = evaluateXPathToArray;
		exports['evaluateXPathToBoolean'] = evaluateXPathToBoolean;
		exports['evaluateXPathToFirstNode'] = evaluateXPathToFirstNode;
		exports['evaluateXPathToMap'] = evaluateXPathToMap;
		exports['evaluateXPathToNodes'] = evaluateXPathToNodes;
		exports['evaluateXPathToNumber'] = evaluateXPathToNumber;
		exports['evaluateXPathToNumbers'] = evaluateXPathToNumbers;
		exports['evaluateXPathToStrings'] = evaluateXPathToStrings;
		exports['evaluateXPathToString'] = evaluateXPathToString;
		exports['precompileXPath'] = precompileXPath;
		exports['registerCustomXPathFunction'] = registerCustomXPathFunction;
		exports['getBucketsForNode'] = getBucketsForNode;
		exports['getBucketForSelector'] = getBucketForSelector;
		exports['compareSpecificity'] = compareSpecificity;
	}
})();

export {
	domFacade,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
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

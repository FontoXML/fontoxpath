var SPECIFICITY_DIMENSIONS = [
        'external',
        'attribute',
        'nodeName',
        'nodeType',
        'universal'
    ],
    NUMBER_OF_SPECIFICITY_DIMENSIONS = SPECIFICITY_DIMENSIONS.length;

/**
 * @constructor
 * @param  {!Object}  countsByKind  simple selector counts indexed by specificity dimension
 */
function Specificity (countsByKind) {
    this._counts = SPECIFICITY_DIMENSIONS.map(function (specificityKind) {
        return countsByKind[specificityKind] || 0;
    });

	if (Object.keys(countsByKind).some((kind => !SPECIFICITY_DIMENSIONS.includes(kind)))) {
		throw new Error('Invalid specificity kind passed');
	}
}

/**
 * @const
 */
Specificity.EXTERNAL_KIND = 'external';

/**
 * @const
 */
Specificity.ATTRIBUTE_KIND = 'attribute';

/**
 * @const
 */
Specificity.NODENAME_KIND = 'nodeName';

/**
 * @const
 */
Specificity.NODETYPE_KIND = 'nodeType';

/**
 * @const
 */
Specificity.UNIVERSAL_KIND = 'universal';

/**
 * @param  {!Specificity}  otherSpecificity
 *
 * @return {!Specificity}  new specificity with the combined counts
 */
Specificity.prototype.add = function (otherSpecificity) {
    return new Specificity(SPECIFICITY_DIMENSIONS.reduce(function (countsByKind, specificityKind, index) {
        countsByKind[specificityKind] = this._counts[index] + otherSpecificity._counts[index];
        return countsByKind;
    }.bind(this), Object.create(null)));
};

/**
 * @param  {Specificity}  otherSpecificity
 *
 * @return  {number}      -1 if specificity is less than otherSpecificity, 1 if it is greater, 0 if equal
 */
Specificity.prototype.compareTo = function (otherSpecificity) {
    for (var i = 0; i < NUMBER_OF_SPECIFICITY_DIMENSIONS; ++i) {
        if (otherSpecificity._counts[i] < this._counts[i]) {
            return 1;
        }
        if (otherSpecificity._counts[i] > this._counts[i]) {
            return -1;
        }
    }
    return 0;
};

export default Specificity;

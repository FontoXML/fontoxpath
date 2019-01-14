const SPECIFICITY_DIMENSIONS = ['external', 'attribute', 'nodeName', 'nodeType', 'universal'];
const NUMBER_OF_SPECIFICITY_DIMENSIONS = SPECIFICITY_DIMENSIONS.length;

class Specificity {
	public static ATTRIBUTE_KIND = 'attribute';
	public static EXTERNAL_KIND = 'external';
	public static NODENAME_KIND = 'nodeName';
	public static NODETYPE_KIND = 'nodeType';
	public static UNIVERSAL_KIND = 'universal';

	private _counts: number[];

	constructor(countsByKind: { [s: string]: number }) {
		this._counts = SPECIFICITY_DIMENSIONS.map(function(specificityKind) {
			return countsByKind[specificityKind] || 0;
		});

		if (Object.keys(countsByKind).some(kind => !SPECIFICITY_DIMENSIONS.includes(kind))) {
			throw new Error('Invalid specificity kind passed');
		}
	}

	/**
	 * @return  new specificity with the combined counts
	 */
	public add(otherSpecificity: Specificity): Specificity {
		const sum = SPECIFICITY_DIMENSIONS.reduce((countsByKind, specificityKind, index) => {
			countsByKind[specificityKind] = this._counts[index] + otherSpecificity._counts[index];
			return countsByKind;
		}, Object.create(null));

		return new Specificity(sum);
	}

	/**
	 * @return  -1 if specificity is less than otherSpecificity, 1 if it is greater, 0 if equal
	 */
	public compareTo(otherSpecificity: Specificity): -1 | 0 | 1 {
		for (let i = 0; i < NUMBER_OF_SPECIFICITY_DIMENSIONS; ++i) {
			if (otherSpecificity._counts[i] < this._counts[i]) {
				return 1;
			}
			if (otherSpecificity._counts[i] > this._counts[i]) {
				return -1;
			}
		}
		return 0;
	}
}
export default Specificity;

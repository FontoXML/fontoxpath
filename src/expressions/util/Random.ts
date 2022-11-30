// Seed a prng with the chosen seed. This is a linear congruential generator. The constants are
// taken from Steele, GL, Vigna, S. Computationally easy, spectrally good multipliers for
// congruential pseudorandom number generators. Softw Pract Exper. 2022; 52( 2): 443–
// 458. doi:10.1002/spe.3030
export default class Random {
	private static readonly _a = 0x72ed;
	private static readonly _c = 0;
	private static readonly _m = 2 ** 32;

	private readonly _defaultSeed: number;

	constructor(seed: number = Math.floor(Math.random() * Random._m)) {
		this._defaultSeed = Math.abs(seed % Random._m);
	}

	public getRandomNumber(seed: number | null) {
		const current = (Random._a * (seed ?? this._defaultSeed) + Random._c) % Random._m;

		return {
			currentInt: Math.floor(current),
			currentDecimal: current / Random._m,
		};
	}
}

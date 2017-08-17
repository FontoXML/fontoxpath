import {
	evaluateXPathToBoolean,
	evaluateXPathToNumbers
} from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('inline functions', () => {
	it('can be placed in a let', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $fn := function () as xs:boolean { true() } return $fn()'));
	});

	it('accepts not passing a return type', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $fn := function (){ true() } return $fn()'));
	});

	it('accepts parameters', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $fn := function ($a as xs:boolean+){ $a } return $fn(true())'));
	});

	it('correctly binds context', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('let $x := true(), $fn := function () {$x}, $x := false() return $fn() = true()'));
	});

	it('correctly binds contextItem / sequence', () => {
		chai.assert.throws(() => evaluateXPathToBoolean('function () { position() }()'), 'XPDY0002');
	});

	it('throws an error for wrong number of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToBoolean('let $fn := function ($a as xs:boolean+){ $a } return $fn()'),
		'XPTY0004');
	});

	it('throws an error for wrong typing of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToBoolean('let $fn := function ($a as xs:integer){ $a } return $fn("A string")'),
		'XPTY0004');
	});

	it('throws an error for wrong multiplicity of arguments', () => {
		chai.assert.throws(
			() => evaluateXPathToBoolean('let $fn := function ($a as xs:integer){ $a } return $fn((1,2,3))'),
		'XPTY0004');
	});

	it('allows variable references inside functions', () => {
		jsonMlMapper.parse([
			'data',
			['a'], ['b'], ['c'], ['d'], ['e'], ['f']
		], documentNode);
		const result = evaluateXPathToBoolean(`
deep-equal((let $index-of-node := function($seqParam as node()*, $srchParam as node()) as xs:integer*
                      { filter( 1 to count($seqParam), function($this as xs:integer) as xs:boolean
                                                       { $seqParam[$this] is $srchParam} ) },
    $nodes := /*/*,
    $perm := ($nodes[1], $nodes[2], $nodes[3], $nodes[1], $nodes[2], $nodes[4], $nodes[2], $nodes[1])
return $index-of-node($perm, $nodes[2])), (2,5,7))
`, documentNode);
		chai.assert.deepEqual(result, true);
	});
});

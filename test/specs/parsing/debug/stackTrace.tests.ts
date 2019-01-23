import * as chai from 'chai';
import { evaluateXPath } from 'fontoxpath';
import sinon = require('sinon');

describe('showStackTraceOnError', () => {
	let consoleErrorStub: sinon.SinonStub<[any?, ...any[]], void>;
	after(() => {
		consoleErrorStub.restore();
	});
	before(() => {
		consoleErrorStub = sinon.stub(console, 'error').callsFake(_message => {
			// No errors in the console :)
		});
	});

	it('shows a stack trace for a dynamic error', () => {
		chai.assert.throws(
			() =>
				evaluateXPath(
					`if (true()) then
  [] and 1
else
  (1, 2, 3)`,
					null,
					null,
					null,
					null,
					{ debug: true }
				),
			`1: if (true()) then
2:   [] and 1
     ^^^^^^^^
3: else
4:   (1, 2, 3)

Error: FORG0006: A wrong argument type was specified in a function call.
  at <andOp>:2:3 - 2:11
  at <ifThenElseExpr>:1:1 - 4:12`
		);
	});

	it('shows a stack trace for a static error', () => {
		chai.assert.throws(
			() =>
				evaluateXPath('$non-existing-map("key")', null, null, null, null, { debug: true }),
			`1: $non-existing-map("key")
   ^^^^^^^^^^^^^^^^^^^^^^^^

Error: XPST0008, The variable non-existing-map is not in scope.
  at <pathExpr>:1:1 - 1:25`
		);
	});

	it('only shows the 2 lines surrounding the error', () => {
		chai.assert.throws(
			() =>
				evaluateXPath(
					`(: 1 :)
(: 2 :)
(: 3 :)
$map("key")
(: 4 :)
(: 5 :)
(: 6 :)`,
					null,
					null,
					null,
					null,
					{ debug: true }
				),
			`2: (: 2 :)
3: (: 3 :)
4: $map("key")
   ^^^^^^^^^^^
5: (: 4 :)
6: (: 5 :)

Error: XPST0008, The variable map is not in scope.
  at <pathExpr>:4:1 - 4:12`
		);
	});

	it('prefixes line numbers with 0 so all match in string length', () => {
		const errorLine = '$map("key")';
		chai.assert.throws(
			() => {
				const lines = Array(10).fill('(::)');
				lines[6] = errorLine;
				evaluateXPath(lines.join('\n'), null, null, null, null, { debug: true });
			},
			`5: (::)
6: (::)
7: $map("key")
   ^^^^^^^^^^^
8: (::)
9: (::)

Error: XPST0008, The variable map is not in scope.
  at <pathExpr>:7:1 - 7:12`
		);
		chai.assert.throws(
			() => {
				const lines = Array(10).fill('(::)');
				lines[8] = errorLine;
				evaluateXPath(lines.join('\n'), null, null, null, null, { debug: true });
			},
			` 7: (::)
 8: (::)
 9: $map("key")
    ^^^^^^^^^^^
10: (::)

Error: XPST0008, The variable map is not in scope.
  at <pathExpr>:9:1 - 9:12`
		);
	});
});

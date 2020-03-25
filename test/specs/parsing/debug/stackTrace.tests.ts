import * as chai from 'chai';
import { evaluateUpdatingExpression, evaluateXPath, registerXQueryModule } from 'fontoxpath';
import sinon = require('sinon');

describe('showStackTraceOnError', () => {
	let consoleErrorStub: sinon.SinonStub<[any?, ...any[]], void>;
	after(() => {
		consoleErrorStub.restore();
	});
	before(() => {
		consoleErrorStub = sinon.stub(console, 'error').callsFake((_message) => {
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

	it('shows a stack trace for a dynamic error in an updating expression', async () => {
		try {
			await evaluateUpdatingExpression('replace node /r with <r/>', null, null, null, {
				debug: true,
			});
		} catch (error) {
			chai.assert.equal(
				error.message,
				`1: replace node /r with <r/>
                ^^

Error: XPDY0002: context is absent, it needs to be present to use paths.
  at <pathExpr>:1:14 - 1:16
  at <replaceExpr>:1:1 - 1:26`
			);
		}
	});

	it('shows a stack trace for a static error in an updating expression', async () => {
		try {
			await evaluateUpdatingExpression('replace node $node with <r/>', null, null, null, {
				debug: true,
			});
		} catch (error) {
			chai.assert.equal(
				error.message,
				`1: replace node $node with <r/>
                ^^^^^

Error: XPST0008, The variable node is not in scope.
  at <varRef>:1:14 - 1:19
  at <replaceExpr>:1:1 - 1:29`
			);
		}
	});

	it('shows a stack trace for when registering an XQuery module', () => {
		chai.assert.throws(
			() =>
				registerXQueryModule(
					`module namespace my-ns="http://www.dita-example-editor.com/hooks";

declare %public %updating function my-ns:my-func ($node as node()) as xs:integer {
    $node/descendant::p ! (replace value of node . with "steve"), 1
};`,
					{ debug: true }
				),
			`2:${' '}
3: declare %public %updating function my-ns:my-func ($node as node()) as xs:integer {
4:     $node/descendant::p ! (replace value of node . with "steve"), 1
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
5: };

Error: XUST0001: Can not execute an updating expression in a non-updating context.
  at <simpleMapExpr>:4:5 - 4:65`
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

	it('contains the correct location of the error in the code', () => {
		const errorLine = '$map("key")';
		const position = {
			end: {
				column: 12,
				line: 7,
				offset: 41,
			},
			start: {
				column: 1,
				line: 7,
				offset: 30,
			},
		};
		try {
			const lines = Array(10).fill('(::)');
			lines[6] = errorLine;
			evaluateXPath(lines.join('\n'), null, null, null, null, { debug: true });
		} catch (error) {
			chai.assert.deepEqual(error.position, position);
		}
	});
});

import * as chai from 'chai';
import {
	ValueType,
	evaluateUpdatingExpression,
	evaluateXPath,
	evaluateXPathToString,
	registerCustomXPathFunction,
	registerXQueryModule,
	SequenceMultiplicity
} from 'fontoxpath';
import * as sinon from 'sinon';

function a() {
	throw new Error('Test error');
}
function b() {
	a();
}
function c() {
	b();
}

function d() {
	return evaluateXPathToString(
		'if(true() and Q{test}boom-abc()) then "steve" else "bob"',
		null,
		null,
		null,
		{
			debug: true,
		}
	);
}

function e() {
	d();
}

function f() {
	e();
}

describe('showStackTraceOnError', () => {
	let consoleErrorStub: sinon.SinonStub<[any?, ...any[]], void>;
	after(() => {
		consoleErrorStub.restore();
	});
	before(() => {
		consoleErrorStub = sinon.stub(console, 'error').callsFake((_message) => {
			// No errors in the console :)
		});

		// This function will call 3 nested JS functions which we expect in our call stack
		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'boom-abc' },
			[],
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			(_dynamicContext) => {
				// This will throw an error so no need for a return
				c();
			}
		);

		// This function will call 3 nested JS functions which we expect in our call stack as well
		// as the call stack of boom-abc
		registerCustomXPathFunction(
			{ namespaceURI: 'test', localName: 'boom-def' },
			[],
			{ type: ValueType.XSSTRING, mult: SequenceMultiplicity.EXACTLY_ONE },
			(_dynamicContext) => {
				// This will throw an error so no need for a return
				f();
			}
		);
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

	it('shows the JS stack trace for error in a custom xpath function', () => {
		try {
			evaluateXPath('Q{test}boom-abc()', null, null, null, null, { debug: true });
			chai.assert.fail('The custom xpath function must throw an error');
		} catch (error) {
			// We compare separate lines of the error message as the stack trace contains
			// machine specific data e.g. your user name
			chai.assert.include(
				error.message,
				`1: Q{test}boom-abc()
   ^^^^^^^^^^^^^^^^^

Error: Custom XPath function Q{test}boom-abc raised:
Test error
    at a (`
			);

			const errorMessageLines = error.message.split('\n');

			// Check the error message lines containing our JS call stack contain function name,
			// filename, and line number. We only check these as the full error message is machine
			// specific (may contain user name in the full file paths)
			chai.assert.include(errorMessageLines[5], '    at a (');
			chai.assert.include(errorMessageLines[5], 'stackTrace.tests.ts:14:8)');

			chai.assert.include(errorMessageLines[6], '    at b (');
			chai.assert.include(errorMessageLines[6], 'stackTrace.tests.ts:17:2)');

			chai.assert.include(errorMessageLines[7], '    at c (');
			chai.assert.include(errorMessageLines[7], 'stackTrace.tests.ts:20:2)');

			chai.assert.equal(errorMessageLines[15], '  at <functionCallExpr>:1:1 - 1:18');
		}
	});

	it('shows the JS stack trace for error in nested custom xpath functions', () => {
		try {
			evaluateXPath('Q{test}boom-def()', null, null, null, null, { debug: true });
			chai.assert.fail('The custom xpath function must throw an error');
		} catch (error) {
			chai.assert.include(
				error.message,
				`1: Q{test}boom-def()
   ^^^^^^^^^^^^^^^^^

Error: Custom XPath function Q{test}boom-def raised:
1: if(true() and Q{test}boom-abc()) then "steve" else "bob"
                 ^^^^^^^^^^^^^^^^^

Error: Custom XPath function Q{test}boom-abc raised:
Test error
    at a (`
			);

			// Check the error message lines containing our JS call stack contain function name,
			// filename, and line number. We only check these as the full error message is machine
			// specific (may contain user name in the full file paths)
			chai.assert.include(error.message, '    at a (');
			chai.assert.include(error.message, 'stackTrace.tests.ts:14:8)');

			chai.assert.include(error.message, '    at b (');
			chai.assert.include(error.message, 'stackTrace.tests.ts:17:2)');

			chai.assert.include(error.message, '    at c (');
			chai.assert.include(error.message, 'stackTrace.tests.ts:20:2)');

			chai.assert.include(error.message, '  at <functionCallExpr>:1:15 - 1:32');
			chai.assert.include(error.message, '  at <andOp>:1:4 - 1:32');
			chai.assert.include(error.message, '  at <ifThenElseExpr>:1:1 - 1:57');

			chai.assert.include(error.message, '    at d (');
			chai.assert.include(error.message, 'stackTrace.tests.ts:24:9)');

			chai.assert.include(error.message, '    at e (');
			chai.assert.include(error.message, 'stackTrace.tests.ts:36:2)');

			chai.assert.include(error.message, '    at f (');
			chai.assert.include(error.message, 'stackTrace.tests.ts:40:2)');

			chai.assert.include(error.message, '  at <functionCallExpr>:1:1 - 1:18');
		}
	});

	it('does not show a JS stack trace for a regular XQuery error', () => {
		chai.assert.throws(
			() => {
				evaluateXPath('$map("key"), Q{foo}boom-abc()', null, null, null, null, {
					debug: true,
				});
			},
			`1: $map("key"), Q{foo}boom-abc()
   ^^^^^^^^^^^

Error: XPST0008, The variable map is not in scope.
  at <pathExpr>:1:1 - 1:12`
		);
	});
});

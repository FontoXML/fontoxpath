define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprints,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest,
	evaluateXPath
) {
	'use strict';

	var blueprint = new blueprints.ReadOnlyBlueprint();

	describe('createSelectorFromXPath', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		describe('axes', function () {
			describe('self', function () {
				it('parses self::', function () {
					var selector = parseSelector('self::someElement');
					var element = documentNode.createElement('someElement');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
			});

			describe('attribute', function () {
				it('parses attribute existence', function () {
					var selector = parseSelector('attribute::someAttribute');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
				it('allows namespaces', function () {
					var selector = parseSelector('attribute::someNamespace:someAttribute');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someNamespace:someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
				it('parses the shorthand for existence', function () {
					var selector = parseSelector('@someAttribute');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
				it('parses the shorthand for value', function () {
					var selector = parseSelector('@someAttribute=\'someValue\'');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
				it('allows namespaces in the shorthand', function () {
					var selector = parseSelector('@someNamespace:someAttribute="someValue"');
					var element = documentNode.createElement('someElement');
					element.setAttribute('someNamespace:someAttribute', 'someValue');
					chai.expect(selector.matches(element, blueprint)).to.equal(true);
				});
			});

			describe('descendant', function () {
				it('parses descendant::', function () {
					var selector = parseSelector('descendant::someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
				});
			});

			describe('parent', function () {
				it('parses parent::', function () {
					var selector = parseSelector('parent::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
				});
			});

			describe('following-sibling', function () {
				it('parses following-sibling::', function () {
					var selector = parseSelector('following-sibling::someSiblingElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement'],
						['someSiblingElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
				});
			});

			describe('preceding-sibling', function () {
				it('parses preceding-sibling::', function () {
					var selector = parseSelector('preceding-sibling::someSiblingElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someSiblingElement'],
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement.lastChild, blueprint)).to.equal(true);
				});
			});

			describe('descendant-or-self', function () {
				it('descendant part', function () {
					var selector = parseSelector('descendant-or-self::someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
				});
				it('self part', function () {
					var selector = parseSelector('descendant-or-self::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
				});
			});

			describe('ancestor', function () {
				it('parses ancestor::', function () {
					var selector = parseSelector('ancestor::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
				});
			});

			describe('ancestor-or-self', function () {
				it('parses ancestor-or-self:: ancestor part', function () {
					var selector = parseSelector('ancestor-or-self::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
				});
				it('parses ancestor-or-self:: self part', function () {
					var selector = parseSelector('ancestor-or-self::someParentElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement', { 'someAttribute': 'someValue' }]
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
				});
			});
			describe('child', function () {
				it('parses child::', function () {
					var selector = parseSelector('child::someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
				});
				it('is added implicitly', function () {
					var selector = parseSelector('someElement');
					jsonMLMapper.parse([
						'someParentElement',
						['someElement']
					], documentNode);
					chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
				});
			});
		});

		describe('operators', function () {
			describe('boolean operators', function () {
				describe('and', function () {
					it('can parse an "and" selector', function () {
						var selector = parseSelector('true() and true()');
						chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
					});

					it('can parse a concatenation of ands', function () {
						var selector = parseSelector('true() and true() and true() and false()');
						chai.expect(selector.matches(documentNode, blueprint)).to.equal(false);
					});
				});
				describe('or', function () {
					it('can parse an "or" selector', function () {
						var selector = parseSelector('false() or true()');
						chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
					});

					it('can parse an "or" selector with different buckets', function () {
						var selector = parseSelector('self::someElement or self::processing-instruction()');
						jsonMLMapper.parse([
							'someParentElement',
							['someElement']
						], documentNode);
						chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
						chai.expect(selector.getBucket()).to.equal(null);
					});

					it('can parse a concatenation of ors', function () {
						var selector = parseSelector('false() or false() or false() or (: Note: the last true() will make te result true:) true()');
						chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
					});

					it('allows not in combination with or', function () {
						var selector = parseSelector('someChildElement or not(someOtherChild)');
						jsonMLMapper.parse([
							'someOtherParentElement',
							['someOtherChildElement']
						], documentNode);
						chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
					});
				});
			});

			it('uses correct operator precedence', function () {
				var selector = parseSelector('(child::someElement and ancestor::someParentElement) or @someAttribute=\'someValue\'');
				jsonMLMapper.parse([
					'someParentElement',
					[
						'someMiddleElement',
						{ 'someAttribute': 'someValue' },
						['someOtherElement']
					]
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
				// The other way around
				selector = parseSelector('(child::someOtherElement and ancestor::someParentElement) or @someAttribute=\'someOtherValue\'');
				chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
				// Changes to testcase A: Operator order changed because of parentheses
				selector = parseSelector('child::someElement and (ancestor::someParentElement or @someAttribute="someValue")');
				chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(false);
			});
		});

		it('allows shorthand for parent (..)', function () {
			var selector = parseSelector('..');
			jsonMLMapper.parse([
				'someParentElement',
				['someChildElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true, 'someMiddleElement has a parent');
		});

		it('allows nodeNames containing namespaces', function () {
			var selector = parseSelector('self::someNamespace:someElement');
			var element = documentNode.createElement('someNamespace:someElement');
			chai.expect(selector.matches(element, blueprint)).to.equal(true);
		});

		it('allows true and false in a test', function () {
			var selector = parseSelector('self::false() or self::true()');
			chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
		});

		describe('predicates', function () {
			it('can parse a simple nodeName + attribute selector', function () {
				var selector = parseSelector('self::someElement[@someAttribute=\'someValue\']');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someAttribute', 'someValue');
				chai.expect(selector.matches(element, blueprint)).to.equal(true);
			});

			it('uses correct contexts in predicates', function () {
				var selector = parseSelector('parent::someParentElement[parent::someGrandParentElement]');
				jsonMLMapper.parse([
					'someGrandParentElement',
					[
						'someParentElement',
						['someChildelement']
					]
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement.firstChild.firstChild, blueprint)).to.equal(true);
			});

			it('can parse a simple any element + attribute selector', function () {
				var selector = parseSelector('self::*[@someAttribute=\'someValue\']');
				var element = documentNode.createElement('someElement');
				element.setAttribute('someAttribute', 'someValue');
				chai.expect(selector.matches(element, blueprint)).to.equal(true);
				var comment = documentNode.createComment('someComment');
				chai.expect(selector.matches(comment, blueprint)).to.equal(false);
			});

			it('can parse nested predicates', function () {
				var selector = parseSelector('descendant-or-self::node()[self::*[@someAttribute="someValue"]]');
				jsonMLMapper.parse([
					'someParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(false);
			});

			it('can parse multiple chained predicates', function () {
				var selector = parseSelector('self::node()[self::*][child::someChildElement]');
				jsonMLMapper.parse([
					'someParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});

			it('can parse multiple chained predicates, resulting in a false', function () {
				var selector = parseSelector('self::node()[self::*][child::someChildElement][self::false()]');
				jsonMLMapper.parse([
					'someParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(false);
			});

			it('allows not', function () {
				var selector = parseSelector('not(someChild)');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});

			it('can target the root element', function () {
				var selector = parseSelector('parent::node() and not(parent::*)');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});
		});

		it('allows processing instruction targets as literals', function () {
			var selector = parseSelector('self::processing-instruction("someTarget")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['?someTarget', 'someData']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});

		it('allows processing instruction targets as NCNames', function () {
			var selector = parseSelector('self::processing-instruction(someTarget)');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['?someTarget', 'someData']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});

		describe('custom nodeTest (fonto:.*())', function () {
			it('allows custom nodeTests', function () {
				addXPathCustomTest(
					'fonto:nodenameContains',
					function (includeString, node, blueprint) {
						return node.nodeName.includes(includeString);
					});
				var selector = parseSelector(
						'descendant-or-self::fonto:nodenameContains("Child")');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});

			it('allows predicates in conjunction with custom tests', function () {
				addXPathCustomTest(
					'fonto:nodenameContains',
					function (includeString, node, blueprint) {
						return node.nodeName.includes(includeString);
					});
				var selector = parseSelector(
						'self::fonto:nodenameContains("someNode")[self::false()]');
				jsonMLMapper.parse([
					'someNode'
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(false, 'The false() predicate should prevent the first part from matching');
			});


			it('allows custom nodeTests with 0 arguments', function () {
				addXPathCustomTest(
					'fonto:true',
					function (node, blueprint) {
						chai.expect(arguments.length).to.equal(2);
						return true;
					});
				var selector = parseSelector(
						'descendant-or-self::fonto:true()');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});

			it('allows custom nodeTests with multiple arguments', function () {
				addXPathCustomTest(
					'fonto:nameWithinRange',
					function (lower, upper, node, blueprint) {
						chai.expect(lower).to.equal('a');
						chai.expect(upper).to.equal('c');
						return lower < node.nodeName &&
							node.nodeName < upper;
					});
				var selector = parseSelector(
						'descendant-or-self::fonto:nameWithinRange("a", "c")');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['b']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});

			it('still allows deprecated syntax of custom nodeTests', function () {
				addXPathCustomTest(
					'fonto-nodenameContains',
					function (includeString, node, blueprint) {
						return node.nodeName.includes(includeString);
					});
				var selector = parseSelector(
						'descendant-or-self::fonto-nodenameContains("Child")');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});

			it('still allows deprecated syntax of custom nodeTests', function () {
				addXPathCustomTest(
					'fonto-nodenameContains',
					function (includeString, node, blueprint) {
						return node.nodeName.includes(includeString);
					});
				var selector = parseSelector(
						'descendant-or-self::fonto:nodenameContains("Child")');
				jsonMLMapper.parse([
					'someOtherParentElement',
					['someChildElement']
				], documentNode);
				chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
			});
		});
		it('matches hovercrafts full of eels', function () {
			jsonMLMapper.parse([
				'hovercraft',
				['eel'],
				['eel']
			], documentNode);
			var selector = parseSelector('self::hovercraft[eel and not(*[not(self::eel)])]');
			chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
		});

		describe('paths', function () {
			describe('absolute paths', function () {
				it('supports absolute paths', function () {
					jsonMLMapper.parse([
						'someNode'
					], documentNode);
					var selector = parseSelector('/someNode');
					chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([documentNode.documentElement]);
				});
				it('supports chaining from absolute paths', function () {
					jsonMLMapper.parse([
						'someNode',
						['someChildNode']
					], documentNode);
					var selector = parseSelector('/someNode/someChildNode');
					chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([documentNode.documentElement.firstChild]);
				});
				it('allows // as root', function () {
					jsonMLMapper.parse([
						'someNode',
						['someChildNode']
					], documentNode);
					var selector = parseSelector('//someChildNode');
					chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([documentNode.documentElement.firstChild]);
				});

				it('targets descendants with //', function () {
					jsonMLMapper.parse([
						'someNode',
						['someChildNode', ['someDescendantNode']]
					], documentNode);
					var selector = parseSelector('//someDescendantNode');
					chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.deep.equal([documentNode.documentElement.firstChild.firstChild]);
				});
			});

			describe('relative paths', function () {
				it('supports relative paths', function () {
					jsonMLMapper.parse([
						'someNode',
						['someChildNode']
					], documentNode);
					var selector = parseSelector('someChildNode');
					chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([documentNode.documentElement.firstChild]);
				});

				it('supports addressing the parent axis with ..', function () {
					jsonMLMapper.parse([
						'someNode',
						[
							'someChildNode',
							['someGrandChild']
						]
					], documentNode);
					var selector = parseSelector('../child::someNode');
					chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([
						documentNode.documentElement
					]);
				});

				it('supports walking from attribute nodes', function () {
					jsonMLMapper.parse([
						'someNode',
						{ someAttribute: 'someValue' },
						['someChildNode']
					], documentNode);
					var selector = parseSelector('@someAttribute/..');
					chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([documentNode.documentElement]);
				});

				it('supports addressing the contextNode with .', function () {
					jsonMLMapper.parse([
						'someNode',
						[
							'someChildNode',
							['someGrandChild']
						]
					], documentNode);
					var selector = parseSelector('.//*');
					chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([
						documentNode.documentElement.firstChild,
						documentNode.documentElement.firstChild.firstChild
					]);
				});
			});

			describe('Arrow functions', function () {
				// Our only 3.1 feature
				it('pipes the result to the next function', function () {
					var selector = parseSelector('true() => not()');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal(false);
				});

				it('can be chained', function () {
					var selector = parseSelector('(1,2,3) => true() => count()');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal(1);
				});
			});

			describe('stringConcat', function () {
				it('can concatenate strings', function () {
					var selector = parseSelector('"con" || "cat" || "enate"');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal('concatenate');
				});
			});

			describe('filters', function () {
				it('works with boolean values: all', function () {
					var selector = parseSelector('(1,2,3)[true()]');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal([1,2,3]);
				});
				it('works with boolean values: none', function () {
					var selector = parseSelector('(1,2,3)[false()]');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal([]);
				});
				it('works with integer values', function () {
					var selector = parseSelector('(1,2,3)[2]');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal(2);
				});
				it('works with decimal values', function () {
					var selector = parseSelector('(1,2,3)[.5]');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal([]);
				});
				it('is passed the context item', function () {
					var selector = parseSelector('(1 to 3)[.!=2]');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal([1,3]);
				});
			});

			describe('comments', function () {
				it('can parse comments', function () {
					var selector = parseSelector('true() (: and false() :) or true()');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal(true);
				});

				it('can parse nested comments', function () {
					var selector = parseSelector('true() (: and false() (:and true():) :) or false');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal(true);
				});
			});

			describe('union', function () {
				it('can parse union', function () {
					var selector = parseSelector('(//someNode | //someChildNode)');
					jsonMLMapper.parse([
						'someNode',
						['someChildNode']
					], documentNode);

					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
				});

				it('dedupes nodes', function () {
					var selector = parseSelector('(//* | //*)');
					jsonMLMapper.parse([
						'someNode',
						['someChildNode']
					], documentNode);

					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
				});

				it('throws an error when not passed a node sequence', function () {
					var selector = parseSelector('(1,2,3) | (4,5,6)');
					chai.expect(function () {
						evaluateXPath(selector, documentNode, blueprint);
					}).to.throw(/ERRXPTY0004/);
				});

				it.skip('sorts nodes', function () {
					// Not implemented yet: performance reasons
					var selector = parseSelector('(//C | //B | //A)');
					jsonMLMapper.parse([
						'someNode',
						['A'],
						['B'],
						['C']
					], documentNode);

					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.deep.equal(Array.from(documentNode.firstChild.childNodes));
				});
			});

			describe('boolean', function () {
				it('If $arg is the empty sequence, fn:boolean returns false.', function () {
					var selector = parseSelector('boolean(())');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.equal(false);
				});

				it('If $arg is a sequence whose first item is a node, fn:boolean returns true.', function () {
					var selector = parseSelector('boolean(.)');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.equal(true);
				});

				it('If $arg is a singleton value of type xs:boolean or a derived from xs:boolean, fn:boolean returns $arg.', function () {
					var selector1 = parseSelector('boolean(true())'),
						selector2 = parseSelector('boolean(false())');
					chai.expect(
						evaluateXPath(selector1, documentNode, blueprint)
					).to.equal(true);
					chai.expect(
						evaluateXPath(selector2, documentNode, blueprint)
					).to.equal(false);
				});

				it('If $arg is a singleton value of type xs:string or a type derived from xs:string, xs:anyURI or a type derived from xs:anyURI or xs:untypedAtomic, fn:boolean returns false if the operand value has zero length; otherwise it returns true.', function () {
					var selector1 = parseSelector('boolean("test")'),
						selector2 = parseSelector('boolean("")');
					chai.expect(
						evaluateXPath(selector1, documentNode, blueprint)
					).to.equal(true);
					chai.expect(
						evaluateXPath(selector2, documentNode, blueprint)
					).to.equal(false);
				});

				it('If $arg is a singleton value of any numeric type or a type derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.', function () {
					var selector1 = parseSelector('boolean(1)'),
						selector2 = parseSelector('boolean(0)'),
						selector3 = parseSelector('boolean(+("not a number" (: string coerce to double will be NaN :)))');
					chai.expect(
						evaluateXPath(selector1, documentNode, blueprint)
					).to.equal(true, '1');
					chai.expect(
						evaluateXPath(selector2, documentNode, blueprint)
					).to.equal(false, '0');
					chai.expect(
						evaluateXPath(selector3, documentNode, blueprint)
					).to.equal(false, 'NaN');
				});

				it('In all other cases, fn:boolean raises a type error [err:FORG0006].', function () {
					var selector = parseSelector('boolean(("a", "b", "c"))');
					chai.expect(function () {
						evaluateXPath(selector, documentNode, blueprint);
					}).to.throw(/FORG0006/);
				});
			});

			describe('string', function () {
				it('In the zero-argument version of the function, $arg defaults to the context item. That is, calling fn:string() is equivalent to calling fn:string(.).', function () {
					var selector = parseSelector('string()');
					jsonMLMapper.parse('Some text.', documentNode);
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.equal('Some text.');
				});

				it('If $arg is the empty sequence, the function returns the zero-length string.', function () {
					var selector = parseSelector('string(())');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.equal('');
				});

				it('If $arg is a node, the function returns string value of the node, as obtained using the dm:string-value accessor defined in [XQuery and XPath Data Model (XDM) 3.0] (see Section 5.13 string-value Accessor).', function () {
					var selector = parseSelector('string(.)');
					jsonMLMapper.parse('Some text.', documentNode);
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.equal('Some text.');
				});

				it('If $arg is an atomic value, the function returns the result of the expression $arg cast as xs:string (see 19 Casting).', function () {
					var selector1 = parseSelector('string(12)'),
						selector2 = parseSelector('string("13")'),
						selector3 = parseSelector('string(true())'),
						selector4 = parseSelector('string(false())');
					chai.expect(
						evaluateXPath(selector1, documentNode, blueprint)
					).to.equal('12');
					chai.expect(
						evaluateXPath(selector2, documentNode, blueprint)
					).to.equal('13');
					chai.expect(
						evaluateXPath(selector3, documentNode, blueprint)
					).to.equal('true');
					chai.expect(
						evaluateXPath(selector4, documentNode, blueprint)
					).to.equal('false');
				});

				it.skip('A dynamic error is raised [err:XPDY0002] by the zero-argument version of the function if the context item is absent.', function () {
					var selector = parseSelector('string()');
					chai.expect(function () {
						evaluateXPath(selector, documentNode, blueprint);
					}).to.throw(/XPDY0002/);
				});

				it('A type error is raised [err:FOTY0014] if $arg is a function item (this includes maps and arrays).', function () {
					var selector = parseSelector('string(("a", "b", "c"))');
					chai.expect(function () {
						evaluateXPath(selector, documentNode, blueprint);
					}).to.throw(/FOTY0014/);
				});
			});

			describe('number', function () {
				it('Calling the zero-argument version of the function is defined to give the same result as calling the single-argument version with the context item (.). That is, fn:number() is equivalent to fn:number(.), as defined by the rules that follow.', function () {
					var selector = parseSelector('number()');
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint)
					).to.be.NaN;
				});

				it('If $arg is the empty sequence or if $arg cannot be converted to an xs:double, the xs:double value NaN is returned.', function () {
					var selector1 = parseSelector('number(())'),
						selector2 = parseSelector('number()');
					chai.expect(
						evaluateXPath(selector1, documentNode, blueprint)
					).to.be.NaN;
					chai.expect(
						evaluateXPath(selector2, documentNode, blueprint)
					).to.be.NaN;
				});

				it('Otherwise, $arg is converted to an xs:double following the rules of 19.1.2.2 Casting to xs:double. If the conversion to xs:double fails, the xs:double value NaN is returned.', function () {
					var selector1 = parseSelector('number(123)'),
						selector2 = parseSelector('number(12.3)');
					chai.expect(
						evaluateXPath(selector1, documentNode, blueprint)
					).to.equal(123);
					chai.expect(
						evaluateXPath(selector2, documentNode, blueprint)
					).to.equal(12);
				});

				it.skip('A dynamic error is raised [err:XPDY0002] if $arg is omitted and the context item is absent.', function () {
					var selector = parseSelector('number()');
					chai.expect(function () {
						evaluateXPath(selector, documentNode, blueprint);
					}).to.throw(/XPDY0002/);
				});

				it.skip('As a consequence of the rules given above, a type error occurs if the context item cannot be atomized, or if the result of atomizing the context item is a sequence containing more than one atomic value.', function () {
					var selector = parseSelector('number()');
					chai.expect(function () {
						evaluateXPath(selector, documentNode, blueprint);
					}).to.throw();
				});
			});

			describe('operators', function () {
				describe('boolan operators', function () {
					describe('compares', function () {
						describe('Value compares', function () {
							it('works over singleton sequences', function () {
								var selector = parseSelector('true() eq true()');
								chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
							});

							it('does not work over non-singleton sequences', function () {
								var selector = parseSelector('(1, 2) eq true()');
								chai.expect(function () {
									evaluateXPath(selector, documentNode, blueprint);
								}).to.throw(/ERRXPTY0004/);
							});

							it('Does work with typing: decimal to int', function () {
								var selector = parseSelector('1 eq 1.0');
								chai.expect(
									evaluateXPath(selector, documentNode, blueprint)
								).to.equal(true);
							});

							it('Does work with typing: double to int', function () {
								var selector = parseSelector('100 eq 1.0e2');
								chai.expect(
									evaluateXPath(selector, documentNode, blueprint)
								).to.equal(true);
							});

							it('atomizes attributes', function () {
								jsonMLMapper.parse([
									'someNode',
									{
										a: 'value',
										b: 'value'
									}
								], documentNode);
								var selector = parseSelector('@a eq "value"');
								chai.expect(
									evaluateXPath(selector, documentNode.documentElement, blueprint)
								).to.deep.equal(true);
							});

							it('(does not) work with typing: untyped attributes', function () {
								jsonMLMapper.parse([
									'someNode',
									{
										a: 'value'
									}
								], documentNode);
								var selector = parseSelector('@a eq 1');
								chai.expect(function () {
									evaluateXPath(selector, documentNode.documentElement, blueprint);
								}).to.throw(/ERRXPTY0004/);
							});

							it('(does not) work with typing: int to string', function () {
								var selector = parseSelector('1 eq "1"');
								chai.expect(function () {
									evaluateXPath(selector, documentNode, blueprint);
								}).to.throw(/ERRXPTY0004/);
							});

							it('(does not) work with typing: boolean to string', function () {
								var selector = parseSelector('true() eq "true"');
								chai.expect(function () {
									evaluateXPath(selector, documentNode, blueprint);
								}).to.throw(/ERRXPTY0004/);
							});

							describe('eq', function () {
								it('returns true if the first operand is equal to the second', function () {
									var selector = parseSelector('1 eq 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('+0 eq -0', function () {
									var selector = parseSelector('+0 eq -0');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns false if the first operand is not equal to the second', function () {
									var selector = parseSelector('1 eq 2');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});
							});

							describe('ne', function () {
								it('returns true if the first operand is not equal to the second', function () {
									var selector = parseSelector('1 ne 2');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns false if the first operand is equal to the second', function () {
									var selector = parseSelector('1 ne 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});
							});

							describe('gt', function () {
								it('returns true if the first operand is greater than the second', function () {
									var selector = parseSelector('2 gt 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns false if the first operand is equal to the second', function () {
									var selector = parseSelector('1 gt 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});

								it('returns false if the first operand is less than the second', function () {
									var selector = parseSelector('1 gt 2');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});
							});

							describe('lt', function () {
								it('returns true if the first operand is less than the second', function () {
									var selector = parseSelector('1 lt 2');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns false if the first operand is equal to the second', function () {
									var selector = parseSelector('1 lt 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});

								it('returns false if the first operand is less than the second', function () {
									var selector = parseSelector('2 lt 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});
							});

							describe('ge', function () {
								it('returns true if the first operand is greater than the second', function () {
									var selector = parseSelector('2 ge 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns true if the first operand is equal to the second', function () {
									var selector = parseSelector('1 ge 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns false if the first operand is less than the second', function () {
									var selector = parseSelector('1 ge 2');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});
							});

							describe('le', function () {
								it('returns true if the first operand is less than the second', function () {
									var selector = parseSelector('1 le 2');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns true if the first operand is equal to the second', function () {
									var selector = parseSelector('1 le 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
								});

								it('returns false if the first operand is greater than the second', function () {
									var selector = parseSelector('2 le 1');
									chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
								});
							});
						});

						describe('General compares', function () {
							it('Compares over sets', function () {
								var selector = parseSelector('(1, 2, 3) = 3');
								chai.expect(
									evaluateXPath(selector, documentNode, blueprint)
								).to.equal(true);
							});
						});
					});
				});

				describe('unary operators', function () {
					it('accepts + when passed an integer', function () {
						var selector = parseSelector('+1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(1);
					});
					it('negates a - when passed an integer', function () {
						var selector = parseSelector('-1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(-1);
					});
					it('accepts + when passed 0', function () {
						var selector = parseSelector('+0');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(0);
					});
					it('accepts - when passed 0', function () {
						var selector = parseSelector('-0');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(0);
					});
					it('accepts chaining +', function () {
						var selector = parseSelector('++++1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(1);
					});
					it('accepts chaining -', function () {
						var selector = parseSelector('----1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(1);
					});
					it('accepts chaining - and + intermittently', function () {
						var selector = parseSelector('+-+-1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(1);
					});
					it('resolves to NaN passed a string', function () {
						var selector = parseSelector('+"something"');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.be.NaN;
					});
					it('resolves to NaN passed a boolean', function () {
						var selector = parseSelector('+true()');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.be.NaN;
					});
					it('resolves to NaN passed a node', function () {
						var selector = parseSelector('+.');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.be.NaN;
					});
				});

				describe('mathematical operators', function () {
					it('can evaluate 1 + 1 to 2', function () {
						var selector = parseSelector('1 + 1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(2);
					});
					it('can evaluate 1 - 1 to 0', function () {
						var selector = parseSelector('1 - 1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(0);
					});
					it('can evaluate 1 * 2 to 2', function () {
						var selector = parseSelector('1 * 2');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(2);
					});
					it('can evaluate 1 div 2 to 0.5', function () {
						var selector = parseSelector('1 div 2');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(0.5);
					});
					it('can evaluate 1 idiv 2 to 1', function () {
						var selector = parseSelector('1 div 2');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(0.5);
					});
					it('can evaluate 5 mod 3 to 2', function () {
						var selector = parseSelector('5 mod 3');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.equal(2);
					});
					it('can evaluate "something" + 1 to NaN', function () {
						var selector = parseSelector('"something" + 1');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.be.NaN;
					});
					it('can parse untyped attributes', function () {
						var selector = parseSelector('@a + 1');
						jsonMLMapper.parse(['someElement',{a:'1'}], documentNode);
						chai.expect(
							evaluateXPath(selector, documentNode.documentElement, blueprint)
						).to.equal(2);
					});
				});

				describe('sequence', function () {
					it('creates a sequence', function () {
						var selector = parseSelector('(1,2,3)');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal([1,2,3]);
					});

					it('creates an empty sequence', function () {
						var selector = parseSelector('()');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal([]);
					});

					it('normalizes sequences', function () {
						var selector = parseSelector('(1,2,(3,4))');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal([1,2,3,4]);
					});
				});

				describe('range', function () {
					it('creates a sequence', function () {
						var selector = parseSelector('1 to 10');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal([1,2,3,4,5,6,7,8,9,10]);
					});
				});

				describe('let', function () {
					it('creates a variable reference', function () {
						var selector = parseSelector('let $x := 1 return $x');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal(1);
					});

					it('can be chained', function () {
						var selector = parseSelector('let $x := 1, $y := 2 return $x * $y');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal(2);
					});

					it('chains in the correct order', function () {
						var selector = parseSelector('let $x := 1, $y := 2, $x := 3 return $x (: If the order would be inverse, $x would still be 1 :)');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal(3);
					});
				});

				describe('varRef', function () {
					it('can reference variables', function () {
						var selector = parseSelector('$x');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint, {'x': 42})
						).to.deep.equal(42);
					});

					it('can reference built-in variables', function () {
						var selector = parseSelector('$theBest');
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint)
						).to.deep.equal('FontoXML is the best!');
					});
				});


				describe('functions', function () {
					describe('last()', function () {
						it('returns the length of the dynamic context size', function () {
							var selector = parseSelector('(1,2,3)[last()]');
							chai.expect(
								evaluateXPath(selector, documentNode, blueprint)
							).to.equal(3);
						});
						it('can target the second to last item', function () {
							var selector = parseSelector('(1,2,3)[last() - 1]');
							chai.expect(
								evaluateXPath(selector, documentNode, blueprint)
							).to.equal(2);
						});
					});
					describe('count()', function () {
						it('returns the length of the sequence', function () {
							var selector = parseSelector('count((1 to 1000))');
							chai.expect(
								evaluateXPath(selector, documentNode, blueprint)
							).to.equal(1000);
						});

						it('returns the length of the empty sequence', function () {
							var selector = parseSelector('count(())');
							chai.expect(
								evaluateXPath(selector, documentNode, blueprint)
							).to.equal(0);
						});

						it('returns the length of a singleton sequence', function () {
							var selector = parseSelector('count((1))');
							chai.expect(
								evaluateXPath(selector, documentNode, blueprint)
							).to.equal(1);
						});
					});
				});
			});
		});
	});
});

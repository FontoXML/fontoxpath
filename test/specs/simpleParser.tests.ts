import * as chai from 'chai';
import ExternalDomFacade from 'fontoxpath/domFacade/ExternalDomFacade';
import { parse } from 'fontoxpath/parsing/simpleParser';
import { sync } from 'slimdom-sax-parser';

describe.only('simpleParser', () => {
	it('parses and runs self::p', () => {
		const result = parse('self::p');

		console.log(result);

		const func = new Function('contextItem', 'domFacade', 'resolvePrefix', result);

		const doc = sync('<p/>');

		const result2 = func(doc.documentElement, new ExternalDomFacade(), () => '');

		chai.assert.equal(result2, doc.documentElement);
	});

	it('parses and runs parent::p', () => {
		const result = parse('parent::p');

		console.log(result);

		const func = new Function('contextItem', 'domFacade', 'resolvePrefix', result);

		const doc = sync('<p><x/></p>');

		const result2 = func(doc.documentElement.firstChild, new ExternalDomFacade(), () => '');

		chai.assert.equal(result2, doc.documentElement);
	});

	it('parses and runs parent::p', () => {
		const result = parse('parent::p/child::x');

		console.log(result);

		const func = new Function('contextItem', 'domFacade', 'resolvePrefix', result);

		const doc = sync('<p><x/></p>');

		const result2 = func(doc.documentElement.firstChild, new ExternalDomFacade(), () => '');

		chai.assert.equal(result2, doc.documentElement.firstChild);
	});
});

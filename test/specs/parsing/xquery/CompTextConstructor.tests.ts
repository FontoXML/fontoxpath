import * as chai from 'chai';
import { evaluateXPath} from 'fontoxpath';
import evaluateXPathToString from "fontoxpath/evaluateXPathToString";

import * as slimdom from 'slimdom';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Computed Text Constructor ', () => {

    it('create a a computed text constructor', () => {
        chai.assert.equal(
            evaluateXPathToString(
                `text {"Hello"}`,
                documentNode,
                undefined,
                {},
                { language: evaluateXPath.XQUERY_3_1_LANGUAGE }), 'Hello');
    });

    it('create a a computed text constructor expression', () => {
        chai.assert.equal(
            evaluateXPathToString(
                `text {"&#xa;"}`,
                documentNode,
                undefined,
                {},
                { language: evaluateXPath.XQUERY_3_1_LANGUAGE }), "\n");
    });
});

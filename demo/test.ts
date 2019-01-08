import * as fontoxpath from '../src/index';
import { sync, slimdom } from 'slimdom-sax-parser';
import SequenceFactory from '../src/expressions/dataTypes/SequenceFactory';
import concatSequences from '../src/expressions/util/concatSequences';
import {
	evaluateXPathToNumber,
	registerCustomXPathFunction,
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	evaluateXPathToArray,
	evaluateXPathToAsyncIterator,
	evaluateXPathToFirstNode,
	evaluateXPathToStrings
} from '../src/index';
import functionRegistry from '../src/expressions/functions/functionRegistry';

const documentNode = new slimdom.Document();

const docA = sync('<a><b/><c/></a>');
const docB = sync('<A><B/><C/></A>');
const result = evaluateXPathToBoolean('let $fn := function ($a as xs:integer){ $a } return $fn("A string")');

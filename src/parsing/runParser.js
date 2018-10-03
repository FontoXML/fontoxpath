// TODO: Remove this file before merging into master
const parser = require('./xPathParser.raw.js');

const input = `
module namespace test="prrt";
declare variable $test := parent::bob/../@henk[bob]/descendant::node();
`;

function print (what, indent, n) {
	const filler = Array(indent).fill(' ').join('');
	switch (typeof what) {
		case 'object': {
			if (Array.isArray(what)) {
				return what.map((w, i) => print(w, indent + 2, i)).join('\n');
			}
			if (what === null) {
				return filler + what;
			}
			if (n !== 1) {
				console.warn('Attributes at the wrong place!!!');
			}
			return Object.keys(what).map(k => filler + '⤷' + k + ': "' + what[k] + '"').join('\n');
		}
		default: {
			if (n === 0) {
				return filler + what;
			}
			return filler + '  "' + what + '"';
		}
	}
}

try {
	console.log(print(parser.xPathParser.parse(input), 0, 0));
}
catch (err) {
	console.log(err);
	const start = err.location.start.offset;
	console.log(input.substring(0, start) + '[HERE]' + input.substring(start));
}

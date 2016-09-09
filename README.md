# fontoxml-selectors

A selector engine for (XML) nodes.

To recompile the parser, run the following

npm i -g pegjs
npm i -g uglify

pegjs --cache --export-var xPathParser --format globals -o src/parsing/xPathParser.raw.js src/parsing/xpath.pegjs
uglify -s ./src/parsing/xPathParser.raw.js -o ./src/parsing/xPathParser.raw.js

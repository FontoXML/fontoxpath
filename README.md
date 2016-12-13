# fontoxml-selectors

A selector engine for (XML) nodes.

To recompile the parser, run the following

```
npm i -g pegjs
npm i -g uglify

# Generate parser
pegjs --cache --export-var xPathParser --format globals -o src/parsing/xPathParser.raw.js src/parsing/xpath.pegjs
# Uglify parser by hand
uglify -s ./src/parsing/xPathParser.raw.js -o ./src/parsing/xPathParser.raw.js
# Add istanbul ignore
sed -i '1s;^;/* istanbul ignore next */\n;' ./src/parsing/xPathParser.raw.js
# Update parser version
sed -r 's/(.*)([0-9]+)(.*)/echo "\1$((\2+1))\3"/ge' src/parsing/XPATHPARSER_VERSION.js -i
```

To build the package, run `npm run build` in the root folder.

// TODO: Remove this file before merging into master
const parser = require('./xPathParser.raw.js');

const input = `xquery version "1.0" encoding "utf-8";
main`;

console.log(parser.xPathParser.parse(input));

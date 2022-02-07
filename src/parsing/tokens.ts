import { or, token } from 'prsc';

export const WHITESPACE = or([token('\u0020'), token('\u0009'), token('\u000D'), token('\u000A')]);

export const COMMENT_START = token('(:');
export const COMMENT_END = token(':)');

export const PRAGMA_START = token('(#');
export const PRAGMA_END = token('#)');

export const BRACE_OPEN = token('(');
export const BRACE_CLOSE = token(')');
export const BRACKET_OPEN = token('[');
export const BRACKET_CLOSE = token(']');
export const CURLY_BRACE_OPEN = token('{');
export const CURLY_BRACE_CLOSE = token('}');
export const CURLY_BRACE_OPEN_DOUBLE = token('{{');
export const CURLY_BRACE_CLOSE_DOUBLE = token('}}');

export const SINGLE_QUOTE = token("'");
export const SINGLE_QUOTE_DOUBLE = token("''");
export const DOUBLE_QUOTE = token('"');
export const DOUBLE_QUOTE_DOUBLE = token('""');

export const CDATA_OPEN = token('<![CDATA[');
export const CDATA_CLOSE = token(']]>');

export const DIR_ELEM_CLOSE = token('/>');
export const DIR_ELEM_OPEN_CONTENT = token('</');

export const DIR_COMMENT_OPEN = token('<!--');
export const DIR_COMMENT_CLOSE = token('-->');

export const DIR_PI_OPEN = token('<?');
export const DIR_PI_CLOSE = token('?>');

export const CHAR_REF_HEX = token('&#x');
export const CHAR_REF = token('&#');

export const COLON_ASTERIX = token(':*');
export const ASTERIX_COLON = token('*:');
export const WALRUS = token(':=');

export const AMPERSAND = token('&');
export const COLON = token(':');
export const SEMICOLON = token(';');
export const ASTERIX = token('*');
export const AT_SIGN = token('@');
export const DOLLAR = token('$');
export const HASHTAG = token('#');
export const PERCENT = token('%');
export const QUESTION_MARK = token('?');
export const EXCLAMATION_MARK = token('!');
export const VERTICAL_BAR = token('|');
export const VERTICAL_BAR_DOUBLE = token('||');
export const EQUALS = token('=');
export const NOT_EQUALS = token('!=');
export const LESS_THAN = token('<');
export const LESS_THAN_DOUBLE = token('<<');
export const LESS_THAN_EQUALS = token('<=');
export const GREATER_THAN = token('>');
export const GREATER_THAN_DOUBLE = token('>>');
export const GREATER_THAN_EQUALS = token('>=');
export const COMMA = token(',');
export const DOT = token('.');
export const DOUBLE_DOT = token('..');
export const PLUS = token('+');
export const MINUS = token('-');
export const SLASH = token('/');
export const DOUBLE_SLASH = token('//');
export const ARROW = token('=>');

export const E_LOWER = token('e');
export const E_UPPER = token('E');

export const L_LOWER = token('l');
export const L_UPPER = token('L');

export const M_LOWER = token('m');
export const M_UPPER = token('M');

export const Q_UPPER = token('Q');

export const X_LOWER = token('x');
export const X_UPPER = token('X');

export const AS = token('as');
export const CAST = token('cast');
export const CASTABLE = token('castable');
export const TREAT = token('treat');
export const INSTANCE = token('instance');
export const OF = token('of');
export const NODE = token('node');
export const NODES = token('nodes');
export const DELETE = token('delete');
export const VALUE = token('value');
export const FUNCTION = token('function');
export const MAP = token('map');
export const ELEMENT = token('element');
export const ATTRIBUTE = token('attribute');
export const SCHEMA_ELEMENT = token('schema-element');
export const INTERSECT = token('intersect');
export const EXCEPT = token('except');
export const UNION = token('union');
export const TO = token('to');
export const IS = token('is');
export const OR = token('or');
export const AND = token('and');
export const DIV = token('div');
export const IDIV = token('idiv');
export const MOD = token('mod');
export const EQ = token('eq');
export const NE = token('ne');
export const LT = token('lt');
export const LE = token('le');
export const GT = token('gt');
export const GE = token('ge');
export const AMP = token('amp');
export const QUOT = token('quot');
export const APOS = token('apos');
export const IF = token('if');
export const THEN = token('then');
export const ELSE = token('else');
export const ALLOWING = token('allowing');
export const EMPTY = token('empty');
export const AT = token('at');
export const IN = token('in');
export const FOR = token('for');
export const LET = token('let');
export const WHERE = token('where');
export const COLLATION = token('collation');
export const GROUP = token('group');
export const BY = token('by');
export const ORDER = token('order');
export const STABLE = token('stable');
export const RETURN = token('return');
export const ARRAY = token('array');
export const DOCUMENT = token('document');
export const NAMESPACE = token('namespace');
export const TEXT = token('text');
export const COMMENT = token('comment');
export const PROCESSING_INSTRUCTION = token('processing-instruction');
export const LAX = token('lax');
export const STRICT = token('strict');
export const VALIDATE = token('validate');
export const TYPE = token('type');
export const DECLARE = token('declare');
export const DEFAULT = token('default');
export const BOUNDARY_SPACE = token('boundary-space');
export const STRIP = token('strip');
export const PRESERVE = token('preserve');
export const NO_PRESERVE = token('no-preserve');
export const INHERIT = token('inherit');
export const NO_INHERIT = token('no-inherit');
export const GREATEST = token('greatest');
export const LEAST = token('least');
export const COPY_NAMESPACES = token('copy-namespaces');
export const DECIMAL_FORMAT = token('decimal-format');
export const CASE = token('case');
export const TYPESWITCH = token('typeswitch');
export const SOME = token('some');
export const EVERY = token('every');
export const SATISFIES = token('satisfies');
export const REPLACE = token('replace');
export const WITH = token('with');
export const COPY = token('copy');
export const MODIFY = token('modify');
export const FIRST = token('first');
export const LAST = token('last');
export const BEFORE = token('before');
export const AFTER = token('after');
export const INTO = token('into');
export const INSERT = token('insert');
export const RENAME = token('rename');
export const SWITCH = token('switch');
export const VARIABLE = token('variable');
export const EXTERNAL = token('external');
export const UPDATING = token('updating');
export const IMPORT = token('import');
export const SCHEMA = token('schema');
export const MODULE = token('module');
export const BASE_URI = token('base-uri');
export const CONSTRUCTION = token('construction');
export const ORDERING = token('ordering');
export const ORDERED = token('ordered');
export const UNORDERED = token('unordered');
export const OPTION = token('option');
export const CONTEXT = token('context');
export const ITEM = token('item');
export const XQUERY = token('xquery');
export const VERSION = token('version');
export const ENCODING = token('encoding');
export const DOCUMENT_NODE = token('document-node');
export const NAMESPACE_NODE = token('namespace-node');
export const SCHEMA_ATTRIBUTE = token('schema-attribute');
export const ASCENDING = token('ascending');
export const DESCENDING = token('descending');
export const EMPTY_SEQUENCE = token('empty-sequence');

export const CHILD_AXIS = token('child::');
export const DESCENDANT_AXIS = token('descendant::');
export const ATTRIBUTE_AXIS = token('attribute::');
export const SELF_AXIS = token('self::');
export const DESCENDANT_OR_SELF_AXIS = token('descendant-or-self::');
export const FOLLOWING_SIBLING_AXIS = token('following-sibling::');
export const FOLLOWING_AXIS = token('following::');

export const PARENT_AXIS = token('parent::');
export const ANCESTOR_AXIS = token('ancestor::');
export const PRECEDING_SIBLING_AXIS = token('preceding-sibling::');
export const PRECEDING_AXIS = token('preceding::');
export const ANCESTOR_OR_SELF_AXIS = token('ancestor-or-self::');

export const DECIMAL_SEPARATOR = token('decimal-separator');
export const GROUPING_SEPARATOR = token('grouping-separator');
export const INFINITY = token('infinity');
export const MINUS_SIGN = token('minus-sign');
export const NAN = token('NaN');
export const PER_MILLE = token('per-mille');
export const ZERO_DIGIT = token('zero-digit');
export const DIGIT = token('digit');
export const PATTERN_SEPARATOR = token('pattern-separator');
export const EXPONENT_SEPARATOER = token('exponent-separator');

export const SCHEMA_ATTRIBUTE_OPEN = token('schema-attribute(');
export const DOCUMENT_NODE_OPEN = token('document-node(');
export const PROCESSING_INSTRUCTION_OPEN = token('processing-instruction(');
export const PROCESSING_INSTRUCTION_TEST = token('processing-instruction()');

export const COMMENT_TEST = token('comment()');
export const TEXT_TEST = token('text()');
export const NAMESPACE_NODE_TEST = token('namespace-node()');
export const ANY_KIND_TEST = token('node()');
export const ITEM_TYPE_TEST = token('item()');
export const EMPTY_SEQUENCE_TEST = token('empty-sequence()');

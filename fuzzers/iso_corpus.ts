export default [
	"as:is-content-chunk(.)",
	"self::*[fonto:is-on-review-route()]",
	"self::Q{}table or self::Q{}thead or self::Q{}tbody or self::Q{}tfoot or self::Q{}tr or self::Q{}td or self::Q{}th or self::Q{}colgroup or self::Q{}col",
	"self::as:*",
	"self::*[parent::std-doc-meta]",
	"self::*[parent::std-meta]",
	"self::*[parent::nat-meta]",
	"self::*[parent::iso-meta]",
	"self::*[parent::article-meta]",
	"self::* and parent::*[self::mml:math[parent::inline-formula]]",
	"self::Q{}table",
	"self::Q{}td",
	"self::element() and fonto:is-read-only-root(.)",
	"self::sec or self::app or self::term-sec",
	"self::Q{}td or self::Q{}th",
	"fonto:is-hierarchy-root(.)",
	"self::text()",
	"./ancestor::Q{}table[1]/@border = '1'",
	"self::p",
	"./@align",
	"./@valign",
	"map {}",
	"./parent::*[self::Q{}tr[parent::Q{}thead or not(child::Q{}td)]]",
	"let $colspan := ./@colspan return if ($colspan) then $colspan => number() else 1",
	"let $rowspan := ./@rowspan return if ($rowspan) then $rowspan => number() else 1",
	"./@char",
	"self::p[parent::def] and not(preceding-sibling::* or following-sibling::*)",
	"self::p[parent::fn]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'roman-upper']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'order']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'dash']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'alpha-upper']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'simple']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'bullet']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'alpha-lower']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'roman-lower']]]",
	"self::p and parent::*[(self::list-item) and parent::*[self::list[@list-type = 'arabic']]]",
	"self::element()[fonto:is-hierarchy-source-node(.) or fonto:is-hierarchy-root(.)]",
	"self::Q{}th",
	"name() = 'table-wrap' or name() = 'app'",
	"child::element()[fonto:is-table-cell(.)]",
	"@Q{http://niso-sts-authoring-solution/authoring-schema}href",
	"self::italic",
	"self::bold",
	"name() = 'fig' or name() = 'fig-group' or name() = 'app'",
	"self::fn[parent::table-wrap-foot]",
	"self::Q{}tr",
	"child::*[fonto:is-table-cell(.)]",
	"child::*[self::Q{}td or self::Q{}th]",
	"child::*",
	"self::sup",
	"self::*[parent::*[self::app-group]] and not (self::node()[not(self::app)])",
	"name() = 'non-normative-note' or name() = 'sec' or name() = 'term-sec' or name() = 'table-wrap' or name() = 'fig'",
	"self::Q{}table and fonto:is-broken-table(.)",
	"name() = 'sec' or name() = 'term-sec' or name() = 'app' or name() = 'front' or name() = 'body'",
	"ancestor::element()[fonto:is-hierarchy-source-node(.) or fonto:is-hierarchy-root(.) or (name() = 'table-wrap' or name() = 'app')][1]",
	"array{app:tables-accumulator($previousAccumulator => array:flatten(),$relType,.,$isSourceNode)}",
	"ancestor::element()[fonto:is-hierarchy-source-node(.) or fonto:is-hierarchy-root(.) or (name() = 'non-normative-note' or name() = 'sec' or name() = 'term-sec' or name() = 'table-wrap' or name() = 'fig')][1]",
	"self::caption",
	"self::table-wrap",
	"array{app:notes-accumulator($previousAccumulator => array:flatten(),$relType,.,$isSourceNode)}",
	"ancestor::element()[fonto:is-hierarchy-source-node(.) or fonto:is-hierarchy-root(.) or (name() = 'fig' or name() = 'fig-group' or name() = 'app')][1]",
	"array{app:figures-accumulator($previousAccumulator => array:flatten(),$relType,.,$isSourceNode)}",
	"asn:id($id)[1]",
	"./@width",
	"self::Q{}col",
	"ancestor::element()[fonto:is-hierarchy-source-node(.) or fonto:is-hierarchy-root(.) or (name() = 'sec' or name() = 'term-sec' or name() = 'app' or name() = 'front' or name() = 'body')][1]",
	"self::Q{}table and not(fonto:is-broken-table(.))",
	"self::break",
	"array{app:sections-accumulator($previousAccumulator => array:flatten(),$relType,.,$isSourceNode)}",
	"count(ancestor-or-self::*[(local-name() = 'sec-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema') or (local-name() = 'term-sec-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema') or (local-name() = 'app-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema')])",
	"self::label[parent::array]",
	"if (ancestor-or-self::*[fonto:is-read-only-root(.)]) then ancestor-or-self::*[1] else ()",
	"self::title",
	"self::title[parent::caption]",
	"self::app",
	"self::title[parent::std]",
	"self::table-wrap-foot",
	"self::Q{}caption[parent::Q{}table]",
	"self::label",
	"self::label[parent::list-item]",
	"ancestor::document-node()",
	"self::Q{}tbody",
	"self::*",
	"let $id := @id return parent::table-wrap-foot/parent::table-wrap/descendant::xref[substring-after(@as:rid, '#') = $id]",
	"asn:footnotes-label(.)",
	"array{Q{http://niso-sts-authoring-solution/authoring-schema/numbering}rid($rid)/map {'node': .,'remoteDocumentId': fonto:remote-document-id(.)}}",
	"fonto:remote-document-id(.)",
	"@id",
	"preceding-sibling::*[1][self::xref]",
	"self::fn",
	"every $x in (ancestor-or-self::node() except ancestor-or-self::node()[fonto:content-boundary-type(.) = ('removed', 'skippable')]/ancestor::node()) satisfies $x[fonto:metadata-property(., 'allowExpansionInContentView') and fonto:in-read-only-doc(.)]",
	"./@border = '1'",
	"./Q{}col",
	"self::fig",
	"if (namespace-uri() = $as) then @as:href else @as:rid",
	"asn:id($id)[fonto:remote-document-id(.) = $remoteDocumentId][1]",
	"self::xref[@ref-type='table']",
	"self::xref",
	"self::sub",
	"self::Q{}thead",
	"name() = 'app' or (local-name() = 'app-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema')",
	"Q{http://niso-sts-authoring-solution/authoring-schema/numbering}tables-reducer(fonto:current-hierarchy-node-id(), .)",
	"self::xref[@ref-type='fig']",
	"let $firstRow :=if (./Q{}thead/Q{}tr) then head(./Q{}thead/Q{}tr)else if (./Q{}tbody/Q{}tr) then head(./Q{}tbody/Q{}tr)else head(./Q{}tr),$cells := $firstRow/*[self::Q{}td | self::Q{}th]return (for $node in $cells return let $colspan := $node/@colspan => number() return if ($colspan) then $colspan else 1) => sum()",
	"./*[self::Q{}table or self::Q{}thead or self::Q{}tbody or self::Q{}tfoot or self::Q{}tr or self::Q{}td or self::Q{}th or self::Q{}colgroup or self::Q{}col]",
	"./*[(self::Q{}col or self::Q{}colgroup or self::Q{}tr or self::Q{}thead or self::Q{}tbody or self::Q{}tfoot) => not() and following-sibling::*[self::Q{}col or self::Q{}colgroup or self::Q{}tr or self::Q{}thead or self::Q{}tbody or self::Q{}tfoot]]",
	"if (./Q{}tbody) then ./Q{}tbody/Q{}tr else ./Q{}tr[./Q{}td]",
	"if (./Q{}thead) then ./Q{}thead/Q{}tr else (./Q{}tr[not(./Q{}td)])",
	"if (./Q{}tfoot) then ./Q{}tfoot/Q{}tr else ()",
	"()",
	"./@xlink:href",
	"asn:tables-label(.)",
	"self::xref[@ref-type='sec']",
	"asn:sections-reference(.)",
	"self::xref[@ref-type='disp-formula']",
	"self::xref[@ref-type='app']",
	"self::xref[@ref-type='term-sec']",
	"self::graphic",
	"name() = 'sec' or (local-name() = 'sec-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema')",
	"name() = 'table-wrap' or name() = 'fig'",
	"Q{http://niso-sts-authoring-solution/authoring-schema/numbering}figures-reducer(fonto:current-hierarchy-node-id(), .)",
	"self::std-ref",
	"self::list[@list-type = 'bullet']",
	"self::sec[@sec-type='norm-refs']",
	"self::std",
	"self::inline-formula",
	"self::sec[@sec-type='index']",
	"self::sec",
	"(self::list-item) and parent::*[self::list[@list-type = 'bullet']]",
	"self::sec[@sec-type='foreword']",
	"asn:tables-reference(.)",
	"self::annex-type",
	"self::non-normative-note",
	"asn:figures-label(.)",
	"(name() = 'fig' and not(parent::*[name() = 'fig-group'])) or name() = 'fig-group'",
	"asn:tables-reducer",
	"descendant-or-self::node()[.]",
	"self::mml:math[parent::inline-formula]",
	"self::array",
	"self::std[fonto:in-inline-layout(.)]",
	"as:is-chunk-reference(.) and(self::as:sec-ref orself::as:term-sec-ref orself::as:app-ref)",
	"self::app[@content-type='normative-annex']",
	"ancestor::node()[(self::list-item) and parent::*[self::list[@list-type = 'bullet']]] except ancestor::*[fonto:closed(.)][1]/ancestor::*",
	"self::list[@list-type = ('alpha-lower', 'arabic', 'roman-lower')]",
	"(self::list-item) and parent::*[self::list[@list-type = 'roman-upper']]",
	"(self::list-item) and parent::*[self::list[@list-type = 'dash']]",
	"(self::list-item) and parent::*[self::list[@list-type = 'simple']]",
	"(self::list-item) and parent::*[self::list[@list-type = 'order']]",
	"(self::list-item) and parent::*[self::list[@list-type = 'alpha-upper']]",
	"count(ancestor::list[@list-type = ('bullet', 'dash')])",
	"self::list[@list-type = ('bullet', 'dash')]",
	"self::inline-graphic",
	"fonto:title-content(.)",
	"let $titleQuery := fonto:metadata-property(., 'title-query')return if ($titleQuery) then  fontoxpath:evaluate($titleQuery, map { '.': . })else  let $titleSelector := fonto:metadata-property(., 'title-selector')  return if ($titleSelector) then    fontoxpath:evaluate(      'descendant-or-self::node()[' || $titleSelector || ']',      map { '.': . }    )//text()/string() => string-join(' ')  else    ()",
	"Q{http://niso-sts-authoring-solution/authoring-schema/numbering}sections-reducer(fonto:current-hierarchy-node-id(), .)",
	"fonto:markup-label(.)",
	"self::front or self::body",
	"as:is-chunk-reference(.)",
	"self::processing-instruction(fontoxml-change-addition-end)",
	"self::processing-instruction()",
	"self::processing-instruction(fontoxml-change-addition-start)",
	"self::processing-instruction(fontoxml-change-deletion)",
	"self::processing-instruction(fontoxml-text-placeholder)",
	"self::list",
	"self::document-node()",
	"self::as:app-ref",
	"ancestor-or-self::*[fonto:is-table-cell(.)][1]",
	"name() = 'body' or (local-name() = 'body-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema') or name() = 'front' or (local-name() = 'front-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema')",
	"@sec-type = ('foreword', 'sec_foreword')",
	"self::standard",
	"self::front",
	"(fonto:metadata-property(., 'title-query'), '()')[1] => fontoxpath:evaluate(map{'.': .})",
	"asn:notes-label(.)",
	"Q{http://niso-sts-authoring-solution/authoring-schema/numbering}notes-reducer(fonto:current-hierarchy-node-id(), .)",
	"descendant-or-self::*[self::*]",
	"fonto:sheet-frame(.)",
	"fonto:metadata-property(., 'structure-view-icon')",
	"fonto:metadata-property(., 'structure-view-click-operation-name')",
	"ancestor::*[name() = 'app' or name() = 'sec' or name() = 'term-sec'][1]",
	"(fonto:metadata-property(., 'structure-view-recursion-query'), '()')[1] => fontoxpath:evaluate(map{'.': .})",
	"(:Derived from structure view configuration, but always takes the document nodeas context and does not include the Virtual Numbering output!:)if (/*/title)then /*/titleelse if (/term-sec)then /term-sec/tbx:termEntry[1]/tbx:langSet[1]/(if(tbx:tig/tbx:normativeAuthorization/@value='preferredTerm')then tbx:tig[tbx:normativeAuthorization/@value='preferredTerm'][1]/tbx:termelse tbx:tig[1]/tbx:term)else()",
	"fonto:metadata-property(., 'structure-view-is-draggable')",
	"ancestor-or-self::*[fonto:is-read-only-root(.)]",
	"fonto:metadata-property(., 'sheet-frame-header-component-name')",
	"fonto:metadata-property(., 'is-hidden-from-structure-view')",
	"fonto:metadata-property(., 'structure-view-output-class')",
	"self::*[name() = ('app-group', 'back')]",
	"as:is-content-chunk(.) and(self::sec orself::term-sec orself::app)",
	"self::non-normative-note[@content-type='warning']",
	"self::sec[@sec-type]",
	"self::back",
	"self::non-normative-note[@content-type='important']",
	"self::non-normative-note[@content-type='caution']",
	"self::body",
	"self::app-group",
	"fonto:content-boundary-type(.)",
	"asn:sections-label(.)",
	"not(name() = 'sec' or name() = 'term-sec' or name() = 'app' or (local-name() = 'sec-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema') or (local-name() = 'term-sec-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema') or (local-name() = 'app-ref' and namespace-uri() = 'http://niso-sts-authoring-solution/authoring-schema'))",
	"fonto:contextual-operations(., 'structure-view')",
	"self::title[parent::non-normative-note or parent::non-normative-example]",
	"@sec-type = ('intro', 'sec_intro')",
	"self::title[parent::def-list]",
	"ancestor-or-self::*[@tooltip-content][1]",
	"./ancestor::*",
	"./descendant-or-self::fn[not(parent::table-wrap-foot)]",
	"let $context := ., $listAncestor := $context/ancestor-or-self::*[fonto:list(.)][1], $closedAncestor := $context/ancestor-or-self::*[fonto:closed(.)][1] return if ($listAncestor and not($closedAncestor)) then true() else $listAncestor >> $closedAncestor",
	"(ancestor-or-self::*[fonto:list(.)] except ancestor-or-self::*[fonto:closed(.)][1]/ancestor-or-self::*) => reverse() (: except produces an output in dom-order :)",
	"fonto:contextual-operations(., 'breadcrumbs-menu')",
	"(self::list-item) and parent::*[self::list]",
	"fonto:document-type-node(.)",
	"descendant-or-self::fn[not(parent::table-wrap-foot)]",
	"ancestor-or-self::*[self::p][1]",
	"(self::list-item) and parent::*[self::list[@list-type = 'roman-lower']]",
	"(self::list-item) and parent::*[self::list[@list-type = 'arabic']]",
	"(self::list-item) and parent::*[self::list[@list-type = 'alpha-lower']]",
	"ancestor-or-self::*[fonto:is-table(.)]",
	"self::xref[@ref-type='table-fn']",
	"self::xref[@ref-type='bibr']",
	"self::xref[@ref-type='fn']",
	"ancestor::table[parent::table-wrap]",
	"ancestor::*[not(fonto:block-layout(.))][1]",
	"ancestor-or-self::term-sec",
	"if($data('contextNode')[@list-type=('bullet', 'dash')]) then $data('contextNode')/@list-type else 'dash'",
	"fonto:selection-common-ancestor()/ancestor-or-self::node()",
	"ancestor-or-self::xref[@ref-type = 'fn']",
	"if($data('contextNode')[@list-type=('alpha-lower', 'arabic', 'roman-lower')]) then $data('contextNode')/@list-type else 'alpha-lower'",
	"ancestor-or-self::*[self::list and @list-type = 'alpha-lower'][1]",
	"ancestor-or-self::*[self::list and @list-type = 'dash'][1]"
];

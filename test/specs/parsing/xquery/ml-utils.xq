xquery version "1.0-ml" encoding "UTF-8";

(:
 : Licensed under the Apache License, Version 2.0 (the "License");
 : you may not use this file except in compliance with the License.
 : You may obtain a copy of the License at
 :
 :     http://www.apache.org/licenses/LICENSE-2.0
 :
 : Unless required by applicable law or agreed to in writing, software
 : distributed under the License is distributed on an "AS IS" BASIS,
 : WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 : See the License for the specific language governing permissions and
 : limitations under the License.
 :)

module namespace util="http://github.com/xquery/xquerydoc/utils";

declare namespace doc="http://www.xqdoc.org/1.0";
declare namespace html="http://www.w3.org/1999/xhtml";

declare variable $util:html-homepage-xslt := '../lib/html-home.xsl';
declare variable $util:html-module-xslt := '../lib/html-module.xsl';


(:~ MarkLogic xslt transformation to generate html output
 :
 : @param xquery parsed into xqdoc xml markup
 : @param original xquery source
 :
 : @returns element(html:html)
 :)
declare function util:generate-html-module($xqdoc,$source as xs:string) {
  let $params := map:map()
  let $_put := map:put(
                    $params,
                    xdmp:key-from-QName(fn:QName("", "source")),
                    $source)
  let $transform := xdmp:xslt-invoke( $util:html-module-xslt, $xqdoc, $params)
  return
    $transform
};
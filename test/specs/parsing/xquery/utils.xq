xquery version "1.0" encoding "UTF-8";

module namespace util="http://github.com/xquery/xquerydoc/utils";
declare namespace doc="http://www.xqdoc.org/1.0";
declare namespace html="http://www.w3.org/1999/xhtml";

declare variable $util:html-homepage-xslt := '../lib/html-home.xsl';
declare variable $util:html-module-xslt := '../lib/html-module.xsl';

declare function util:generate-html-module($xqdoc) 
{
  ()
};
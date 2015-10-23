/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/formatMarkdown', ['hbs/handlebars', 'markdown'], function(Handlebars, Markdown) {
  var formatMarkdown = function(input) {
    return Markdown.toHTML(input || '');
  };

  Handlebars.registerHelper('formatMarkdown', formatMarkdown);

  return formatMarkdown;
});
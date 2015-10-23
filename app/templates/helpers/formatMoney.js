/**
 * Created by Duy A. Nguyen on 3/30/2014.
 */
'use strict';
define('templates/helpers/formatMoney', ['hbs/handlebars', 'numeral'], function(Handlebars, numeral) {

  var formatMoney = function(number) {
    return numeral(number).format('$0,0.00');
  };
  Handlebars.registerHelper('formatMoney', formatMoney);

  return formatMoney;
});
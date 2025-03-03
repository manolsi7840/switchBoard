/*jslint white: true */
/*global module, console, require */

/**
 * Copyright (c) 2014 brian@bevey.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function(exports){
  'use strict';

  var version = 20150921;

  exports.activeBuilding = function (deviceId, markup, state, value, language) {
    var tempMarkup = '',
        status     = '',
        icon       = '',
        senders    = '',
        translate  = function(message) {
          var util;

          if((typeof SB === 'object') && (typeof SB.util === 'object')) {
            message = SB.util.translate(message, 'activeBuilding');
          }

          else {
            util    = require(__dirname + '/../../lib/sharedUtil').util;
            message = util.translate(message, 'activeBuilding', language);
          }

          return message;
        },
        arrayList  = function(elms) {
          var message = '',
              util;

          if((typeof SB === 'object') && (typeof SB.util === 'object')) {
            message = SB.util.arrayList(elms, 'activeBuilding', language);
          }

          else {
            util    = require(__dirname + '/../../lib/sharedUtil').util;
            message = util.arrayList(elms, 'activeBuilding', language);
          }

          return message;
        };

    if((state) && (value)) {
      senders = arrayList(value);
    }

    if((!value || value.length === 0)) {
      status     = 'err';
      icon       = 'times';
      tempMarkup = translate('NO_PACKAGES');
    }

    else if(value.length === 1) {
      status     = 'ok';
      icon       = 'tag';
      tempMarkup = translate('SINGLE_PACKAGE');
    }

    else if(value.length > 1) {
      status     = 'ok';
      icon       = 'tags';
      tempMarkup = translate('PLURAL_PACKAGES');
    }

    tempMarkup = tempMarkup.split('{{SENDERS}}').join(senders);

    markup = markup.replace('{{ACTIVEBUILDING_STATE}}', status);
    markup = markup.replace('{{ACTIVEBUILDING_ICON}}', icon);
    markup = markup.replace('{{ACTIVEBUILDING_DYNAMIC}}', tempMarkup);

    return markup;
  };
})(typeof exports === 'undefined' ? this.SB.spec.parsers : exports);

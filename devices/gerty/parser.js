/*jslint white: true */
/*global alert,module, console, require */

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

  exports.gerty = function (deviceId, markup, state, value, language) {
    var action = '',
        container;

    if(typeof SB === 'object') {
      container = SB.getByTag('span', SB.get(deviceId))[0];

      if(container) {
        SB.putText(container, value.emoji);

        if(value.action) {
          action = value.action;
        }

        container.className = action;
      }

      markup = '';
    }

    else {
      if(value.action) {
        action = ' class="' + value.action + '"';
      }

      markup = markup.split('{{GERTY_ACTION}}').join(action);
      markup = markup.split('{{GERTY_DYNAMIC}}').join(value.emoji);
    }

    return markup;
  };
})(typeof exports === 'undefined' ? this.SB.spec.parsers : exports);

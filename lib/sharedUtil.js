/*jslint white: true */
/*global State, module, console, require */

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

/**
 * @author brian@bevey.org
 * @fileoverview Collection of small sugar functions shared between client and
 *               server.
 */

(function(exports){
  'use strict';

  exports.util = {
    version : 20151006,

    /**
     * Replace all instances of a substring within a larger string by a new
     * string.  Basically .replace, but for all instances of the substring.
     */
    replaceAll : function(text, find, replace) {
      var value = text;

      if(typeof text === 'string') {
        value = text.replace(new RegExp(find, 'g'), replace);
      }

      return value;
    },

    /**
     * Accept a string and removes any HTML tags for more safe display.
     */
    stripTags : function(text) {
      return typeof text === 'string' ? text.replace(/(<([^>]+)>)/ig, '') : text;
    },

    /**
     * Strip out control characters from the inputted string.
     */
    stripControl : function(text) {
      return typeof text === 'string' ? text.replace(new RegExp('[\x00-\x1F\x7F]+', 'g'), '') : text;
    },

    /**
     * Sanitize a given string against control characters and HTML tags.
     */
    sanitize : function(text) {
      return this.stripTags(this.stripControl(text));
    },

    /**
     * Accept a readable name "Test Device" and convert it to a usable token:
     * "test_device".
     */
    encodeName : function(name) {
      if((name) && (typeof name === 'string')) {
        name = name.replace(/[\s!@#$%^&*()"'\\<>,;.:/+]/g, '_').toLowerCase();
      }

      return name;
    },

    /**
     * Translates strings set in a devices parser.  If you're on the
     * server-side, it uses the standard translate library to look up strings.
     * If on the client side, it references translation data attributes set to
     * the root of the device markup.
     */
    translate : function(key, typeClass, language) {
      var translate,
          message = '',
          i;

      if((key) && (typeof key === 'string')) {
        key = key.toUpperCase();

        if(typeof SB === 'object') {
          language = document.documentElement.getAttribute('lang');

          translate = function(message, typeClass, language) {
            var node = SB.getByClass(typeClass, SB.getByTag('main')[0], 'section')[0];

            message = message.replace('{{i18n_', '').replace('}}', '');

            if((node.dataset) && (node.dataset['string' + message.charAt(0) + message.substr(1).toLowerCase()])) {
              message = node.dataset['string' + message.charAt(0) + message.substr(1).toLowerCase()];
            }

            else if(SB.spec.strings[message]) {
              message = SB.spec.strings[message];
            }

            return message;
          };
        }

        else {
          translate = require(__dirname + '/translate').translate;
        }

        message = translate('{{i18n_' + key + '}}', typeClass, language);
      }

      else {
        message = key;
      }

      return message;
    },


    /**
     * Accept an array of names or values - and return the proper translated
     * string list of them.  ['Apple', 'Orange', 'Banana'] would return:
     * "Apple, Orange and Banana".  Requires lang and deviceType to determine
     * correct translation strings.
     */
    arrayList : function(elms, deviceType, language) {
      var message = '',
          i       = 0;

      for(i; i < elms.length; i += 1) {
        if(i) {
          if (i === (elms.length - 1)) {
            message = message + ' ' + this.translate('AND', deviceType, language) + ' ';
          }

          else {
            message = message + ', ';
          }
        }

        message = message + elms[i];
      }

      return message;
    }
  };
})(typeof exports === 'undefined' ? this.SB : exports);

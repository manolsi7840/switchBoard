/*jslint white: true */
/*global module, String, require, console, Switchboard */

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
 * @fileoverview Unit test for devices/foscam/parser.js
 */

exports.foscamParserTest = {
  parser : function (test) {
    'use strict';

    var foscamParser = require(__dirname + '/../../../../devices/foscam/parser'),
        markup       = '<h1>Foo</h1> <span class="{{DEVICE_STATE_ON}}">On</span> <span class="{{DEVICE_STATE_OFF}}">Off</span>',
        onMarkup     = foscamParser.foscam('dummy', markup, 'ok', 'on'),
        offMarkup    = foscamParser.foscam('dummy', markup, 'ok', 'off');

    test.strictEqual(onMarkup.indexOf('{{'),  -1, 'All values replaced');
    test.notStrictEqual(onMarkup.indexOf('<span class=" device-active">On</span> <span class="">Off</span>'),  -1, 'Passed markup validated');
    test.strictEqual(offMarkup.indexOf('{{'), -1, 'All values replaced');
    test.notStrictEqual(offMarkup.indexOf('<span class="">On</span> <span class=" device-active">Off</span>'), -1, 'Passed markup validated');

    test.done();
  }
};

/*jslint white: true */
/*global module, String, require, console */

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
 * @fileoverview Unit test for devices/weather/parser.js
 */

exports.weatherParserTest = {
  parser : function (test) {
    'use strict';

    var weatherParser = require(__dirname + '/../../../../devices/weather/parser'),
        markup     = '<h1>Foo</h1> <div>{{WEATHER_CURRENT}}</div> <div>{{WEATHER_DYNAMIC}}</div>',
        value      = { code : 47, city : 'Seattle', text : 'Storm', temp : 80,
                       forecast : {
                         foo : { code : 43, day : 'Mon',  text : 'Snow',  high : 30, low : 20 },
                         bar : { code : 31, day : 'Tues', text : 'Clear', high : 50, low : 40 },
                         baz : { code : 32, day : 'Wed',  text : 'Sun',   high : 75, low : 70 } }
                     },
        fragments  = { forecast : '<span class="fa fa-{{WEATHER_ICON}}"></span> {{WEATHER_DAY}} {{WEATHER_TEXT}} {{WEATHER_HIGH}}/{{WEATHER_LOW}}' },
        goodMarkup = weatherParser.weather('dummy', markup, 'ok', value,        fragments),
        noValue    = weatherParser.weather('dummy', markup, 'ok', 'API Choked', fragments);

    test.strictEqual(goodMarkup.indexOf('{{'), -1, 'All values replaced');
    test.notStrictEqual(goodMarkup.indexOf('Seattle Current Weather: 80&deg; Storm'),                         -1, 'Passed markup validated');
    test.notStrictEqual(goodMarkup.indexOf('<span class="fa fa-asterisk"></span> Mon: Snow 30&deg;/20&deg;'), -1, 'Passed markup validated');
    test.notStrictEqual(goodMarkup.indexOf('<span class="fa fa-sun-o"></span> Wed: Sun 75&deg;/70&deg;'),     -1, 'Passed markup validated');
    test.strictEqual(noValue.indexOf('{{'), -1, 'All values replaced');
    test.strictEqual(noValue, '<h1>Foo</h1> <div>Weather data unavailable</div> <div>API Choked</div>', 'Passed markup validated');

    test.done();
  }
};

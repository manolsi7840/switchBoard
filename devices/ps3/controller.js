/*jslint white: true */
/*global module, require, console */

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

module.exports = (function () {
  'use strict';

  /**
   * @author brian@bevey.org
   * @fileoverview Basic control over PS3 pre-configured GIMX setup.
   * @requires child_process
   * @note Requires the installation of GIMX package, version 2.x available
   *       here: https://github.com/matlo/GIMX/releases/
   *       See this page for detailed information about how to spoof your
   *       Bluetooth dongle's Mac address:
   *       http://gimx.fr/wiki/index.php?title=Command_line#Linux_.2B_bluetooth_.2B_PS3
   */
  return {
    version : 20150921,

    inputs  : ['command'],

    /**
     * Whitelist of available key codes to use.  We could support all buttons,
     * as they are supported in GIMX, but timing of events for unnecessary
     * buttons in the context of media control seems pointless.
     */
    keymap  : ['POWERON', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'PS', 'SELECT', 'START', 'TRIANGLE', 'CIRCLE', 'CROSS', 'SQUARE', 'L1', 'L2', 'R1', 'R2'],

    /*
     * Find the correct path to execute the given command on the given platform.
     */
    translateCommand : function (command, deviceMac, serviceIP, servicePort, platform, revert) {
      var execute = { command : '', params : [] },
          value   = revert === true ? 0 : 255;

      if(platform === 'linux' || platform === 'win32') {
        switch(command) {
          case 'POWERON' :
            execute.command = 'gimx';

            execute.params.push('--type');
            execute.params.push('Sixaxis');
            execute.params.push('--src');
            execute.params.push(serviceIP + ':' + servicePort);
            execute.params.push('--bdaddr');
            execute.params.push(deviceMac);
          break;

          case 'PS' :
            execute.command = 'gimx';

            execute.params.push('--dst');
            execute.params.push(serviceIP + ':' + servicePort);
            execute.params.push('--event');
            execute.params.push('PS(' + value + ')');
          break;

          case 'LEFT'     :
          case 'RIGHT'    :
          case 'UP'       :
          case 'DOWN'     :
          case 'SELECT'   :
          case 'START'    :
          case 'TRIANGLE' :
          case 'CIRCLE'   :
          case 'CROSS'    :
          case 'SQUARE'   :
          case 'L1'       :
          case 'L2'       :
          case 'R1'       :
          case 'R2'       :
            execute.command = 'gimx';

            execute.params.push('--dst');
            execute.params.push(serviceIP + ':' + servicePort);
            execute.params.push('--event');
            execute.params.push(command.toLowerCase() + '(' + value + ')');
          break;

          default :
            execute = '';
          break;
        }
      }

      else {
        execute = '';
      }

      return execute;
    },

    /**
     * On startup, your PS3 is clearly not connected to SwitchBoard, so we'll
     * start it off with the "err" (or "off") state.
     */
    init : function(controller, config) {
      var deviceState = require(__dirname + '/../../lib/deviceState');

      deviceState.updateState(controller.config.deviceId, 'ps3', { state : 'err' });
    },

    send : function (config) {
      var spawn       = require('child_process').spawn,
          deviceState = require(__dirname + '/../../lib/deviceState'),
          ps3State    = deviceState.getDeviceState(config.device.deviceId),
          ps3         = {},
          that        = this,
          gimx;

      ps3.deviceId    = config.device.deviceId;
      ps3.deviceMac   = config.device.deviceMac;
      ps3.serviceIp   = config.device.serviceIp   || '127.0.0.1';
      ps3.servicePort = config.device.servicePort || '8181';
      ps3.command     = config.command            || '';
      ps3.callback    = config.callback           || function () {};
      ps3.platform    = config.platform           || process.platform;
      ps3.revert      = config.revert             || false;

      if(ps3State.state === 'ok') {
        // If the PS3 is already on, we shouldn't execute PowerOn again.
        if(ps3.command === 'POWERON') {
          console.log('\x1b[35m' + config.device.title + '\x1b[0m: Device looks on already.  Changing command to PS');

          ps3.command = 'PS';
        }
      }

      else {
        console.log('\x1b[35m' + config.device.title + '\x1b[0m: Device is off or unreachable');
      }

      ps3.execute = this.translateCommand(ps3.command, ps3.deviceMac, ps3.serviceIp, ps3.servicePort, ps3.platform, ps3.revert);

      if((ps3.execute) && (ps3.execute.command) && (ps3.execute.params)) {
        gimx = spawn(ps3.execute.command, ps3.execute.params);

        // The Gimx service will run for quite a while, so we need to execute the
        // callback to send a response before the command closes some time later.
        if(ps3.command === 'POWERON') {
          ps3.callback(null, 'ok');

          gimx.stderr.on('data', function(err) {
            if(err.toString().indexOf('shutdown') !== -1) {
              console.log('\x1b[31m' + config.device.title + '\x1b[0m: Controller disconnected');
            }

            gimx.kill();
          });
        }

        gimx.once('error', function(err) {
          ps3.callback(err);
        });

        gimx.once('close', function(code) {
          var deviceState;

          if(ps3.command === 'POWERON') {
            ps3.callback('Device is off or unreachable');
          }

          else if((ps3.revert !== true) && (ps3.command !== 'PS')) {
            config.revert = true;

            that.send(config);
          }

          else {
            if(ps3State.state === 'ok') {
              if(code === 0) {
                ps3.callback(null, 'ok');
              }

              else {
                ps3.callback('err');
              }
            }
          }
        });
      }

      else {
        ps3.callback('Gimx is not supported on your platform!');
      }
    }
  };
}());

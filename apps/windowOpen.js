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

/**
 * @author brian@bevey.org
 * @fileoverview When a window is opened from SmartThings - notify immediately
 *               if the Nest thermostat is on.  After a grace period, turn the
 *               thermostat off.  Additionally, if the window is already open
 *               and a thermostat is turned on, notify and turn it off.
 */

module.exports = (function () {
  'use strict';

  return {
    version : 20151009,

    governor : false,

    translate : function(token, lang) {
      var translate = require(__dirname + '/../lib/translate');

      return translate.translate('{{i18n_' + token + '}}', 'smartthings', lang);
    },

    formatMessage : function(messageType, contact, state, lang) {
      var sharedUtil = require(__dirname + '/../lib/sharedUtil').util,
          windows    = '',
          type       = '',
          message    = '';

      windows = sharedUtil.arrayList(contact, 'smartthings', lang);
      type    = this.translate(state === 'heat' ? 'HEAT' : 'AIR_CONDITION', lang);
      message = messageType === 'warn' ? this.translate('HVAC_ON', lang) : this.translate('HVAC_OFF', lang);
      message = message.split('{{WINDOW}}').join(windows);
      message = message.split('{{HVAC}}').join(type);

      return message;
    },

    windowOpen : function(device, command, controllers, values, config) {
      var notify      = require(__dirname + '/../lib/notify'),
          deviceState = require(__dirname + '/../lib/deviceState'),
          runCommand  = require(__dirname + '/../lib/runCommand'),
          that        = this,
          delay       = config.delay || 60,
          checkState,
          message     = '',
          status;

      checkState = function() {
        var deviceId,
            currentDevice = {},
            status        = { thermostat : [], contact : [] },
            subDeviceId,
            subDevice,
            windows       = '',
            type          = '',
            i             = 0;

        for(deviceId in controllers) {
          if((controllers[deviceId].config) && (controllers[deviceId].config.typeClass === 'nest')) {
            currentDevice = deviceState.getDeviceState(deviceId);

            if(currentDevice.value) {
              for(subDeviceId in currentDevice.value.devices) {
                subDevice = currentDevice.value.devices[subDeviceId];

                if((config.thermostat.indexOf(subDevice.label) !== -1) && (subDevice.type === 'thermostat') && (subDevice.state !== 'off') && (currentDevice.state !== 'err')) {
                  status.thermostat.push({ label : subDevice.label, state : subDevice.state });
                }
              }
            }
          }

          else if((controllers[deviceId].config) && (controllers[deviceId].config.typeClass === 'smartthings')) {
            currentDevice = deviceState.getDeviceState(deviceId);

            if(currentDevice.value) {
              for(subDeviceId in currentDevice.value.devices) {
                subDevice = currentDevice.value.devices[subDeviceId];

                if((config.contact.indexOf(subDevice.label) !== -1) && (subDevice.type === 'contact') && (subDevice.state === 'on')) {
                  status.contact.push(subDevice.label);
                }
              }
            }
          }
        }

        return status;
      };

      status = checkState();

      // If something is on while a contact sensor is open, we'll first notify,
      // then wait a minute before we shut things down.
      if((this.governor === false) && (status.thermostat.length) && (status.contact.length)) {
        this.governor = true;

        message = that.formatMessage('warn', status.contact, status.thermostat[0].state, controllers.config.language);
        notify.notify(message, controllers, device);

        setTimeout(function() {
          var status = checkState(),
              deviceId,
              i      = 0;

          if(status.thermostat.length && status.contact.length) {
            for(deviceId in controllers) {
              if(controllers[deviceId].config) {
                if(controllers[deviceId].config.typeClass === 'nest') {
                  for(i; i < status.thermostat.length; i += 1) {
                    runCommand.runCommand(deviceId, 'subdevice-mode-' + status.thermostat[i].label + '-off');
                  }

                  message = that.formatMessage('off', status.contact, status.thermostat[0].state, controllers.config.language);
                  notify.notify(message, controllers, device);
                }
              }
            }
          }

          // Don't hammer us if we're messing with the thermostat.
          setTimeout(function() {
            that.governor = false;
          }, 60000);
        }, delay * 1000);
      }
    }
  };
}());

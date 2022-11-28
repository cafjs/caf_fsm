"use strict"

const hello = require('./hello/main.js');
const app = hello;

const caf_core= require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const cli = caf_core.caf_cli;

const crypto = require('crypto');

const APP_FULL_NAME = 'root-fsm';

const CA_OWNER_1='me'+ crypto.randomBytes(8).toString('hex');
const CA_LOCAL_NAME_1='ca1';
const FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
const FQN_1 = APP_FULL_NAME + '#' + FROM_1;

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

module.exports = {
    setUp(cb) {
       var self = this;
        app.init( {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              console.log('setUP Error $' + $);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                              cb(err, $);
                          }
                      });
    },
    tearDown(cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    async fsmSend(test) {
        const from1 = FROM_1;
        test.expect(7);
        try {
            let s1 = new cli.Session('ws://root-fsm.localtest.me:3000',
                                     from1, {
                                         from : from1
                                     });
            let p = await new Promise((resolve, reject) => {
                s1.onopen = async function() {
                    try {
                        let res = await s1.tick().getPromise();
                        test.ok(res.transition === 'GREEN');

                        res = await s1.tick().getPromise();
                        test.ok(res.transition === 'YELLOW');

                        res = await s1.tick().getPromise();
                        test.ok(res.transition === 'RED');

                        resolve(res);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        reject(err);
                    }
                };
                return [];
            });

            let res = await s1.getFSMState().getPromise();
            test.ok(res === 'RED');
            try {
                res = await s1.tickAbort().getPromise();
            } catch (ex) {
                // ignore
            }

            // State changes ignored
            res = await s1.getFSMState().getPromise();
            test.ok(res === 'RED');

            // reload machine OK
            res = await s1.tick().getPromise();
            test.ok(res.transition === 'GREEN');

            p = await new Promise((resolve, reject) => {
                s1.onclose = function(err) {
                    test.ifError(err);
                    resolve(null);
                };
                s1.close();
            });
            test.done();
        } catch (err) {
            test.ifError(err);
            test.done();
        }
    }
};

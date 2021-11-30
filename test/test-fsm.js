"use strict"

const hello = require('./hello/main.js');
const app = hello;

const caf_core= require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const cli = caf_core.caf_cli;

const crypto = require('crypto');

const APP_FULL_NAME = 'root-graphql';

const CA_OWNER_1='me'+ crypto.randomBytes(8).toString('hex');
const CA_LOCAL_NAME_1='ca1';
const FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
const FQN_1 = APP_FULL_NAME + '#' + FROM_1;

const QUERY1 = `
query {
  all {
     name
  }
}
`;

const QUERY2 = `
query {
  altAll {
     tool
  }
}
`;

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

    async dirtyEval(test) {
        var self = this;
        var s1;
        var from1 = FROM_1;
        test.expect(5);
        var lastId;
        try {
            s1 = new cli.Session('ws://root-graphql.vcap.me:3000',
                                 from1, {
                                     from : from1
                                 });
            let p = await new Promise((resolve, reject) => {
                s1.onopen = async function() {
                    try {
                        var res = await s1.evalQuery(QUERY1)
                                .getPromise();
                        test.ok(res.all.length === 2);
                        resolve(res);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        reject(err);
                    }
                };
                return [];
            });

            // repeat
            console.log(p);
            let res = await s1.evalQuery(QUERY1).getPromise();
            test.ok(res === null);

            res = await s1.setResolver().getPromise();

            res = await s1.evalQuery(QUERY2).getPromise();
            test.ok(res.altAll.length === 2);
            console.log(res);
            res = await s1.evalQuery(QUERY2).getPromise();
            test.ok(res === null);

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

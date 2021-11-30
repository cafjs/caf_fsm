'use strict';

/**
 * Evaluates a GraphQL query with a resolver custom to this CA.
 *
 *
 * @module caf_fsm/plug_ca_fsm
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;

const gql = require('fsm');
const gqlTools = require('fsm-tools');

exports.newInstance = async function($, spec) {
    try {
        let executableSchema = null;
        let lastResult = null;

        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {}; // query:string, resolverMethod:string

        // transactional ops
        const target = {
        };

        that.__ca_setLogActionsTarget__(target);

        that.setResolverMethod = function(methodName) {
            that.state.resolverMethod = methodName;
            executableSchema = null;
        };

        that.setQuery = function(q) {
            that.state.query = q;
        };

        that.dirtyReset = function() {
            lastResult = null;
        };

        that.dirtyEvalQuery = function(self) {
            const makeSchema = async () => {
                const typeDefs = $._.$.fsm.getTypeDefs();
                if (that.state.resolverMethod) {
                    const m = that.state.resolverMethod;
                    const [err, resolvers] = await self[m].apply(self, []);
                    if (err) {
                        throw err;
                    }
                    return gqlTools.makeExecutableSchema({typeDefs, resolvers});
                } else {
                    const resolvers = [];
                    return gqlTools.makeExecutableSchema({typeDefs, resolvers});
                }
            };
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    if (!that.state.query) {
                        resolve(); // undefined, `null` reserved for "no change"
                    } else {
                        executableSchema = executableSchema ||
                            await makeSchema();
                        const ctx = {self};
                        const res = await gql.fsm(
                            executableSchema, that.state.query, self.state, ctx
                        );
                        if (res.errors) {
                            reject(res.errors[0]);
                        } else {
                            if (lastResult &&
                                myUtils.deepEqual(res.data, lastResult)) {
                                resolve(null);
                            } else {
                                lastResult = res.data;
                                resolve(res.data);
                            }
                        }
                    }
                } catch (err) {
                    reject(err);
                }
            });
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};

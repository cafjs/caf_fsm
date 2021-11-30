'use strict';

/**
 *  Proxy that allows a CA to perform GraphQL queries.
 *
 * @module caf_fsm/proxy_fsm
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Evaluates the GraphQL query.
         *
         * This is a "dirty" call, i.e., it returns a promise so that the CA
         * can block waiting for completion before processing the next message,
         * and it may externalize internal state before checkpointing.
         *
         * @param {Object} self The object reference for the CA, i.e., `this`.
         *
         * @return {Promise<Object>}  A promise that we can `await` to
         * block further message processing. It resolves to `null` if the query
         * result has not changed since the last call. Otherwise, it returns
         * the query result or an error if it cannot be evaluated.
         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias dirtyEvalQuery
         */
        that.dirtyEvalQuery = function(self) {
            return $._.dirtyEvalQuery(self);
        };

        /**
         * Sets a new GraphQL query or resets a previous one.
         *
         * @param {string|null} query A new query or null to reset.
         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias setQuery
         */
        that.setQuery = function(query) {
            return $._.setQuery(query);
        };

        /**
         * Sets the name of the method that returns a resolver object.
         *
         * When this method name is not set, a default resolver that look up
         * properties using `this.state` as root object will be used.
         *
         * The resolver method should have a signature like:
         *
         *        async  __ca_resolver__() : [err, ResolverObject]
         *
         * The returned Resolver object methods use the standard GraphQL
         * signature:
         *
         *        whatever(obj, args, context, info) {...}
         *
         * and `context` has a key `self` with value the `this` reference in the
         * current CA. For top level objects `obj` is always `this.state`, as
         * mentioned above. See `GraphGL` documentation for details.
         *
         * @param {string|null} methodName The name of a CA method that
         * returns a resolver object or `null` to reset.
         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias setResolverMethod
         */
        that.setResolverMethod = function(methodName) {
            return $._.setResolverMethod(methodName);
        };

        /**
         * Forgets the value of the previous query.
         *
         * The CA always resets after a resume, i.e., the previous value is
         * never checkpointed.
         *
         * It is a "dirty" call because the reset is visible immediately.
         * By calling `dirtyReset` before `dirtyEvalQuery`
         * the query will always returns a value.

         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias dirtyReset
         */
        that.dirtyReset = function() {
            return $._.dirtyReset();
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};

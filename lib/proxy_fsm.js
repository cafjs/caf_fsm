'use strict';

/**
 *  Proxy that allows a CA to implement a FSM.
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
         * Changes the current state.
         *
         * After that it triggers the transition actions, and the state
         * listeners functions, all in the same request.
         *
         * In this way, if there is an error, or a failure before
         * checkpointing, both the state change and the actions are ignored.
         *
         * When the failure is after checkpointing, we always retry the external
         * side-effects of actions and listeners, by using safe transactional
         * plugins.
         *
         * @param {Object} self The object reference for the CA, i.e., `this`.
         * @param {string} eventName The name of the event.
         *
         * @throws {Error} if the `createMachineMethod` has not been set.
         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias send
         */
        that.send = function(self, eventName) {
            return $._.send(self, eventName);
        };

        /**
         * Sets the name of the method that returns a machine description.
         *
         * The method should have this signature :
         *
         *        async  __ca_whatever__() : [err, fsmDescType]
         *
         * `fsmDescType` is an object described in types.js, and refers to the
         * @xstate/fsm documentation  in
         * https://xstate.js.org/docs/packages/xstate-fsm/#api
         *
         * This object can also provide an state listener function that will
         * be called whenever the state changes.
         *
         * Actions and listener calls are synchronous, i.e.,
         * within the scope of the request, and therefore, will be part of the
         * same transaction. They are triggered by a `send` operation that
         * changes the state in the same request.
         *
         * @param {string} methodName The name of a CA method that
         * returns a machine description.
         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias setCreateMachineMethod
         */
        that.setCreateMachineMethod = function(methodName) {
            return $._.setCreateMachineMethod(methodName);
        };

        /**
         * Returns the current state.
         *
         * @return {string} The current state.
         *
         * @memberof! module:caf_fsm/proxy_fsm#
         * @alias getState
         */
        that.getState = function() {
            return $._.getState();
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};

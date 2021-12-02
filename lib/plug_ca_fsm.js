'use strict';

/**
 * Implements a FSM using xstate
 *
 *
 * @module caf_fsm/plug_ca_fsm
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;

const xstate = require('@xstate/fsm');

exports.newInstance = async function($, spec) {
    try {
        let fsm = null;

        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {}; // currentState:string, machineMethod:string

        // transactional ops
        const target = {
        };

        that.__ca_setLogActionsTarget__(target);

        that.setCreateMachineMethod = function(methodName) {
            that.state.machineMethod = methodName;
        };

        const createService = async function(self) {
            const m = that.state.machineMethod;
            const [err, machineConf] = await self[m].apply(self, []);
            if (err) {
                throw err;
            }
            const {config, options, stateListener} = machineConf;
            if (that.state.currentState) {
                // recover after crash
                config.initial = that.state.currentState;
            }
            const machine = xstate.createMachine(config, options || {});
            const service = xstate.interpret(machine);
            if (stateListener) {
                // filter initial state to make `restore` transparent
                const f = (state) => state && state.changed &&
                      stateListener(state);
                service.subscribe(f);
            }
            service.start();
            return service;
        };

        that.send = async function(self, eventName) {
            if (!fsm && that.state.machineMethod) {
                fsm = await createService(self);
            }
            if (fsm) {
                fsm.send(eventName);
                that.state.currentState = fsm.state.value;
            } else {
                throw new Error('createMachineMethod not set');
            }
        };

        that.getState = function() {
            return fsm ? fsm.state.value : that.state.currentState;
        };

        const super__ca_abort__ =
            myUtils.superiorPromisify(that, '__ca_abort__');
        that.__ca_abort__ = async function() {
            try {
                const data = await super__ca_abort__();
                fsm = null;
                return [null, data];
            } catch (err) {
                return [err];
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};

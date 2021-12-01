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
        const fsm = null;

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
            if (this.state.currentState) {
                // recover after crash
                config.initial = this.state.currentState;
            }
            const machine = xstate.createMachine(config, options);
            const service = xstate.interpret(machine).start();
            if (stateListener) {
                service.subscribe(stateListener);
            }
            return service;
        };

        that.send = async function(self, newState) {
            if (fsm) {
                fsm.send(newState);
            } else if (this.state.machineMethod) {
                fsm = await createService(self);
                fsm.send(newState);
                this.state.currentState = fsm.state.value;
            } else {
                throw new Error('createMachineMethod not set');
            }
        };

        that.getState = function() {
            return fsm ? fsm.state.value : this.state.currentState;
        };

        DELETE fsm on abort
        return [null, that];
    } catch (err) {
        return [err];
    }
};

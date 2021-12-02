'use strict';

const APP_SESSION = 'default';

exports.methods = {
    async __ca_init__() {
        this.$.log.debug("++++++++++++++++Calling init");
        this.state.transition = null;
        this.$.fsm.setCreateMachineMethod('__ca_createMachine__');
        return [];
    },
    async __ca_createMachine__() {
        const self = this;
        const config = {
            id: 'semaphore',
            initial: 'RED',
            states: {
                RED: {
                    on: {
                        TICK: {
                            target: 'GREEN',
                            actions: () => {self.state.transition = 'GREEN';}
                        }
                    }
                },
                GREEN: {
                    on: {
                        TICK: {
                            target: 'YELLOW',
                            actions: () => {self.state.transition = 'YELLOW';}
                        }
                    }
                },
                YELLOW: {
                    on: {
                        TICK: {
                            target: 'RED',
                            actions: () => {self.state.transition = 'RED';}
                        }
                    }
                }
            }

        };

        const options = null;

        const stateListener = (state) => {
            console.log(state);
            this.$.session.notify([`got ${state}`], APP_SESSION);
        };

        return [null, {config, options, stateListener}];
    },

    async tick() {
        this.$.fsm.send(this, 'TICK');
        return this.getState();
    },

    async tickAbort() {
        this.$.fsm.send(this, 'TICK');
        return [new Error('abort tick')];
    },

    async getFSMState() {
        return [null, this.$.fsm.getState()];
    },

    async getState() {
        return [null, this.state];
    }
};

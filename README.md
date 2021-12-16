# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Create Finite State Machines (FSM) with xstate and Caf.js

[![Build Status](https://github.com/cafjs/caf_fsm/actions/workflows/push.yml/badge.svg)](https://github.com/cafjs/caf_fsm/actions/workflows/push.yml)

Caf.js plugin to integrate the great FSM library `@xstate/fsm` (see https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm)

When we combine state machines with our autonomous cloud assistants we make it easier to remotely control IoT devices, make them feel alive, or synchronize actions on hundreds of thousands of them across the world.

And that's not all. The internal state of a cloud assistant is always externally consistent. If the server crashes and restarts, the recovered state is always what everybody expects.

This means that our state machines are also reliable, and we can count on them to, for example, safely orchestrate service API calls, or track the progress of a request in a sea of microservices.

You can learn more about external consistency in Caf.js [here](https://www.cafjslabs.com/orchestration)

## API

See {@link module:caf_fsm/proxy_fsm} and the docs in https://xstate.js.org/docs/packages/xstate-fsm

An example that configures a traffic light state machine from https://github.com/cafjs/caf_hellofsm.git :

```
    async __ca_init__() {
        ...
        this.$.fsm.setCreateMachineMethod('__ca_createMachine__');
        ...
    },
    async __ca_createMachine__() {
        const updateImpl = (newLight) => {
            this.state.light = newLight;
            ...
            this.$.pubsub.publish(this.state.myChannel, newLight);
        };
        const config = {
            id: 'semaphore',
            initial: LIGHTS.RED,
            states: {
                RED: {
                    on: {
                        TICK: {
                            target: LIGHTS.GREEN,
                            actions: () => updateImpl(LIGHTS.GREEN)
                        }
                    }
                },
                GREEN: {
                    on: {
                        TICK: {
                            target: LIGHTS.YELLOW,
                            actions: () => updateImpl(LIGHTS.YELLOW)
                        }
                    }
                },
                YELLOW: {
                    on: {
                        TICK: {
                            target: LIGHTS.RED,
                            actions: () => updateImpl(LIGHTS.RED)
                        }
                    }
                }
            }
        };
        return [null, {config}];
    },
    async __ca_pulse__() {
        ...
        await this.tick();
        ...
    },
    async tick() {
        await this.$.fsm.send(this, TICK);
        return [null, this.state];
    },
```

By using `await` in `this.$.fsm.send` we force state transition actions to be part of the transaction processing the pulse request.

But this also means that the transition action `updateImpl()` cannot be an `async` function, to ensure it completes within the transaction (`xstate` does not internally `await` actions).

This is not a big concern because actions can always call transactional plugins, like `this.$.pubsub`, or modify CA state.

## Configuration

### ca.json

See {@link module:caf_fsm/plug_ca_fsm}

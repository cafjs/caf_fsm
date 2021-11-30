# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Library to create reliable Finite State Machines (FSM) using xstate

[![Build Status](https://github.com/cafjs/caf_fsm/actions/workflows/push.yml/badge.svg)](https://github.com/cafjs/caf_fsm/actions/workflows/push.yml)

Caf.js plugin to integrate the great FSM library `@xstate/fsm`, see https://github.com/statelyai/xstate/tree/main/packages/xstate-fsm

The combination provides server crash reliability with external consistency. Transition actions in the FSM can, for example, could send external notifications that are always consistent with the internal FSM state, even after crash-recovery!

You can learn more about external consistency in Caf.js [here](https://www.cafjslabs.com/orchestration)

## API

See {@link module:caf_fsm/proxy_fsm}

## Configuration

### ca.json

See {@link module:caf_fsm/plug_ca_fsm}

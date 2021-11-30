"use strict";

exports.methods = {
    async __ca_init__() {
        this.$.log.debug("++++++++++++++++Calling init");
        this.state.pulses = 0;
        this.state.nCalls = 0;
        this.scratch.altAll = [
            {
                id: "11",
                tool: "hammer",
                material: "metal"
            },
            {
                id: "12",
                tool: "wrench",
                material: "metal"
            }
        ];

        this.state.all = [
            {
                id: "1",
                name: "foo",
                age : 14
            },
            {
                id: "2",
                name: "bar",
                age : 4
            }
        ];
        this.state.lastResponse = {};
        return [];
    },
    async __ca_pulse__() {
        this.state.pulses = this.state.pulses + 1;
        this.$.log.debug('<<< Calling Pulse>>>' + this.state.pulses);
        if (this.state.lastResponse) {
            this.$.log.debug('Last response: ' +
                             JSON.stringify(this.state.lastResponse));
        }
        return [];
    },
    async __ca_resolver__() {
        return [null, {
            Query: {
                all(obj, args, ctx, info) {
                    return ctx.self.state.all;
                },
                altAll(obj, args, ctx, info) {
                    return ctx.self.scratch.altAll;
                }
            }
        }];
    },
    async setResolver() {
        this.$.graphql.setResolverMethod('__ca_resolver__');
        return [];
    },
    async evalQuery(query) {
        try {
            this.$.graphql.setQuery(query);
            let res = await this.$.graphql.dirtyEvalQuery(this);
            return [null, res];
        } catch (err) {
            return [err];
        }
    },
    async getState() {
        return [null, this.state];
    }
};

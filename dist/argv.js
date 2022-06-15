"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./providers/interface");
exports.default = {
    rpc: {
        describe: 'JSON RPC url to initiate provider',
        required: true,
    },
    token: {
        describe: 'Token address to track',
        example: '0xA1997c88a60dCe7BF92A3644DA21e1FfC8F96dC2',
        type: 'string',
    },
    denomination: {
        describe: 'Token denomination',
        default: 18,
        type: 'number',
    },
    start: {
        describe: 'Start listening from certain block',
        default: null,
        type: 'number',
    },
    end: {
        describe: 'End listening on certain block',
        default: interface_1.LatestBlock,
        type: 'number',
    },
    balancesJson: {
        describe: 'Path to JSON file to include positive balances at the "end" block for unique addresses found in events from "start" to "end" blocks. Live update not supported!',
        default: null,
        type: 'string',
    }
};
//# sourceMappingURL=argv.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.runSafe = exports.Application = void 0;
const nconf = require("nconf");
const yargs = require("yargs");
const fs = require("fs-extra");
const argv_1 = require("./argv");
const interface_1 = require("./interface");
const application_1 = require("./application");
Object.defineProperty(exports, "Application", { enumerable: true, get: function () { return application_1.Application; } });
function runSafe() {
    run().then(stop => {
        process.on('SIGINT', () => {
            stop();
            process.exit(0);
        });
    }).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
exports.runSafe = runSafe;
async function run() {
    var _a;
    const command = ((_a = process.argv.slice(2, 3).shift()) !== null && _a !== void 0 ? _a : '').toLowerCase();
    const cli = yargs(process.argv.slice(3)).options(argv_1.default)
        .example('$0 index --rpc "wss://eth-mainnet.alchemyapi.io/v2/RqNO5cGv853tbDA_MblBuXJIz4V9F2J4" --token "0x73d7c860998CA3c01Ce8c808F5577d94d545d1b4" --start 13145419 --end 14047959 --balancesJson ./test.json', 'Dump balances to "test.json" for addresses indexed within the "start" and "end" blocks').example(`$0 index-lp --rpc "wss://eth-mainnet.alchemyapi.io/v2/RqNO5cGv853tbDA_MblBuXJIz4V9F2J4" --token "0xc09bf2b1bc8725903c509e8caeef9190857215a8" --start 13145419 --end 14047959 --balancesJson ./test.json`, 'Dump holdings to "test.json" for LPs from an Uni V2 pool indexed within the "start" and "end" blocks');
    nconf.argv(cli).env({
        lowerCase: true,
        parseValues: false,
    });
    const app = application_1.Application.create(nconf, true);
    const balancesJsonFile = nconf.get('balancesJson');
    switch (command) {
        case interface_1.Commands.INDEX:
            return await app.index(async (balances) => {
                if (balancesJsonFile) {
                    await fs.outputJson(balancesJsonFile, Array.from(balances));
                }
                setTimeout(() => process.kill(process.pid, 'SIGINT'), 100);
            }, !!balancesJsonFile, true);
        case interface_1.Commands.INDEX_LP:
            if (!balancesJsonFile) {
                throw new Error('LP indexing only available when passing "balancesJson" option');
            }
            return await app.indexUniV2Pool(async (holdings) => {
                holdings.balances = Array.from(holdings.balances);
                await fs.outputJson(balancesJsonFile, holdings);
                setTimeout(() => process.kill(process.pid, 'SIGINT'), 100);
            }, true);
        default:
            cli.showHelp();
    }
}
exports.run = run;
//# sourceMappingURL=index.js.map
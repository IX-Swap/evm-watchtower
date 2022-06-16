"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const ololog_1 = require("ololog");
const ethers_1 = require("ethers");
const evm_1 = require("./providers/evm");
const interface_1 = require("./providers/interface");
const object_config_1 = require("./object-config");
class Application {
    constructor(config, logging) {
        this.config = config;
        this.logging = logging;
        this.log = ololog_1.default.configure({ locate: false, time: true });
    }
    async indexUniV2PoolPromised(stringifyBalances = false) {
        return new Promise(async (resolve) => {
            await this.indexUniV2Pool(holdings => resolve(holdings), stringifyBalances);
        });
    }
    async indexUniV2Pool(onEnd, stringifyBalances = false) {
        return this.index(async (balances) => {
            const evm = new evm_1.Evm(this.config.get('rpc'));
            this.logging && this.log.darkGray(`Calculating ${balances.size} LPs holdings in "${this.config.get('token')}" Uni V2 pool`);
            const holdings = await evm.getUniV2Holdings(this.config.get('token'), balances, this.config.get('end'), stringifyBalances);
            return (onEnd !== null && onEnd !== void 0 ? onEnd : (() => { }))(holdings);
        }, true, false);
    }
    async indexPromised(readBalances = false, stringifyBalances = false) {
        return new Promise(async (resolve) => {
            await this.index(balances => resolve(balances), readBalances, stringifyBalances);
        });
    }
    async index(onEnd, readBalances = false, stringifyBalances = false) {
        const evm = new evm_1.Evm(this.config.get('rpc'));
        this.logging && this.log.green(await evm.info());
        this.logging && this.log.green(`TOKEN=${this.config.get('token')}`);
        this.logging && this.log.green(`DENOMINATION=${this.config.get('denomination')}`);
        this.logging && this.log.green(`START_BLOCK=${this.config.get('start')}`);
        this.logging && this.log.green(`END_BLOCK=${this.config.get('end')}`);
        const uniqueAddresses = readBalances ? new Set() : null;
        const cancel = await evm.listenErc20Transfers(this.config.get('token'), this.config.get('denomination'), async (event) => {
            if (event == interface_1.EndOfEvents) {
                let balances = null;
                if (readBalances) {
                    uniqueAddresses.delete(ethers_1.ethers.constants.AddressZero);
                    this.logging && this.log.darkGray(`Read balances of ${uniqueAddresses.size} addresses`);
                    balances = await evm.getErc20Balances(this.config.get('token'), uniqueAddresses, stringifyBalances);
                    this.logging && this.log.darkGray(`Found ${balances.size} addresses w/ positive balances`);
                }
                return (onEnd !== null && onEnd !== void 0 ? onEnd : (() => { }))(balances);
            }
            this.logging && this.log.yellow(`[${event.blockNumber}] ${event.type}(${event.fromShort}, ${event.toShort}, ${event.amountHuman})`);
            if (readBalances) {
                uniqueAddresses.add(event.from);
                uniqueAddresses.add(event.to);
            }
        }, this.config.get('start'), this.config.get('end'));
        return () => {
            this.logging && this.log.yellow('Stopping...');
            cancel();
        };
    }
    static createFromConfig(config, logging = false) {
        return new this(new object_config_1.ObjectConfig(config), logging);
    }
    static create(config, logging = false) {
        return new this(config, logging);
    }
}
exports.Application = Application;
//# sourceMappingURL=application.js.map
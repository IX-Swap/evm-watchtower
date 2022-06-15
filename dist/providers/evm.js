"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evm = void 0;
const ethers_1 = require("ethers");
const ethers_multicall_1 = require("ethers-multicall");
const interface_1 = require("./interface");
class Evm {
    constructor(rpcUrl) {
        this.provider = /^wss:/i.test(rpcUrl)
            ? new ethers_1.ethers.providers.WebSocketProvider(rpcUrl)
            : new ethers_1.ethers.providers.JsonRpcProvider(rpcUrl);
    }
    erc20Contract(token, multicall = false, includeUniV2 = false) {
        const abi = [
            interface_1.Abi.Transfer, interface_1.Abi.BalanceOf, interface_1.Abi.TotalSupply,
            ...(includeUniV2 ? [interface_1.Abi.Token0, interface_1.Abi.Token1, interface_1.Abi.GetReserves] : [])
        ];
        return multicall ? new ethers_multicall_1.Contract(token, abi) : new ethers_1.ethers.Contract(token, abi, this.provider);
    }
    async getUniV2Holdings(pool, balances, block = interface_1.LatestBlock, stringifyBalances = false) {
        const contract = this.erc20Contract(pool, false, true);
        const token0 = await contract.token0();
        const token1 = await contract.token1();
        let totalSupply = await contract.totalSupply({ blockTag: block });
        totalSupply = totalSupply.sub(10 ** 3);
        const [reserve0, reserve1] = await contract.getReserves({ blockTag: block });
        const result = {
            token0, token1,
            totalSupply: stringifyBalances ? totalSupply.toString() : totalSupply,
            balances: new Set(),
        };
        for (const { address, amount } of balances) {
            const perc = amount.mul(10 ** 8).div(totalSupply.div(100));
            const amount0 = reserve0.mul(perc).div(10 ** 10);
            const amount1 = reserve1.mul(perc).div(10 ** 10);
            result.balances.add({
                address,
                amount: stringifyBalances ? amount.toString() : amount,
                amount0: stringifyBalances ? amount0.toString() : amount0,
                amount1: stringifyBalances ? amount1.toString() : amount1,
            });
        }
        return result;
    }
    async getErc20Balances(token, addresses, stringifyBalances = false) {
        const ethcallProvider = new ethers_multicall_1.Provider(this.provider);
        await ethcallProvider.init();
        const contract = this.erc20Contract(token, true);
        const result = new Set();
        const balances = await ethcallProvider.all(Array.from(addresses).map(address => contract.balanceOf(address)));
        let i = 0;
        for (const address of addresses) {
            const balance = balances[i++];
            if (balance.toString() !== '0') {
                result.add({ address, amount: stringifyBalances ? balance.toString() : balance });
            }
        }
        return result;
    }
    async listenErc20Transfers(token, denomination, callback, fromBlock = null, toBlock = interface_1.LatestBlock) {
        const contract = this.erc20Contract(token);
        const allTransfers = contract.filters.Transfer(null, null);
        const listener = async (from, to, amount, { blockNumber }) => await callback(Evm.wrapTransfer(from, to, amount, denomination, blockNumber));
        if (fromBlock !== null) {
            const events = await contract.queryFilter(allTransfers, Number(fromBlock), Number(toBlock));
            for (const { args: [from, to, amount], blockNumber } of events) {
                await listener(from, to, amount, { blockNumber });
            }
            if (toBlock !== interface_1.LatestBlock) {
                await callback(interface_1.EndOfEvents);
                return () => { };
            }
        }
        contract.on(allTransfers, listener);
        return () => contract.off(allTransfers, listener);
    }
    async info() {
        const { name, chainId, ensAddress } = await this.provider.getNetwork();
        return {
            name, chainId, ensAddress,
            gasPrice: (await this.provider.getGasPrice()).toString(),
            latestBlock: await this.provider.getBlockNumber(),
        };
    }
    static wrapTransfer(from, to, amount, denomination, blockNumber) {
        let type = interface_1.EventType.Transfer;
        if (from == ethers_1.ethers.constants.AddressZero) {
            type = interface_1.EventType.Mint;
        }
        else if (to == ethers_1.ethers.constants.AddressZero) {
            type = interface_1.EventType.Burn;
        }
        return {
            type, from, to, amount, blockNumber,
            amountHuman: ethers_1.ethers.utils.formatUnits(amount, denomination),
            fromShort: this.shortAddress(from),
            toShort: this.shortAddress(to),
        };
    }
    static shortAddress(address) {
        return `${address.substring(0, 7)}...${address.substring(address.length - 6)}`;
    }
}
exports.Evm = Evm;
//# sourceMappingURL=evm.js.map
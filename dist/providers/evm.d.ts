import { ethers } from 'ethers';
import { Contract as MulticallContract } from 'ethers-multicall';
import { ProviderInfo, Event, TokenBalance, UniV2HoldingsResponse } from './interface';
export declare class Evm {
    readonly provider: ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider;
    constructor(rpcUrl: string);
    erc20Contract(token: string, multicall?: boolean, includeUniV2?: boolean): ethers.Contract | MulticallContract;
    getUniV2Holdings(pool: string, balances: Set<TokenBalance>, block?: number | string, stringifyBalances?: boolean): Promise<UniV2HoldingsResponse>;
    getErc20Balances(token: string, addresses: Set<string>, stringifyBalances?: boolean): Promise<Set<TokenBalance>>;
    listenErc20Transfers(token: string, denomination: number, callback: Function, fromBlock?: number, toBlock?: number | string): Promise<Function>;
    info(): Promise<ProviderInfo>;
    static wrapTransfer(from: string, to: string, amount: ethers.BigNumber, denomination: number, blockNumber: number): Event;
    static shortAddress(address: string): string;
}

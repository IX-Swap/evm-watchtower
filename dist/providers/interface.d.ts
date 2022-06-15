import { ethers } from 'ethers';
export interface ProviderInfo extends ethers.providers.Network {
    latestBlock: number;
    gasPrice: string;
}
export declare enum Abi {
    Transfer = "event Transfer(address indexed from, address indexed to, uint256 value)",
    BalanceOf = "function balanceOf(address owner) view returns (uint256)",
    TotalSupply = "function totalSupply() view returns (uint256)",
    GetReserves = "function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
    Token0 = "function token0() view returns (address)",
    Token1 = "function token1() view returns (address)"
}
export declare enum EventType {
    Transfer = "Transfer",
    Burn = "Burn",
    Mint = "Mint"
}
export interface Event {
    eoe?: boolean;
    type?: EventType;
    from?: string;
    fromShort?: string;
    to?: string;
    toShort?: string;
    amount?: ethers.BigNumber;
    amountHuman?: string;
    blockNumber?: number;
}
export interface TokenBalance {
    address: string;
    amount: ethers.BigNumber | string;
}
export interface UniV2Holdings extends TokenBalance {
    amount0: ethers.BigNumber | string;
    amount1: ethers.BigNumber | string;
}
export interface UniV2HoldingsResponse {
    token0: string;
    token1: string;
    totalSupply: ethers.BigNumber | string;
    balances: Set<UniV2Holdings>;
}
export declare const EndOfEvents: {
    eoe: boolean;
};
export declare const LatestBlock = "latest";

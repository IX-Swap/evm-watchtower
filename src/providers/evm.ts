import { ethers } from 'ethers';
import { Contract as MulticallContract, Provider as MulticallProvider } from 'ethers-multicall';
import { ProviderInfo, Abi, Event, EventType, LatestBlock, EndOfEvents, TokenBalance, UniV2Holdings, UniV2HoldingsResponse } from './interface';

export class Evm {
  readonly provider: ethers.providers.JsonRpcProvider | ethers.providers.WebSocketProvider;

  constructor(rpcUrl: string) {
    this.provider = /^wss:/i.test(rpcUrl)
      ? new ethers.providers.WebSocketProvider(rpcUrl)
      : new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  erc20Contract(token: string, multicall = false, includeUniV2 = false): ethers.Contract | MulticallContract {
    const abi = [
      Abi.Transfer, Abi.BalanceOf, Abi.TotalSupply,
      ...(includeUniV2 ? [Abi.Token0, Abi.Token1, Abi.GetReserves] : [])
    ];
    return multicall ? new MulticallContract(token, abi) : new ethers.Contract(token, abi, this.provider);
  }

  async getUniV2Holdings(
    pool: string,
    balances: Set<TokenBalance>,
    block: number | string = LatestBlock,
    stringifyBalances = false
  ): Promise<UniV2HoldingsResponse> {
    const contract = this.erc20Contract(pool, false, true);
    const blockTag = Number(block);

    const token0 = await contract.token0();
    const token1 = await contract.token1();

    let totalSupply = await contract.totalSupply({ blockTag });
    totalSupply = totalSupply.sub(10 ** 3); // @todo remove MINIMUM_LIQUIDITY?
    const [reserve0, reserve1] = await contract.getReserves({ blockTag });

    const result = {
      token0, token1,
      totalSupply: stringifyBalances ? totalSupply.toString() : totalSupply,
      balances: new Set() as Set<UniV2Holdings>,
    };

    for (const { address, amount } of balances) {
      // @todo should it be enough for smaller holdings?
      const perc = (amount as ethers.BigNumber).mul(10 ** 8).div(totalSupply.div(100));
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

  async getErc20Balances(token: string, addresses: Set<string>, stringifyBalances = false)
    : Promise<Set<TokenBalance>> {
    const ethcallProvider = new MulticallProvider(this.provider);
    await ethcallProvider.init(); // Only required when `chainId` is not provided in the `Provider` constructor

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

    return result as Set<TokenBalance>;
  }

  async listenErc20Transfers(
    token: string,
    denomination: number,
    callback: Function,
    fromBlock: number = null,
    toBlock: number | string = LatestBlock,
  ): Promise<Function> {
    const contract = this.erc20Contract(token);
    const allTransfers = contract.filters.Transfer(null, null) as ethers.EventFilter;
    const listener = async (from: string, to: string, amount: ethers.BigNumber, { blockNumber }) =>
      await callback(Evm.wrapTransfer(from, to, amount, denomination, blockNumber));

    if (fromBlock !== null) {
      const events = await contract.queryFilter(allTransfers, Number(fromBlock), Number(toBlock));

      for (const { args: [from, to, amount], blockNumber } of events) {
        await listener(from, to, amount, { blockNumber });
      }

      // we might not want to listen to new events...
      if (toBlock !== LatestBlock) {
        await callback(EndOfEvents);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => { }; // no nothing
      }
    }

    contract.on(allTransfers, listener);
    return () => contract.off(allTransfers, listener);
  }

  async info(): Promise<ProviderInfo> {
    const { name, chainId, ensAddress } = await this.provider.getNetwork();

    return {
      name, chainId, ensAddress,
      gasPrice: (await this.provider.getGasPrice()).toString(),
      latestBlock: await this.provider.getBlockNumber(),
    };
  }

  static wrapTransfer(from: string, to: string, amount: ethers.BigNumber, denomination: number, blockNumber: number): Event {
    let type = EventType.Transfer;

    if (from == ethers.constants.AddressZero) {
      type = EventType.Mint;
    } else if (to == ethers.constants.AddressZero) {
      type = EventType.Burn;
    }

    return {
      type, from, to, amount, blockNumber,
      amountHuman: ethers.utils.formatUnits(amount, denomination),
      fromShort: this.shortAddress(from),
      toShort: this.shortAddress(to),
    };
  }

  static shortAddress(address: string): string {
    return `${address.substring(0, 7)}...${address.substring(address.length - 6)}`;
  }
}

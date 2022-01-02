# evm-watchtower
EVM watchtower to monitor contracts activity over the time.

## Installation

```
git clone git@github.com:IX-Swap/evm-watchtower.git
cd ./evm-watchtower
npm i -g .
```

## CLI Examples

Dump balances to "test.json" for addresses indexed within the "start" and "end" blocks:

```
evm-wt index --rpc "wss://eth-mainnet.alchemyapi.io/v2/RqNO5cGv853tbDA_MblBuXJIz4V9F2J4" --token "0x73d7c860998CA3c01Ce8c808F5577d94d545d1b4" --start 13145419 --end 14047959 --balancesJson ./test.json
```


Dump holdings to "test.json" for LPs from an Uni V2 pool indexed within the "start" and "end" blocks:

```
evm-wt index-lp --rpc "wss://eth-mainnet.alchemyapi.io/v2/RqNO5cGv853tbDA_MblBuXJIz4V9F2J4" --token "0xc09bf2b1bc8725903c509e8caeef9190857215a8" --start 13145419 --end 14047959 --balancesJson ./test.json
```

## Programmatic Usage

```typescript
import { Application } from 'evm-watchtower';

/////////// Read ERC20 token balances

const app = Application.create({
  rpc: 'wss://eth-mainnet.alchemyapi.io/v2/RqNO5cGv853tbDA_MblBuXJIz4V9F2J4',
  token: '0x73d7c860998CA3c01Ce8c808F5577d94d545d1b4', // IXS ERC20 token
  start: '13145419',
  end: '14047959'
});

await app.index(async balances => {

  /*
  TYPE: balances => Set<TokenBalance>

  export interface TokenBalance {
    address: string,
    amount: ethers.BigNumber | string,
  }
  */

  console.log('balances', balances);
}, /* readBalances = */ true, /* stringifyBalances = */ false);


/////////// Read Uni V2 LP token holdings

const app = Application.create({
  rpc: 'wss://eth-mainnet.alchemyapi.io/v2/RqNO5cGv853tbDA_MblBuXJIz4V9F2J4',
  token: '0xc09bf2b1bc8725903c509e8caeef9190857215a8', // Uni V2 IXS-ETH LP token
  start: '13145419',
  end: '14047959'
});

await app.indexUniV2Pool(async holdings => {
  /*
  TYPE: holdings => { token0: string, token1: string, totalSupply: ethers.BigNumber | string, balances: Set<UniV2Holdings> }

  export interface UniV2Holdings extends TokenBalance {
    address: string,
    amount: ethers.BigNumber | string,
  }
  */

  console.log('holdings', holdings);
}, /* stringifyBalances = */ false);
```

## Help

```
Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --rpc           JSON RPC url to initiate provider                   [required]
  --token         Token address to track                                [string]
  --denomination  Token denomination                      [number] [default: 18]
  --start         Start listening from certain block    [number] [default: null]
  --end           End listening on certain block    [number] [default: "latest"]
  --balancesJson  Path to JSON file to include positive balances at the "end"
                  block for unique addresses found in events from "start" to
                  "end" blocks. Live update not supported!
                                                        [string] [default: null]

Examples:
  evm-wt index --rpc                        Dump balances to "test.json" for
  "wss://eth-mainnet.alchemyapi.io/v2/RqNO  addresses indexed within the "start"
  5cGv853tbDA_MblBuXJIz4V9F2J4" --token     and "end" blocks
  "0x73d7c860998CA3c01Ce8c808F5577d94d545d
  1b4" --start 13145419 --end 14047959
  --balancesJson ./test.json
  evm-wt index-lp --rpc                     Dump holdings to "test.json" for LPs
  "wss://eth-mainnet.alchemyapi.io/v2/RqNO  from an Uni V2 pool indexed within
  5cGv853tbDA_MblBuXJIz4V9F2J4" --token     the "start" and "end" blocks
  "0xc09bf2b1bc8725903c509e8caeef919085721
  5a8" --start 13145419 --end 14047959
  --balancesJson ./test.json
```

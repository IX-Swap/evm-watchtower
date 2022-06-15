import { Application } from './src/application';

async function runApplication() {
  try {
    const app = Application.createFromConfig({
      rpc: 'wss://polygon-mainnet.g.alchemy.com/v2/your_key', // your network node
      token: '0x2B38800032da1B091452c0d0739153CAb702A1fD', // IXS ERC20 token
      start: '28511673',
      end: '29360569'
    });
          
    const balances = await app.indexPromised(/* readBalances = */ true, /* stringifyBalances = */ false);
          
    console.log('balances', balances);
  } catch (err) {
    console.log("Error in input reading", err);
  }
}
  
 runApplication();
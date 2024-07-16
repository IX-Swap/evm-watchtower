import { Evm } from './evm'
import { utils } from 'ethers'

const evm = new Evm('https://polygon-amoy.g.alchemy.com/v2/VAr-dttdNxi7WYf2ft4wNScXqrUzXRK3')

describe('evm balances', () => {
    const tokenAddress = '0x91c55F646832577E433871A83bbb117C119a2573'
    const userAddress = '0x59D77C797d93A92D1AeF1588a22602450A284334'
    const uniqueAddresses = new Set()
    it('should has token', async () => {
        uniqueAddresses.add(userAddress)
        const balances = await evm.getErc20Balances(
            tokenAddress,
            uniqueAddresses as Set<string>,
            false
        );

        expect(balances.size).toEqual(1)
        balances.forEach((item) => {
            const balance = utils.formatUnits(item.amount, 18);
            expect(+balance).toBeGreaterThan(0)
        });
    })
})
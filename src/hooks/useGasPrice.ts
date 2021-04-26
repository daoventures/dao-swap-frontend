import Web3 from 'web3'
import { BridgeConfig } from 'constants/CrosschainConfig'

export default async function useGasPrice(currentChain: BridgeConfig): Promise<string> {
  const web3 = await new Web3(currentChain.rpcUrl)
  return await web3.eth.getGasPrice()
}

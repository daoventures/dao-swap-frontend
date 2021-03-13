import { ChainId } from '@zeroexchange/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441',
  [ChainId.ROPSTEN]: '0x53C43764255c17BD724F74c4eF150724AC50a3ed',
  [ChainId.KOVAN]: '0x2cc8688C5f75E365aaEEb4ea8D6a480405A48D2A',
  [ChainId.RINKEBY]: '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821',
  [ChainId.GÖRLI]: '0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e',
  [ChainId.FUJI]: '0x032eca8A5eF2e32348C56e9808B7a816B7d3a427',
  [ChainId.AVALANCHE]: '0xd2b4cD0966D08fE000CED7B73DFcbD2Ec000759F',
  [ChainId.SMART_CHAIN_TEST]: '0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042',
  [ChainId.SMART_CHAIN]: '0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }

import { ChainId } from '@zeroexchange/sdk';

export type TokenConfig = {
  chainId?: number
  address: string
  decimals: number
  name?: string
  symbol?: string
  imageUri?: string
  isNativeWrappedToken?: boolean
  assetBase: string
}

export type BridgeConfig = {
  chainId: number
  name: string
  isTestnet?: boolean
  bridgeAddress: string
  rpcUrl: string
  gasLimit?: number
  type: 'Ethereum' | 'Substrate'
  tokens: TokenConfig[]
  nativeTokenSymbol: string
  //This should be the full path to display a tx hash, without the trailing slash, ie. https://etherscan.io/tx
  blockExplorer?: string
  defaultGasPrice?: number
}

export type ChainbridgeConfig = {
  chains: BridgeConfig[]
}

export const crosschainConfig: ChainbridgeConfig = {
  chains: [
    {
      chainId: ChainId.MAINNET,
      name: 'Ethereum',
      isTestnet: false,
      bridgeAddress: '',
      rpcUrl: 'https://mainnet.infura.io/v3/8ea75892f7044dd59127696bd2d3b114',
      type: 'Ethereum',
      blockExplorer: 'https://etherscan.io/tx',
      nativeTokenSymbol: 'ETH',
      tokens: [
        {
          address: "0x51e00a95748DBd2a3F47bC5c3b3E7B3F0fea666c",
          name: "DVGToken",
          symbol: "DVG",
          assetBase: 'DVG',
          decimals: 18,
        },
      ]
    },
    {
      chainId: ChainId.ROPSTEN,
      name: 'Ropsten',
      isTestnet: true,
      bridgeAddress: '0x3685fB7CA1C555Cb5BD5A246422ee1f2c53DdB71',
      rpcUrl: 'https://ropsten.infura.io/v3/8ea75892f7044dd59127696bd2d3b114',
      type: 'Ethereum',
      blockExplorer: 'https://ropsten.etherscan.io/tx',
      nativeTokenSymbol: 'ETH',
      tokens: [
        {
          address: "0xE8c9F440677bDC8bA915734e6c7C1b232916877d",
          name: "DVGToken",
          symbol: "DVG",
          assetBase: 'DVG',
          decimals: 18,
        },
      ]
    },
    {
      chainId: ChainId.SMART_CHAIN,
      name: 'Smart Chain',
      isTestnet: false,
      bridgeAddress: '',
      rpcUrl: 'https://bsc-dataseed2.binance.org',
      type: 'Ethereum',
      gasLimit: 6721975,
      defaultGasPrice: 12.5,
      blockExplorer: 'https://bscscan.com/',
      nativeTokenSymbol: 'BNB',
      tokens: [
        {
          address: '',
          name: 'DVGToken',
          symbol: 'DVG',
          assetBase: 'DVG',
          decimals: 18,
        },
      ]
    },
    {
      chainId: ChainId.SMART_CHAIN_TEST,
      name: 'Smart Chain(Testnet)',
      isTestnet: true,
      bridgeAddress: '0x4728a38b6B00cdFF9Fdc59aCE8E3c7eF3c6560E5',
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      type: 'Ethereum',
      gasLimit: 6721975,
      defaultGasPrice: 12.5,
      blockExplorer: 'https://testnet.bscscan.com/',
      nativeTokenSymbol: 'BNB',
      tokens: [
        {
          address: '0x111DE482A01eB87875d18f8C1131FCA709b6a646',
          name: 'DVGToken',
          symbol: 'DVG',
          assetBase: 'DVG',
          decimals: 18,
        },
      ]
    },
  ]
}

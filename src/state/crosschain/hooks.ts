import { BigNumber, ethers, utils } from 'ethers'
import { BridgeConfig, TokenConfig, crosschainConfig } from '../../constants/CrosschainConfig'
import {
  ChainTransferState,
  CrosschainChain,
  CrosschainToken,
  ProposalStatus,
  setAvailableChains,
  setAvailableTokens,
  setCrosschainDepositConfirmed,
  setCrosschainFee,
  setCrosschainRecipient,
  setCrosschainSwapDetails,
  setCrosschainTransferStatus,
  setCurrentChain,
  setCurrentToken,
  setCurrentTokenBalance,
  setCurrentTxID,
  setPendingTransfer,
  setTargetChain,
  setTargetTokens,
  setTransferAmount
} from './actions'
import store, { AppDispatch, AppState } from '../index'
import { useDispatch, useSelector } from 'react-redux'

import { ChainId } from '@zeroexchange/sdk'
import Web3 from 'web3'
import { initialState } from './reducer'
import { useActiveWeb3React } from '../../hooks'
import { useEffect } from 'react'
import useGasPrice from 'hooks/useGasPrice'
import { calculateGasMargin } from '../../utils'

// import { afterWrite } from '@popperjs/core'

const BSCSwapAgentABI = require('../../constants/abis/BSCSwapAgentImpl.json').abi
const ETHSwapAgentABI = require('../../constants/abis/ETHSwapAgentImpl.json').abi
const TokenABI = require('../../constants/abis/ERC20PresetMinterPauser.json').abi
// eslint-disable-next-line @typescript-eslint/no-var-requires
const USDTTokenABI = require('../../constants/abis/USDTABI.json')

let dispatch: AppDispatch
let web3React: any

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function useCrosschainState(): AppState['crosschain'] {
  return useSelector<AppState, AppState['crosschain']>(state => state.crosschain)
}

function getCrosschainState(): AppState['crosschain'] {
  return store.getState().crosschain || initialState
}

function WithDecimals(value: string | number): string {
  if (typeof value !== 'string') {
    value = String(value)
  }
  return utils.formatUnits(value, 18)
}

function WithDecimalsHexString(value: string, decimals: number): string {
  return BigNumber.from(utils.parseUnits(value, decimals)).toHexString()
}

function GetCurrentChain(currentChainName: string): CrosschainChain {
  let result: CrosschainChain = {
    name: '',
    chainId: -1,
    isTestnet: false,
  }
  for (const chain of crosschainConfig.chains) {
    if (chain.name === currentChainName) {
      result = {
        name: chain.name,
        chainId: chain.chainId,
        symbol: chain.nativeTokenSymbol,
        isTestnet: chain.isTestnet,
      }
      break;
    }
  }
  return result
}

function GetChainbridgeConfigByID(chainId: number | string): BridgeConfig {
  if (typeof chainId === 'string') {
    chainId = Number(chainId)
  }
  let result: BridgeConfig = {
    chainId: -1,
    name: '',
    bridgeAddress: '',
    rpcUrl: '',
    tokens: [],
    nativeTokenSymbol: '',
    type: 'Ethereum',
    isTestnet: false,
  }
  for (const chain of crosschainConfig.chains) {
    if (chain.chainId === chainId) {
      result = chain
      break;
    }
  }
  return result
}

export function GetTokenByAddress(address: string): TokenConfig {
  let result: TokenConfig = {
    address: '',
    decimals: 18,
    assetBase: ''
  }
  for (const chain of crosschainConfig.chains) {
    for (const token of chain.tokens) {
      if (token.address === address) {
        result = token
        return result
      }
    }
  }
  return result
}

export function GetTokenByName(chainId: number | undefined, name: string ): TokenConfig {
  let result: TokenConfig = {
    address: '',
    decimals: 18,
    assetBase: ''
  }
  for (const chain of crosschainConfig.chains) {
    if (chain.chainId !== chainId) continue;
    for (const token of chain.tokens) {
      if (token.name && token.name === name) {
        result = token
        return result
      }
    }
  }
  return result
}

function GetAvailableChains(currentChainName: string): Array<CrosschainChain> {
  const currentChain = GetCurrentChain(currentChainName)

  const result: Array<CrosschainChain> = []
  for (const chain of crosschainConfig.chains) {
    if (chain.name !== currentChainName && chain.isTestnet === currentChain.isTestnet) {
      result.push({
        name: chain.name,
        chainId: chain.chainId,
        isTestnet: chain.isTestnet,
      })
    }
  }
  return result
}

function GetAvailableTokens(chainName: string): Array<CrosschainToken> {
  const result: Array<CrosschainToken> = []
  for (const chain of crosschainConfig.chains) {
    if (chain.name === chainName) {
      for (const token of chain.tokens) {
        const t = {
          chainId: chain.chainId,
          address: token.address,
          name: token.name || '',
          symbol: token.symbol || '',
          decimals: token.decimals,
          imageUri: token.imageUri,
          isNativeWrappedToken: token.isNativeWrappedToken,
          assetBase: token.assetBase
        }
        result.push(t)
      }
    }
  }
  return result
}


function GetChainNameById(chainId: number): string {
  if (chainId === ChainId.MAINNET) {
    return 'Ethereum'
  // } else if (chainId === ChainId.RINKEBY) {
  //   return 'Rinkeby'
  } else if (chainId === ChainId.ROPSTEN) {
    return 'Ropsten'
  // } else if (chainId === ChainId.FUJI) {
  //   return 'Avalanche'
  // } else if (chainId === ChainId.AVALANCHE) {
  //   return 'Avalanche'
  } else if (chainId === ChainId.SMART_CHAIN) {
    return 'Smart Chain'
  } else if (chainId === ChainId.SMART_CHAIN_TEST) {
    return 'Smart Chain(Testnet)'
  }
  return ''
}

export function useCrosschainHooks() {
  dispatch = useDispatch()
  web3React = useActiveWeb3React()
  const { account } = useActiveWeb3React()

  const BreakCrosschainSwap = () => {
    dispatch(
      setCurrentTxID({
        txID: ''
      })
    )
    dispatch(setCrosschainTransferStatus({
      status: ChainTransferState.NotStarted
    }))

    dispatch(
      setCrosschainSwapDetails({
        details: {
          status: ProposalStatus.INACTIVE,
          voteCount: 0
        }
      })
    )

    dispatch(
      setCrosschainDepositConfirmed({
        confirmed: false
      })
    )

    dispatch(
      setPendingTransfer({
        pendingTransfer: {}
      })
    )
  }

  const getNonce = async (): Promise<number> => {
    return await web3React.library.getSigner().getTransactionCount()
  }

  const MakeDeposit = async () => {
    dispatch(setCrosschainTransferStatus({
      status: ChainTransferState.TransferPending
    }))

    const crosschainState = getCrosschainState()
    const currentChain = GetChainbridgeConfigByID(crosschainState.currentChain.chainId)
    const currentToken = GetTokenByAddress(crosschainState.currentToken.address)
    const targetChain = GetChainbridgeConfigByID(crosschainState.targetChain.chainId)
    const currentGasPrice = await useGasPrice(currentChain)
    dispatch(
      setCurrentTxID({
        txID: ''
      })
    )
    const abi = (currentChain.chainId === ChainId.SMART_CHAIN || currentChain.chainId === ChainId.SMART_CHAIN_TEST)
      ? BSCSwapAgentABI
      : ETHSwapAgentABI;
    const signer = web3React.library.getSigner()
    const bridgeContract = new ethers.Contract(currentChain.bridgeAddress, abi, signer)

    const data = '0x'
      + utils
        .hexZeroPad(
          // TODO Wire up dynamic token decimals
          WithDecimalsHexString(crosschainState.transferAmount, currentToken.decimals),
          32
        )
        .substr(2) // Deposit Amount (32 bytes)
      // + utils.hexZeroPad(utils.hexlify((crosschainState.currentRecipient.length - 2) / 2), 32).substr(2) // len(recipientAddress) (32 bytes)
      // + crosschainState.currentRecipient.substr(2) // recipientAddress (?? bytes)

    // const gasPriceFromChain = (currentChain.chainId === ChainId.MAINNET || currentChain.chainId === ChainId.ROPSTEN)
    //     ? WithDecimalsHexString(currentGasPrice, 0)
    //     : WithDecimalsHexString(String(currentChain.defaultGasPrice || 470), 9)
    const gasPriceFromChain = WithDecimalsHexString(currentGasPrice, 0);

    var txObj;
    if (currentChain.chainId === ChainId.SMART_CHAIN || currentChain.chainId === ChainId.SMART_CHAIN_TEST) {
      const estimatedGas = await bridgeContract.estimateGas.swapBSC2ETH(currentToken.address, data, {
        value: WithDecimalsHexString(crosschainState.crosschainFee, 18)
      }).catch((e) => {
        return BigNumber.from(500000)}
      );

      txObj = bridgeContract
      .swapBSC2ETH(currentToken.address, data, {
        gasLimit: calculateGasMargin(estimatedGas),
        value: WithDecimalsHexString(crosschainState.crosschainFee, 18 /*18 - AVAX/ETH*/),
        gasPrice: gasPriceFromChain,
        nonce: await getNonce()
      })
    } else {
      const estimatedGas = await bridgeContract.estimateGas.swapETH2BSC(currentToken.address, data, {
        value: WithDecimalsHexString(crosschainState.crosschainFee, 18)
      }).catch((e) => {
        return BigNumber.from(500000)
      });

      txObj = bridgeContract
      .swapETH2BSC(currentToken.address, data, {
        gasLimit: calculateGasMargin(estimatedGas),
        value: WithDecimalsHexString(crosschainState.crosschainFee, 18 /*18 - AVAX/ETH*/),
        gasPrice: gasPriceFromChain,
        nonce: await getNonce()
      })
    }

    const resultDepositTx = await txObj
      .catch((err: any) => {
        console.log(err)
        BreakCrosschainSwap()
      })

    if (!resultDepositTx) {
      return
    }

    await resultDepositTx.wait()

    dispatch(
      setCrosschainDepositConfirmed({
        confirmed: true
      })
    )

    dispatch(
      setCurrentTxID({
        txID: resultDepositTx.hash
      })
    )
    dispatch(setCrosschainTransferStatus({
      status: ChainTransferState.TransferComplete
    }))

    const state = getCrosschainState()
    const pendingTransfer = {
      currentSymbol: state?.currentToken?.symbol,
      targetSymbol: state?.targetTokens?.find(x => x.assetBase === state?.currentToken?.assetBase)?.symbol,
      assetBase: state?.currentToken?.assetBase,
      amount: state?.transferAmount,
      decimals: state?.currentToken?.decimals,
      name: state?.targetChain?.name,
      address: state?.currentToken?.address,
      status: state?.swapDetails?.status,
      votes: state?.swapDetails?.voteCount
    }

    dispatch(
      setPendingTransfer({
        pendingTransfer
      })
    )

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    UpdateOwnTokenBalance(account).catch(console.error)
  }

  const GetAllowance = async () => {
    const crosschainState = getCrosschainState()
    const currentChain = GetChainbridgeConfigByID(crosschainState.currentChain.chainId)
    const currentToken = GetTokenByAddress(crosschainState.currentToken.address)

    // @ts-ignore
    const signer = web3React.library.getSigner()
    const tokenContract = new ethers.Contract(currentToken.address, TokenABI, signer)
    const approvedAmount = await tokenContract.allowance(
      crosschainState.currentRecipient,
      currentChain.bridgeAddress
    )
    const countTokenForTransfer = BigNumber.from(
      WithDecimalsHexString(crosschainState.transferAmount, currentToken.decimals)
    )
    if (countTokenForTransfer.lte(approvedAmount)) {
      dispatch(setCrosschainTransferStatus({
        status: ChainTransferState.ApprovalComplete
      }))
    } else {
      console.log('not approved before')
    }
  }

  const MakeApprove = async () => {
    const crosschainState = getCrosschainState()
    const currentChain = GetChainbridgeConfigByID(crosschainState.currentChain.chainId)
    const currentToken = GetTokenByAddress(crosschainState.currentToken.address)
    const currentGasPrice = await useGasPrice(currentChain)
    dispatch(
      setCurrentTxID({
        txID: ''
      })
    )
    dispatch(setCrosschainTransferStatus({
      status: ChainTransferState.NotStarted
    }))

    // const gasPriceFromChain = (currentChain.chainId === ChainId.MAINNET || currentChain.chainId === ChainId.ROPSTEN)
    //     ? WithDecimalsHexString(currentGasPrice, 0)
    //     : WithDecimalsHexString(String(currentChain.defaultGasPrice || 470), 9)
    const gasPriceFromChain = WithDecimalsHexString(currentGasPrice, 0);

    // @ts-ignore
    const signer = web3React.library.getSigner()
    const usdtAddress = crosschainState.availableTokens.find(token => token.symbol === 'USDT')?.address ??
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    // https://forum.openzeppelin.com/t/can-not-call-the-function-approve-of-the-usdt-contract/2130/2
    const isUsdt = currentToken.address === usdtAddress
    const ABI = isUsdt ? USDTTokenABI : TokenABI
    const tokenContract = new ethers.Contract(currentToken.address, ABI, signer)

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(currentChain.bridgeAddress, WithDecimalsHexString(String(Number.MAX_SAFE_INTEGER), currentToken.decimals)).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(currentChain.bridgeAddress, WithDecimalsHexString(crosschainState.transferAmount, currentToken.decimals))
    })
    const transferAmount =  !useExact/*isUsdt*/ ? String(Number.MAX_SAFE_INTEGER) : crosschainState.transferAmount

    tokenContract
      .approve(
        currentChain.bridgeAddress,
        WithDecimalsHexString(transferAmount, currentToken.decimals),
        {
          gasLimit: calculateGasMargin(estimatedGas),
          gasPrice: gasPriceFromChain,
          nonce: await getNonce()
        }
      )
      .then((resultApproveTx: any) => {
        dispatch(setCrosschainTransferStatus({
          status: ChainTransferState.ApprovalPending
        }))
        dispatch(
          setCurrentTxID({
            txID: resultApproveTx.hash
          })
        )

        resultApproveTx
          .wait()
          .then(() => {
            return tokenContract.allowance(crosschainState.currentRecipient, currentChain.bridgeAddress)
          })
          .then((approvedAmount: any) => {
            const crosschainState2 = getCrosschainState()
            if (crosschainState2.currentTxID === resultApproveTx.hash) {
              dispatch(setCurrentTxID({
                txID: ''
              }));
              const countTokenForTransfer = BigNumber.from(
                WithDecimalsHexString(crosschainState2.transferAmount, currentToken.decimals)
              )
              if (countTokenForTransfer.lte(approvedAmount)) {
                dispatch(setCrosschainTransferStatus({
                  status: ChainTransferState.ApprovalComplete
                }))
              } else {
                dispatch(setCrosschainTransferStatus({
                  status: ChainTransferState.NotStarted
                }))
              }
            }
          })
          .catch((err: any) => {
            BreakCrosschainSwap()
          })
      })
      .catch((err: any) => {
        BreakCrosschainSwap()
      })
  }

  const UpdateOwnTokenBalance = async (account: string | null | undefined) => {
    if (account) {
      const crosschainState = getCrosschainState()
      const currentToken = GetTokenByAddress(crosschainState.currentToken.address)
      if (currentToken.address) {
        // @ts-ignore
        const signer = web3React.library.getSigner()
        const tokenContract = new ethers.Contract(currentToken.address, TokenABI, signer)

        const balance = (await tokenContract.balanceOf(account)).toString();
        dispatch(setCurrentTokenBalance({
          balance: WithDecimals(balance)
        }))
        return
      }
    }

    dispatch(setCurrentTokenBalance({
      balance: WithDecimals('0')
    }))
  }

  const UpdateFee = async (account: string | null | undefined) => {
    if (account) {
      const crosschainState = getCrosschainState()
      const currentChain = GetChainbridgeConfigByID(crosschainState.currentChain.chainId)

      // @ts-ignore
      const signer = web3React.library.getSigner()
      const abi = (currentChain.chainId === ChainId.SMART_CHAIN || currentChain.chainId === ChainId.SMART_CHAIN_TEST)
        ? BSCSwapAgentABI
        : ETHSwapAgentABI;
      const bridgeContract = new ethers.Contract(currentChain.bridgeAddress, abi, signer)

      try {
        const fee = (await bridgeContract.swapFee()).toString()
        dispatch(setCrosschainFee({
          value: WithDecimals(fee)
        }))
        return
      } catch(e) {
      }
    }

    dispatch(setCrosschainFee({
      value: WithDecimals('0')
    }))
  }

  return {
    MakeDeposit,
    MakeApprove,
    UpdateFee,
    GetAllowance,
    UpdateOwnTokenBalance,
    BreakCrosschainSwap
  }
}

export function useCrossChain() {
  dispatch = useDispatch()
  web3React = useActiveWeb3React()

  const { currentChain, targetChain, currentToken } = useCrosschainState()

  const { UpdateOwnTokenBalance, UpdateFee } = useCrosschainHooks()

  const { account, library } = useActiveWeb3React()
  const chainIdFromWeb3React = useActiveWeb3React().chainId

  const chainId = library?._network?.chainId || chainIdFromWeb3React

  const initAll = () => {
    dispatch(setCrosschainRecipient({ address: account || '' }))
    dispatch(setCurrentTxID({ txID: '' }))
    const currentChainName = GetChainNameById(chainId || -1)

    const chains = GetAvailableChains(currentChainName)
    dispatch(
      setAvailableChains({
        chains: chains
      })
    )

    let newTargetCain = {
        name: '',
        chainId: -1
      }
    for (const chain of chains) {
      if (chain.name === currentChainName) {
        continue;
      }
      newTargetCain = chain;
      if (chain.name === targetChain.name) {
        break;
      }
    }

    const tokens = GetAvailableTokens(currentChainName)
    const targetTokens = GetAvailableTokens(newTargetCain?.name)
    dispatch(
      setAvailableTokens({
        tokens: tokens.length ? tokens : []
      })
    )
    dispatch(
      setTargetTokens({
        targetTokens: targetTokens.length ? targetTokens : []
      })
    )
    dispatch(
      setTargetChain({
        chain: newTargetCain
      })
    )
    dispatch(
      setCurrentToken({
        token: {
          name: '',
          address: '',
          assetBase: '',
          symbol: '',
          decimals: 18
        }
      })
    )
    dispatch(
      setCurrentChain({
        chain: GetCurrentChain(currentChainName)
      })
    )
    dispatch(setTransferAmount({ amount: '' }))
    UpdateOwnTokenBalance(account).catch(console.error)
    UpdateFee(account).catch(console.error)
  }

  useEffect(initAll, [])
  useEffect(initAll, [chainId, library])

  useEffect(() => {
    dispatch(setCrosschainRecipient({ address: account || '' }))
    dispatch(setCurrentTxID({ txID: '' }))

    dispatch(
      setAvailableTokens({
        tokens: GetAvailableTokens(currentChain.name)
      })
    )
  }, [targetChain, account, currentChain])

  // to address
  useEffect(() => {
    dispatch(setCrosschainRecipient({ address: account || '' }))
    UpdateOwnTokenBalance(account).catch(console.error)
    UpdateFee(account).catch(console.error)
  }, [account, currentToken])
}

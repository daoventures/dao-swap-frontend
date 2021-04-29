import { Check, Copy } from 'react-feather'
import { Currency, CurrencyAmount, Pair } from '@zeroexchange/sdk'
import React, { useCallback, useEffect, useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'

// import BlockchainLogo from '../BlockchainLogo'
import BlockchainSearchModal from '../SearchModal/BlockchainSearchModal'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CurrencyLogo from '../CurrencyLogo'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import DoubleCurrencyLogo from '../DoubleLogo'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { Input as NumericalInput } from '../NumericalInput'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { darken } from 'polished'
import { returnBalanceNum } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalance, useTokenBalanceOnChain } from '../../state/wallet/hooks'
import { useTranslation } from 'react-i18next'
import { WithDecimals } from '../../state/crosschain/hooks';

const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`

const BlockchainSelect = styled.button<{ selected: boolean }>`
  align-items: center;
  outline: none;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg1};
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
`

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 8px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;

  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '12px')};
  background-color: ${({ theme }) => theme.bg2};
  z-index: 1;
`

const CopyRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: flex-end;
  align-items: center;
  padding-right: 1rem;
  margin-top: -5px;
  p {
    margin-top: 0;
    margin-bottom: 0;
    background: rgba(255, 255, 255, 0.075);
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 0.8rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    opacity: 0.75;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    min-height: 25px;
    min-width: 86px;
    span {
      margin-right: 4px;
    }
    .active {
      display: block;
    }
    .inactive {
      display: none;
    }
    &:active {
      opacity: 1;
      .active {
        display: none;
      }
      .inactive {
        display: block;
      }
    }
  }
`

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '12px')};
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.bg1};
`

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};

`

const StyledBalanceMax = styled.button`
  height: 28px;
  background-color: ${({ theme }) => theme.primary5};
  border: 1px solid ${({ theme }) => theme.primary5};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.primaryText1};
  :hover {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  blockchain?: string
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  onBlockchainSelect?: (blockchain: Currency) => void
  currency?: any
  disableCurrencySelect?: boolean
  disableBlockchainSelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  isCrossChain?: boolean
  currentTargetToken?: any
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  onBlockchainSelect,
  currency,
  blockchain,
  disableCurrencySelect = false,
  disableBlockchainSelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
  isCrossChain,
  currentTargetToken
}: CurrencyInputPanelProps) {

  const { t } = useTranslation()
  const theme = useContext(ThemeContext)

  const isCrossTargetToken = () => {
    return (isCrossChain && label === 'To');
  }

  const [modalOpen, setModalOpen] = useState(false)
  const [modal2Open, setModal2Open] = useState(false)

  const { account, chainId } = useActiveWeb3React();

  const selectedCurrencyBalance = useCurrencyBalance(
    account ?? undefined,
    currency ?? undefined,
    chainId
  );
  const targetCurrencyBalance = useTokenBalanceOnChain(
    account ?? undefined,
    isCrossTargetToken() ? currentTargetToken?.address : '',
    isCrossTargetToken() ? currentTargetToken?.chainId : undefined
  )

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  const [balance, setBalance] = useState('')
  useEffect(() => {
    if (isCrossTargetToken()) {
      setBalance(targetCurrencyBalance ? WithDecimals(targetCurrencyBalance) : '');
    } else {
      setBalance(selectedCurrencyBalance
        ? selectedCurrencyBalance?.toSignificant(returnBalanceNum(selectedCurrencyBalance, 6), {groupSeparator: ','})
        : '');
    }
  }, [selectedCurrencyBalance, targetCurrencyBalance]);

  // hack to fix AWAX
  let altCurrency = currency;
  if (altCurrency?.symbol.includes('AWAX')) {
    altCurrency.symbol = altCurrency.symbol.replace('AWAX', 'AVAX');
  }

  return (
    <>
      <InputPanel id={id}>
        <Container hideInput={hideInput}>
          {!hideInput && (
            <LabelRow>
              <RowBetween>
                <BlockchainSelect
                  selected={!!blockchain}
                  className="open-blockchain-select-button"
                  onClick={() => {
                    if (!disableBlockchainSelect) {
                      setModal2Open(true)
                    }
                  }}
                >
                  <Aligner>
                    {label}
                    {/*pair ? (
                    <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={14} margin={true} />
                  ) : blockchain ? (
                    <BlockchainLogo blockchain={blockchain} size={'14px'} />
                  ) : null}
                  {' '+blockchain}
                  {!disableCurrencySelect && <StyledDropDown selected={!!currency} />*/}
                  </Aligner>
                </BlockchainSelect>
                {account && (
                  <TYPE.body
                    onClick={balance ? onMax : () => {}}
                    color={theme.text2}
                    fontWeight={500}
                    fontSize={14}
                    style={{ display: 'inline', cursor: 'pointer' }}
                  >
                    {!hideBalance && !!altCurrency && balance
                      ? (customBalanceText ?? 'Balance: ') + balance
                      : '-'}
                  </TYPE.body>
                )}
              </RowBetween>
            </LabelRow>
          )}
          <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
            {!hideInput && (
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  onUserInput={val => {
                    onUserInput(val)
                  }}
                />
                {account && altCurrency && showMaxButton && label !== 'To' && (
                  <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
                )}
              </>
            )}
            <CurrencySelect
              style={{ opacity: `${isCrossTargetToken() && !altCurrency?.symbol ? '0' : '1'}` }}
              selected={!!altCurrency}
              className="open-currency-select-button"
              onClick={() => {
                if (!disableCurrencySelect) {
                  setModalOpen(true)
                }
              }}
            >
              <Aligner>
                {pair ? (
                  <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
                ) : altCurrency ? (
                  <CurrencyLogo currency={altCurrency} size={'24px'} />
                ) : null}
                {pair ? (
                  <StyledTokenName className="pair-name-container">
                    {pair?.token0.symbol}:{pair?.token1.symbol}
                  </StyledTokenName>
                ) : (
                  <StyledTokenName className="token-symbol-container" active={Boolean(altCurrency && altCurrency.symbol)}>
                    {isCrossTargetToken()
                      ? `${currentTargetToken?.symbol ? currentTargetToken?.symbol : '-'}`
                      : (altCurrency && altCurrency.symbol && altCurrency.symbol.length > 20
                          ? altCurrency.symbol.slice(0, 4) +
                            '...' +
                            altCurrency.symbol.slice(altCurrency.symbol.length - 5, altCurrency.symbol.length)
                          : altCurrency?.symbol) || t('selectToken')}
                  </StyledTokenName>
                )}
                {!disableCurrencySelect && !disableBlockchainSelect && <StyledDropDown selected={!!altCurrency} />}
              </Aligner>
            </CurrencySelect>
          </InputRow>
        </Container>
        {!disableCurrencySelect && onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={altCurrency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={!isCrossChain}
            isCrossChain={isCrossChain}
          />
        )}
        {!disableBlockchainSelect && onBlockchainSelect && (
          <BlockchainSearchModal
            isOpen={modal2Open}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onBlockchainSelect}
            selectedCurrency={altCurrency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
          />
        )}
      </InputPanel>
      {altCurrency && altCurrency?.address && (
        <CopyRow>
          <CopyToClipboard text={(isCrossTargetToken() && currentTargetToken?.address) ? currentTargetToken?.address : altCurrency?.address}>
            <p>
              <span className="active">address</span>
              <Copy className="active" size={'14'} />
              <span className="inactive" style={{ color: 'green' }}>
                copied!
              </span>
              <Check className="inactive" color="green" size={'14'} />
            </p>
          </CopyToClipboard>
        </CopyRow>
      )}
    </>
  )
}

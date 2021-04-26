import { CheckCircle, ChevronsRight } from 'react-feather'

import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { ChainTransferState } from '../../state/crosschain/actions'
import React, { useContext } from 'react'
import { RowFixed } from '../Row'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { useCrosschainHooks } from '../../state/crosschain/hooks'
import ApprovedImg from '../../assets/images/approved.svg';
import ArrowTransferImg from '../../assets/images/arrow-transfer.svg';

const CancelLink = styled.a`
  color: ${({ theme }) => theme.primary1};
  font-weight: bold;
  font-size: 1rem;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.primary5};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  &:hover {
    // background: rgba(255, 255, 255, 0.1);
  }
`
export default function ApprovalComplete({
  // @ts-ignore
  onDismiss,
  changeTransferState,
}: {
  onDismiss: () => void
  changeTransferState: any
}) {
  const theme = useContext(ThemeContext)

  const { MakeDeposit, BreakCrosschainSwap } = useCrosschainHooks()
  const cancelTransfer = () => {
    BreakCrosschainSwap()
    // changeTransferState(ChainTransferState.NotStarted)
  }

  return (
    <AutoColumn gap="12px" justify={'center'}>
      <Text fontWeight={500} fontSize={16}>
        Now Start Transfer
      </Text>
      <RowFixed style={{ justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(238, 238, 238, 1)', borderRadius: '12px', margin: '1rem auto' }}>
        {/* <CheckCircle size={'66'} style={{ margin: '1rem 1rem 1rem 1rem', color: '#27AE60' }} /> */}
        {/* <ChevronsRight size={'66'} style={{ margin: '1rem 1rem 1rem 1rem', opacity: '.5' }} /> */}
        <img src={ApprovedImg} style={{ height: '42px', margin: '1rem' }}/>
        <img src={ArrowTransferImg} style={{ width: '42px', margin: '1rem' }}/>
      </RowFixed>
      <RowFixed style={{ width: '100%' }}>
        <ButtonPrimary
          onClick={() => {
            MakeDeposit().catch(console.error)
            changeTransferState(ChainTransferState.TransferPending)
          }}
        >
          Start Transfer
        </ButtonPrimary>
      </RowFixed>
      <RowFixed style={{ width: '100%', marginTop: '1rem' }}>
        <Text fontSize={14} color={theme.desc} textAlign="center" style={{lineHeight: '22px'}}>
          You will be asked again to confirm this transaction in your wallet
        </Text>
      </RowFixed>
      <RowFixed>
        <CancelLink onClick={() => onDismiss()}>Cancel Transfer</CancelLink>
      </RowFixed>
    </AutoColumn>
  )
}

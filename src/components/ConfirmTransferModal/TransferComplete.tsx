import { AutoColumn } from '../Column'
import { ButtonOutlined } from '../Button'
import { CheckCircle } from 'react-feather'
import React, { useContext } from 'react'
import { RowFixed } from '../Row'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import TransferredImg from '../../assets/images/transferred.svg';

const Message = styled.p`
  font-size: 0.85rem;
  margin-top: 0.4rem;
  line-height: 22px;
  color: ${({ theme }) => theme.desc};
  border: 1px dashed rgba(238, 238, 238, 1);
  border-radius: 12px;
  padding: 8px;
  a {
    font-weight: bold;
    color: ${({ theme }) => theme.primary1};
    cursor: pointer;
    outline: none;
    text-decoration: none;
    margin-left: 4px;
    margin-right: 4px;
  }
`

export const CloseButton = styled(ButtonOutlined)`
  border: none
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.primary1};
  font-size: 15px;

  &:focus {
    box-shadow: none;
  }
  &:hover {
    box-shadow: none;
  }
  &:active {
    box-shadow: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export default function TransferComplete({
  onDismiss,
  activeChain,
  transferTo,
  transferAmount,
  currentToken
}: {
  onDismiss: () => void
  activeChain?: string
  transferTo?: string
  transferAmount?: string
  currentToken?: any
}) {
  const theme = useContext(ThemeContext)

  return (
    <AutoColumn gap="12px" justify={'center'}>
      <RowFixed style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <img src={TransferredImg} style={{ height: '93px', margin: '.5rem' }}/>
      </RowFixed>
      <RowFixed style={{ width: '100%', marginTop: '1rem' }}>
        <Text fontSize={14} textAlign="center" style={{ lineHeight: '22px', color: theme.desc }}>
          <b>
            {transferAmount} {currentToken?.symbol}{' '}
          </b>
          tokens were successfully transferred into the ChainBridge, and are now being sent from {activeChain} to{' '}
          {transferTo}.
          <br/>
          Santa's reindeer are busy relaying the transaction across the chains, this process can sometimes take up to 10
          minutes.
        </Text>
      </RowFixed>
      <RowFixed style={{ width: '100%' }}>
        <CloseButton onClick={onDismiss} style={{}}>Close</CloseButton>
      </RowFixed>
      <RowFixed>
        <Message>
          To see your token assets on the correct chain, you must 
          <a
            href="https://metamask.zendesk.com/hc/en-us/articles/360043227612-How-to-add-a-custom-Network-RPC-and-or-Block-Explorer"
            rel="noopener noreferrer"
            target="_blank"
          >
            configure the Network RPC
          </a>
          of your connected wallet.
        </Message>
      </RowFixed>
    </AutoColumn>
  )
}

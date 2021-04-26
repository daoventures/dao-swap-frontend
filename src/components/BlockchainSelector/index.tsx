import { ChevronDown, ChevronsRight, Link } from 'react-feather'

import BlockchainLogo from '../BlockchainLogo'
import { CrosschainChain } from '../../state/crosschain/actions'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import ArrowRightImg from '../../assets/images/arrow-right.png'

const Container = styled.div`
  border: 1px dashed rgba(238, 238, 238, 1);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  h5 {
    margin-left: 0.3rem;
  }
  p {
    margin-left: auto;
    padding: 0.5rem 0.25rem;
    border-radius: 12px;
    // background: rgba(238, 238, 238, 0.25);
    transition: all 0.2s ease-in-out;
    // font-size: 0.85rem;
    font-weight: 600;
    span {
      margin-left: 4px;
      margin-right: 4px;
    }
    &:hover {
      background: rgba(238, 238, 238, 1);
      cursor: pointer;
    }
    &.crosschain {
      margin: auto;
      display: flex;
      > span {
        margin: auto;
      }
    }
    &.currentchain {
      background: transparent;
    }
  }
`
const Row = styled.div<{ borderBottom: boolean; isCrossChain?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ isCrossChain }) => (!isCrossChain ? '0 1rem 0 1rem' : '1rem')};
  border-bottom: ${({ borderBottom }) => (borderBottom ? '1px dashed rgba(238, 238, 238, 1)' : 'none')};
`

const BlockchainSelector = ({
  blockchain,
  transferTo,
  onSetTransferTo,
  supportedChains,
  isCrossChain,
  onShowCrossChainModal,
  onShowTransferChainModal
}: {
  blockchain: string | CrosschainChain | undefined
  transferTo: any // tslint not working here, same as above
  isCrossChain?: boolean
  supportedChains: string[]
  onShowCrossChainModal: () => void
  onSetTransferTo: (name: string) => void
  onShowTransferChainModal: () => void
}) => {
  useEffect(() => {
    onSetTransferTo(transferTo?.name)
  }, [transferTo])

  const openChangeChainInfo = () => {
    onShowCrossChainModal()
  }

  const openTransferModal = () => {
    onShowTransferChainModal()
  }

  if (!blockchain) {
    return <div />
  }
  // @ts-ignore
  return (
    <Container>
      {!isCrossChain && (
        <Row borderBottom={false} isCrossChain={isCrossChain}>
          <Link size={16} />
          <h5>Blockchain:</h5>
          <p onClick={openChangeChainInfo}>
            <BlockchainLogo
              size="28px"
              blockchain={typeof blockchain === 'string' ? blockchain : ''}
              style={{ }}
            />
            <span>{blockchain}</span>
            <ChevronDown size="18" style={{ marginBottom: '-3px' }} />
          </p>
        </Row>
      )}
      {isCrossChain && (
        <Row borderBottom={false} isCrossChain={isCrossChain}>
          <p className="crosschain currentchain">
            <BlockchainLogo
              size="28px"
              blockchain={typeof blockchain !== 'string' ? blockchain.name : blockchain}
              style={{ }}
            />
            <span>{typeof blockchain !== 'string' ? blockchain.name : blockchain}</span>
          </p>
          {/* <ChevronsRight /> */}
          <img src={ArrowRightImg} style={{ margin: 'auto 8px', height: '12px' }}/>
          <p className="crosschain" onClick={openTransferModal}>
            <BlockchainLogo
              size="28px"
              blockchain={typeof transferTo !== 'string' ? transferTo.name : blockchain}
              style={{ }}
            />
            <span>{typeof transferTo !== 'string' ? transferTo.name : blockchain}</span>
            <ChevronDown size="18" style={{ margin: 'auto', color: '#BBBBBB' }} />
          </p>
        </Row>
      )}
    </Container>
  )
}

export default BlockchainSelector

import { BigNumber } from '@ethersproject/bignumber'

import { Contents } from '@/src/components/pools/actions/Wrapper'
import { ButtonGradient } from '@/src/components/pureStyledComponents/buttons/Button'
import { MAX_BN, ZERO_ADDRESS } from '@/src/constants/misc'
import useERC20Call from '@/src/hooks/contracts/useERC20Call'
import useERC20Transaction from '@/src/hooks/contracts/useERC20Transaction'
import { GasOptions, useTransactionModal } from '@/src/providers/transactionModalProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

type Props = {
  tokenAddress: string
  spender: string
  title: string
  description: string
  refetchAllowance: () => void
  approveAmt?: BigNumber
}

export default function Approve({
  description,
  refetchAllowance,
  spender,
  title,
  tokenAddress,
  approveAmt = MAX_BN,
}: Props) {
  const { address, appChainId, isAppConnected } = useWeb3Connection()

  const { isSubmitting, setConfigAndOpenModal } = useTransactionModal()

  const { estimate, execute: approve } = useERC20Transaction(tokenAddress, 'approve')

  const [userBalance] = useERC20Call(appChainId, tokenAddress || ZERO_ADDRESS, 'balanceOf', [
    address || ZERO_ADDRESS,
  ])

  const approveInvestmentToken = async () => {
    setConfigAndOpenModal({
      onConfirm: async (txGasOptions: GasOptions) => {
        const receipt = await approve([spender, approveAmt], txGasOptions)
        if (receipt) {
          refetchAllowance()
        }
      },
      title: `${title}`,
      estimate: () => estimate([spender, approveAmt]),
    })
  }

  return (
    <>
      <Contents>{description}</Contents>
      <ButtonGradient
        disabled={!address || !isAppConnected || isSubmitting || !userBalance?.gt(0)}
        onClick={approveInvestmentToken}
      >
        Approve
      </ButtonGradient>
    </>
  )
}

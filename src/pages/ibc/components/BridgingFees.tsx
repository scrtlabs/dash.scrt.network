import React, { useContext, useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { Chain, ICSTokens, Token, chains } from 'utils/config'
import { useSecretNetworkClientStore } from 'store/secretNetworkClient'
import Tooltip from '@mui/material/Tooltip'
import { faCopy, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { IbcMode } from 'types/IbcMode'
import { GasToken } from '@axelar-network/axelarjs-sdk'
import { IbcService } from 'services/ibc.service'
import { amber } from '@mui/material/colors'
import { Coin } from 'secretjs'
import { useTokenPricesStore } from 'store/TokenPrices'

interface IProps {
  chain: Chain
  ibcMode: IbcMode
  token: Token
  amount: string
}

export default function BridgingFees(props: IProps) {
  const { isConnected, connectWallet } = useSecretNetworkClientStore()

  const [axelarTransferFee, setAxelarTransferFee] = useState<Coin>(null)
  const [usdPriceString, setUsdPriceString] = useState<string>(null)

  const { getValuePrice, priceMapping } = useTokenPricesStore()

  useEffect(() => {
    if ((props.ibcMode, props.token, props.chain, props.amount)) {
      async function fetchAxelarTransferFee() {
        const { fee } = await IbcService.getAxelarTransferFee(
          props.token,
          props.chain,
          BigNumber(props.amount).dividedBy(`1e${props.token.decimals}`).toNumber(),
          props.ibcMode
        )
        setAxelarTransferFee(fee)
        console.log(fee)
      }
      setAxelarTransferFee(null)
      fetchAxelarTransferFee()
    }
  }, [props.ibcMode, props.token, props.chain, props.amount])

  useEffect(() => {
    if (priceMapping !== null && axelarTransferFee !== null) {
      setUsdPriceString(getValuePrice(props.token, BigNumber(axelarTransferFee.amount)))
    } else {
      setUsdPriceString('')
    }
  }, [priceMapping, props.token, axelarTransferFee])

  return (
    <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded-xl space-y-6 my-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-semibold text-sm text-white">Bridging Fees</span>
          <Tooltip
            title={`Make sure to always transfer a higher amount than the transfer fees!`}
            placement="right"
            arrow
          >
            <span className="ml-2 text-white relative hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </div>
        {props.token.is_ics20 && axelarTransferFee ? (
          <div className="text-white font-medium">
            {`${new BigNumber(axelarTransferFee.amount).dividedBy(`1e${props.token.decimals}`).toFormat()} ${
              props.ibcMode == 'withdrawal' ? 's' : ''
            }`}{' '}
            {ICSTokens.filter((icstoken: any) => icstoken.axelar_denom === axelarTransferFee.denom)[0].name}
            {props.token.coingecko_id && usdPriceString ? ` (${usdPriceString})` : ''}
          </div>
        ) : (
          <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-600/40 rounded w-20 h-5"></span>
        )}
      </div>
    </div>
  )
}

import { useContext, useEffect, useState } from 'react'
import { Chain, ICSTokens, Token } from 'utils/config'
import Tooltip from '@mui/material/Tooltip'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import BigNumber from 'bignumber.js'
import { IbcMode } from 'types/IbcMode'
import { IbcService } from 'services/ibc.service'
import { Coin } from 'secretjs'
import { useTokenPricesStore } from 'store/TokenPrices'
import { APIContext } from 'context/APIContext'
import { useUserPreferencesStore } from 'store/UserPreferences'
import { toCurrencyString } from 'utils/commons'

interface IProps {
  chain: Chain
  ibcMode: IbcMode
  token: Token
  amount: string
}

export default function BridgingFees(props: IProps) {
  const [axelarTransferFee, setAxelarTransferFee] = useState<Coin>(undefined)
  const [priceString, setPriceString] = useState<string>(null)

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
      }
      setAxelarTransferFee(undefined)
      fetchAxelarTransferFee()
    }
  }, [props.ibcMode, props.token, props.chain, props.amount])

  const { convertCurrency } = useContext(APIContext)
  const { currency } = useUserPreferencesStore()

  useEffect(() => {
    if (priceMapping !== null && axelarTransferFee !== undefined) {
      const priceInCurrency = convertCurrency(
        'USD',
        getValuePrice(props.token, BigNumber(axelarTransferFee.amount)),
        currency
      )
      console.log(priceInCurrency)
      if (priceInCurrency !== null) {
        setPriceString(toCurrencyString(priceInCurrency, currency))
      } else {
        setPriceString('')
      }
    } else {
      setPriceString('')
    }
  }, [priceMapping, props.token, axelarTransferFee])

  return (
    <div className="bg-neutral-200 dark:bg-neutral-700 p-4 rounded-xl space-y-6">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center">
          <span className="font-semibold text-sm">Bridging Fees</span>
          <Tooltip
            title={`Make sure to always transfer a higher amount than the transfer fees!`}
            placement="right"
            arrow
          >
            <span className="ml-2 mt-1 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </Tooltip>
        </div>
        {props.token.is_ics20 && axelarTransferFee !== undefined ? (
          <div>
            {` ${Number(BigNumber(axelarTransferFee.amount).dividedBy(`1e${props.token.decimals}`)).toLocaleString(
              undefined,
              {
                maximumFractionDigits: props.token.decimals
              }
            )} ${props.ibcMode == 'withdrawal' ? 's' : ''}${
              ICSTokens.filter((icstoken: Token) => icstoken.axelar_denom === axelarTransferFee.denom)[0].name
            }
          ${props.token.coingecko_id && priceString ? ` (${priceString})` : ''}`}
          </div>
        ) : (
          <span className="animate-pulse bg-neutral-300/40 dark:bg-neutral-600/40 rounded w-20 h-5"></span>
        )}
      </div>
    </div>
  )
}

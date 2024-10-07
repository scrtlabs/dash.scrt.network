import * as yup from 'yup'
import { isIbcMode } from 'types/IbcMode'
import { chains } from 'utils/config'

export const ibcSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Please enter a valid amount')
    .required('Please enter a valid amount')
    .test('min-amount', 'Please enter a valid amount', function (value) {
      const { token } = this.parent
      if (token && typeof token.decimals === 'number') {
        const minAmount = Math.pow(10, -token.decimals)
        if (value < minAmount) {
          return this.createError({
            message: `Please enter an amount of at least ${minAmount}`
          })
        }
      }
      return true
    }),
  token: yup.mixed().required('Token is required'),
  chain: yup
    .mixed()
    .required('Please select a chain')
    .test('isValidChain', 'Please select a valid chain', (chainValue: any) =>
      Object.values(chains).some((chain) => chain.chain_name === chainValue.chain_name)
    ),
  ibcMode: yup
    .string()
    .required('Please pick an IBC Mode')
    .test('isIbcMode', 'Invalid IBC Mode', (value) => isIbcMode(value))
})

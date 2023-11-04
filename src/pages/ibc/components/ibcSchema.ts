import * as yup from 'yup'
import { isIbcMode } from 'types/IbcMode'
import { chains, tokens } from 'utils/config'

/**
 * TODO: Src
 * TODO: Dest
 * Token
 * Amount
 */

export const ibcSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.00001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.'))) // transforms comma to dot
    .required('Please enter a valid amount'),
  token: yup
    .mixed()
    .test('isValidToken', 'Please select a valid token', (value) => tokens.some((token) => token.name === value))
    .required('Please select a token!'),
  chain: yup
    .mixed()
    .required('Please select a chain!')
    .test('isValidChain', 'Please select a valid chain', (chainValue: any) =>
      Object.values(chains).some((chain) => chain.chain_name === chainValue.chain_name)
    ),
  ibcMode: yup
    .string()
    .test('isIbcMode', 'Invalid IBC Mode', (value) => isIbcMode(value))
    .required('Please pick an IBC Mode')
})

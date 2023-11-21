import * as yup from 'yup'
import { isIbcMode } from 'types/IbcMode'
import { Token, chains, tokens } from 'utils/config'

export const ibcSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.00001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .transform((_value, originalValue) => Number(originalValue.replace(/,/, '.'))) // transforms comma to dot
    .required('Please enter a valid amount'),
  token: yup.mixed().required('Token is required'), // TODO: (low prio) add check with SendService.getSupportedTokens()
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

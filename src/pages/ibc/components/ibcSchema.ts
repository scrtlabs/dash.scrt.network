import * as yup from 'yup'
import { isIbcMode } from 'types/IbcMode'
import { chains } from 'utils/config'

export const ibcSchema = yup.object().shape({
  amount: yup
    .number()
    .min(0.000001, 'Please enter a valid amount')
    .typeError('Please enter a valid amount')
    .required('Please enter a valid amount'),
  token: yup.mixed().required('Token is required'),
  chain: yup
    .mixed()
    .required('Please select a chain')
    .test('isValidChain', 'Please select a valid chain', (chainValue: any) =>
      Object.values(chains).some((chain) => chain.chain_name === chainValue.chain_name)
    ),
  ibcMode: yup
    .string()
    .test('isIbcMode', 'Invalid IBC Mode', (value) => isIbcMode(value))
    .required('Please pick an IBC Mode')
})

import * as yup from 'yup'
import { isIbcMode } from 'shared/types/IbcMode'
import { tokens } from 'shared/utils/config'

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
    .transform((_value, originalValue) =>
      Number(originalValue.replace(/,/, '.'))
    ) // transforms comma to dot
    .required('Please enter a valid amount'),
  tokenName: yup.string().oneOf(
    tokens.map((token) => token.name),
    'Please select a valid token'
  ),
  chainName: yup.string().required('Please select a chain!'),
  ibcMode: yup
    .string()
    .test('isIbcMode', 'Invalid IBC Mode', (value) => isIbcMode(value))
    .required('Please pick an IBC Mode')
})
